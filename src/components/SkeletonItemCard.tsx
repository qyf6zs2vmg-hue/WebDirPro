import React from 'react';

export const SkeletonItemCard = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-full animate-pulse">
      <div className="aspect-video-custom bg-gray-200" />
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="h-3 w-16 bg-gray-200 rounded" />
        </div>
        <div className="h-6 w-3/4 bg-gray-200 rounded mb-3" />
        <div className="space-y-2 mb-4">
          <div className="h-3 w-full bg-gray-200 rounded" />
          <div className="h-3 w-5/6 bg-gray-200 rounded" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
          <div className="h-3 w-12 bg-gray-200 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
};
