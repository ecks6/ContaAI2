import { useState, useEffect, useCallback } from 'react';
import { Document, Transaction } from '../types';
import { apiService } from '../services/api';
import { analyzeDocument, GeminiAnalysis } from '../services/geminiService';

export const useDocumentsDB = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load documents from database
  const loadDocuments = useCallback(async () => {
    try {
      const [documentsData, transactionsData] = await Promise.all([
        apiService.getDocuments(),
        apiService.getTransactions()
      ]);
      
      setDocuments(documentsData.map(transformDocumentFromDB));
      setTransactions(transactionsData.map(transformTransactionFromDB));
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const processDocument = useCallback(async (file: File) => {
    setIsProcessing(true);
    
    try {
      // Convert file to base64
      const base64Data = await fileToBase64(file);
      
      // Create document in database
      const documentData = {
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        fileType: file.type,
        fileData: base64Data,
        status: 'processing'
      };

      const savedDocument = await apiService.createDocument(documentData);
      const newDocument = transformDocumentFromDB(savedDocument);
      setDocuments(prev => [...prev, newDocument]);

      // Process with Gemini AI
      try {
        const analysis: GeminiAnalysis = await analyzeDocument(file);
        
        // Generate transaction from analysis
        const generatedTransaction = {
          description: analysis.description,
          amount: parseAmount(analysis.amount),
          type: categorizeTransactionType(analysis.category),
          category: analysis.category,
          date: parseDate(analysis.documentDate) || new Date()
        };

        // Update document with analysis results
        const updatedDocumentData = {
          category: analysis.category,
          status: 'completed',
          geminiAnalysis: analysis.confidence,
          supplier: analysis.supplier,
          amount: analysis.amount,
          client: analysis.client,
          documentDate: analysis.documentDate,
          invoiceNumber: analysis.invoiceNumber,
          cui: analysis.cui,
          description: analysis.description,
          aiInsights: analysis.insights,
          recommendations: analysis.recommendations,
          generatedTransactions: [generatedTransaction]
        };

        const updatedDocument = await apiService.updateDocument(savedDocument._id, updatedDocumentData);
        const transformedDocument = transformDocumentFromDB(updatedDocument);
        
        setDocuments(prev => prev.map(doc => 
          doc.id === transformedDocument.id ? transformedDocument : doc
        ));

        // Add transaction to local state
        const newTransaction = {
          ...generatedTransaction,
          id: `${transformedDocument.id}-tx-1`,
          documentId: transformedDocument.id
        };
        setTransactions(prev => [...prev, newTransaction]);
        
      } catch (analysisError) {
        console.error('Error analyzing document:', analysisError);
        await apiService.updateDocument(savedDocument._id, { status: 'error' });
        setDocuments(prev => prev.map(doc => 
          doc.id === savedDocument._id ? { ...doc, status: 'error' } : doc
        ));
      }
      
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    documents,
    transactions,
    isProcessing,
    isLoading,
    processDocument,
    refreshDocuments: loadDocuments
  };
};

// Helper functions
const transformDocumentFromDB = (dbDoc: any): Document => ({
  id: dbDoc._id,
  fileName: dbDoc.fileName,
  fileSize: dbDoc.fileSize,
  category: dbDoc.category || '',
  status: dbDoc.status,
  geminiAnalysis: dbDoc.geminiAnalysis || 0,
  supplier: dbDoc.supplier || '',
  amount: dbDoc.amount || '',
  client: dbDoc.client || '',
  documentDate: dbDoc.documentDate || '',
  invoiceNumber: dbDoc.invoiceNumber,
  cui: dbDoc.cui,
  description: dbDoc.description || '',
  aiInsights: dbDoc.aiInsights || [],
  recommendations: dbDoc.recommendations || [],
  generatedTransactions: dbDoc.generatedTransactions?.map(transformTransactionFromDB) || [],
  uploadedAt: new Date(dbDoc.createdAt)
});

const transformTransactionFromDB = (dbTx: any): Transaction => ({
  id: dbTx._id || dbTx.id || Date.now().toString(),
  description: dbTx.description,
  amount: dbTx.amount,
  type: dbTx.type,
  category: dbTx.category,
  date: new Date(dbTx.date),
  documentId: dbTx.documentId
});

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const parseAmount = (amountStr: string): number => {
  const numberMatch = amountStr.match(/[\d,.-]+/);
  if (numberMatch) {
    return parseFloat(numberMatch[0].replace(',', '.'));
  }
  return 0;
};

const categorizeTransactionType = (category: string): 'income' | 'expense' => {
  const incomeCategories = ['servicii', 'consultanta', 'vanzari'];
  return incomeCategories.some(cat => 
    category.toLowerCase().includes(cat)
  ) ? 'income' : 'expense';
};

const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  
  const formats = [
    /(\d{2})\.(\d{2})\.(\d{4})/,
    /(\d{4})-(\d{2})-(\d{2})/,
    /(\d{2})\/(\d{2})\/(\d{4})/
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (format === formats[1]) {
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
      } else {
        return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
      }
    }
  }
  
  return null;
};