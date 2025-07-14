"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useRef, useEffect, useMemo } from 'react';
import Container from '../Container';

const AirbnbNavigation = () => {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [activeIndicatorStyle, setActiveIndicatorStyle] = useState({ left: 0, width: 0 });
  const navRef = useRef<HTMLDivElement>(null);

  // ✅ navItems est maintenant stable
  const navItems = useMemo(() => [
    {
      label: 'Logements',
      icon: '🏠',
      href: '/',
      description: 'Trouvez votre logement idéal',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      label: 'Expériences',
      icon: '🎈',
      href: '/experiences',
      description: 'Découvrez des activités uniques',
      isNew: true,
      gradient: 'from-pink-500 to-rose-600'
    },
    {
      label: 'Services',
      icon: '🔔',
      href: '/services',
      description: 'Services et assistance',
      isNew: true,
      gradient: 'from-emerald-500 to-teal-600'
    }
  ], []);

  // ✅ useEffect stable
  useEffect(() => {
    const activeIndex = navItems.findIndex(item => item.href === pathname);
    if (activeIndex !== -1 && navRef.current) {
      const activeLink = navRef.current.children[activeIndex] as HTMLElement;
      if (activeLink) {
        const { offsetLeft, offsetWidth } = activeLink;
        setActiveIndicatorStyle({
          left: offsetLeft + (offsetWidth / 2) - 12,
          width: 24
        });
      }
    }
  }, [pathname, navItems]);

  return (
    <div className="w-full bg-white/95 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <Container>
        <div className="flex items-center justify-center py-4 relative">
          {/* Indicateur animé */}
          <div 
            className="absolute bottom-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500 ease-out"
            style={{
              left: `${activeIndicatorStyle.left}px`,
              width: `${activeIndicatorStyle.width}px`,
              opacity: pathname !== '/' || pathname === navItems.find(item => pathname === item.href)?.href ? 1 : 0
            }}
          />

          <nav ref={navRef} className="flex items-center gap-2 relative">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const isHovered = hoveredItem === item.label;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group relative"
                  onMouseEnter={() => setHoveredItem(item.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className={`
                    relative flex flex-col items-center gap-2 px-6 py-3 rounded-2xl
                    transition-all duration-300 ease-out transform
                    ${isActive 
                      ? 'bg-gradient-to-br from-gray-50 to-gray-100 scale-105 shadow-lg shadow-gray-200/50' 
                      : isHovered 
                        ? 'bg-gradient-to-br from-gray-50/80 to-white scale-102 shadow-md shadow-gray-200/30'
                        : 'hover:scale-102 hover:bg-gray-50/50'
                    }
                  `}>
                    {item.isNew && (
                      <div className={`
                        absolute -top-1 -right-1 z-10
                        bg-gradient-to-r ${item.gradient}
                        text-white text-xs font-bold px-2 py-1 rounded-full
                        shadow-lg transform transition-all duration-300
                        ${isHovered ? 'scale-110 shadow-xl' : 'scale-100'}
                        animate-pulse
                      `}>
                        <span className="relative z-10">NOUVEAU</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-shimmer" />
                      </div>
                    )}

                    <div className="relative">
                      <div className={`
                        text-3xl transition-all duration-300 transform
                        ${isActive 
                          ? 'scale-110 drop-shadow-lg' 
                          : isHovered 
                            ? 'scale-105 drop-shadow-md' 
                            : 'group-hover:scale-105'
                        }
                      `}>
                        {item.icon}
                      </div>

                      {isActive && (
                        <div className={`
                          absolute inset-0 text-3xl opacity-30 blur-sm scale-110
                          animate-pulse
                        `}>
                          {item.icon}
                        </div>
                      )}
                    </div>

                    <span className={`
                      text-sm font-semibold transition-all duration-300 text-center
                      ${isActive
                        ? 'bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent'
                        : isHovered
                          ? 'text-gray-800'
                          : 'text-gray-600 group-hover:text-gray-800'
                      }
                    `}>
                      {item.label}
                    </span>

                    <div className={`
                      absolute -bottom-16 left-1/2 transform -translate-x-1/2
                      bg-gray-900 text-white text-xs px-3 py-2 rounded-lg
                      whitespace-nowrap pointer-events-none z-20
                      transition-all duration-200 shadow-xl
                      ${isHovered && !isActive 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-2'
                      }
                    `}>
                      {item.description}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                    </div>
                  </div>

                  {isActive && (
                    <>
                      <div className="absolute top-0 left-1/2 w-1 h-1 bg-blue-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0ms' }} />
                      <div className="absolute top-1 right-2 w-1 h-1 bg-purple-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '150ms' }} />
                      <div className="absolute top-1 left-2 w-1 h-1 bg-pink-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '300ms' }} />
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-purple-50/20 to-pink-50/20 rounded-3xl opacity-50 pointer-events-none" />
        </div>
      </Container>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default AirbnbNavigation;
