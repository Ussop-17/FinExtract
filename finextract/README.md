# FinExtract - Intelligent Bank Statement Data Extractor

FinExtract is a full-stack web application designed to process bank statements (PDF, images, DOCX), extract transaction details using AI, and provide structured data visualization and export capabilities.

## 🚀 Features

- **AI-Powered Extraction**: Automatically identifies Bank Name, Account Holder, and Transactions.
- **Smart Calculations**: Computes Total Debit, Total Credit, and Net Balance (including Opening Balance detection).
- **Data Visualization**: Interactive Area Chart for expense analysis.
- **Secure Authentication**: Employee-based login system with bank-specific details.
- **Export Options**: Download extracted data as Excel (.xlsx) or CSV files.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Framer Motion, Recharts.
- **Backend**: Node.js, Express.js.
- **AI**: Google Gemini API (@google/genai).
- **Spreadsheets**: SheetJS (xlsx).

## 📦 Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)
- A **Google Gemini API Key** (Get one from [Google AI Studio](https://aistudio.google.com/app/apikey))

## ⚙️ Local Setup

1. **Clone or Download** the repository.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   - Create a `.env` file in the root directory.
   - Copy the contents from `.env.example`.
   - Add your **Gemini API Key**:
     ```env
     GEMINI_API_KEY="your_api_key_here"
     ```
4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
5. **Open the App**:
   Navigate to `http://localhost:3000` in your browser.

## 🔑 Demo Credentials

For quick testing, you can use the following pre-configured user:
- **Employee ID**: `DEMO-001`
- **Bank Code**: `GFB-123`
- **Password**: `password123`

## 🏗️ Production Build

To build the application for production:
```bash
npm run build
```
Then start the server:
```bash
NODE_ENV=production npm start
```

## 📝 Note on Data Persistence

For demonstration purposes, this version uses an **in-memory mock database** for user authentication. Data will be reset whenever the server restarts. For production use, consider integrating a persistent database like PostgreSQL or MongoDB.
