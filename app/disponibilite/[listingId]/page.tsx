'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { RangeKeyDict } from "react-date-range";
import Container from "@/app/components/Container";
import DatePicker from "@/app/components/inputs/Calendar";
import { Range } from "react-date-range";
import { format, addDays, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface DisponibilitePageProps {
  params: { listingId: string };
}

const DisponibilitePage = ({ params }: DisponibilitePageProps) => {
  const router = useRouter();
  const listingId = params?.listingId as string;
  const [range, setRange] = useState<Range>({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  });
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [availabilityData, setAvailabilityData] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    setIsVisible(true);
    loadAvailabilityData();
  }, []);

const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);

  useEffect(() => {
  const fetchBookedDates = async () => {
    try {
      const response = await axios.get(`/api/bookings/${listingId}`);
      const data = response.data as { date: string }[];
      const dates = data.map((d: { date: string }) => {
        const parsed = new Date(d.date);
        parsed.setHours(12, 0, 0, 0); // Heure centrale pour éviter les décalages
        return parsed;
      });
      setBookedDates(dates);
    } catch (error) {
      console.error("Erreur lors du chargement des dates réservées :", error);
    }
  };

  fetchBookedDates();
  loadAvailabilityData();
  setIsVisible(true);
}, []);


  const loadAvailabilityData = async () => {
    try {
      const response = await axios.get(`/api/availability/${listingId}`);
      setAvailabilityData((response.data as { [key: string]: boolean }) || {});

    } catch (error) {
      console.error('Erreur lors du chargement des disponibilités:', error);
    }
  };

  const onChange = (value: RangeKeyDict) => {
    setRange(value.selection);
  };

  const updateAvailability = async (available: boolean) => {
    if (!range.startDate || !range.endDate) {
      toast.error('Veuillez sélectionner une période', {
        position: 'top-center',
        style: {
          background: '#EF4444',
          color: 'white',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '600',
        },
      });
      return;
    }

    setLoading(true);

    const start = new Date(range.startDate);
    start.setHours(12, 0, 0, 0);
    const end = new Date(range.endDate);
    end.setHours(12, 0, 0, 0);

    const dates: string[] = [];
    let currentDate = new Date(start);
    
    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    try {
      await axios.post('/api/availability/update', {
        listingId,
        dates,
        isAvailable: available,
      });

      const successMessage = available 
        ? `✅ ${dates.length} jour${dates.length > 1 ? 's' : ''} disponible${dates.length > 1 ? 's' : ''}`
        : `🚫 ${dates.length} jour${dates.length > 1 ? 's' : ''} bloqué${dates.length > 1 ? 's' : ''}`;

      toast.success(successMessage, {
        duration: 3000,
        position: 'top-center',
        style: {
          background: available ? '#10B981' : '#F59E0B',
          color: 'white',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '600',
        },
      });

      const newAvailabilityData = { ...availabilityData };
      dates.forEach(date => {
        newAvailabilityData[date] = available;
      });
      setAvailabilityData(newAvailabilityData);

      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('❌ Erreur lors de la mise à jour', {
        position: 'top-center',
        style: {
          background: '#EF4444',
          color: 'white',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '600',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedDaysCount = () => {
    if (!range.startDate || !range.endDate) return 0;
    return differenceInDays(range.endDate, range.startDate) + 1;
  };

  const getSelectedPeriodText = () => {
    if (!range.startDate || !range.endDate) return "Sélectionnez des dates";
    
    const start = format(range.startDate, "d MMM", { locale: fr });
    const end = format(range.endDate, "d MMM", { locale: fr });
    const days = getSelectedDaysCount();
    
    return `${start} → ${end} • ${days} jour${days > 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header mobile optimisé */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <span className="text-lg">←</span>
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Disponibilités</h1>
              <p className="text-sm text-gray-500">Gérez votre calendrier</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Légende mobile */}
        <div className={`transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Légende</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Dispo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Bloqué</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Sélection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calendrier mobile */}
        <div className={`transition-all duration-500 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Sélectionnez une période
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Appuyez et glissez pour choisir les dates
              </p>

              {/* Calendrier responsive */}
              <div className="calendar-mobile">
                <DatePicker
                  value={range}
                  onChange={onChange}
                  showPreview={true}
            disabledDates={bookedDates}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Info sélection mobile */}
        {(range.startDate && range.endDate) && (
          <div className={`transition-all duration-500 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">📅</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Période sélectionnée</p>
                  <p className="text-sm text-blue-700">{getSelectedPeriodText()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Raccourcis mobile */}
        <div className={`transition-all duration-500 delay-400 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Sélection rapide</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Ce weekend", days: 2, icon: "🏖️" },
                { label: "Cette semaine", days: 7, icon: "📅" },
                { label: "Ce mois", days: 30, icon: "🗓️" },
                { label: "3 mois", days: 90, icon: "📆" }
              ].map((shortcut, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const start = new Date();
                    const end = addDays(start, shortcut.days - 1);
                    setRange({
                      startDate: start,
                      endDate: end,
                      key: 'selection'
                    });
                  }}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors text-sm"
                >
                  <span>{shortcut.icon}</span>
                  <span>{shortcut.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions mobile */}
        <div className={`transition-all duration-500 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Actions</h3>
            
            <div className="space-y-3">
              {/* Bouton Disponible */}
              <button
                disabled={loading || !range.startDate || !range.endDate}
                onClick={() => updateAvailability(true)}
                className={`w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${
                  loading ? 'animate-pulse' : ''
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Mise à jour...</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl">✅</span>
                    <span>Marquer comme disponible</span>
                  </>
                )}
              </button>

              {/* Bouton Non disponible */}
              <button
                disabled={loading || !range.startDate || !range.endDate}
                onClick={() => updateAvailability(false)}
                className={`w-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${
                  loading ? 'animate-pulse' : ''
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Mise à jour...</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl">🚫</span>
                    <span>Marquer comme non disponible</span>
                  </>
                )}
              </button>
            </div>

            {/* Note d'aide */}
            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-600 text-center">
                💡 Conseil : Bloquez les dates pour maintenance ou repos personnel
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom safe area for mobile */}
      <div className="h-6"></div>

      <style jsx global>{`
        /* Mobile-first calendar styling */
        .calendar-mobile .rdrCalendarWrapper {
          background: transparent;
          color: #374151;
          font-family: inherit;
          width: 100%;
        }

        .calendar-mobile .rdrMonth {
          padding: 0;
          width: 100%;
        }

        .calendar-mobile .rdrWeekDays {
          padding: 0;
        }

        .calendar-mobile .rdrDays {
          padding: 0;
        }

        .calendar-mobile .rdrDay {
          height: 40px;
          line-height: 40px;
        }

        .calendar-mobile .rdrDayNumber {
          font-weight: 500;
          font-size: 14px;
        }

        .calendar-mobile .rdrDayToday .rdrDayNumber:after {
          background: #3B82F6;
        }

        .calendar-mobile .rdrSelected {
          background: #3B82F6 !important;
          color: white !important;
        }

        .calendar-mobile .rdrInRange {
          background: #DBEAFE !important;
          color: #1E40AF !important;
        }

        .calendar-mobile .rdrStartEdge,
        .calendar-mobile .rdrEndEdge {
          background: #3B82F6 !important;
          color: white !important;
        }

        .calendar-mobile .rdrMonthAndYearWrapper {
          padding-bottom: 0.5rem;
          justify-content: center;
        }

        .calendar-mobile .rdrMonthAndYearPickers select {
          background: white;
          border: 1px solid #D1D5DB;
          border-radius: 8px;
          padding: 6px 10px;
          font-weight: 500;
          font-size: 14px;
        }

        .calendar-mobile .rdrPprevButton,
        .calendar-mobile .rdrNextButton {
          background: #F3F4F6;
          border-radius: 8px;
          margin: 0 2px;
          width: 32px;
          height: 32px;
        }

        .calendar-mobile .rdrPprevButton:hover,
        .calendar-mobile .rdrNextButton:hover {
          background: #E5E7EB;
        }

        .calendar-mobile .rdrWeekDay {
          font-size: 12px;
          font-weight: 600;
          color: #6B7280;
        }

        /* Touch-friendly interactions */
        @media (max-width: 640px) {
          .calendar-mobile .rdrDay {
            height: 44px;
            line-height: 44px;
          }
          
          .calendar-mobile .rdrDayNumber {
            font-size: 16px;
          }
        }

        /* Remove hover effects on touch devices */
        @media (hover: none) {
          .calendar-mobile .rdrDay:hover {
            background: transparent;
          }
        }
      `}</style>
    </div>
  );
};

export default DisponibilitePage;