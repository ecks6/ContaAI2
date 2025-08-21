import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  title: String,
  description: String,
  dueDate: Date,
  value: Number,
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'overdue'],
    default: 'pending'
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  }
});

const contractAnalysisSchema = new mongoose.Schema({
  confidence: Number,
  extractedData: {
    parties: [String],
    obligations: [String],
    paymentTerms: [String],
    deliverables: [String],
    penalties: [String],
    terminationClauses: [String]
  },
  riskAssessment: {
    level: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    factors: [String],
    recommendations: [String]
  },
  keyDates: {
    startDate: Date,
    endDate: Date,
    paymentDates: [Date],
    milestones: [Date]
  },
  insights: [String],
  warnings: [String]
});

const contractSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true
  },
  title: String,
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  clientName: String,
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  supplierName: String,
  type: {
    type: String,
    enum: ['service', 'supply', 'maintenance', 'consulting', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled', 'expired'],
    default: 'draft'
  },
  startDate: Date,
  endDate: Date,
  value: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'RON'
  },
  paymentTerms: String,
  description: String,
  terms: [String],
  deliverables: [String],
  milestones: [milestoneSchema],
  linkedInvoices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  }],
  geminiAnalysis: contractAnalysisSchema,
  fileData: String, // Base64 encoded contract file
  fileName: String,
  fileSize: String,
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

export default mongoose.model('Contract', contractSchema);