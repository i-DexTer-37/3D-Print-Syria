
import React from 'react';
import type { View } from '../App';
import { LogoIcon, XIcon } from './icons/Icons';
import { useTranslation } from '../hooks/useTranslation';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  navigationItems: {
    name: View;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, navigationItems, isOpen, setIsOpen }) => {
  const { lang } = useTranslation();

  const sidebarClasses = `
    fixed inset-y-0 ${lang === 'ar' ? 'right-0' : 'left-0'} z-50
    w-64 bg-[#1a2e2e] text-white flex flex-col
    transform transition-transform duration-300 ease-in-out
    sm:relative sm:translate-x-0
    ${isOpen 
        ? 'translate-x-0' 
        : (lang === 'ar' ? 'translate-x-full' : '-translate-x-full')}
  `;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      <aside className={sidebarClasses} aria-label="Sidebar">
        <div className="flex items-center justify-between h-20 border-b border-gray-700/50 px-4">
          <div className="flex items-center">
            <LogoIcon className="w-10 h-10 text-teal-400" />
            <h1 className="text-lg font-bold whitespace-nowrap mx-3">3D Print Syria POS</h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="sm:hidden text-gray-300 hover:text-white" aria-label="Close menu">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6">
          <ul>
            {navigationItems.map(item => (
              <li key={item.name}>
                <button
                  onClick={() => setCurrentView(item.name)}
                  className={`w-full flex items-center px-4 py-3 my-1 rounded-md transition-colors duration-200 ${
                    currentView === item.name
                      ? 'bg-teal-600 text-white'
                      : 'text-gray-300 hover:bg-teal-900/50 hover:text-white'
                  }`}
                >
                  <item.icon className={`w-6 h-6 ${lang === 'ar' ? 'ml-4' : 'mr-4'}`} />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
