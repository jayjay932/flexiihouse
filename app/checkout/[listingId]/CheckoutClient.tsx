'use client';

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SafeListing, SafeUser } from "@/app/types";
import axios from "axios";
import { toast } from "react-hot-toast";
import { differenceInDays } from "date-fns";
import Image from "next/image";

import Heading from "@/app/components/Heading";
import Button from "@/app/components/Button";
import Textarea from "@/app/components/inputs/Textarea";
import Input from "@/app/components/inputs/Input";

type TransactionType = 'mobile_money' | 'taptap_send' | 'cb';

const paymentOptions: { label: string; value: TransactionType; image: string }[] = [
  { label: 'Mobile Money', value: 'mobile_money', image: '/images/mobile_money.png' },
  { label: 'TapTap Send', value: 'taptap_send', image: '/images/taptap_send.png' },
  { label: 'Carte Bancaire', value: 'cb', image: '/images/cb.png' },
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
  const [checkInHour, setCheckInHour] = useState('');
  const [loading, setLoading] = useState(false);

  const startDateParam = params?.get('startDate');
  const endDateParam = params?.get('endDate');

  const startDate = useMemo(() => (startDateParam ? new Date(startDateParam) : null), [startDateParam]);
  const endDate = useMemo(() => (endDateParam ? new Date(endDateParam) : null), [endDateParam]);

  const dayCount = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const diff = differenceInDays(endDate, startDate);
    return diff <= 0 ? 1 : diff;
  }, [startDate, endDate]);

  const totalPrice = useMemo(() => listing.price * dayCount, [listing.price, dayCount]);

  const handleNext = () => {
    if (step === 4 && selectedPayment === 'mobile_money') {
      if (!nomMM || !numeroMM || !checkInHour) {
        toast.error("Tous les champs Mobile Money sont requis.");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleConfirm = async () => {
    if (!selectedPayment) return toast.error("Veuillez sélectionner un mode de paiement.");

    try {
      setLoading(true);
      await axios.post("/api/reservations", {
        listingId: listing.id,
        totalPrice,
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

      toast.success("Réservation confirmée !");
      router.push("/trips");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la réservation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {/* Étape 1 : Récapitulatif */}
      {step === 1 && (
        <div className="flex flex-col gap-6">
          <Heading title="Récapitulatif" subtitle="Vérifiez les détails de votre réservation" />
          <div className="relative h-56 w-full rounded-lg overflow-hidden">
            <Image src={listing.images?.[0]?.url || "/placeholder.jpg"} fill className="object-cover" alt="listing" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{listing.title}</h2>
            <p className="text-neutral-500">{listing.locationValue}</p>
            <p className="text-lg mt-2 font-medium">XAF {listing.price} / nuit</p>
            <p className="text-sm text-neutral-600 mt-1">
              Du <strong>{startDate?.toLocaleDateString()}</strong> au <strong>{endDate?.toLocaleDateString()}</strong><br />
              Total estimé : <strong>XAF {totalPrice.toLocaleString()}</strong> pour {dayCount} nuit{dayCount > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex justify-between mt-6">
            <Button label="Annuler" outline onClick={() => router.back()} />
            <Button label="Continuer" onClick={handleNext} />
          </div>
        </div>
      )}

      {/* Étape 2 : Message */}
      {step === 2 && (
        <div className="flex flex-col gap-6">
          <Heading title="Message à l’hôte" subtitle="Facultatif, mais utile pour présenter votre séjour" />
          <Textarea
            id="message"
            label="Votre message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="flex justify-between mt-6">
            <Button label="Retour" outline onClick={handleBack} />
            <Button label="Continuer" onClick={handleNext} />
          </div>
        </div>
      )}

      {/* Étape 3 : Moyen de paiement */}
      {step === 3 && (
        <div className="flex flex-col gap-6">
          <Heading title="Paiement" subtitle="Choisissez votre moyen de paiement" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {paymentOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => setSelectedPayment(option.value)}
                className={`cursor-pointer border rounded-lg p-4 text-center hover:shadow-md transition ${
                  selectedPayment === option.value ? 'border-rose-500 shadow-lg' : 'border-neutral-300'
                }`}
              >
                <Image src={option.image} alt={option.label} width={60} height={40} className="mx-auto mb-2" />
                <p className="font-medium">{option.label}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <Button label="Retour" outline onClick={handleBack} />
            <Button label="Continuer" onClick={handleNext} disabled={!selectedPayment} />
          </div>
        </div>
      )}

      {/* Étape 4 : Saisie Mobile Money */}
      {step === 4 && selectedPayment === 'mobile_money' && (
        <div className="flex flex-col gap-6">
          <Heading title="Mobile Money" subtitle="Entrez vos coordonnées" />
          <Input label="Nom Mobile Money" value={nomMM} onChange={(e) => setNomMM(e.target.value)} />
          <Input label="Numéro Mobile Money" value={numeroMM} onChange={(e) => setNumeroMM(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heure d’entrée souhaitée</label>
            <select
              value={checkInHour}
              onChange={(e) => setCheckInHour(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              <option value="">-- Choisir une heure --</option>
              <option value="11:00">11h</option>
              <option value="12:00">12h</option>
              <option value="13:00">13h</option>
              <option value="14:00">14h</option>
              <option value="15:00">15h</option>
              <option value="16:00">16h</option>
              <option value="17:00">17h</option>
            </select>
          </div>
          <div className="flex justify-between mt-6">
            <Button label="Retour" outline onClick={handleBack} />
            <Button label="Continuer" onClick={handleNext} />
          </div>
        </div>
      )}

      {/* Étape 5 : Confirmation */}
      {(step === 5 || (step === 4 && selectedPayment !== 'mobile_money')) && (
        <div className="flex flex-col gap-6">
          <Heading title="Confirmer" subtitle="Finalisez votre réservation" />
          <p className="text-neutral-600">
            Vous réservez <strong>{listing.title}</strong> à <strong>XAF {listing.price}</strong>/nuit pour <strong>{dayCount}</strong> nuit{dayCount > 1 ? 's' : ''}.
          </p>
          {message && (
            <p className="text-sm text-neutral-500 italic">Message à l’hôte : {message}</p>
          )}
          {selectedPayment && (
            <div className="flex items-center gap-3 mt-2">
              <Image
                src={paymentOptions.find(p => p.value === selectedPayment)?.image || '/placeholder.jpg'}
                alt="paiement"
                width={40}
                height={30}
              />
              <p className="text-sm font-medium text-gray-800">
                Paiement via : {paymentOptions.find(p => p.value === selectedPayment)?.label}
              </p>
            </div>
          )}
          {selectedPayment === 'mobile_money' && (
            <div className="bg-yellow-50 text-yellow-900 p-4 rounded-md text-sm mt-4 space-y-1">
              <p>Envoyez le montant à : <strong>+242 061271245</strong></p>
              <p>Nom Mobile Money : <strong>{nomMM}</strong></p>
              <p>Numéro Mobile Money : <strong>{numeroMM}</strong></p>
              <p>Heure d’entrée souhaitée : <strong>{checkInHour}</strong></p>
              <p>Montant total : <strong>XAF {totalPrice.toLocaleString()}</strong></p>
            </div>
          )}
          <div className="flex justify-between mt-6">
            <Button label="Retour" outline onClick={handleBack} />
            <Button
              label={loading ? "Confirmation..." : "Confirmer"}
              onClick={handleConfirm}
              disabled={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutClient;
