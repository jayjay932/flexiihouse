'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { Range, RangeKeyDict } from "react-date-range";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Calendar as CalendarIcon, TrendingUp, DollarSign, BarChart3, CreditCard, Users, Clock, Award } from 'lucide-react';
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
      setPeriodData(response.data as RevenueData);
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
      setMonthlyData(response.data as RevenueData);
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

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
      icon: Users,
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-600',
      iconColor: 'text-blue-500'
    },
    {
      title: 'Nuits réservées',
      value: periodData?.totalNights || monthlyData?.totalNights || 0,
      icon: Clock,
      color: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-600',
      iconColor: 'text-purple-500'
    },
    {
      title: 'Revenus totaux',
      value: `${formatPrice(periodData?.totalToHost || monthlyData?.totalToHost || 0)} FCFA`,
      icon: DollarSign,
      color: 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200',
      textColor: 'text-rose-600',
      iconColor: 'text-rose-500'
    }
  ];

  const tabsConfig = [
    { key: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { key: 'period', label: 'Période', icon: CalendarIcon },
    { key: 'trends', label: 'Tendances', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-3 rounded-2xl shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tableau de bord
            </h1>
          </div>
          
          {/* Navigation tabs */}
          <div className="flex bg-gray-100 rounded-2xl p-1.5">
            {tabsConfig.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setViewMode(tab.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                  viewMode === tab.key
                    ? 'bg-white text-gray-900 shadow-md transform scale-[1.02]'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
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
                  className={`${card.color} rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-2">{card.title}</p>
                      <p className={`text-2xl font-bold ${card.textColor}`}>
                        {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl ${card.iconColor} bg-white/50`}>
                      <card.icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Graphique mensuel */}
            {chartData.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-2 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Évolution mensuelle
                  </h3>
                </div>
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
                        stroke="url(#gradient)" 
                        strokeWidth={3}
                        dot={{ fill: '#EC4899', strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: '#EC4899', strokeWidth: 2 }}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#F43F5E" />
                          <stop offset="100%" stopColor="#EC4899" />
                        </linearGradient>
                      </defs>
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
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-2 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Sélectionner une période
                </h3>
              </div>
              
              <Calendar
                value={selectedRange ?? { startDate: undefined, endDate: undefined, key: 'selection' }}
                onChange={handleCalendarChange}
                showPreview={false}
              />

              {selectedRange && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => {
                      setSelectedRange(null);
                      setPeriodData(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Réinitialiser
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gradient-to-r from-rose-500 to-pink-600"></div>
                  <span className="ml-3 text-gray-600">Chargement des données...</span>
                </div>
              </div>
            ) : periodData ? (
              <>
                {/* Statistiques de la période */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-2 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Résultats de la période
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'Réservations', value: periodData.totalReservations, icon: Users, color: 'text-blue-600' },
                      { label: 'Nuits réservées', value: periodData.totalNights, icon: Clock, color: 'text-purple-600' },
                      { label: 'Total payé par les clients', value: `${formatPrice(periodData.totalPaidByClients)} FCFA`, icon: CreditCard, color: 'text-gray-600' },
                      { label: 'Montant à recevoir', value: `${formatPrice(periodData.totalToHost)} FCFA`, icon: DollarSign, color: 'text-rose-600' },
                      { label: 'Commission Flexi', value: `${formatPrice(periodData.totalCommission)} FCFA`, icon: Award, color: 'text-orange-600' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-4 px-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${item.color} bg-white`}>
                            <item.icon className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-gray-700">{item.label}</span>
                        </div>
                        <span className={`font-bold ${item.color}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Graphique en camembert */}
                {pieData.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-2 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Répartition des revenus
                      </h3>
                    </div>
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
                          <span className="text-sm font-medium text-gray-600">{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : selectedRange ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500 font-medium">Aucune donnée pour cette période</p>
              </div>
            ) : null}
          </>
        )}

        {/* Vue tendances */}
        {viewMode === 'trends' && (
          <>
            {chartData.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-2 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Tendances mensuelles
                  </h3>
                </div>
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
                        fill="url(#barGradient)"
                        radius={[8, 8, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#F43F5E" />
                          <stop offset="100%" stopColor="#EC4899" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Liste détaillée des mois */}
            {monthlyData?.monthlyRevenue && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-2 rounded-lg">
                    <CalendarIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Détail mensuel
                  </h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(monthlyData.monthlyRevenue).map(([month, revenue]) => (
                    <div key={month} className="flex items-center justify-between py-4 px-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl hover:from-rose-100 hover:to-pink-100 transition-all duration-200 border border-rose-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg">
                          <CalendarIcon className="w-4 h-4 text-rose-500" />
                        </div>
                        <span className="font-medium text-gray-700">
                          {format(parseISO(`${month}-01`), "MMMM yyyy", { locale: fr })}
                        </span>
                      </div>
                      <span className="font-bold text-rose-600">
                        {formatPrice(revenue)} FCFA
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