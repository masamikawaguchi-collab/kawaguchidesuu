import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, List, PlusCircle, Briefcase, LogOut, Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setCurrentView }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-1 ${
        currentView === view
          ? 'bg-blue-800 text-white'
          : 'text-blue-100 hover:bg-blue-800 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="px-6 py-8 border-b border-slate-700 flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center mr-3">
              <Briefcase className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-wider">SalesFlow</h1>
          </div>

          <nav className="flex-1 px-4 py-6">
            <NavItem view="DASHBOARD" icon={LayoutDashboard} label="ダッシュボード" />
            <NavItem view="LIST" icon={List} label="商談一覧" />
            <button
              onClick={() => {
                setCurrentView('FORM');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-1 ${
                currentView === 'FORM'
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-100 hover:bg-blue-800 hover:text-white'
              }`}
            >
              <PlusCircle className="w-5 h-5 mr-3" />
              新規登録
            </button>
          </nav>

          <div className="p-4 border-t border-slate-700">
            <button className="flex items-center text-slate-400 hover:text-white text-sm px-4 py-2 transition-colors">
              <LogOut className="w-4 h-4 mr-3" />
              ログアウト
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10 md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-bold text-slate-800">SalesFlow</span>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};