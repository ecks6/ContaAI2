import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { Briefcase, Zap, Shield, BarChart3, FileText, CreditCard } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const features = [
    {
      icon: FileText,
      title: 'Procesare AI',
      description: 'Analizează documente cu Gemini AI'
    },
    {
      icon: BarChart3,
      title: 'Rapoarte Automate',
      description: 'Generează rapoarte financiare instant'
    },
    {
      icon: CreditCard,
      title: 'Reconciliere Bancară',
      description: 'Reconciliază automat tranzacțiile'
    },
    {
      icon: Shield,
      title: 'Securitate Avansată',
      description: 'Datele tale sunt protejate'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12">
        <div className="max-w-lg">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">ContaAI</h1>
              <p className="text-blue-300 text-lg">Contabilitate inteligentă</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-6">
            Transformă-ți contabilitatea cu puterea AI
          </h2>
          
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            Procesează documente, generează rapoarte și gestionează financele companiei 
            cu ajutorul inteligenței artificiale Gemini.
          </p>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold">Powered by Gemini AI</span>
            </div>
            <p className="text-gray-300 text-sm">
              Folosește cea mai avansată tehnologie AI pentru procesarea documentelor contabile
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
};