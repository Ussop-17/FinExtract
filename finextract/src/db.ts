import { Sequelize, DataTypes, Model } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = process.env.DB_HOST && process.env.DB_HOST !== 'localhost'
  ? new Sequelize(
      process.env.DB_NAME || 'finextract',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
      }
    )
  : new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: false,
    });

export class User extends Model {
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public employeeId!: string;
  public bankName!: string;
  public bankCode!: string;
  public phone!: string;
  public address!: string;
  public password!: string;
}

User.init({
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  employeeId: { type: DataTypes.STRING, allowNull: false, unique: true },
  bankName: { type: DataTypes.STRING, allowNull: false },
  bankCode: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.TEXT, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
}, { sequelize, modelName: 'user' });

export class Statement extends Model {
  public id!: number;
  public fileName!: string;
  public uploadDate!: Date;
  public bankName!: string | null;
  public userName!: string | null;
  public currentBalance!: number | null;
  public userId!: number;
}

Statement.init({
  fileName: { type: DataTypes.STRING, allowNull: false },
  uploadDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  bankName: { type: DataTypes.STRING },
  userName: { type: DataTypes.STRING },
  currentBalance: { type: DataTypes.FLOAT },
  userId: { type: DataTypes.INTEGER, allowNull: false },
}, { sequelize, modelName: 'statement' });

export class Transaction extends Model {
  public id!: number;
  public statementId!: number;
  public date!: string;
  public description!: string;
  public coaCategory!: string;
  public debit!: number;
  public credit!: number;
  public balance!: number;
  public userId!: number;
}

Transaction.init({
  statementId: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  coaCategory: { type: DataTypes.STRING, defaultValue: 'Others' },
  debit: { type: DataTypes.FLOAT, defaultValue: 0 },
  credit: { type: DataTypes.FLOAT, defaultValue: 0 },
  balance: { type: DataTypes.FLOAT, defaultValue: 0 },
  userId: { type: DataTypes.INTEGER, allowNull: false },
}, { sequelize, modelName: 'transaction' });

// Relationships
User.hasMany(Statement, { foreignKey: 'userId' });
Statement.belongsTo(User, { foreignKey: 'userId' });

Statement.hasMany(Transaction, { foreignKey: 'statementId' });
Transaction.belongsTo(Statement, { foreignKey: 'statementId' });

User.hasMany(Transaction, { foreignKey: 'userId' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

export { sequelize };
