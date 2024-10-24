import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  FileText, 
  ChefHat,
  BarChart2, 
  LogOut
} from 'lucide-react';
import { signOut } from 'aws-amplify/auth';

const SidebarItem = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 px-6 py-3 text-sm transition-colors ${
      active 
        ? 'bg-blue-700 text-white' 
        : 'text-gray-300 hover:bg-blue-700/50 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </Link>
);

const Sidebar = ({ onSignOut }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      onSignOut?.();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="fixed left-0 top-0 z-40 h-full w-64 bg-blue-800">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center space-x-2">
          <LayoutDashboard className="h-8 w-8 text-white" />
          <span className="text-xl font-bold text-white">KITCHEN ERP</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 space-y-1">
        <SidebarItem 
          to="/digitalizar" 
          icon={Receipt} 
          label="Digitalizar Facturas"
          active={isActive('/digitalizar')}
        />
        <SidebarItem 
          to="/gastos" 
          icon={FileText} 
          label="Ver Gastos"
          active={isActive('/gastos')}
        />
        <SidebarItem 
          to="/escandallos" 
          icon={ChefHat} 
          label="Escandallos IA"
          active={isActive('/escandallos')}
        />
        <SidebarItem 
          to="/analytics" 
          icon={BarChart2} 
          label="Analytics"
          active={isActive('/analytics')}
        />
      </nav>

      {/* Sign Out Button */}
      <div className="absolute bottom-4 w-full px-6">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center space-x-3 rounded-md bg-blue-900 px-4 py-2 text-sm text-white hover:bg-blue-950"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};
export default Sidebar;