import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  sku: {
    type: String,
    required: true,
    unique: true
  },
  category: String,
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  vatRate: {
    type: Number,
    default: 19
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  minStock: {
    type: Number,
    default: 5
  },
  unit: {
    type: String,
    default: 'buc'
  },
  supplier: String,
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
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

export default mongoose.model('Product', productSchema);