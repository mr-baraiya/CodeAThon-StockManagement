import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HomeIcon,
  CubeIcon,
  EyeIcon,
  CalculatorIcon,
  ChartBarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const StaffNavigation = () => {
  const location = useLocation();
  
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      description: 'Overview and quick stats'
    },
    {
      name: 'Stock Management',
      href: '/staff/stock',
      icon: CubeIcon,
      description: 'Stock in/out operations'
    },
    {
      name: 'Product View',
      href: '/staff/products',
      icon: EyeIcon,
      description: 'Browse products (read-only)'
    },
    {
      name: 'Bill Management',
      href: '/staff/billing',
      icon: CalculatorIcon,
      description: 'Generate invoices and bills'
    },
    {
      name: 'Sales Reports',
      href: '/staff/reports',
      icon: ChartBarIcon,
      description: 'Daily sales reports'
    }
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Functions</h3>
      <div className="space-y-3">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                active
                  ? 'bg-blue-50 border border-blue-200 text-blue-700'
                  : 'hover:bg-gray-50 border border-transparent text-gray-700 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <div>
                  <p className={`font-medium ${active ? 'text-blue-900' : 'text-gray-900'}`}>
                    {item.name}
                  </p>
                  <p className={`text-sm ${active ? 'text-blue-600' : 'text-gray-500'}`}>
                    {item.description}
                  </p>
                </div>
              </div>
              <ArrowRightIcon className={`w-4 h-4 ${
                active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'
              }`} />
            </Link>
          );
        })}
      </div>
      
      {/* Staff Access Notice */}
      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 font-medium">Staff Access Level</p>
        <p className="text-xs text-blue-600 mt-1">
          Limited permissions - Contact manager for additional access
        </p>
      </div>
    </motion.div>
  );
};

export default StaffNavigation;
