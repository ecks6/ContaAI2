import express from 'express';
import Document from '../models/Document.js';
import Contract from '../models/Contract.js';
import Invoice from '../models/Invoice.js';
import Product from '../models/Product.js';
import BankStatement from '../models/BankStatement.js';
import { authenticateToken, requireCompany } from '../middleware/auth.js';

const router = express.Router();

// Generate financial report
router.get('/financial', authenticateToken, requireCompany, async (req, res) => {
  try {
    const { startDate, endDate, type = 'monthly' } = req.query;
    
    // Get all data for the company
    const documents = await Document.find({ companyId: req.companyId });
    const contracts = await Contract.find({ companyId: req.companyId });
    const invoices = await Invoice.find({ companyId: req.companyId }).populate('clientId');
    const products = await Product.find({ companyId: req.companyId });
    const bankStatements = await BankStatement.find({ companyId: req.companyId });

    // Calculate financial metrics
    const transactions = documents.flatMap(doc => doc.generatedTransactions);
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    // Invoice metrics
    const totalInvoiceValue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');

    // Contract metrics
    const activeContracts = contracts.filter(c => c.status === 'active');
    const totalContractValue = contracts.reduce((sum, c) => sum + c.value, 0);

    // Product metrics
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock * p.unitPrice), 0);
    const lowStockProducts = products.filter(p => p.stock <= p.minStock);

    const report = {
      period: { startDate, endDate, type },
      financial: {
        totalIncome,
        totalExpenses,
        netProfit,
        profitMargin: totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0
      },
      invoices: {
        total: invoices.length,
        totalValue: totalInvoiceValue,
        paid: paidInvoices.length,
        overdue: overdueInvoices.length,
        collectionRate: totalInvoiceValue > 0 ? (paidInvoices.reduce((sum, inv) => sum + inv.total, 0) / totalInvoiceValue) * 100 : 0
      },
      contracts: {
        total: contracts.length,
        active: activeContracts.length,
        totalValue: totalContractValue
      },
      inventory: {
        totalProducts: products.length,
        totalValue: totalInventoryValue,
        lowStock: lowStockProducts.length
      },
      banking: {
        statements: bankStatements.length,
        totalTransactions: bankStatements.reduce((sum, stmt) => sum + stmt.totalTransactions, 0)
      },
      generatedAt: new Date()
    };

    res.json(report);
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

// Get dashboard data
router.get('/dashboard', authenticateToken, requireCompany, async (req, res) => {
  try {
    const documents = await Document.find({ companyId: req.companyId });
    const contracts = await Contract.find({ companyId: req.companyId });
    const invoices = await Invoice.find({ companyId: req.companyId }).populate('clientId');
    const products = await Product.find({ companyId: req.companyId });
    const bankStatements = await BankStatement.find({ companyId: req.companyId });

    const transactions = documents.flatMap(doc => doc.generatedTransactions);
    
    res.json({
      documents,
      contracts,
      invoices,
      products,
      bankStatements,
      transactions,
      summary: {
        totalDocuments: documents.length,
        completedDocuments: documents.filter(d => d.status === 'completed').length,
        totalContracts: contracts.length,
        activeContracts: contracts.filter(c => c.status === 'active').length,
        totalInvoices: invoices.length,
        paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
        totalProducts: products.length,
        lowStockProducts: products.filter(p => p.stock <= p.minStock).length
      }
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

export default router;