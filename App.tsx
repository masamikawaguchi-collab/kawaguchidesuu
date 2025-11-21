import React, { useState, useEffect } from 'react';
import { Negotiation, NegotiationFormData, ViewState } from './types';
import { MOCK_NEGOTIATIONS } from './constants';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { NegotiationList } from './components/NegotiationList';
import { NegotiationForm } from './components/NegotiationForm';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [negotiations, setNegotiations] = useState<Negotiation[]>(MOCK_NEGOTIATIONS);
  const [editingNegotiation, setEditingNegotiation] = useState<Negotiation | undefined>(undefined);

  // Handle saving (create or update)
  const handleSave = (data: NegotiationFormData) => {
    if (data.id) {
      // Update existing
      setNegotiations(prev => prev.map(item => 
        item.id === data.id 
          ? { ...item, ...data, updatedAt: Date.now() } as Negotiation 
          : item
      ));
    } else {
      // Create new
      const newNegotiation: Negotiation = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as Negotiation;
      setNegotiations(prev => [newNegotiation, ...prev]);
    }
    
    setCurrentView('LIST');
    setEditingNegotiation(undefined);
  };

  // Handle switch to edit mode
  const handleEdit = (negotiation: Negotiation) => {
    setEditingNegotiation(negotiation);
    setCurrentView('FORM');
  };

  // Handle switching views (reset editing state if leaving form)
  const handleViewChange = (view: ViewState) => {
    if (view !== 'FORM') {
      setEditingNegotiation(undefined);
    }
    setCurrentView(view);
  };

  // Render content based on view state
  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard negotiations={negotiations} />;
      case 'LIST':
        return <NegotiationList negotiations={negotiations} onEdit={handleEdit} />;
      case 'FORM':
        return (
          <NegotiationForm 
            initialData={editingNegotiation} 
            onSave={handleSave} 
            onCancel={() => handleViewChange('LIST')}
          />
        );
      default:
        return <Dashboard negotiations={negotiations} />;
    }
  };

  return (
    <Layout currentView={currentView} setCurrentView={handleViewChange}>
      {renderContent()}
    </Layout>
  );
}

export default App;