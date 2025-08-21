import express from 'express';
import Document from '../models/Document.js';
import { authenticateToken, requireCompany } from '../middleware/auth.js';

const router = express.Router();

// Get all documents
router.get('/', authenticateToken, requireCompany, async (req, res) => {
  try {
    const documents = await Document.find({ companyId: req.companyId })
      .sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
});

// Create document
router.post('/', authenticateToken, requireCompany, async (req, res) => {
  try {
    const documentData = {
      ...req.body,
      companyId: req.companyId,
      userId: req.user._id
    };

    const document = new Document(documentData);
    await document.save();

    res.status(201).json(document);
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ message: 'Failed to create document' });
  }
});

// Update document
router.put('/:id', authenticateToken, requireCompany, async (req, res) => {
  try {
    const document = await Document.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      req.body,
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ message: 'Failed to update document' });
  }
});

// Delete document
router.delete('/:id', authenticateToken, requireCompany, async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Failed to delete document' });
  }
});

// Get transactions from documents
router.get('/transactions', authenticateToken, requireCompany, async (req, res) => {
  try {
    const documents = await Document.find({ companyId: req.companyId });
    const transactions = documents.flatMap(doc => 
      doc.generatedTransactions.map(tx => ({
        ...tx.toObject(),
        documentId: doc._id
      }))
    );
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

export default router;