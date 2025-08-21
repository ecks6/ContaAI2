import express from 'express';
import Product from '../models/Product.js';
import { authenticateToken, requireCompany } from '../middleware/auth.js';

const router = express.Router();

// Get all products
router.get('/', authenticateToken, requireCompany, async (req, res) => {
  try {
    const products = await Product.find({ companyId: req.companyId })
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// Create product
router.post('/', authenticateToken, requireCompany, async (req, res) => {
  try {
    const productData = {
      ...req.body,
      companyId: req.companyId,
      userId: req.user._id
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', authenticateToken, requireCompany, async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', authenticateToken, requireCompany, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

export default router;