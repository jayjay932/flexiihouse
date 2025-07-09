'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { RangeKeyDict } from "react-date-range";

import Container from "@/app/components/Container";
import Heading from "@/app/components/Heading";
import DatePicker from "@/app/components/inputs/Calendar"; // ou ton composant DatePicker

import { Range } from "react-date-range";
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

  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(false);

  const onChange = (value: RangeKeyDict) => {
    setRange(value.selection);
  };

  const updateAvailability = async () => {
    if (!range.startDate || !range.endDate) return;

    setLoading(true);

    const dates: string[] = [];
    let currentDate = new Date(range.startDate);

    while (currentDate <= range.endDate) {
      dates.push(currentDate.toISOString().split('T')[0]); // format YYYY-MM-DD
      currentDate.setDate(currentDate.getDate() + 1);
    }

    try {
      await axios.post('/api/availability/update', {
        listingId,
        dates,
        isAvailable
      });

      toast.success('Disponibilité mise à jour');
      router.refresh();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Heading
        title="Modifier la disponibilité"
        subtitle="Sélectionnez une plage de dates"
      />

      <div className="max-w-md mx-auto mt-8">
        <DatePicker
          value={range}
          onChange={onChange}
          showPreview={true}
        />

        <div className="flex gap-4 mt-6 justify-center">
          <button
            disabled={loading}
            onClick={() => {
              setIsAvailable(true);
              updateAvailability();
            }}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            Marquer comme disponible
          </button>

          <button
            disabled={loading}
            onClick={() => {
              setIsAvailable(false);
              updateAvailability();
            }}
            className="px-4 py-2 rounded bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
          >
            Marquer comme non disponible
          </button>
        </div>
      </div>
    </Container>
  );
};

export default DisponibilitePage;
