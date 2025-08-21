import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  vatRate: {
    type: Number,
    default: 19
  },
  total: {
    type: Number,
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }
});

const invoiceSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  issueDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  vatAmount: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  notes: String,
  paymentTerms: {
    type: Number,
    default: 30
  },
  currency: {
    type: String,
    default: 'RON'
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

export default mongoose.model('Invoice', invoiceSchema);