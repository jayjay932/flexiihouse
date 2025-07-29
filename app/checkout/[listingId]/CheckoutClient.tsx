'use client';
import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SafeListing, SafeUser } from "@/app/types";
import axios from "axios";
import { toast } from "react-hot-toast";
import { differenceInDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import Image from "next/image";

type TransactionType = 'mobile_money' | 'taptap_send' | 'cb';

const paymentOptions: { label: string; value: TransactionType; image: string; description: string; popular?: boolean }[] = [
  { label: 'Mobile Money', value: 'mobile_money', image: '/images/mobile_money.png', description: 'Airtel, MTN, Orange', popular: true },
  { label: 'TapTap Send', value: 'taptap_send', image: '/images/taptap_send.png', description: 'Transfert international' },
  { label: 'Carte Bancaire', value: 'cb', image: '/images/cb.png', description: 'Visa, Mastercard' },
];

const checkInHours = [
  { value: '11:00', label: '11h00' },
  { value: '12:00', label: '12h00' },
  { value: '13:00', label: '13h00' },
  { value: '14:00', label: '14h00 (Recommandé)' },
  { value: '15:00', label: '15h00' },
  { value: '16:00', label: '16h00' },
  { value: '17:00', label: '17h00' },
  { value: '18:00', label: '18h00' },
];

interface CheckoutClientProps {
  listing: SafeListing;
  currentUser?: SafeUser | null;
}

const CheckoutClient: React.FC<CheckoutClientProps> = ({ listing, currentUser }) => {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<TransactionType | null>(null);
  const [nomMM, setNomMM] = useState('');
  const [numeroMM, setNumeroMM] = useState('');
  const [checkInHour, setCheckInHour] = useState('14:00');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const startDateParam = params?.get('startDate');
  const endDateParam = params?.get('endDate');
  const startDate = useMemo(() => (startDateParam ? new Date(startDateParam) : null), [startDateParam]);
  const endDate = useMemo(() => (endDateParam ? new Date(endDateParam) : null), [endDateParam]);

  const dayCount = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const diff = differenceInDays(endDate, startDate);
    return diff <= 0 ? 1 : diff;
  }, [startDate, endDate]);

  // Calculs des prix avec commission de 1000 FCFA par nuit
  const basePrice = useMemo(() => listing.price * dayCount, [listing.price, dayCount]);
  const COMMISSION_PER_NIGHT = 1000; // Commission de 1000 FCFA par nuit
  const commissionTotal = useMemo(() => COMMISSION_PER_NIGHT * dayCount, [dayCount]);
  const totalPrice = useMemo(() => basePrice + commissionTotal, [basePrice, commissionTotal]);
  const cashToPayOwner = useMemo(() => basePrice, [basePrice]); // À payer en espèces au propriétaire
