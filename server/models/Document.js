import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  type: {
    type: String,
    enum: ['income', 'expense']
  },
  category: String,
  date: Date
});

const documentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  fileSize: String,
  fileType: String,
  fileData: String, // Base64 encoded file data
  category: String,
  status: {
    type: String,
    enum: ['processing', 'completed', 'error'],
    default: 'processing'
  },
  geminiAnalysis: {
    type: Number,
    default: 0
  },
  supplier: String,
  amount: String,
  client: String,
  documentDate: String,
  invoiceNumber: String,
  cui: String,
  description: String,
  aiInsights: [String],
  recommendations: [String],
  generatedTransactions: [transactionSchema],
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

export default mongoose.model('Document', documentSchema);