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

interface CheckoutClientProps {
  listing: SafeListing;
  currentUser?: SafeUser | null;
}

const CheckoutClient: React.FC<CheckoutClientProps> = ({ listing, currentUser }) => {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');

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

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const handleConfirm = async () => {
    try {
      await axios.post("/api/reservations", {
        listingId: listing.id,
        totalPrice,
        startDate,
        endDate,
        message,
      });
      toast.success("Réservation confirmée !");
      router.push("/trips");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la réservation");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
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
              Total estimé : <strong>XAF {totalPrice}</strong> pour {dayCount} nuit{dayCount > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex justify-between mt-6">
            <Button label="Annuler" outline onClick={() => router.back()} />
            <Button label="Continuer" onClick={handleNext} />
          </div>
        </div>
      )}

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

      {step === 3 && (
        <div className="flex flex-col gap-6">
          <Heading title="Paiement" subtitle="Choisissez votre moyen de paiement" />
          <p className="text-neutral-500">Méthodes de paiement à venir...</p>
          <div className="flex justify-between mt-6">
            <Button label="Retour" outline onClick={handleBack} />
            <Button label="Continuer" onClick={handleNext} />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-6">
          <Heading title="Confirmer" subtitle="Finalisez votre réservation" />
          <p className="text-neutral-600">
            Vous êtes sur le point de réserver <strong>{listing.title}</strong> à <strong>XAF {listing.price}</strong>/nuit pour <strong>{dayCount} nuit{dayCount > 1 ? 's' : ''}</strong>.
          </p>
          {message && (
            <p className="text-sm text-neutral-500 italic">Votre message : {message}</p>
          )}
          <div className="flex justify-between mt-6">
            <Button label="Retour" outline onClick={handleBack} />
            <Button label="Confirmer" onClick={handleConfirm} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutClient;
