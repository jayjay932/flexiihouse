"use client"

import qs from 'query-string'
import useSearchModal from "@/app/hooks/useSearchModal"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo, useState, useEffect } from "react"
import { Range } from "react-date-range"
import dynamic from "next/dynamic"
import CountrySelect, { CountrySelectValue } from "../inputs/CountrySelect"
import { formatISO } from 'date-fns'
import Calendar from "../inputs/Calendar";
import Counter from '../inputs/Counter'

const equipments = [
    { id: 'has_tv', label: 'Télévision', icon: '📺' },
    { id: 'has_air_conditioning', label: 'Climatisation', icon: '❄️' },
    { id: 'has_wifi', label: 'Wifi', icon: '📶' },
    { id: 'has_washing_machin', label: 'Lave-linge', icon: '🧺' },
    { id: 'has_pool', label: 'Piscine', icon: '🏊' },
    { id: 'has_kitchen', label: 'Cuisine', icon: '🍳' },
    { id: 'has_parking', label: 'Parking gratuit', icon: '🅿️' },
    { id: 'has_balcony', label: 'Balcon', icon: '🏞️' },
];

const reservationOptions = [
    { id: 'instantanee', label: 'Réservation instantanée', icon: '⚡', description: 'Réservez sans attendre l\'approbation' },
    { id: 'arrivee_autonome', label: 'Arrivée autonome', icon: '🔑', description: 'Accédez facilement au logement' },
    { id: 'annulation_gratuite', label: 'Annulation gratuite', icon: '📅', description: 'Politique d\'annulation flexible' },
    { id: 'animaux_autorises', label: 'Animaux de compagnie autorisés', icon: '🐕', description: 'Voyagez avec vos compagnons' },
];

const propertyTypes = [
    { id: 'Maison', label: 'Maison', icon: '🏠' },
    { id: 'Appartement', label: 'Appartement', icon: '🏢' },
    { id: 'Chambre_d_hotes', label: 'Maison d\'hôtes', icon: '🏨' },
    { id: 'Bateau', label: 'Bateau', icon: '⛵' },
];

const recommendations = [
    { id: 'has_wifi', label: 'Wifi', icon: '📶', color: 'bg-orange-50 border-orange-200' },
    { id: 'has_kitchen', label: 'Cuisine', icon: '🍳', color: 'bg-blue-50 border-blue-200' },
    { id: 'has_parking', label: 'Parking gratuit', icon: '🅿️', color: 'bg-green-50 border-green-200' },
];

const exceptionalAccommodations = [
    { id: 'coup_coeur', label: 'Coup de cœur voyageurs', icon: '🏆', description: 'Les logements les plus appréciés sur Airbnb' },
    { id: 'luxe', label: 'Luxe', icon: '💎', description: 'Des logements de luxe au design exceptionnel' },
];

