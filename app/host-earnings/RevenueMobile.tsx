'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { Range, RangeKeyDict } from "react-date-range";
import { format, parseISO } from "date-fns";
import Calendar from "@/app/components/inputs/Calendar";
import Button from "@/app/components/Button";

interface RevenueData {
  totalReservations: number;
  totalNights: number;
  totalPaidByClients: number;
  totalToHost: number;
  totalCommission: number;
  monthlyRevenue?: Record<string, number>;
}

const RevenueMobile = () => {
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);

  const [periodData, setPeriodData] = useState<RevenueData | null>(null);
  const [monthlyData, setMonthlyData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPeriodRevenue = async (range: Range) => {
    if (!range?.startDate || !range?.endDate) return;

    setLoading(true);
    try {
      const response = await axios.get("/api/dashboard/revenue", {
        params: {
          start: range.startDate.toISOString(),
          end: range.endDate.toISOString(),
        },
      });
      setPeriodData(response.data);
    } catch (err) {
      console.error("Erreur API:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyRevenue = async () => {
    try {
      const response = await axios.get("/api/dashboard/revenue");
      setMonthlyData(response.data);
    } catch (err) {
      console.error("Erreur CA mensuel:", err);
    }
  };

  useEffect(() => {
    fetchMonthlyRevenue();
  }, []);

  const handleCalendarChange = (range: RangeKeyDict) => {
    const newRange = range.selection;

    // Désélection si même date cliquée
    if (
      selectedRange &&
      selectedRange.startDate?.toDateString() === newRange.startDate?.toDateString() &&
      selectedRange.endDate?.toDateString() === newRange.endDate?.toDateString()
    ) {
      setSelectedRange(null);
      setPeriodData(null);
    } else {
      setSelectedRange(newRange);
      fetchPeriodRevenue(newRange);
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4 text-center">
        Chiffre d’affaires sur la période
      </h2>

    <Calendar
  value={selectedRange ?? { startDate: undefined, endDate: undefined, key: 'selection' }}
  onChange={handleCalendarChange}
  showPreview={false} // ✅ Désactive le hover
/>

      {selectedRange && (
        <div className="flex justify-end mt-2">
          <Button
            label="Réinitialiser"
            small
            onClick={() => {
              setSelectedRange(null);
              setPeriodData(null);
            }}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center mt-6 text-sm text-gray-500">Chargement...</div>
      ) : periodData ? (
        <div className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total réservations</span>
            <span className="font-medium">{periodData.totalReservations}</span>
          </div>
          <div className="flex justify-between">
            <span>Total nuits réservées</span>
            <span className="font-medium">{periodData.totalNights}</span>
          </div>
          <div className="flex justify-between">
            <span>Total payé par les clients</span>
            <span className="font-medium">{periodData.totalPaidByClients.toLocaleString()} FCFA</span>
          </div>
          <div className="flex justify-between">
            <span>Montant à recevoir</span>
            <span className="font-medium text-green-600">{periodData.totalToHost.toLocaleString()} FCFA</span>
          </div>
          <div className="flex justify-between">
            <span>Commission Flexi</span>
            <span className="font-medium text-red-500">{periodData.totalCommission.toLocaleString()} FCFA</span>
          </div>
        </div>
      ) : (
        <div className="text-center mt-6 text-sm text-gray-400">
          {selectedRange ? "Aucune donnée pour cette période." : "Aucune période sélectionnée."}
        </div>
      )}

      {monthlyData?.monthlyRevenue && (
        <div className="mt-8">
          <h3 className="font-semibold text-center mb-2">Chiffre d’affaires mensuel</h3>
          <ul className="space-y-1 text-sm">
            {Object.entries(monthlyData.monthlyRevenue).map(([month, revenue]) => (
              <li key={month} className="flex justify-between">
                <span>{format(parseISO(`${month}-01`), "MMMM yyyy")}</span>
                <span className="font-medium">{revenue.toLocaleString()} FCFA</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RevenueMobile;
