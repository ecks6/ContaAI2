import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Eye, EyeOff, Mail, Lock, User, Building, Loader2 } from 'lucide-react';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // User data
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    // Company data
    companyData: {
      name: '',
      cui: '',
      regCom: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      contactPerson: '',
      activityCode: '',
      employees: 1,
      legalForm: 'SRL'
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      // Validate user data
      if (formData.password !== formData.confirmPassword) {
        setError('Parolele nu se potrivesc');
        return;
      }
      if (formData.password.length < 6) {
        setError('Parola trebuie să aibă cel puțin 6 caractere');
        return;
      }
      setCurrentStep(2);
      setError('');
      return;
    }

    // Step 2 - Submit registration
    setIsLoading(true);
    setError('');

    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyData: {
          ...formData.companyData,
          contactPerson: `${formData.firstName} ${formData.lastName}`
        }
      };

      await register(userData);
    } catch (error: any) {
      setError(error.message || 'Eroare la înregistrare');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Creează cont nou</h2>
        <p className="text-gray-400">Pasul 1: Informații personale</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Prenume
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Prenume"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Nume
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nume"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">
            Adresa de email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="exemplu@email.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">
            Parola
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Minim 6 caractere"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">
            Confirmă parola
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirmă parola"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Configurează compania</h2>
        <p className="text-gray-400">Pasul 2: Informații despre companie</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            value={formData.companyData.name}
            onChange={(e) => setFormData({ 
              ...formData, 
              companyData: { ...formData.companyData, name: e.target.value }
            })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Numele companiei"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={formData.companyData.cui}
              onChange={(e) => setFormData({ 
                ...formData, 
                companyData: { ...formData.companyData, cui: e.target.value }
              })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="CUI"
              required
            />
            <input
              type="text"
              value={formData.companyData.regCom}
              onChange={(e) => setFormData({ 
                ...formData, 
                companyData: { ...formData.companyData, regCom: e.target.value }
              })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nr. Reg. Com."
              required
            />
          </div>
          <textarea
            value={formData.companyData.address}
            onChange={(e) => setFormData({ 
              ...formData, 
              companyData: { ...formData.companyData, address: e.target.value }
            })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Adresa companiei"
            rows={3}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="tel"
              value={formData.companyData.phone}
              onChange={(e) => setFormData({ 
                ...formData, 
                companyData: { ...formData.companyData, phone: e.target.value }
              })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Telefon"
            />
            <input
              type="email"
              value={formData.companyData.email}
              onChange={(e) => setFormData({ 
                ...formData, 
                companyData: { ...formData.companyData, email: e.target.value }
              })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email companie"
            />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
        {currentStep === 1 ? renderStep1() : renderStep2()}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex gap-3">
            {currentStep === 2 && (
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex-1 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
              >
                Înapoi
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Se înregistrează...
                </>
              ) : currentStep === 1 ? (
                'Continuă'
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Creează contul
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Ai deja cont?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Conectează-te aici
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};