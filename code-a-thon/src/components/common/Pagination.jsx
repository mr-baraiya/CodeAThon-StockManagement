import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  onItemsPerPageChange 
}) => {
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-6 bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
    >
      {/* Items per page selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Show</span>
        <motion.select
          whileHover={{ scale: 1.05 }}
          whileFocus={{ scale: 1.05 }}
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200 cursor-pointer"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </motion.select>
        <span className="text-sm font-medium text-gray-700">entries</span>
      </div>

      {/* Page info */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-sm font-medium text-gray-700 bg-blue-50 px-4 py-2 rounded-lg"
      >
        Showing <span className="font-bold text-blue-600">{startItem}</span> to{' '}
        <span className="font-bold text-blue-600">{endItem}</span> of{' '}
        <span className="font-bold text-blue-600">{totalItems}</span> entries
      </motion.div>

      {/* Pagination controls */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2"
      >
        {/* Previous button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center space-x-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 bg-white/70 backdrop-blur-sm"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span>Previous</span>
        </motion.button>

        {/* First page */}
        {pageNumbers[0] > 1 && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(1)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 bg-white/70 backdrop-blur-sm"
            >
              1
            </motion.button>
            {pageNumbers[0] > 2 && (
              <div className="flex items-center px-2">
                <EllipsisHorizontalIcon className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </>
        )}

        {/* Page numbers */}
        {pageNumbers.map((page, index) => (
          <motion.button
            key={page}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
              page === currentPage
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-600 shadow-lg'
                : 'border-gray-300 hover:bg-blue-50 hover:border-blue-300 bg-white/70 backdrop-blur-sm'
            }`}
          >
            {page}
          </motion.button>
        ))}

        {/* Last page */}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <div className="flex items-center px-2">
                <EllipsisHorizontalIcon className="w-5 h-5 text-gray-400" />
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 bg-white/70 backdrop-blur-sm"
            >
              {totalPages}
            </motion.button>
          </>
        )}

        {/* Next button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center space-x-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 bg-white/70 backdrop-blur-sm"
        >
          <span>Next</span>
          <ChevronRightIcon className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Pagination;
