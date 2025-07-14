'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Calendar from '@/app/components/inputs/Calendar';
import { SafeListing, SafeUser } from '@/app/types';
import Image from 'next/image';

interface CheckoutVisitePageProps {
  listing: SafeListing;
  currentUser?: SafeUser | null;
}

const paymentOptions = [
  { 
    value: 'mobile_money', 
    label: 'Mobile Money', 
    icon: '📱', 
    description: 'Airtel, MTN, Orange',
    popular: true 
  },
  { 
    value: 'especes', 
    label: 'Espèces', 
    icon: '💵', 
    description: 'Paiement sur place' 
  },
  { 
    value: 'cb', 
    label: 'Carte Bancaire', 
    icon: '💳', 
    description: 'Visa, Mastercard' 
  },
];

const heuresDisponibles = [
  { value: '09:00', label: '9h00', period: 'Matinée' },
  { value: '10:00', label: '10h00', period: 'Matinée' },
  { value: '11:00', label: '11h00', period: 'Matinée' },
  { value: '12:00', label: '12h00', period: 'Midi' },
  { value: '14:00', label: '14h00 (Recommandé)', period: 'Après-midi', recommended: true },
  { value: '15:00', label: '15h00', period: 'Après-midi' },
  { value: '16:00', label: '16h00', period: 'Après-midi' },
  { value: '17:00', label: '17h00', period: 'Fin d\'après-midi' },
  { value: '18:00', label: '18h00', period: 'Fin d\'après-midi' },
];

