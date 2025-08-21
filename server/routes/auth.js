import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Company from '../models/Company.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, companyData } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: 'admin' // First user is admin
    });

    await user.save();

    // Create company if provided
    let company = null;
    if (companyData) {
      company = new Company({
        ...companyData,
        ownerId: user._id
      });
      await company.save();
      
      user.companyId = company._id;
      await user.save();
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toJSON(),
      company
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).populate('companyId');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON(),
      company: user.companyId
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('companyId');
    res.json({
      user: user.toJSON(),
      company: user.companyId
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user data' });
  }
});

// Setup company
router.post('/setup-company', authenticateToken, async (req, res) => {
  try {
    const companyData = req.body;
    
    let company;
    if (req.user.companyId) {
      // Update existing company
      company = await Company.findByIdAndUpdate(
        req.user.companyId,
        companyData,
        { new: true }
      );
    } else {
      // Create new company
      company = new Company({
        ...companyData,
        ownerId: req.user._id
      });
      await company.save();
      
      // Update user with company reference
      await User.findByIdAndUpdate(req.user._id, { companyId: company._id });
    }

    res.json({
      message: 'Company setup successful',
      company
    });
  } catch (error) {
    console.error('Company setup error:', error);
    res.status(500).json({ message: 'Company setup failed', error: error.message });
  }
});

export default router;