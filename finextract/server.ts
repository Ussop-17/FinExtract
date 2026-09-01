import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sequelize, User, Statement, Transaction } from "./src/db";

const JWT_SECRET = process.env.JWT_SECRET || "finextract_secret_key";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Sync Database
  try {
    await sequelize.authenticate();
    const dialect = sequelize.getDialect();
    console.log(`${dialect.charAt(0).toUpperCase() + dialect.slice(1)} Connection has been established successfully.`);
    await sequelize.sync(); // Sync all models
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

  // Middleware to authenticate JWT
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // API Routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { password, ...userData } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ ...userData, password: hashedPassword });
      res.json({ success: true, user: { id: user.id, employeeId: user.employeeId } });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Signup failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { employeeId, bankCode, password } = req.body;
      const user = await User.findOne({ where: { employeeId, bankCode } });
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, employeeId: user.employeeId }, JWT_SECRET);
      const { password: _, ...userData } = user.toJSON();
      res.json({ success: true, token, user: userData });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Login failed" });
    }
  });

  app.get("/api/user/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      const { password: _, ...userData } = user.toJSON();
      res.json({ user: userData });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Statement History
  app.get("/api/statements", authenticateToken, async (req: any, res) => {
    try {
      const statements = await Statement.findAll({ 
        where: { userId: req.user.id },
        order: [['uploadDate', 'DESC']]
      });
      res.json({ statements });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/statements/:id/transactions", authenticateToken, async (req: any, res) => {
    try {
      const transactions = await Transaction.findAll({ 
        where: { statementId: req.params.id, userId: req.user.id }
      });
      res.json({ transactions });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/statements/:id", authenticateToken, async (req: any, res) => {
    try {
      const statementId = req.params.id;
      const userId = req.user.id;

      // Delete transactions first
      await Transaction.destroy({ where: { statementId, userId } });
      // Delete statement
      const deleted = await Statement.destroy({ where: { id: statementId, userId } });

      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Statement not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/statements", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await Transaction.destroy({ where: { userId } });
      await Statement.destroy({ where: { userId } });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/statements", authenticateToken, async (req: any, res) => {
    try {
      const { fileName, bankName, userName, currentBalance, transactions } = req.body;
      
      const statement = await Statement.create({
        fileName,
        bankName,
        userName,
        currentBalance,
        userId: req.user.id,
        uploadDate: new Date()
      });

      const txsWithIds = transactions.map((tx: any) => ({
        ...tx,
        statementId: statement.id,
        userId: req.user.id
      }));

      await Transaction.bulkCreate(txsWithIds);

      res.json({ success: true, statementId: statement.id });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
