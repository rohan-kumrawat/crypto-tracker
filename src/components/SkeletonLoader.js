import React from 'react';

const SkeletonLoader = () => (
  <>
    {Array(10).fill().map((_, index) => (
      <tr key={index} className="border-b dark:border-gray-700">
        <td className="px-2 py-3"><div className="shimmer h-6 w-6 rounded-full"></div></td>
        <td className="px-4 py-3">
          <div className="flex items-center">
            <div className="shimmer h-8 w-8 rounded-full mr-2"></div>
            <div>
              <div className="shimmer h-4 w-16 mb-1"></div>
              <div className="shimmer h-3 w-10"></div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3"><div className="shimmer h-4 w-20"></div></td>
        <td className="px-4 py-3"><div className="shimmer h-4 w-16"></div></td>
        <td className="px-4 py-3"><div className="shimmer h-4 w-24"></div></td>
        <td className="px-4 py-3"><div className="shimmer h-4 w-24"></div></td>
      </tr>
    ))}
  </>
);

export default SkeletonLoader;