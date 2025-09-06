import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  UserIcon, 
  ShieldCheckIcon, 
  CogIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

const DemoCredentials = ({ onSelectUser }) => {
  const testUsers = [
    {
      email: 'admin@stockms.com',
      password: 'admin123',
      role: 'admin',
      name: 'System Administrator',
      description: 'Full access to all features',
      icon: ShieldCheckIcon,
      bgColor: 'bg-red-50 border-red-200',
      iconColor: 'text-red-600',
      buttonColor: 'bg-red-600 hover:bg-red-700'
    },
    {
      email: 'manager@stockms.com',
      password: 'manager123',
      role: 'manager',
      name: 'Store Manager',
      description: 'Can manage suppliers, purchase orders',
      icon: CogIcon,
      bgColor: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      email: 'staff@stockms.com',
      password: 'staff123',
      role: 'staff',
      name: 'Store Staff',
      description: 'Can manage sales, update stock',
      icon: UserIcon,
      bgColor: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
      buttonColor: 'bg-green-600 hover:bg-green-700'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="mt-8 p-6 bg-white rounded-2xl shadow-xl border border-gray-100"
    >
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Demo Login Credentials
        </h3>
        <p className="text-sm text-gray-600">
          Click any role below to auto-fill login credentials
        </p>
      </div>

      <div className="space-y-4">
        {testUsers.map((user, index) => (
          <motion.div
            key={user.role}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.4 }}
            className={`p-4 rounded-xl border-2 ${user.bgColor} cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg`}
            onClick={() => onSelectUser(user)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                  <user.icon className={`w-5 h-5 ${user.iconColor}`} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{user.name}</h4>
                  <p className="text-sm text-gray-600">{user.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {user.email}
                  </p>
                </div>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-gray-400" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Or{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            create your own account
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default DemoCredentials;
