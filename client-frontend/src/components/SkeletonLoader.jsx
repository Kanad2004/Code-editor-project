import React from 'react';

export const SkeletonCard = () => (
  <div className="animate-pulse bg-gray-800 p-6 rounded-lg">
    <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
  </div>
);

export const SkeletonTable = () => (
  <div className="animate-pulse bg-gray-800 p-6 rounded-lg">
    <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex gap-4 mb-4">
        <div className="h-6 bg-gray-700 rounded flex-1"></div>
        <div className="h-6 bg-gray-700 rounded w-24"></div>
      </div>
    ))}
  </div>
);

export const SkeletonWorkspace = () => (
  <div className="flex flex-col lg:flex-row gap-4 h-full">
    <div className="lg:w-1/2 animate-pulse bg-gray-800 p-6 rounded-lg">
      <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-700 rounded mb-2"></div>
      <div className="h-4 bg-gray-700 rounded mb-2"></div>
      <div className="h-4 bg-gray-700 rounded w-2/3"></div>
    </div>
    <div className="lg:w-1/2 animate-pulse bg-gray-800 rounded-lg h-96"></div>
  </div>
);
