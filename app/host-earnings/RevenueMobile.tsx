'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { Range, RangeKeyDict } from "react-date-range";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
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
  const [viewMode, setViewMode] = useState<'overview' | 'period' | 'trends'>('overview');

  const fetchPeriodRevenue = async (range: Range) => {
    if (!range?.startDate || !range?.endDate) return;

    setLoading(true);
    try {
      const response = await axios.get("/api/dashboard/revenue", {
        params: {
          start: range.startDate.toISOString(),
          end: range.endDate.toISOString(),
        },
        withCredentials: true,
      });
      setPeriodData(response.data);
    } catch (err) {
      console.error("Erreur API période:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyRevenue = async () => {
    try {
      const response = await axios.get("/api/dashboard/revenue", {
        withCredentials: true,
      });
      setMonthlyData(response.data);
    } catch (err) {
      console.error("Erreur API mensuel:", err);
    }
  };

  useEffect(() => {
    fetchMonthlyRevenue();
  }, []);

  const handleCalendarChange = (range: RangeKeyDict) => {
    const newRange = range.selection;

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
      setViewMode('period');
    }
  };

  // Préparer les données pour les graphiques
  const chartData = monthlyData?.monthlyRevenue ? 
    Object.entries(monthlyData.monthlyRevenue).map(([month, revenue]) => ({
      month: format(parseISO(`${month}-01`), "MMM", { locale: fr }),
      revenue: revenue,
      formattedRevenue: `${revenue.toLocaleString()} FCFA`
    })) : [];

  const pieData = periodData ? [
    { name: 'Montant à recevoir', value: periodData.totalToHost, color: '#10B981' },
    { name: 'Commission Flexi', value: periodData.totalCommission, color: '#EF4444' }
  ] : [];

  const statsCards = [
    {
      title: 'Réservations',
      value: periodData?.totalReservations || monthlyData?.totalReservations || 0,
      icon: '📅',
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-600'
    },
    {
      title: 'Nuits réservées',
      value: periodData?.totalNights || monthlyData?.totalNights || 0,
      icon: '🛏️',
      color: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-600'
    },
    {
      title: 'Revenus totaux',
      value: `${(periodData?.totalToHost || monthlyData?.totalToHost|| 0).toLocaleString()} FCFA`,
      icon: '💰',
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-semibold text-gray-900 text-center">
            Tableau de bord
          </h1>
          
          {/* Navigation tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mt-4">
            {[
              { key: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
              { key: 'period', label: 'Période', icon: '📅' },
              { key: 'trends', label: 'Tendances', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setViewMode(tab.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  viewMode === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Vue d'ensemble */}
        {viewMode === 'overview' && (
          <>
            {/* Cards de statistiques */}
            <div className="grid grid-cols-1 gap-4">
              {statsCards.map((card, index) => (
                <div
                  key={index}
                  className={`${card.color} rounded-2xl p-4 border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                      <p className={`text-2xl font-bold ${card.textColor}`}>
                        {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                      </p>
                    </div>
                    <div className="text-3xl">{card.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Graphique mensuel */}
            {chartData.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  📈 Évolution mensuelle
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value: any) => [`${value.toLocaleString()} FCFA`, 'Revenus']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}

        {/* Vue période */}
        {viewMode === 'period' && (
          <>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                📅 Sélectionner une période
              </h3>
              
              <Calendar
                value={selectedRange ?? { startDate: undefined, endDate: undefined, key: 'selection' }}
                onChange={handleCalendarChange}
                showPreview={false}
              />

              {selectedRange && (
                <div className="flex justify-end mt-4">
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
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Chargement des données...</span>
                </div>
              </div>
            ) : periodData ? (
              <>
                {/* Statistiques de la période */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    📊 Résultats de la période
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'Réservations', value: periodData.totalReservations, icon: '📅' },
                      { label: 'Nuits réservées', value: periodData.totalNights, icon: '🛏️' },
                      { label: 'Total payé par les clients', value: `${periodData.totalPaidByClients.toLocaleString()} FCFA`, icon: '💰' },
                      { label: 'Montant à recevoir', value: `${periodData.totalToHost.toLocaleString()} FCFA`, icon: '✅', color: 'text-green-600' },
                      { label: 'Commission Flexi', value: `${periodData.totalCommission.toLocaleString()} FCFA`, icon: '📋', color: 'text-red-500' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-gray-700">{item.label}</span>
                        </div>
                        <span className={`font-semibold ${item.color || 'text-gray-900'}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Graphique en camembert */}
                {pieData.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      🥧 Répartition des revenus
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any) => `${value.toLocaleString()} FCFA`}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '12px',
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                      {pieData.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: entry.color }}
                          ></div>
                          <span className="text-sm text-gray-600">{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : selectedRange ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500">Aucune donnée pour cette période</p>
              </div>
            ) : null}
          </>
        )}

        {/* Vue tendances */}
        {viewMode === 'trends' && (
          <>
            {chartData.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  📈 Tendances mensuelles
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value: any) => [`${value.toLocaleString()} FCFA`, 'Revenus']}
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill="#3B82F6"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Liste détaillée des mois */}
            {monthlyData?.monthlyRevenue && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  📋 Détail mensuel
                </h3>
                <div className="space-y-3">
                  {Object.entries(monthlyData.monthlyRevenue).map(([month, revenue]) => (
                    <div key={month} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">📅</span>
                        <span className="font-medium text-gray-700">
                          {format(parseISO(`${month}-01`), "MMMM yyyy", { locale: fr })}
                        </span>
                      </div>
                      <span className="font-semibold text-blue-600">
                        {revenue.toLocaleString()} FCFA
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RevenueMobile;