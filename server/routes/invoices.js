import express from 'express';
import Invoice from '../models/Invoice.js';
import Client from '../models/Client.js';
import Company from '../models/Company.js';
import { authenticateToken, requireCompany } from '../middleware/auth.js';

const router = express.Router();

// Get all invoices
router.get('/', authenticateToken, requireCompany, async (req, res) => {
  try {
    const invoices = await Invoice.find({ companyId: req.companyId })
      .populate('clientId')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
});

// Create invoice
router.post('/', authenticateToken, requireCompany, async (req, res) => {
  try {
    // Get company to generate invoice number
    const company = await Company.findById(req.companyId);
    const invoiceNumber = `${company.invoicePrefix}-${company.invoiceCounter.toString().padStart(4, '0')}`;

    const invoiceData = {
      ...req.body,
      number: invoiceNumber,
      companyId: req.companyId,
      userId: req.user._id
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    // Update company invoice counter
    company.invoiceCounter += 1;
    await company.save();

    // Update client total invoiced
    await Client.findByIdAndUpdate(
      req.body.clientId,
      { $inc: { totalInvoiced: req.body.total } }
    );

    const populatedInvoice = await Invoice.findById(invoice._id).populate('clientId');
    res.status(201).json(populatedInvoice);
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ message: 'Failed to create invoice' });
  }
});

// Update invoice
router.put('/:id', authenticateToken, requireCompany, async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      req.body,
      { new: true }
    ).populate('clientId');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ message: 'Failed to update invoice' });
  }
});

// Get all clients
router.get('/clients', authenticateToken, requireCompany, async (req, res) => {
  try {
    const clients = await Client.find({ companyId: req.companyId })
      .sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ message: 'Failed to fetch clients' });
  }
});

// Create client
router.post('/clients', authenticateToken, requireCompany, async (req, res) => {
  try {
    const clientData = {
      ...req.body,
      companyId: req.companyId,
      userId: req.user._id
    };

    const client = new Client(clientData);
    await client.save();

    res.status(201).json(client);
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ message: 'Failed to create client' });
  }
});

export default router;