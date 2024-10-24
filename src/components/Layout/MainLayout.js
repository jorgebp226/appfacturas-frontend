import React from 'react';
import Sidebar from './SideBar';

const MainLayout = ({ children, onSignOut }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onSignOut={onSignOut} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 pl-64">
        <div className="container mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};