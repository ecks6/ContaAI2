import express from 'express';
import Contract from '../models/Contract.js';
import { authenticateToken, requireCompany } from '../middleware/auth.js';

const router = express.Router();

// Get all contracts
router.get('/', authenticateToken, requireCompany, async (req, res) => {
  try {
    const contracts = await Contract.find({ companyId: req.companyId })
      .populate('clientId')
      .populate('supplierId')
      .sort({ createdAt: -1 });
    res.json(contracts);
  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({ message: 'Failed to fetch contracts' });
  }
});

// Create contract
router.post('/', authenticateToken, requireCompany, async (req, res) => {
  try {
    const contractData = {
      ...req.body,
      companyId: req.companyId,
      userId: req.user._id
    };

    const contract = new Contract(contractData);
    await contract.save();

    res.status(201).json(contract);
  } catch (error) {
    console.error('Create contract error:', error);
    res.status(500).json({ message: 'Failed to create contract' });
  }
});

// Update contract
router.put('/:id', authenticateToken, requireCompany, async (req, res) => {
  try {
    const contract = await Contract.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      req.body,
      { new: true }
    );

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    res.json(contract);
  } catch (error) {
    console.error('Update contract error:', error);
    res.status(500).json({ message: 'Failed to update contract' });
  }
});

// Delete contract
router.delete('/:id', authenticateToken, requireCompany, async (req, res) => {
  try {
    const contract = await Contract.findOneAndDelete({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    res.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    console.error('Delete contract error:', error);
    res.status(500).json({ message: 'Failed to delete contract' });
  }
});

export default router;