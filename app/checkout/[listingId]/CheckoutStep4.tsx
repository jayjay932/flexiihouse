'use client';

import { SafeListing, SafeUser } from '@/app/types';
import Heading from '@/app/components/Heading';
import Button from '@/app/components/Button';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Range } from 'react-date-range';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface Props {
  listing: SafeListing;
  currentUser: SafeUser | null;
  totalPrice: number;
  dateRange: Range;
  message: string;
  isLoading: boolean;
  onBack: () => void;
}

const CheckoutStep4: React.FC<Props> = ({
  listing,
  currentUser,
  totalPrice,
  dateRange,
  message,
  onBack
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onConfirm = () => {
    setLoading(true);
    axios.post('/api/reservations', {
      listingId: listing.id,
      totalPrice,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      message,
    }).then(() => {
      toast.success("Réservation confirmée !");
      router.push('/trips');
    }).catch(() => {
      toast.error("Erreur lors de la réservation.");
    }).finally(() => {
      setLoading(false);
    });
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md mt-20">
      <Heading title="Confirmation" subtitle="Vérifiez les détails de votre séjour." />
      <div className="mt-4 text-sm text-neutral-700 space-y-2">
        <p><strong>Logement :</strong> {listing.title}</p>
        <p><strong>Lieu :</strong> {listing.locationValue}</p>
        <p><strong>Dates :</strong> {dateRange.startDate?.toLocaleDateString()} - {dateRange.endDate?.toLocaleDateString()}</p>
        <p><strong>Total :</strong> {totalPrice} XAF 💵</p>
        {message && <p><strong>Message :</strong> {message}</p>}
      </div>
      <div className="flex justify-between mt-6">
        <Button label="Annuler" onClick={onBack} disabled={loading} />
        <Button label="Confirmer" onClick={onConfirm} disabled={loading} />
      </div>
    </div>
  );
};

export default CheckoutStep4;
