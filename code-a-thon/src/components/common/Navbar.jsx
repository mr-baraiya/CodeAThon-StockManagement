import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  HomeIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActiveLink = (path) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-2xl backdrop-blur-sm border-b border-blue-500/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center"
          >
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg mr-3 flex items-center justify-center shadow-lg"
              >
                <span className="text-white font-bold text-lg">C</span>
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                CodeAThon
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {isAuthenticated() ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/dashboard"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:shadow-lg ${isActiveLink('/dashboard') ? 'bg-white/20 shadow-lg' : ''}`}
                  >
                    <HomeIcon className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/profile"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:shadow-lg ${isActiveLink('/profile') ? 'bg-white/20 shadow-lg' : ''}`}
                  >
                    <UserCircleIcon className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                </motion.div>

                {isAdmin() && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/admin"
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:shadow-lg ${isActiveLink('/admin') ? 'bg-white/20 shadow-lg' : ''}`}
                    >
                      <ShieldCheckIcon className="w-4 h-4" />
                      <span>Admin Panel</span>
                    </Link>
                  </motion.div>
                )}

                {/* User Dropdown */}
                <div className="relative ml-4" ref={dropdownRef}>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200 shadow-lg bg-white/10"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-semibold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <span className="max-w-32 truncate">{user?.name}</span>
                    <motion.div
                      animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDownIcon className="w-4 h-4" />
                    </motion.div>
                  </motion.button>
                  
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-200 backdrop-blur-sm"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        
                        <motion.div whileHover={{ backgroundColor: "#f3f4f6" }}>
                          <Link
                            to="/profile"
                            onClick={closeDropdown}
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 transition-colors duration-150"
                          >
                            <UserIcon className="w-4 h-4" />
                            <span>My Profile</span>
                          </Link>
                        </motion.div>
                        
                        <motion.div whileHover={{ backgroundColor: "#f3f4f6" }}>
                          <Link
                            to="/settings"
                            onClick={closeDropdown}
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 transition-colors duration-150"
                          >
                            <Cog6ToothIcon className="w-4 h-4" />
                            <span>Settings</span>
                          </Link>
                        </motion.div>
                        
                        <hr className="my-1 border-gray-200" />
                        
                        <motion.button
                          whileHover={{ backgroundColor: "#fef2f2" }}
                          onClick={handleLogout}
                          className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 transition-colors duration-150"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4" />
                          <span>Sign out</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:shadow-lg ${isActiveLink('/login') ? 'bg-white/20 shadow-lg' : ''}`}
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register"
                    className={`px-6 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:from-yellow-500 hover:to-orange-600 ${isActiveLink('/register') ? 'from-yellow-500 to-orange-600' : ''}`}
                  >
                    Register
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-white/20 pt-4 pb-4"
            >
              {isAuthenticated() ? (
                <div className="space-y-2">
                  <motion.div whileHover={{ x: 10 }}>
                    <Link
                      to="/dashboard"
                      onClick={toggleMobileMenu}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 ${isActiveLink('/dashboard') ? 'bg-white/20' : ''}`}
                    >
                      <HomeIcon className="w-5 h-5" />
                      <span>Dashboard</span>
                    </Link>
                  </motion.div>
                  
                  <motion.div whileHover={{ x: 10 }}>
                    <Link
                      to="/profile"
                      onClick={toggleMobileMenu}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 ${isActiveLink('/profile') ? 'bg-white/20' : ''}`}
                    >
                      <UserCircleIcon className="w-5 h-5" />
                      <span>Profile</span>
                    </Link>
                  </motion.div>

                  {isAdmin() && (
                    <motion.div whileHover={{ x: 10 }}>
                      <Link
                        to="/admin"
                        onClick={toggleMobileMenu}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 ${isActiveLink('/admin') ? 'bg-white/20' : ''}`}
                      >
                        <ShieldCheckIcon className="w-5 h-5" />
                        <span>Admin Panel</span>
                      </Link>
                    </motion.div>
                  )}

                  <motion.div whileHover={{ x: 10 }}>
                    <Link
                      to="/settings"
                      onClick={toggleMobileMenu}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 ${isActiveLink('/settings') ? 'bg-white/20' : ''}`}
                    >
                      <Cog6ToothIcon className="w-5 h-5" />
                      <span>Settings</span>
                    </Link>
                  </motion.div>

                  <hr className="my-2 border-white/20" />
                  
                  <motion.button
                    whileHover={{ x: 10 }}
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/10 transition-all duration-200"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span>Sign out</span>
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-2">
                  <motion.div whileHover={{ x: 10 }}>
                    <Link
                      to="/login"
                      onClick={toggleMobileMenu}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 ${isActiveLink('/login') ? 'bg-white/20' : ''}`}
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ x: 10 }}>
                    <Link
                      to="/register"
                      onClick={toggleMobileMenu}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:from-yellow-500 hover:to-orange-600 ${isActiveLink('/register') ? 'from-yellow-500 to-orange-600' : ''}`}
                    >
                      Register
                    </Link>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