const CheckoutVisitePage: React.FC<CheckoutVisitePageProps> = ({ listing, currentUser }) => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [dateVisite, setDateVisite] = useState<Date | null>(null);
  const [heureVisite, setHeureVisite] = useState<string>('14:00');
  const [paymentType, setPaymentType] = useState<string>('mobile_money');
  const [nomMobileMoney, setNomMobileMoney] = useState('');
  const [numeroMobileMoney, setNumeroMobileMoney] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Planifier votre visite";
      case 2: return "Choisir l'heure";
      case 3: return "Mode de paiement";
      case 4: return "Confirmation";
      default: return "Réserver une visite";
    }
  };

  const getDateText = () => {
    if (!dateVisite) return "Sélectionnez une date";
    return format(dateVisite, "EEEE d MMMM yyyy", { locale: fr });
  };

  const handleNext = () => {
    if (step === 1 && !dateVisite) {
      alert('Veuillez choisir une date de visite.');
      return;
    }
    if (step === 2 && !heureVisite) {
      alert('Veuillez choisir une heure.');
      return;
    }
    if (step === 3 && paymentType === 'mobile_money' && (!nomMobileMoney || !numeroMobileMoney)) {
      alert('Veuillez remplir les informations Mobile Money.');
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    if (!dateVisite || !heureVisite) {
      alert('Veuillez choisir une date et une heure de visite.');
      return;
    }

    setLoading(true);

    const payload = {
      listingId: listing.id,
      userId: currentUser?.id,
      date_visite: dateVisite,
      heure_visite: heureVisite,
      type_transaction: paymentType,
      nom_mobile_money: nomMobileMoney || null,
      numero_mobile_money: numeroMobileMoney || null,
      totalPrice: listing.prix_viste,
    };

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Erreur API:", data);
        alert(data.error || "Erreur lors de la réservation.");
        return;
      }

      alert('🎉 Visite confirmée avec succès !');
      router.push('/trips');
    } catch (err) {
      console.error("Erreur JS:", err);
      alert('Erreur lors de la réservation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header sticky */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => step === 1 ? router.back() : handleBack()}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <span className="text-lg">←</span>
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{getStepTitle()}</h1>
                <p className="text-sm text-gray-500">Étape {step} sur 4</p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-6 h-2 rounded-full transition-all duration-300 ${
                    i <= step ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Card logement */}
        <div className={`mb-8 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex gap-4 p-6">
              <div className="w-24 h-24 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={listing.images?.[0]?.url || '/placeholder.jpg'}
                  alt={listing.title}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2">
                  {listing.title}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <span>📍</span>
                  <span>{listing.city} • {listing.quater}</span>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🏠</span>
                      <span className="text-sm font-medium text-blue-900">Prix de la visite</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {listing.prix_viste?.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Étape 1: Date */}
        {step === 1 && (
          <div className={`space-y-6 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Quand souhaitez-vous visiter ?</h2>
              <p className="text-gray-600">Choisissez la date qui vous convient le mieux</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Date sélectionnée</h3>
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className={`text-base ${dateVisite ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                      {getDateText()}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📅</span>
                      <span className={`text-lg transition-transform duration-200 ${
                        showCalendar ? 'rotate-180' : ''
                      }`}>
                        ↓
                      </span>
                    </div>
                  </div>
                </button>
              </div>

              <div className={`overflow-hidden transition-all duration-300 ${
                showCalendar ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="p-6 pt-0">
                  <div className="calendar-visit">
                    <Calendar
                      value={{
                        startDate: dateVisite ?? new Date(),
                        endDate: dateVisite ?? new Date(),
                        key: 'selection',
                      }}
                      onChange={(val) => {
                        setDateVisite(val.selection.startDate ?? new Date());
                        setShowCalendar(false);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
              <div className="flex gap-3">
                <span className="text-green-600 text-lg">💡</span>
                <div>
                  <h4 className="font-medium text-green-900">Conseil pour votre visite</h4>
                  <p className="text-sm text-green-800 mt-1">
                    Planifiez environ 30-45 minutes pour visiter le logement et poser vos questions
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Étape 2: Heure */}
        {step === 2 && (
          <div className={`space-y-6 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">À quelle heure ?</h2>
              <p className="text-gray-600">Sélectionnez l'heure de votre visite</p>
            </div>

            <div className="space-y-4">
              {heuresDisponibles.map((heure, index) => (
                <div
                  key={heure.value}
                  onClick={() => setHeureVisite(heure.value)}
                  className={`relative bg-white rounded-2xl p-6 border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    heureVisite === heure.value 
                      ? 'border-blue-500 shadow-lg scale-[1.02]' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {heure.recommended && (
                    <div className="absolute -top-2 left-4">
                      <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Recommandé
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">🕐</span>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{heure.label}</h3>
                      <p className="text-sm text-gray-600">{heure.period}</p>
                    </div>
                    
                    <div className={`w-6 h-6 rounded-full border-2 transition-all ${
                      heureVisite === heure.value 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300'
                    }`}>
                      {heureVisite === heure.value && (
                        <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Étape 3: Paiement */}
        {step === 3 && (
          <div className={`space-y-6 transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Comment souhaitez-vous payer ?</h2>
              <p className="text-gray-600">Choisissez votre mode de paiement préféré</p>
            </div>

            <div className="space-y-4">
              {paymentOptions.map((option, index) => (
                <div
                  key={option.value}
                  onClick={() => setPaymentType(option.value)}
                  className={`relative bg-white rounded-2xl p-6 border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    paymentType === option.value 
                      ? 'border-blue-500 shadow-lg scale-[1.02]' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {option.popular && (
                    <div className="absolute -top-2 left-4">
                      <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Populaire
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">{option.icon}</span>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{option.label}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                    
                    <div className={`w-6 h-6 rounded-full border-2 transition-all ${
                      paymentType === option.value 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300'
                    }`}>
                      {paymentType === option.value && (
                        <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Champs Mobile Money */}
            {paymentType === 'mobile_money' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span>📱</span>
                  Informations Mobile Money
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Nom sur le compte *
                    </label>
                    <input
                      type="text"
                      value={nomMobileMoney}
                      onChange={(e) => setNomMobileMoney(e.target.value)}
                      placeholder="Ex: Jean Dupont"
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Numéro Mobile Money *
                    </label>
                    <input
                      type="tel"
                      value={numeroMobileMoney}
                      onChange={(e) => setNumeroMobileMoney(e.target.value)}
                      placeholder="Ex: +242 06 123 45 67"
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Étape 4: Confirmation */}
        {step === 4 && (
          <div className={`space-y-6 transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirmer votre visite</h2>
              <p className="text-gray-600">Vérifiez les détails avant de finaliser</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span>🏠</span>
                    Logement
                  </h4>
                  <p className="text-gray-700">{listing.title}</p>
                  <p className="text-sm text-gray-600">{listing.city} • {listing.quater}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span>📅</span>
                    Date et heure
                  </h4>
                  <p className="text-gray-700">
                    {dateVisite && format(dateVisite, "EEEE d MMMM yyyy", { locale: fr })}
                  </p>
                  <p className="text-sm text-gray-600">
                    à {heuresDisponibles.find(h => h.value === heureVisite)?.label}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span>💳</span>
                    Paiement
                  </h4>
                  <p className="text-gray-700">
                    {paymentOptions.find(p => p.value === paymentType)?.label}
                  </p>
                </div>

                {paymentType === 'mobile_money' && (
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                      <span>📱</span>
                      Instructions Mobile Money
                    </h4>
                    <div className="space-y-2 text-sm text-yellow-800">
                      <p>• Envoyez <strong>{listing.prix_viste?.toLocaleString()} FCFA</strong> au <strong>+242 061271245</strong></p>
                      <p>• Nom : <strong>{nomMobileMoney}</strong></p>
                      <p>• Numéro : <strong>{numeroMobileMoney}</strong></p>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                      <span>💰</span>
                      Total à payer
                    </h4>
                    <span className="text-2xl font-bold text-blue-600">
                      {listing.prix_viste?.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      {step < 4 && (
        <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10 shadow-lg">
          <div className="flex gap-3 max-w-lg mx-auto">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-4 px-6 rounded-xl transition-all duration-200"
              >
                Retour
              </button>
            )}
            
            <button
              onClick={handleNext}
              className={`${step > 1 ? 'flex-1' : 'w-full'} bg-red-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]`}
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* Confirmation button */}
      {step === 4 && (
        <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10 shadow-lg">
          <div className="flex gap-3 max-w-lg mx-auto">
            <button
              onClick={handleBack}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-4 px-6 rounded-xl transition-all duration-200"
            >
              Retour
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`flex-1 font-semibold py-4 px-6 rounded-xl transition-all duration-200 ${
                loading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Confirmation...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>🎉</span>
                  <span>Confirmer la visite</span>
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Safe area */}
      <div className="h-32"></div>

      <style jsx global>{`
        .calendar-visit .rdrCalendarWrapper {
          background: transparent;
          color: #374151;
          font-family: inherit;
          width: 100%;
        }

        .calendar-visit .rdrMonth {
          padding: 0;
          width: 100%;
        }

        .calendar-visit .rdrDay {
          height: 44px;
          line-height: 44px;
        }

        .calendar-visit .rdrDayNumber {
          font-weight: 500;
          font-size: 14px;
        }

        .calendar-visit .rdrSelected {
          background:rgb(246, 59, 128) !important;
          color: white !important;
        }

        .calendar-visit .rdrInRange {
          background: #DBEAFE !important;
          color:rgb(233, 27, 130) !important;
        }

        .calendar-visit .rdrStartEdge,
        .calendar-visit .rdrEndEdge {
          background:rgb(246, 59, 140) !important;
          color: white !important;
        }

        .calendar-visit .rdrDayToday .rdrDayNumber:after {
          background:rgb(250, 115, 176);
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default CheckoutVisitePage;