"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Container from '../Container';

const AirbnbNavigation = () => {
    const pathname = usePathname();

    const navItems = [
        {
            label: 'Logements',
            icon: '🏠',
            href: '/',
            description: 'Trouvez votre logement idéal'
        },
        {
            label: 'Expériences',
            icon: '🎈',
            href: '/experiences',
            description: 'Découvrez des activités uniques',
            isNew: true
        },
        {
            label: 'Services',
            icon: '🔔',
            href: '/services',
            description: 'Services et assistance',
            isNew: true
        }
    ];

    return (
        <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-40">
            <Container>
                <div className="flex items-center justify-center py-2">
                    <nav className="flex items-center gap-6">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="group relative flex flex-col items-center gap-1 px-3 py-1 transition-all duration-200 hover:scale-105"
                                >
                                    {/* Badge NOUVEAU */}
                                    {item.isNew && (
                                        <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full z-10">
                                            NOUVEAU
                                        </div>
                                    )}
                                    
                                    {/* Icône */}
                                    <div className={`text-2xl transition-all duration-200 group-hover:scale-110 ${
                                        isActive ? 'transform scale-110' : ''
                                    }`}>
                                        {item.icon}
                                    </div>
                                    
                                    {/* Label */}
                                    <span className={`text-xs font-medium transition-colors duration-200 ${
                                        isActive 
                                            ? 'text-gray-900' 
                                            : 'text-gray-600 group-hover:text-gray-900'
                                    }`}>
                                        {item.label}
                                    </span>
                                    
                                    {/* Ligne de soulignement pour l'item actif */}
                                    {isActive && (
                                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gray-900 rounded-full" />
                                    )}
                                    
                                    {/* Effet hover */}
                                    <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gray-300 rounded-full transition-opacity duration-200 ${
                                        isActive ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                                    }`} />
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </Container>
        </div>
    );
};

export default AirbnbNavigation;