import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/Auth/AuthPage';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { FileUpload } from './components/FileUpload';
import { DocumentCard } from './components/DocumentCard';
import { ContractCard } from './components/ContractCard';
import { ContractsManager } from './components/ContractsManager';
import { InvoiceManager } from './components/InvoiceManager';
import { InventoryManager } from './components/InventoryManager';
import { BankReconciliationManager } from './components/BankReconciliationManager';
import { ReportsManager } from './components/ReportsManager';
import { SettingsManager } from './components/SettingsManager';
import { ChatBot } from './components/ChatBot';
import { DateFilter } from './components/DateFilter';
import { useDocumentsDB } from './hooks/useDocumentsDB';
import { useContracts } from './hooks/useContracts';
import { useAccounting } from './hooks/useAccounting';
import { useBankReconciliation } from './hooks/useBankReconciliation';

function AppContent() {
  const { isAuthenticated, isLoading, user, company } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Custom hooks
  const { documents, transactions, isProcessing, processDocument } = useDocumentsDB();
  const { contracts, isProcessing: isProcessingContract, processContract } = useContracts();
  const { 
    clients, 
    suppliers, 
    invoices, 
    products, 
    taxReports, 
    bankAccounts, 
    budgets, 
    companySettings, 
    chatHistory,
    addClient,
    addSupplier,
    addProduct,
    createInvoice,
    generateTaxReport,
    addBankAccount,
    createBudget,
    setCompanySettings,
    addChatMessage
  } = useAccounting();

  const {
    bankStatements,
    bankTransactions,
    reconciliations,
    isProcessing: isProcessingBank,
    processBankStatement,
    manualReconcile,
    getReconciliationSummary
  } = useBankReconciliation(documents, transactions, invoices);

  // Filter documents based on selected criteria
  const filteredDocuments = documents.filter(doc => {
    if (categoryFilter !== 'all' && doc.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
    if (selectedMonth || selectedYear) {
      const docDate = new Date(doc.uploadedAt);
      const docYear = docDate.getFullYear().toString();
      const docMonth = (docDate.getMonth() + 1).toString().padStart(2, '0');
      
      if (selectedYear && docYear !== selectedYear) return false;
      if (selectedMonth && docMonth !== selectedMonth) return false;
    }
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      case 'oldest':
        return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      case 'amount-high':
        const amountA = parseFloat(a.amount.replace(/[^\d.-]/g, '')) || 0;
        const amountB = parseFloat(b.amount.replace(/[^\d.-]/g, '')) || 0;
        return amountB - amountA;
      case 'amount-low':
        const amountA2 = parseFloat(a.amount.replace(/[^\d.-]/g, '')) || 0;
        const amountB2 = parseFloat(b.amount.replace(/[^\d.-]/g, '')) || 0;
        return amountA2 - amountB2;
      default:
        return 0;
    }
  });

  // Calculate totals
  const totalRevenue = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Se încarcă ContaAI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard
            documents={documents}
            transactions={transactions}
            contracts={contracts}
            bankStatements={bankStatements}
            reconciliations={reconciliations}
            invoices={invoices}
            products={products}
            companySettings={companySettings}
          />
        );

      case 'upload':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Încărcare Documente</h2>
              <p className="text-gray-400">Încarcă și procesează documente contabile cu AI</p>
            </div>
            <FileUpload onFileUpload={processDocument} isProcessing={isProcessing} />
            {isProcessing && (
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-blue-400 font-medium">
                    Se procesează documentul cu Gemini AI...
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      case 'documents':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Documente</h2>
                <p className="text-gray-400">
                  {filteredDocuments.length} din {documents.length} documente
                  {(selectedMonth || selectedYear || categoryFilter !== 'all' || statusFilter !== 'all') && (
                    <span className="ml-2 text-blue-400">- filtrate</span>
                  )}
                </p>
              </div>
              <div className="flex gap-3 items-center flex-wrap">
                <DateFilter
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                  onMonthChange={setSelectedMonth}
                  onYearChange={setSelectedYear}
                  onClear={() => {
                    setSelectedMonth('');
                    setSelectedYear('');
                  }}
                  showClear={!!(selectedMonth || selectedYear)}
                />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Toate categoriile</option>
                  <option value="Transport">Transport</option>
                  <option value="Servicii">Servicii</option>
                  <option value="Materiale">Materiale</option>
                  <option value="Utilitati">Utilități</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Toate statusurile</option>
                  <option value="completed">Procesate</option>
                  <option value="processing">În procesare</option>
                  <option value="error">Eroare</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Cele mai noi</option>
                  <option value="oldest">Cele mai vechi</option>
                  <option value="amount-high">Sumă mare</option>
                  <option value="amount-low">Sumă mică</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filteredDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
              
              {filteredDocuments.length === 0 && documents.length > 0 && (
                <div className="col-span-full text-center py-16">
                  <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Nu s-au găsit documente</h3>
                  <p className="text-gray-400 mb-6">Încearcă să modifici filtrele de căutare</p>
                  <button
                    onClick={() => {
                      setSelectedMonth('');
                      setSelectedYear('');
                      setCategoryFilter('all');
                      setStatusFilter('all');
                      setSortBy('newest');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                  >
                    Resetează filtrele
                  </button>
                </div>
              )}
              
              {documents.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Nu există documente încărcate</h3>
                  <p className="text-gray-400 mb-6">Începe prin a încărca primul document pentru procesare cu AI</p>
                  <button
                    onClick={() => setActiveView('upload')}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Încarcă primul document
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'contracts':
        return (
          <ContractsManager
            contracts={contracts}
            onProcessContract={processContract}
            isProcessing={isProcessingContract}
          />
        );

      case 'invoices':
        return (
          <InvoiceManager
            invoices={invoices}
            clients={clients}
            onCreateInvoice={createInvoice}
            onAddClient={addClient}
          />
        );

      case 'inventory':
        return (
          <InventoryManager
            products={products}
            onAddProduct={addProduct}
          />
        );

      case 'reconciliation':
        return (
          <BankReconciliationManager
            bankStatements={bankStatements}
            bankTransactions={bankTransactions}
            reconciliations={reconciliations}
            isProcessing={isProcessingBank}
            onProcessBankStatement={processBankStatement}
            onManualReconcile={manualReconcile}
            reconciliationSummary={getReconciliationSummary()}
          />
        );

      case 'reports':
        return (
          <ReportsManager
            transactions={transactions}
            taxReports={taxReports}
            contracts={contracts}
            bankStatements={bankStatements}
            invoices={invoices}
            products={products}
            onGenerateReport={generateTaxReport}
          />
        );

      case 'settings':
        return (
          <SettingsManager
            settings={companySettings}
            onUpdateSettings={setCompanySettings}
          />
        );

      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Pagina nu a fost găsită</h2>
            <p className="text-gray-400">Secțiunea solicitată nu există.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="flex h-screen">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
      
      <ChatBot
        chatHistory={chatHistory}
        onAddMessage={addChatMessage}
        documents={documents}
        transactions={transactions}
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
        companyName={company?.name || companySettings.name || 'Compania Ta'}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;