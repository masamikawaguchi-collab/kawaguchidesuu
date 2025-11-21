import React, { useState, useEffect } from 'react';
import { Negotiation, NegotiationFormData, ViewState } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { NegotiationList } from './components/NegotiationList';
import { NegotiationForm } from './components/NegotiationForm';
import {
  getAllNegotiations,
  createNegotiation,
  updateNegotiation
} from './services/negotiationService';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [editingNegotiation, setEditingNegotiation] = useState<Negotiation | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load negotiations from database on mount
  useEffect(() => {
    loadNegotiations();
  }, []);

  const loadNegotiations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllNegotiations();
      setNegotiations(data);
    } catch (err) {
      console.error('Failed to load negotiations:', err);
      setError('商談データの読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  // Handle saving (create or update)
  const handleSave = async (data: NegotiationFormData) => {
    try {
      if (data.id) {
        // Update existing
        const updated = await updateNegotiation(data.id, data);
        setNegotiations(prev => prev.map(item =>
          item.id === data.id ? updated : item
        ));
      } else {
        // Create new
        const created = await createNegotiation(data as Omit<Negotiation, 'id' | 'createdAt' | 'updatedAt'>);
        setNegotiations(prev => [created, ...prev]);
      }

      setCurrentView('LIST');
      setEditingNegotiation(undefined);
    } catch (err) {
      console.error('Failed to save negotiation:', err);
      setError('商談の保存に失敗しました。');
    }
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
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">⚠️</div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadNegotiations}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              再読み込み
            </button>
          </div>
        </div>
      );
    }

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