const SearchModal = () => {
    const router = useRouter();
    const params = useSearchParams();
    const searchModal = useSearchModal();

    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState<CountrySelectValue>();
    const [guestCount, setGuestCount] = useState(1);
    const [roomCount, setRoomCount] = useState(1);
    const [bathroomCount, setBathroomCount] = useState(1);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 500000 });
    const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
    const [selectedReservationOptions, setSelectedReservationOptions] = useState<string[]>([]);
    const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
    const [selectedExceptionalTypes, setSelectedExceptionalTypes] = useState<string[]>([]);
    const [accommodationType, setAccommodationType] = useState('tous');
    const [isVisible, setIsVisible] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showEquipments, setShowEquipments] = useState(false);
    const [calendarKey, setCalendarKey] = useState(0);
    
    // Dates par défaut
    const getDefaultDateRange = () => ({
        startDate: new Date(),
        endDate: new Date(),
        key: "selection"
    });

    const [dateRange, setDateRange] = useState<Range>(getDefaultDateRange());

    useEffect(() => {
        if (searchModal.isOpen) {
            setIsVisible(true);
        }
    }, [searchModal.isOpen]);

    const Map = useMemo(() => dynamic(() => import("../Map"), {
        ssr: false
    }), [location]);

    // Fonction pour vérifier si les dates sont différentes des valeurs par défaut
    const isDateRangeChanged = useMemo(() => {
        const defaultRange = getDefaultDateRange();
        const today = new Date();
        const selectedStart = dateRange.startDate ? new Date(dateRange.startDate) : null;
        const selectedEnd = dateRange.endDate ? new Date(dateRange.endDate) : null;
        
        if (!selectedStart || !selectedEnd) return false;
        
        // Comparer les dates (sans l'heure)
        const isSameStartDate = selectedStart.toDateString() === today.toDateString();
        const isSameEndDate = selectedEnd.toDateString() === today.toDateString();
        
        return !(isSameStartDate && isSameEndDate);
    }, [dateRange]);

    // Vérifier si des filtres sont appliqués
    const hasActiveFilters = useMemo(() => {
        return searchQuery !== '' ||
               location !== undefined ||
               guestCount !== 1 ||
               roomCount !== 1 ||
               bathroomCount !== 1 ||
               priceRange.min !== 0 ||
               priceRange.max !== 500000 ||
               selectedEquipments.length > 0 ||
               selectedReservationOptions.length > 0 ||
               selectedPropertyTypes.length > 0 ||
               selectedExceptionalTypes.length > 0 ||
               accommodationType !== 'tous' ||
               isDateRangeChanged;
    }, [searchQuery, location, guestCount, roomCount, bathroomCount, priceRange, selectedEquipments, selectedReservationOptions, selectedPropertyTypes, selectedExceptionalTypes, accommodationType, isDateRangeChanged]);

    const toggleEquipment = (id: string) => {
        setSelectedEquipments(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const toggleReservationOption = (id: string) => {
        setSelectedReservationOptions(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const togglePropertyType = (id: string) => {
        setSelectedPropertyTypes(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const toggleExceptionalType = (id: string) => {
        setSelectedExceptionalTypes(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const resetFilters = useCallback(() => {
        setSearchQuery('');
        setLocation(undefined);
        setGuestCount(1);
        setRoomCount(1);
        setBathroomCount(1);
        setPriceRange({ min: 0, max: 500000 });
        setSelectedEquipments([]);
        setSelectedReservationOptions([]);
        setSelectedPropertyTypes([]);
        setSelectedExceptionalTypes([]);
        setAccommodationType('tous');
        
        // Réinitialiser les dates
        setDateRange(getDefaultDateRange());
        
        // Forcer le re-render du Calendar
        setCalendarKey(prev => prev + 1);
        
        // Rediriger vers la page d'accueil sans paramètres pour réinitialiser les cards
        searchModal.onClose();
        router.push('/');
    }, [searchModal, router]);

    const resetDates = useCallback(() => {
        setDateRange(getDefaultDateRange());
        setCalendarKey(prev => prev + 1);
    }, []);

    const onSubmit = useCallback(async () => {
        let currentQuery = {};

        if (params) {
            currentQuery = qs.parse(params.toString());
        }

        const updatedQuery: any = {
            ...currentQuery,
        };

        // Ajouter les filtres seulement s'ils ont des valeurs
        if (searchQuery.trim()) {
            updatedQuery.searchQuery = searchQuery.trim();
        }

        if (location?.value) {
            updatedQuery.locationValue = location.value;
        }

        if (guestCount > 1) {
            updatedQuery.guestCount = guestCount;
        }

        if (roomCount > 1) {
            updatedQuery.roomCount = roomCount;
        }

        if (bathroomCount > 1) {
            updatedQuery.bathroomCount = bathroomCount;
        }

        // Filtres de prix
        if (priceRange.min > 0) {
            updatedQuery.minPrice = priceRange.min;
        }

        if (priceRange.max < 500000) {
            updatedQuery.maxPrice = priceRange.max;
        }

        // Équipements sélectionnés
        if (selectedEquipments.length > 0) {
            // Créer des paramètres séparés pour chaque équipement
            selectedEquipments.forEach(equipment => {
                updatedQuery[equipment] = 'true';
            });
        }

        // Options de réservation
        if (selectedReservationOptions.length > 0) {
            updatedQuery.reservationOptions = selectedReservationOptions.join(',');
        }

        // Types de propriété
        if (selectedPropertyTypes.length > 0) {
            updatedQuery.listing_type = selectedPropertyTypes.join(',');
        }

        // Types exceptionnels
        if (selectedExceptionalTypes.length > 0) {
            updatedQuery.exceptionalTypes = selectedExceptionalTypes.join(',');
        }

        // Type d'hébergement
        if (accommodationType !== 'tous') {
            updatedQuery.accommodationType = accommodationType;
        }

        // Dates
        if (isDateRangeChanged && dateRange.startDate) {
            updatedQuery.startDate = formatISO(dateRange.startDate);
        }

        if (isDateRangeChanged && dateRange.endDate) {
            updatedQuery.endDate = formatISO(dateRange.endDate);
        }

        // Debug: Afficher les paramètres de recherche
        console.log('🔍 Paramètres de recherche:', updatedQuery);

        const url = qs.stringifyUrl({
            url: '/',
            query: updatedQuery
        }, { skipNull: true, skipEmptyString: true });

        console.log('🌐 URL générée:', url);

        searchModal.onClose();
        router.push(url);

    }, [searchModal, searchQuery, location, router, guestCount, roomCount, bathroomCount, dateRange, priceRange, selectedEquipments, selectedReservationOptions, selectedPropertyTypes, selectedExceptionalTypes, accommodationType, params, isDateRangeChanged]);

    if (!searchModal.isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
            <div className={`bg-white w-full max-w-lg mx-auto rounded-t-3xl shadow-2xl transform transition-all duration-500 max-h-[90vh] ${
                isVisible ? 'translate-y-0' : 'translate-y-full'
            }`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-3xl">
                    <h2 className="text-xl font-semibold text-gray-900">Filtres</h2>
                    <button 
                        onClick={searchModal.onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                        <span className="text-lg">✕</span>
                    </button>
                </div>

                {/* Content scrollable */}
                <div className="overflow-y-auto pb-32" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                    <div className="p-6 space-y-8">
                        
                        {/* Barre de recherche */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rechercher par nom</h3>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-xl">🔍</span>
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher un logement par nom..."
                                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl text-base focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                    >
                                        <span className="text-gray-400 hover:text-gray-600">✕</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Localisation */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Où</h3>
                            <CountrySelect
                                value={location}
                                onChange={(value) => setLocation(value)}
                            />
                        </div>

                        {/* Dates de réservation */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Dates de réservation</h3>
                                {isDateRangeChanged && (
                                    <button
                                        onClick={resetDates}
                                        className="text-sm text-gray-600 hover:text-gray-800 underline hover:no-underline transition-all"
                                    >
                                        Effacer les dates
                                    </button>
                                )}
                            </div>
                            <Calendar
                                key={calendarKey}
                                value={dateRange}
                                onChange={(value) => setDateRange(value.selection)}
                            />
                        </div>

                        {/* Nos recommandations */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nos recommandations</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {recommendations.map((rec) => (
                                    <button
                                        key={rec.id}
                                        onClick={() => toggleEquipment(rec.id)}
                                        className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                                            selectedEquipments.includes(rec.id)
                                                ? 'border-rose-500 bg-rose-50'
                                                : `${rec.color} hover:border-gray-300`
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                                <span className="text-2xl">{rec.icon}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="font-semibold text-gray-900">{rec.label}</h5>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Type de logement */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Type de logement</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'tous', label: 'Tous les types' },
                                    { id: 'chambre', label: 'Chambre' },
                                    { id: 'entier', label: 'Logement entier' },
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setAccommodationType(type.id)}
                                        className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                                            accommodationType === type.id
                                                ? 'border-gray-900 bg-gray-900 text-white'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Fourchette de prix */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fourchette de prix</h3>
                            <p className="text-sm text-gray-600 mb-4">Prix du voyage, tous frais compris</p>
                            
                            <div className="space-y-4">
                                {/* Graphique de prix simulé */}
                                <div className="relative h-16 bg-gray-50 rounded-xl overflow-hidden">
                                    <div className="absolute inset-0 flex items-end justify-center px-2">
                                        {[...Array(50)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="bg-rose-500 mx-px rounded-t"
                                                style={{ 
                                                    height: `${Math.random() * 80 + 20}%`,
                                                    width: '2px'
                                                }}
                                            />
                                        ))}
                                    </div>
                                    {/* Curseurs simulés */}
                                    <div className="absolute left-4 top-1/2 w-6 h-6 bg-white border-2 border-gray-300 rounded-full transform -translate-y-1/2 shadow-md"></div>
                                    <div className="absolute right-4 top-1/2 w-6 h-6 bg-white border-2 border-gray-300 rounded-full transform -translate-y-1/2 shadow-md"></div>
                                </div>
                                
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm text-gray-600 mb-1">Minimum</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={priceRange.min || ''}
                                                onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                                                className="w-full p-3 border border-gray-300 rounded-xl text-center"
                                                placeholder="0"
                                            />
                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">FCFA</span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm text-gray-600 mb-1">Maximum</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={priceRange.max || ''}
                                                onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 500000 }))}
                                                className="w-full p-3 border border-gray-300 rounded-xl text-center"
                                                placeholder="500000+"
                                            />
                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">FCFA</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Indicateur visuel des prix sélectionnés */}
                                <div className="text-center text-sm text-gray-600">
                                    Prix sélectionné: {priceRange.min.toLocaleString()} - {priceRange.max.toLocaleString()} FCFA
                                </div>
                            </div>
                        </div>

                        {/* Chambres et lits */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Chambres et lits</h3>
                            <div className="space-y-6">
                                <Counter
                                    title="Chambres"
                                    subtitle=""
                                    value={roomCount}
                                    onChange={(value) => setRoomCount(value)}
                                />
                                <Counter
                                    title="Lits"
                                    subtitle=""
                                    value={guestCount}
                                    onChange={(value) => setGuestCount(value)}
                                />
                                <Counter
                                    title="Salles de bain"
                                    subtitle=""
                                    value={bathroomCount}
                                    onChange={(value) => setBathroomCount(value)}
                                />
                            </div>
                        </div>

                        {/* Équipements */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Équipements</h3>
                                {selectedEquipments.length > 0 && (
                                    <span className="text-sm text-rose-600 font-medium">
                                        {selectedEquipments.length} sélectionné(s)
                                    </span>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {equipments.slice(0, showEquipments ? equipments.length : 5).map((equipment) => (
                                    <button
                                        key={equipment.id}
                                        onClick={() => toggleEquipment(equipment.id)}
                                        className={`p-4 rounded-2xl border-2 transition-all text-left ${
                                            selectedEquipments.includes(equipment.id)
                                                ? 'border-gray-900 bg-gray-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{equipment.icon}</span>
                                            <span className="text-sm font-medium">{equipment.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            
                            {equipments.length > 5 && (
                                <button
                                    onClick={() => setShowEquipments(!showEquipments)}
                                    className="text-gray-700 font-medium underline hover:no-underline transition-all flex items-center gap-1"
                                >
                                    <span>{showEquipments ? 'Afficher moins' : 'Afficher plus'}</span>
                                    <span className={`transition-transform ${showEquipments ? 'rotate-180' : ''}`}>
                                        ▼
                                    </span>
                                </button>
                            )}
                        </div>

                        {/* Type de propriété */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Type de propriété</h3>
                                {selectedPropertyTypes.length > 0 && (
                                    <span className="text-sm text-rose-600 font-medium">
                                        {selectedPropertyTypes.length} sélectionné(s)
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {propertyTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => togglePropertyType(type.id)}
                                        className={`p-4 rounded-2xl border-2 transition-all text-center ${
                                            selectedPropertyTypes.includes(type.id)
                                                ? 'border-gray-900 bg-gray-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="text-2xl mb-2">{type.icon}</div>
                                        <div className="text-sm font-medium">{type.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Options de réservation */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Options de réservation</h3>
                            <div className="space-y-3">
                                {reservationOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => toggleReservationOption(option.id)}
                                        className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                                            selectedReservationOptions.includes(option.id)
                                                ? 'border-gray-900 bg-gray-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-xl">{option.icon}</span>
                                            <div className="flex-1">
                                                <h5 className="font-medium text-gray-900">{option.label}</h5>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Logements exceptionnels */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Logements exceptionnels</h3>
                            <div className="space-y-3">
                                {exceptionalAccommodations.map((exceptional) => (
                                    <button
                                        key={exceptional.id}
                                        onClick={() => toggleExceptionalType(exceptional.id)}
                                        className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
                                            selectedExceptionalTypes.includes(exceptional.id)
                                                ? 'border-gray-900 bg-gray-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-3xl">{exceptional.icon}</span>
                                            <div className="flex-1">
                                                <h5 className="font-semibold text-gray-900 mb-1">{exceptional.label}</h5>
                                                <p className="text-sm text-gray-600">{exceptional.description}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Debug info */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="bg-gray-100 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">🐛 Debug Info:</h4>
                                <div className="text-xs space-y-1">
                                    <div>Search: {searchQuery || 'vide'}</div>
                                    <div>Location: {location?.label || 'vide'}</div>
                                    <div>Prix: {priceRange.min} - {priceRange.max}</div>
                                    <div>Équipements: {selectedEquipments.join(', ') || 'aucun'}</div>
                                    <div>Types: {selectedPropertyTypes.join(', ') || 'aucun'}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer fixe */}
                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-white">
                    <div className="flex gap-3">
                        {hasActiveFilters && (
                            <button
                                onClick={resetFilters}
                                className="flex-1 text-gray-700 font-semibold py-4 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 transition-all"
                            >
                                Effacer tout
                            </button>
                        )}
                        
                        <button
                            onClick={onSubmit}
                            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
                        >
                            Rechercher
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchModal;