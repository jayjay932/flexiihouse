"use client"
import useCountries from '@/app/hooks/useCountries';
import useSearchModal from '@/app/hooks/useSearchModal'
import { differenceInDays } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
// React icons
import { BiSearch } from 'react-icons/bi'

const Search = () => {
    const searchModal = useSearchModal();
    const params = useSearchParams();
    const { getByValue } = useCountries();
    const [isHovered, setIsHovered] = useState(false);
    
    const locationValue = params?.get("locationValue")
    const startDate = params?.get("startDate")
    const endDate = params?.get("endDate")
    const guestCount = params?.get("guestCount");
    
    const locationLabel = useMemo(() => {
        if (locationValue) {
            return getByValue(locationValue as string)?.label
        }
        return "Anywhere"
    }, [getByValue, locationValue]);
    
    const durationLabel = useMemo(() => {
        if (startDate && endDate) {
            const start = new Date(startDate as string);
            const end = new Date(endDate as string);
            let diff = differenceInDays(end, start);
            if (diff === 0) {
                diff = 1
            }
            return `${diff} Days`
        }
        return "Any Week"
    }, [startDate, endDate]);
    
    const guestLabel = useMemo(() => {
        if (guestCount) {
            return `${guestCount} Guests`
        }
        return "Add Guests";
    }, [guestCount])
    
    const IconBiSearch = BiSearch as unknown as React.FC<{ size?: number; className?: string }>
    
    const hasValues = locationValue || (startDate && endDate) || guestCount;
    
    return (
        <div className="w-full px-4 sm:px-6 md:px-0 md:max-w-2xl md:mx-auto">
            {/* Version Mobile (par défaut) - Style Airbnb */}
            <div 
                onClick={searchModal.onOpen}
                className={`
                    relative bg-gray-100 rounded-full border-0
                    shadow-sm active:shadow-md transition-all duration-200 cursor-pointer
                    transform active:scale-[0.98] overflow-hidden
                    md:hidden
                    ${isHovered ? 'shadow-md bg-gray-200' : ''}
                `}
                onTouchStart={() => setIsHovered(true)}
                onTouchEnd={() => setIsHovered(false)}
            >
                <div className="flex items-center relative z-10">
                    {/* Texte principal - style Airbnb */}
                    <div className="flex-1 px-5 py-4">
                        <div className="text-[15px] font-medium text-gray-600 leading-tight">
                           {locationLabel !== "Partout" ? locationLabel : "Où allez-vous ?"}

                        </div>
                       {(locationLabel !== "Partout" || durationLabel !== "N'importe quelle semaine" || guestLabel !== "Ajouter des voyageurs") && (
  <div className="text-[13px] text-gray-500 mt-0.5 leading-tight">
    {durationLabel !== "N'importe quelle semaine" ? durationLabel : "N'importe quelle semaine"} 
    {guestLabel !== "Ajouter des voyageurs" && (
      <span> · {guestLabel}</span>
    )}
  
                            </div>
                        )}
                    </div>
                    
                    {/* Bouton de recherche - style Airbnb */}
                    <div className="pr-2">
                        <div className={`
                            w-10 h-10 rounded-full transition-all duration-300
                            bg-gradient-to-r from-rose-500 to-pink-600
                            hover:from-rose-600 hover:to-pink-700
                            shadow-md flex items-center justify-center
                            ${isHovered ? 'shadow-lg scale-105' : ''}
                        `}>
                            <IconBiSearch size={16} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Version Desktop (md+) */}
            <div
                onClick={searchModal.onOpen}
                className={`
                    hidden md:block relative bg-white rounded-full border border-gray-200 
                    shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer
                    transform hover:scale-[1.02] active:scale-[0.98]
                    ${isHovered ? 'shadow-2xl border-gray-300' : ''}
                `}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Effet de glow desktop */}
                <div className={`
                    absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10
                    transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}
                `} />
                
                <div className='flex items-center relative z-10'>
                    {/* Section Location */}
                    <div className="flex-1 px-6 py-4 group">
                        <div className="text-xs font-semibold text-gray-900 mb-1">
                            Where
                        </div>
                        <div className={`
                            text-sm transition-all duration-200
                            ${locationValue 
                                ? 'font-semibold text-gray-900' 
                                : 'font-normal text-gray-500'
                            }
                        `}>
                            {locationLabel}
                        </div>
                        {locationValue && (
                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
                        )}
                    </div>
                    
                    {/* Divider */}
                    <div className="w-px h-8 bg-gray-200" />
                    
                    {/* Section Duration */}
                    <div className="flex-1 px-6 py-4 group">
                        <div className="text-xs font-semibold text-gray-900 mb-1">
                            When
                        </div>
                        <div className={`
                            text-sm transition-all duration-200
                            ${(startDate && endDate)
                                ? 'font-semibold text-gray-900' 
                                : 'font-normal text-gray-500'
                            }
                        `}>
                            {durationLabel}
                        </div>
                        {(startDate && endDate) && (
                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
                        )}
                    </div>
                    
                    {/* Divider */}
                    <div className="w-px h-8 bg-gray-200" />
                    
                    {/* Section Guests */}
                    <div className="flex-1 px-6 py-4 group">
                        <div className="text-xs font-semibold text-gray-900 mb-1">
                            Who
                        </div>
                        <div className={`
                            text-sm transition-all duration-200
                            ${guestCount
                                ? 'font-semibold text-gray-900' 
                                : 'font-normal text-gray-500'
                            }
                        `}>
                            {guestLabel}
                        </div>
                        {guestCount && (
                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
                        )}
                    </div>
                    
                    {/* Bouton de recherche desktop */}
                    <div className="pr-2">
                        <div className={`
                            relative p-3 rounded-full transition-all duration-300
                            bg-gradient-to-r from-rose-500 to-pink-600
                            hover:from-rose-600 hover:to-pink-700
                            shadow-lg hover:shadow-xl
                            transform hover:scale-110 active:scale-95
                        `}>
                            {/* Effet de pulse */}
                            <div className={`
                                absolute inset-0 rounded-full bg-rose-400 animate-ping
                                ${isHovered ? 'opacity-20' : 'opacity-0'}
                            `} />
                            
                            {/* Icône */}
                            <div className="relative z-10">
                                <IconBiSearch size={20} className="text-white" />
                            </div>
                            
                            {/* Effet de brillance */}
                            <div className={`
                                absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent
                                transform -skew-x-12 transition-all duration-700
                                ${isHovered ? 'translate-x-full' : '-translate-x-full'}
                            `} />
                        </div>
                    </div>
                </div>
                
                {/* Ligne de progression desktop */}
                <div className={`
                    absolute bottom-0 left-0 right-0 h-0.5 rounded-full overflow-hidden
                    bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
                    transition-all duration-500
                    ${isHovered ? 'opacity-100' : 'opacity-0'}
                `}>
                    <div className={`
                        h-full bg-white/30 transition-all duration-1000
                        ${isHovered ? 'translate-x-full' : '-translate-x-full'}
                    `} />
                </div>
            </div>
        </div>
    )
}

export default Search