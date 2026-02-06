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
      className="w-full flex items-center gap-2 overflow-x-auto pb-8 border-b border-slate-100 relative z-10"
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
          className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-6 md:px-8 py-3 sm:py-4 rounded-lg sm:rounded-[1.5rem] transition-all duration-300 shrink-0 group min-h-[44px] text-xs sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] ${currentSlide === item.id
            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'
            : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
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
