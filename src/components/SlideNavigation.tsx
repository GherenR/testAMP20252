import React, { ReactNode, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface MenuItem {
  id: number;
  icon: ReactNode;
  label: string;
  path?: string; // Optional route path for external pages
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
 * Supports both slide-based navigation and route-based navigation
 */
export const SlideNavigation: React.FC<SlideNavigationProps> = ({
  menuItems,
  onSlideChange
}) => {
  const navRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (item: MenuItem) => {
    navigate(item.path || '/');
  };

  const isItemActive = (item: MenuItem) => {
    const currentPath = location.pathname;
    const itemPath = item.path || '/';

    if (itemPath === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(itemPath);
  };

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
          key={item.path || item.id}
          onClick={() => handleClick(item)}
          className={`flex items-center gap-1 sm:gap-3 px-3 sm:px-4 md:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 shrink-0 group min-h-[48px] sm:min-h-[52px] text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.25em] ${isItemActive(item)
            ? 'bg-indigo-600 text-white shadow-lg hover:shadow-xl scale-105'
            : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-100 border-2 border-slate-200 hover:border-indigo-300'
            }`}
          title={item.label}
          aria-current={isItemActive(item) ? 'page' : undefined}
        >
          <span className="transition-colors text-sm sm:text-base flex items-center justify-center">{item.icon}</span>
          <span className="hidden sm:inline whitespace-nowrap">
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
};
