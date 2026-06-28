
import React from 'react';
import { COLLEGE_NAME } from '../../constants';

interface PageWrapperProps {
  children: React.ReactNode;
  pageNumber: number;
  side: 'left' | 'right';
  title?: string;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children, pageNumber, side, title }) => {
  return (
    <div className={`
      relative h-full w-full bg-white paper-texture overflow-hidden flex flex-col p-6 academic-font
      ${side === 'left' ? 'rounded-l-sm border-r border-gray-300' : 'rounded-r-sm border-l border-gray-300 shadow-inner'}
    `}>
      {/* Page Header branding - Matches image style */}
      <div className="flex items-start justify-between border-b border-gray-200 pb-2 mb-4">
        <div className="text-[10px] uppercase font-bold text-gray-800 leading-tight">
          {COLLEGE_NAME}
        </div>
        <div className="text-[10px] font-bold text-gray-500">
          {pageNumber.toString().padStart(2, '0')}
        </div>
      </div>

      {title && (
        <div className="flex justify-center mb-6">
          <div className="bg-black text-white px-8 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">
            {title}
          </div>
        </div>
      )}

      <div className="flex-1 relative no-scrollbar overflow-y-auto">
        {children}
      </div>

      <div className="mt-4 pt-2 border-t border-gray-100 flex justify-center">
        <span className="text-[8px] italic text-gray-300 uppercase tracking-widest">St. Peter's Academic Record</span>
      </div>
    </div>
  );
};
