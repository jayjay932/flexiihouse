'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Calendar from '@/app/components/inputs/Calendar';
import { SafeListing, SafeUser } from '@/app/types';
import Button from '@/app/components/Button';
import Image from 'next/image';

interface CheckoutVisitePageProps {
  listing: SafeListing;
  currentUser?: SafeUser | null;
}

const CheckoutVisitePage: React.FC<CheckoutVisitePageProps> = ({ listing, currentUser }) => {
  const router = useRouter();

  const [dateVisite, setDateVisite] = useState<Date | null>(null);
  const [heureVisite, setHeureVisite] = useState<string>('');
  const [paymentType, setPaymentType] = useState<string>('mobile_money');
  const [nomMobileMoney, setNomMobileMoney] = useState('');
  const [numeroMobileMoney, setNumeroMobileMoney] = useState('');

  const heures = Array.from({ length: 9 }, (_, i) => `${i + 9}:00`);
const handleSubmit = async () => {
  if (!dateVisite || !heureVisite) {
    alert('Veuillez choisir une date et une heure de visite.');
    return;
  }

  const payload = {
    listingId: listing.id,
    userId: currentUser?.id,
    date_visite: dateVisite,
    heure_visite: heureVisite,
    type_transaction: paymentType,
    nom_mobile_money: nomMobileMoney,
    numero_mobile_money: numeroMobileMoney,
    totalPrice: listing.prix_viste, // ✅ Ajouté ici
  };

  try {
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json", // ✅ Important pour parse JSON côté backend
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Erreur API:", data);
      alert(data.error || "Erreur lors de la réservation.");
      
      return;
    }

    alert('Réservation confirmée !');
    router.push('/trips');
  } catch (err) {
    console.error("Erreur JS:", err);
    alert('Erreur lors de la réservation.');
    console.error("Erreur API réservation:", err); // 🔍 ceci affiche l'erreur réelle
  }
};

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-black">Confirmer votre visite</h1>

      {/* Logement résumé */}
      <div className="border rounded-lg p-4 mb-6 shadow-sm flex gap-4 items-center">
        <Image
          src={listing.images?.[0]?.url || '/placeholder.jpg'}
          alt={listing.title}
          width={100}
          height={100}
          className="rounded-md object-cover"
        />
        <div>
          <p className="text-lg font-semibold text-black">{listing.title}</p>
          <p className="text-sm text-neutral-500">{listing.city} - {listing.quater}</p>
        </div>
      </div>

      {/* Prix de visite */}
      <div className="mb-4 text-lg text-black">
        Prix de la visite : <strong className="text-rose-500">XAF {listing.prix_viste}</strong>
      </div>

      {/* Date de visite */}
      <div className="mb-6">
        <h2 className="text-md font-semibold text-black mb-2">Choisissez une date de visite</h2>
       <Calendar
  value={{
    startDate: dateVisite ?? new Date(),
    endDate: dateVisite ?? new Date(),
    key: 'selection',
  }}
  onChange={(val) => setDateVisite(val.selection.startDate ?? new Date())}
/>

      </div>

      {/* Heure */}
      <div className="mb-6">
        <label htmlFor="heure" className="block text-md font-semibold text-black mb-2">
          Heure de visite
        </label>
        <select
          id="heure"
          className="w-full p-3 border border-gray-300 rounded-md"
          value={heureVisite}
          onChange={(e) => setHeureVisite(e.target.value)}
        >
          <option value="">-- Sélectionner une heure --</option>
          {heures.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </div>

      {/* Type de paiement */}
      <div className="mb-6">
        <label className="block text-md font-semibold text-black mb-2">Type de paiement</label>
        <select
          className="w-full p-3 border border-gray-300 rounded-md"
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
        >
          <option value="mobile_money">Mobile Money</option>
          <option value="espèces">Espèces</option>
          <option value="cb">Carte bancaire</option>
        </select>
      </div>

      {/* Infos Mobile Money */}
      {paymentType === 'mobile_money' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            placeholder="Nom Mobile Money"
            className="p-3 border border-gray-300 rounded-md"
            value={nomMobileMoney}
            onChange={(e) => setNomMobileMoney(e.target.value)}
          />
          <input
            type="text"
            placeholder="Numéro Mobile Money"
            className="p-3 border border-gray-300 rounded-md"
            value={numeroMobileMoney}
            onChange={(e) => setNumeroMobileMoney(e.target.value)}
          />
        </div>
      )}

      {/* Bouton */}
      <Button label="Confirmer la réservation" onClick={handleSubmit} />
    </div>
  );
};

export default CheckoutVisitePage;
