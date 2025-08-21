import express from 'express';
import BankStatement from '../models/BankStatement.js';
import { authenticateToken, requireCompany } from '../middleware/auth.js';

const router = express.Router();

// Get all bank statements
router.get('/statements', authenticateToken, requireCompany, async (req, res) => {
  try {
    const statements = await BankStatement.find({ companyId: req.companyId })
      .sort({ createdAt: -1 });
    res.json(statements);
  } catch (error) {
    console.error('Get bank statements error:', error);
    res.status(500).json({ message: 'Failed to fetch bank statements' });
  }
});

// Create bank statement
router.post('/statements', authenticateToken, requireCompany, async (req, res) => {
  try {
    const statementData = {
      ...req.body,
      companyId: req.companyId,
      userId: req.user._id
    };

    const statement = new BankStatement(statementData);
    await statement.save();

    res.status(201).json(statement);
  } catch (error) {
    console.error('Create bank statement error:', error);
    res.status(500).json({ message: 'Failed to create bank statement' });
  }
});

// Update bank statement
router.put('/statements/:id', authenticateToken, requireCompany, async (req, res) => {
  try {
    const statement = await BankStatement.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      req.body,
      { new: true }
    );

    if (!statement) {
      return res.status(404).json({ message: 'Bank statement not found' });
    }

    res.json(statement);
  } catch (error) {
    console.error('Update bank statement error:', error);
    res.status(500).json({ message: 'Failed to update bank statement' });
  }
});

// Get all bank transactions
router.get('/transactions', authenticateToken, requireCompany, async (req, res) => {
  try {
    const statements = await BankStatement.find({ companyId: req.companyId });
    const transactions = statements.flatMap(stmt => 
      stmt.transactions.map(tx => ({
        ...tx.toObject(),
        statementId: stmt._id,
        bankName: stmt.bankName,
        accountNumber: stmt.accountNumber
      }))
    );
    res.json(transactions);
  } catch (error) {
    console.error('Get bank transactions error:', error);
    res.status(500).json({ message: 'Failed to fetch bank transactions' });
  }
});

export default router;