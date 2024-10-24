import React from 'react';
import SideBar from './Layout/SideBar';

const Layout = ({ children }) => {
  return (
    <div className="flex">
      <SideBar />
      <div className="ml-64 w-full">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};