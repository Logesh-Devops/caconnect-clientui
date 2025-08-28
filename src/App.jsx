
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { AuthProvider, useAuth } from '@/hooks/useAuth.jsx';
import { Toaster } from '@/components/ui/toaster';
import LoginForm from '@/components/auth/LoginForm';
import Sidebar from '@/components/layout/Sidebar';
import Dashboard from '@/components/dashboard/Dashboard';
import Documents from '@/components/documents/Documents';
import Finance from '@/components/finance/Finance';
import Beneficiaries from '@/components/beneficiaries/Beneficiaries';
import OrganisationBank from '@/components/organisation/OrganisationBank.jsx';
import Profile from '@/components/profile/Profile.jsx';
import { motion } from 'framer-motion';
import { getOrganisationBankAccounts } from '@/lib/api';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentEntity, setCurrentEntity] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [quickAction, setQuickAction] = useState(null);
  const [organisationBankAccounts, setOrganisationBankAccounts] = useState([]);

  const fetchOrganisationBankAccounts = useCallback(async () => {
    if (currentEntity && user?.access_token) {
      try {
        const accounts = await getOrganisationBankAccounts(currentEntity, user.access_token);
        setOrganisationBankAccounts(accounts);
      } catch (error) {
        console.error("Failed to fetch organisation bank accounts:", error);
        setOrganisationBankAccounts([]);
      }
    }
  }, [currentEntity, user?.access_token]);

  useEffect(() => {
    fetchOrganisationBankAccounts();
  }, [fetchOrganisationBankAccounts]);

  const handleQuickAction = useCallback((action) => {
    const actionMap = {
      'add-beneficiary': 'beneficiaries',
      'add-invoice': 'finance',
      'add-voucher': 'finance',
      'add-organisation-bank': 'organisation-bank',
    };
    const targetTab = actionMap[action];
    if (targetTab) {
      setActiveTab(targetTab);
      setQuickAction(action);
    }
  }, []);

  const clearQuickAction = useCallback(() => {
    setQuickAction(null);
  }, []);

  useEffect(() => {
    if (user && !currentEntity) {
        const entitiesToDisplay = user.entities || [];
        if (entitiesToDisplay.length > 0) {
            setCurrentEntity(entitiesToDisplay[0].id);
        } else if (user.organization_id) {
            setCurrentEntity(user.organization_id);
        }
    }
  }, [user, currentEntity]);
  
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="animated-bg"></div>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }
  
  const getEntityName = (entityId) => {
    const entitiesToDisplay = user.entities || [];
    const entity = entitiesToDisplay.find(e => e.id === entityId);
    if (entity) return entity.name;
    if (entityId === user.organization_id) return user.organization_name;
    return 'Select Entity';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
                  entityId={currentEntity} 
                  entityName={getEntityName(currentEntity)} 
                  onQuickAction={handleQuickAction}
                  organisationBankAccounts={organisationBankAccounts}
                />;
      case 'finance':
        return <Finance 
                  entityName={getEntityName(currentEntity)}
                  organisationBankAccounts={organisationBankAccounts}
                  quickAction={quickAction}
                  clearQuickAction={clearQuickAction}
                  entityId={currentEntity}
                />;
      case 'documents':
        return <Documents 
                  entityId={currentEntity}
                />;
      case 'beneficiaries':
        return <Beneficiaries 
                  quickAction={quickAction}
                  clearQuickAction={clearQuickAction}
                />;
      case 'organisation-bank':
        return <OrganisationBank
                  entityId={currentEntity}
                  entityName={getEntityName(currentEntity)}
                  quickAction={quickAction}
                  clearQuickAction={clearQuickAction}
                />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard 
                  entityId={currentEntity} 
                  entityName={getEntityName(currentEntity)} 
                  onQuickAction={handleQuickAction}
                  organisationBankAccounts={organisationBankAccounts}
                />;
    }
  };

  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentEntity={currentEntity}
        setCurrentEntity={setCurrentEntity}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        getEntityName={getEntityName}
      />
      <motion.main 
        animate={{ marginLeft: isSidebarCollapsed ? '80px' : '288px' }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="flex-1 overflow-auto"
      >
        {currentEntity !== null ? renderContent() : (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
        )}
      </motion.main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Helmet>
        <title>Financial Publication Platform - Manage Your Finances</title>
        <meta name="description" content="Comprehensive financial management platform for documents, beneficiaries, transactions, and invoice management." />
        <meta property="og:title" content="Financial Publication Platform - Manage Your Finances" />
        <meta property="og:description" content="Comprehensive financial management platform for documents, beneficiaries, transactions, and invoice management." />
      </Helmet>
      <div className="animated-bg"></div>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
