import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  cui: {
    type: String,
    required: true,
    unique: true
  },
  regCom: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: String,
  email: String,
  website: String,
  logo: String,
  vatRate: {
    type: Number,
    default: 19
  },
  currency: {
    type: String,
    default: 'RON'
  },
  fiscalYear: {
    type: String,
    default: () => new Date().getFullYear().toString()
  },
  invoicePrefix: {
    type: String,
    default: 'INV'
  },
  invoiceCounter: {
    type: Number,
    default: 1
  },
  contactPerson: String,
  bankAccount: String,
  bankName: String,
  activityCode: String,
  employees: {
    type: Number,
    default: 1
  },
  foundedYear: {
    type: Number,
    default: () => new Date().getFullYear()
  },
  legalForm: {
    type: String,
    default: 'SRL'
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Company', companySchema);