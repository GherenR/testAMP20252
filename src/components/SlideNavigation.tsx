import React, { ReactNode, useRef } from 'react';

export interface MenuItem {
  id: number;
  icon: ReactNode;
  label: string;
}

interface SlideNavigationProps {
  menuItems: MenuItem[];
  currentSlide: number;
  onSlideChange: (slideIndex: number) => void;
}

/**
 * SlideNavigation Component
 * Menampilkan navigation menu horizontal dengan icon dan label
 * Bisa di-scroll pada mobile, menampilkan indicator slide aktif
 */
export const SlideNavigation: React.FC<SlideNavigationProps> = ({
  menuItems,
  currentSlide,
  onSlideChange
}) => {
  const navRef = useRef<HTMLElement>(null);

  return (
    <nav
      ref={navRef}
      className="w-full flex items-center gap-2 overflow-x-auto pb-6 px-4 sm:px-6 md:px-8 bg-white border-b-2 border-slate-200 shadow-sm sticky top-0 relative z-20"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#4f46e5 #f1f5f9',
        WebkitOverflowScrolling: 'touch',
        msOverflowStyle: 'auto'
      }}
    >
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onSlideChange(item.id)}
          className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-300 shrink-0 group min-h-[44px] text-xs sm:text-[10px] md:text-[11px] font-black uppercase tracking-[0.12em] sm:tracking-[0.15em] md:tracking-[0.2em] ${currentSlide === item.id
              ? 'bg-indigo-600 text-white shadow-lg hover:shadow-xl scale-105'
              : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-100 border-2 border-transparent hover:border-indigo-300'
            }`}
          title={item.label}
        >
          <span className="transition-colors text-sm sm:text-base">{item.icon}</span>
          <span className="hidden sm:inline whitespace-nowrap">
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
};
