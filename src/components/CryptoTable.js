import React from 'react';
import SkeletonLoader from './SkeletonLoader';

const CryptoTable = ({
  loading,
  filteredData,
  sortConfig,
  handleSort,
  selectedCryptos,
  toggleCryptoSelection,
  currency,
  timeRange,
  formatCurrency,
  renderPriceChange,
  page,
  setPage,
  error
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <p className="text-sm mt-1">API limit reached or network error. Please try again later.</p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Select</th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Cryptocurrency
                {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? ' ↑' : ' ↓')}
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('current_price')}
              >
                Price
                {sortConfig.key === 'current_price' && (sortConfig.direction === 'ascending' ? ' ↑' : ' ↓')}
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('price_change_percentage_24h_in_currency')}
              >
                {timeRange === '1h' ? '1h' : timeRange === '7d' ? '7d' : timeRange === '30d' ? '30d' : '24h'} Change
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('market_cap')}
              >
                Market Cap
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('total_volume')}
              >
                Volume (24h)
              </th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <SkeletonLoader />
            ) : filteredData.length > 0 ? (
              filteredData.map(crypto => (
                <tr 
                  key={crypto.id} 
                  className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    selectedCryptos.some(c => c.id === crypto.id) 
                      ? 'bg-purple-50 dark:bg-purple-900 bg-opacity-40 dark:bg-opacity-20' 
                      : ''
                  }`}
                >
                  <td className="px-2 py-3">
                    <input 
                      type="checkbox" 
                      checked={selectedCryptos.some(c => c.id === crypto.id)}
                      onChange={() => toggleCryptoSelection(crypto)}
                      className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <img src={crypto.image} alt={crypto.name} className="w-8 h-8 mr-3" />
                      <div>
                        <div className="font-medium">{crypto.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">{crypto.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(crypto.current_price)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {renderPriceChange(
                      timeRange === '1h' ? crypto.price_change_percentage_1h_in_currency :
                      timeRange === '7d' ? crypto.price_change_percentage_7d_in_currency :
                      timeRange === '30d' ? crypto.price_change_percentage_30d_in_currency :
                      crypto.price_change_percentage_24h_in_currency
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(crypto.market_cap)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(crypto.total_volume)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No cryptocurrency found. Try changing the search term.

                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Page <span className="font-medium">{page}</span>
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                  page === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-400' : 'bg-white dark:bg-gray-800 hover:bg-gray-50'
                }`}
              >
                ←
              </button>
              {[page, page + 1, page + 2].map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 border ${
                    page === pageNum 
                      ? 'z-10 bg-indigo-50 dark:bg-indigo-900 border-indigo-500' 
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => setPage(page + 1)}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border bg-white dark:bg-gray-800 hover:bg-gray-50"
              >
                →
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
      
  );
};

export default CryptoTable;