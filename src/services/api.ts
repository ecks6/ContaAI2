const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async setupCompany(companyData: any) {
    return this.request('/auth/setup-company', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  }

  // Documents endpoints
  async getDocuments() {
    return this.request('/documents');
  }

  async createDocument(documentData: any) {
    return this.request('/documents', {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  }

  async updateDocument(id: string, documentData: any) {
    return this.request(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(documentData),
    });
  }

  async deleteDocument(id: string) {
    return this.request(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  async getTransactions() {
    return this.request('/documents/transactions');
  }

  // Contracts endpoints
  async getContracts() {
    return this.request('/contracts');
  }

  async createContract(contractData: any) {
    return this.request('/contracts', {
      method: 'POST',
      body: JSON.stringify(contractData),
    });
  }

  async updateContract(id: string, contractData: any) {
    return this.request(`/contracts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contractData),
    });
  }

  // Invoices endpoints
  async getInvoices() {
    return this.request('/invoices');
  }

  async createInvoice(invoiceData: any) {
    return this.request('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  }

  async getClients() {
    return this.request('/invoices/clients');
  }

  async createClient(clientData: any) {
    return this.request('/invoices/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  // Products endpoints
  async getProducts() {
    return this.request('/products');
  }

  async createProduct(productData: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  // Banking endpoints
  async getBankStatements() {
    return this.request('/banking/statements');
  }

  async createBankStatement(statementData: any) {
    return this.request('/banking/statements', {
      method: 'POST',
      body: JSON.stringify(statementData),
    });
  }

  async getBankTransactions() {
    return this.request('/banking/transactions');
  }

  // Reports endpoints
  async getFinancialReport(params: any) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/reports/financial?${queryString}`);
  }

  async getDashboardData() {
    return this.request('/reports/dashboard');
  }

  // Settings endpoints
  async getCompanySettings() {
    return this.request('/settings/company');
  }

  async updateCompanySettings(settingsData: any) {
    return this.request('/settings/company', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  }

  async getUserPreferences() {
    return this.request('/settings/user');
  }

  async updateUserPreferences(preferencesData: any) {
    return this.request('/settings/user', {
      method: 'PUT',
      body: JSON.stringify(preferencesData),
    });
  }
}

export const apiService = new ApiService();