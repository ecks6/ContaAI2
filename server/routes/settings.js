import express from 'express';
import Company from '../models/Company.js';
import User from '../models/User.js';
import { authenticateToken, requireCompany } from '../middleware/auth.js';

const router = express.Router();

// Get company settings
router.get('/company', authenticateToken, requireCompany, async (req, res) => {
  try {
    const company = await Company.findById(req.companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    console.error('Get company settings error:', error);
    res.status(500).json({ message: 'Failed to fetch company settings' });
  }
});

// Update company settings
router.put('/company', authenticateToken, requireCompany, async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.companyId,
      req.body,
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    console.error('Update company settings error:', error);
    res.status(500).json({ message: 'Failed to update company settings' });
  }
});

// Get user preferences
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.preferences);
  } catch (error) {
    console.error('Get user preferences error:', error);
    res.status(500).json({ message: 'Failed to fetch user preferences' });
  }
});

// Update user preferences
router.put('/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferences: req.body },
      { new: true }
    );

    res.json(user.preferences);
  } catch (error) {
    console.error('Update user preferences error:', error);
    res.status(500).json({ message: 'Failed to update user preferences' });
  }
});

export default router;