const totalCashToPay = useMemo(() =>basePrice- commissionTotal, [basePrice, commissionTotal]);
  const getStepTitle = () => {
    switch (step) {
      case 1: return "Récapitulatif";
      case 2: return "Message à l'hôte";
      case 3: return "Paiement";
      case 4: return "Informations Mobile Money";
      case 5: return "Confirmation";
      default: return "Réservation";
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 1: return "Vérifiez les détails de votre séjour";
      case 2: return "Présentez-vous à votre hôte (optionnel)";
      case 3: return "Choisissez votre mode de paiement";
      case 4: return "Complétez vos informations de paiement";
      case 5: return "Dernière étape avant confirmation";
      default: return "";
    }
  };

  const handleNext = () => {
    if (step === 4 && selectedPayment === 'mobile_money') {
      if (!nomMM || !numeroMM) {
        toast.error("Veuillez remplir tous les champs obligatoires", {
          style: {
            background: '#EF4444',
            color: 'white',
            borderRadius: '12px',
            padding: '16px',
          },
        });
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleConfirm = async () => {
    if (!selectedPayment) {
      toast.error("Veuillez sélectionner un mode de paiement");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/reservations", {
        listingId: listing.id,
        totalPrice: totalCashToPay, // Seuls les frais de réservation (1000 FCFA par nuit)
        startDate,
        endDate,
        message,
        type_transaction: selectedPayment,
        nom_mobile_money: nomMM || null,
        numero_mobile_money: numeroMM || null,
        check_in_hours: checkInHour
          ? new Date(`${startDate?.toISOString().split('T')[0]}T${checkInHour}:00Z`)
          : null,
      });

      toast.success("🎉 Réservation confirmée avec succès !", {
        duration: 4000,
        style: {
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: 'white',
          borderRadius: '16px',
          padding: '16px 24px',
          fontWeight: '600',
        },
      });

      router.push("/trips");
    } catch (error) {
      console.error(error);
      toast.error("❌ Erreur lors de la réservation", {
        style: {
          background: '#EF4444',
          color: 'white',
          borderRadius: '12px',
          padding: '16px',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header sticky avec progress */}
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
                <p className="text-sm text-gray-500">Étape {step} sur 5</p>
              </div>
            </div>
           
            {/* Progress bar */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-6 h-2 rounded-full transition-all duration-300 ${
                    i <= step ? 'bg-rose-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Étape 1 : Récapitulatif */}
        {step === 1 && (
          <div className={`space-y-6 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{getStepTitle()}</h2>
              <p className="text-gray-600">{getStepSubtitle()}</p>
            </div>

            {/* Card logement */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-[16/9] relative">
                <Image
                  src={listing.images?.[0]?.url || "/placeholder.jpg"}
                  fill
                  className="object-cover"
                  alt="listing"
                />
                <div className="absolute top-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                    ❤️ Coup de cœur
                  </div>
                </div>
              </div>
             
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{listing.title}</h3>
                <p className="text-gray-600 mb-4 flex items-center gap-2">
                  <span>📍</span>
                  {listing.locationValue}
                </p>
               
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Dates</span>
                    <span className="font-medium">
                      {startDate && endDate && (
                        `${format(startDate, "d MMM", { locale: fr })} → ${format(endDate, "d MMM yyyy", { locale: fr })}`
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Durée</span>
                    <span className="font-medium">{dayCount} nuit{dayCount > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Prix par nuit</span>
                    <span className="font-medium">{listing.price.toLocaleString()} FCFA</span>
                  </div>
                  
                  {/* Calcul détaillé des prix */}
                  <div className="border-t border-gray-200 pt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Sous-total ({dayCount} nuit{dayCount > 1 ? 's' : ''})</span>
                      <span>{basePrice.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Frais de réservation ({dayCount} nuit{dayCount > 1 ? 's' : ''} × 1000)</span>
                      <span>{commissionTotal.toLocaleString()} FCFA</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-xl font-bold text-rose-500">
                          {basePrice.toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations de paiement */}
                <div className="mt-4 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <div className="flex gap-3">
                    <span className="text-yellow-600 text-lg">ℹ️</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-yellow-900 mb-2">Détails du paiement</h4>
                      <div className="space-y-1 text-sm text-yellow-800">
                        <div className="flex justify-between">
                          <span>À payer maintenant :</span>
                          <span className="font-semibold">{commissionTotal.toLocaleString()} FCFA</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reste en espèces :</span>
                          <span className="font-semibold">{totalCashToPay.toLocaleString()} FCFA</span>
                        </div>
                      </div>
                      <p className="text-xs text-yellow-700 mt-2">
                        Frais remboursables uniquement si le propriétaire annule
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Étape 2 : Message */}
        {step === 2 && (
          <div className={`space-y-6 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{getStepTitle()}</h2>
              <p className="text-gray-600">{getStepSubtitle()}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">💬</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Message à votre hôte</h3>
                    <p className="text-sm text-gray-600">Présentez-vous et votre séjour</p>
                  </div>
                </div>
               
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Bonjour ! Je suis ravi(e) de séjourner dans votre logement. Nous sommes un couple en voyage de découverte..."
                  className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                />
               
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Optionnel mais recommandé</span>
                  <span className="text-gray-400">{message.length}/500</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-medium text-blue-900 mb-2">💡 Conseils pour votre message</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Présentez-vous brièvement</li>
                  <li>• Mentionnez le motif de votre voyage</li>
                  <li>• Posez des questions sur le quartier</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Étape 3 : Paiement */}
        {step === 3 && (
          <div className={`space-y-6 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{getStepTitle()}</h2>
              <p className="text-gray-600">{getStepSubtitle()}</p>
            </div>

            {/* Récapitulatif des frais avant paiement */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">💰 Récapitulatif des frais</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Prix du séjour ({dayCount} nuit{dayCount > 1 ? 's' : ''})</span>
                  <span className="font-medium">{basePrice.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Frais de réservation ({dayCount} × 1000)</span>
                  <span className="font-medium">{commissionTotal.toLocaleString()} FCFA</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-rose-600">À payer maintenant</span>
                    <span className="text-xl font-bold text-rose-600">{commissionTotal.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">Reste à payer en espèces</span>
                    <span className="font-medium">{totalCashToPay.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {paymentOptions.map((option, index) => (
                <div
                  key={option.value}
                  onClick={() => setSelectedPayment(option.value)}
                  className={`relative bg-white rounded-2xl p-6 border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedPayment === option.value
                      ? 'border-rose-500 shadow-lg scale-[1.02]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {option.popular && (
                    <div className="absolute -top-2 left-4">
                      <div className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Populaire
                      </div>
                    </div>
                  )}
                 
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <Image
                        src={option.image}
                        alt={option.label}
                        width={48}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                   
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{option.label}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                   
                    <div className={`w-6 h-6 rounded-full border-2 transition-all ${
                      selectedPayment === option.value
                        ? 'border-rose-500 bg-rose-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedPayment === option.value && (
                        <div className="w-full h-full rounded-full bg-rose-500 flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
              <div className="flex gap-3">
                <span className="text-yellow-600 text-lg">ℹ️</span>
                <div>
                  <h4 className="font-medium text-yellow-900">Informations importantes</h4>
                  <div className="text-sm text-yellow-800 mt-1 space-y-1">
                    <p>• Frais remboursables uniquement si le propriétaire annule</p>
                    <p>• Solde de {totalCashToPay.toLocaleString()} FCFA à payer en espèces directement au propriétaire</p>
                    <p>• Paiement sécurisé et crypté</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Étape 4 : Mobile Money */}
        {step === 4 && selectedPayment === 'mobile_money' && (
          <div className={`space-y-6 transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{getStepTitle()}</h2>
              <p className="text-gray-600">{getStepSubtitle()}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nom sur le compte Mobile Money *
                </label>
                <input
                  type="text"
                  value={nomMM}
                  onChange={(e) => setNomMM(e.target.value)}
                  placeholder="Ex: Jean Dupont"
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Numéro Mobile Money *
                </label>
                <input
                  type="tel"
                  value={numeroMM}
                  onChange={(e) => setNumeroMM(e.target.value)}
                  placeholder="Ex: +242 06 123 45 67"
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Heure d'arrivée souhaitée
                </label>
                <select
                  value={checkInHour}
                  onChange={(e) => setCheckInHour(e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                >
                  {checkInHours.map((hour) => (
                    <option key={hour.value} value={hour.value}>
                      {hour.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
              <div className="flex gap-3">
                <span className="text-blue-600 text-lg">ℹ️</span>
                <div>
                  <h4 className="font-medium text-blue-900">Instructions de paiement</h4>
                  <p className="text-sm text-blue-800 mt-1">
                    Après confirmation, vous recevrez les instructions pour effectuer le transfert Mobile Money de {commissionTotal.toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Étape 5 : Confirmation */}
        {(step === 5 || (step === 4 && selectedPayment !== 'mobile_money')) && (
          <div className={`space-y-6 transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{getStepTitle()}</h2>
              <p className="text-gray-600">{getStepSubtitle()}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎉</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Presque terminé !</h3>
                <p className="text-gray-600">Vérifiez une dernière fois les détails</p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">📍 Logement</h4>
                  <p className="text-gray-700">{listing.title}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">📅 Séjour</h4>
                  <p className="text-gray-700">
                    {startDate && endDate && (
                      `${format(startDate, "d MMMM yyyy", { locale: fr })} → ${format(endDate, "d MMMM yyyy", { locale: fr })}`
                    )}
                  </p>
                  <p className="text-sm text-gray-600">{dayCount} nuit{dayCount > 1 ? 's' : ''}</p>
                </div>

                {selectedPayment && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">💳 Paiement</h4>
                    <div className="flex items-center gap-3">
                      <Image
                        src={paymentOptions.find(p => p.value === selectedPayment)?.image || '/placeholder.jpg'}
                        alt="paiement"
                        width={32}
                        height={24}
                        className="object-contain"
                      />
                      <span className="text-gray-700">
                        {paymentOptions.find(p => p.value === selectedPayment)?.label}
                      </span>
                    </div>
                  </div>
                )}

                {selectedPayment === 'mobile_money' && (
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <h4 className="font-semibold text-yellow-900 mb-3">📱 Instructions Mobile Money</h4>
                    <div className="space-y-2 text-sm text-yellow-800">
                      <p>• Envoyez <strong>{commissionTotal.toLocaleString()} FCFA</strong> au <strong>+242 061271245</strong></p>
                      <p>• Nom : <strong>{nomMM}</strong></p>
                      <p>• Numéro : <strong>{numeroMM}</strong></p>
                      <p>• Arrivée prévue : <strong>{checkInHour}</strong></p>
                    </div>
                  </div>
                )}

                {/* Récapitulatif final des frais */}
                <div className="bg-rose-50 rounded-xl p-4 border border-rose-200">
                  <h4 className="font-semibold text-rose-900 mb-3">💰 Récapitulatif des paiements</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-rose-800">À payer maintenant (frais de réservation) :</span>
                      <span className="font-bold text-rose-900">{commissionTotal.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rose-700">Reste à payer en espèces au propriétaire :</span>
                      <span className="font-medium text-rose-800">{totalCashToPay.toLocaleString()} FCFA</span>
                    </div>
                    <div className="border-t border-rose-200 pt-2">
                      <div className="flex justify-between">
                        <span className="font-bold text-rose-900">Coût total du séjour :</span>
                        <span className="font-bold text-rose-900">{basePrice.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations de remboursement */}
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <div className="flex gap-3">
                    <span className="text-yellow-600 text-lg">ℹ️</span>
                    <div>
                      <h4 className="font-medium text-yellow-900">Informations de remboursement</h4>
                      <div className="text-sm text-yellow-800 mt-1 space-y-1">
                        <p>• Frais de réservation remboursables uniquement si le propriétaire annule</p>
                        <p>• Solde à payer en espèces directement au propriétaire lors de votre arrivée</p>
                        <p>• Aucun remboursement en cas d'annulation de votre part</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      {step < 5 && !(step === 4 && selectedPayment !== 'mobile_money') && (
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
              disabled={step === 3 && !selectedPayment}
              className={`${step > 1 ? 'flex-1' : 'w-full'} font-semibold py-4 px-6 rounded-xl transition-all duration-200 ${
                (step === 3 && !selectedPayment)
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
              }`}
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* Confirmation button */}
      {(step === 5 || (step === 4 && selectedPayment !== 'mobile_money')) && (
        <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10 shadow-lg">
          <div className="flex gap-3 max-w-lg mx-auto">
            <button
              onClick={handleBack}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-4 px-6 rounded-xl transition-all duration-200"
            >
              Retour
            </button>
           
            <button
              onClick={handleConfirm}
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
                  <span>Confirmer la réservation</span>
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Safe area étendue */}
      <div className="h-32"></div>
    </div>
  );
};

export default CheckoutClient;