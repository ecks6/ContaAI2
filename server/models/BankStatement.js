import mongoose from 'mongoose';

const bankTransactionSchema = new mongoose.Schema({
  date: Date,
  description: String,
  amount: Number,
  balance: Number,
  reference: String,
  type: {
    type: String,
    enum: ['debit', 'credit']
  },
  category: String,
  counterparty: String,
  iban: String,
  geminiAnalysis: Number,
  aiInsights: [String],
  recommendations: [String]
});

const bankStatementSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  fileSize: String,
  fileData: String, // Base64 encoded file
  bankName: String,
  accountNumber: String,
  statementPeriod: {
    startDate: Date,
    endDate: Date
  },
  transactions: [bankTransactionSchema],
  status: {
    type: String,
    enum: ['processing', 'completed', 'error'],
    default: 'processing'
  },
  totalTransactions: {
    type: Number,
    default: 0
  },
  openingBalance: {
    type: Number,
    default: 0
  },
  closingBalance: {
    type: Number,
    default: 0
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('BankStatement', bankStatementSchema);