'use client'

import { useState, useEffect } from 'react'
import { ArrowPathIcon, ArrowUpIcon, ArrowDownIcon, ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { MinusSmallIcon, PlusSmallIcon } from '@heroicons/react/24/outline'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// ✅ IMPORTS für ausgelagerte Komponenten
import { KInvestPortfolioTable } from '@/components/portfolio/PortfolioTable'
import { PerformanceBadge } from '@/components/portfolio/PerformanceBadge'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

interface PortfolioData {
  chart: Array<{
    date: string
    Portfolio: number
    'MSCI World'?: number
    'S&P 500'?: number
    'DAX'?: number
  }>
  summary: {
    total_value: number
    total_gain: number
    total_gain_pct: number
    cash_position: number
    total_invested?: number
  }
  positions?: Array<{
    ticker: string
    position_value: number
    position_size: number
  }>
  recentTransactions: Array<{
    date: string
    ticker: string
    transaction_type: string
    shares: number
  }>
  meta: {
    dataPoints: number
    dateRange: {
      start: string
      end: string
    }
    lastUpdate: string | null
  }
}

const valueFormatter = (number) =>
  `€${Intl.NumberFormat('de-DE').format(number).toString()}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {valueFormatter(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const StatusBadge = ({ status, className = "" }) => {
  const configs = {
    live: { bg: "bg-green-100", text: "text-green-800", label: "Live" },
    updated: { bg: "bg-blue-100", text: "text-blue-800", label: "Aktualisiert" },
    outperforming: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Übertrifft Markt" },
    underperforming: { bg: "bg-red-100", text: "text-red-800", label: "Unter Markt" },
    neutral: { bg: "bg-gray-100", text: "text-gray-800", label: "Neutral" }
  }
  
  const config = configs[status] || configs.neutral
  
  return (
    <span className={classNames(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      config.bg,
      config.text,
      className
    )}>
      {status === 'live' && <div className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse" />}
      {status === 'updated' && <ClockIcon className="w-3 h-3 mr-1" />}
      {status === 'outperforming' && <ChartBarIcon className="w-3 h-3 mr-1" />}
      {status === 'underperforming' && <ChartBarIcon className="w-3 h-3 mr-1" />}
      {config.label}
    </span>
  )
}

export default function Portfolio() {
  const [data, setData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [timeRange, setTimeRange] = useState(365) // Tage

  // Portfolio Daten laden
  const fetchPortfolioData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/portfolio/performance?days=${timeRange}&positions=true`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
        setError(null)
      } else {
        throw new Error(result.error || 'Failed to fetch data')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Portfolio Update triggern
  const triggerUpdate = async () => {
    try {
      setUpdating(true)
      const response = await fetch('/api/portfolio/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger_update' })
      })
      
      if (response.ok) {
        setTimeout(() => {
          fetchPortfolioData()
        }, 1000)
      }
    } catch (err) {
      console.error('Update error:', err)
    } finally {
      setUpdating(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchPortfolioData()
  }, [timeRange])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8 min-w-[320px]">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8 min-w-[320px]">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-red-800">Fehler beim Laden der Portfolio-Daten</h3>
          <p className="text-sm text-red-600 mt-1">{error}</p>
          <button
            onClick={fetchPortfolioData}
            className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8 min-w-[320px]">
        <div className="text-center text-gray-500">Keine Portfolio-Daten verfügbar</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8 min-w-[320px]">
      {/* Portfolio Header mit Badges */}
      <div className="flex justify-between items-start">
        <div className="min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-xs sm:text-sm text-gray-600 truncate">Portfolio Performance</h3>
            <StatusBadge status="live" />
            {data.meta.lastUpdate && (
              <StatusBadge status="updated" />
            )}
          </div>
          
          <p className="mt-1 text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 truncate">
            {valueFormatter(data.summary.total_value)}
          </p>
          
          <div className="flex items-center space-x-3 mt-2">
            <PerformanceBadge percentage={data.summary.total_gain_pct} />
            <span className="text-xs sm:text-sm text-gray-600 font-normal">
              {data.summary.total_gain_pct >= 0 ? '+' : ''}{valueFormatter(data.summary.total_gain)} Gesamt Performance
            </span>
          </div>
          
          {data.meta.lastUpdate && (
            <p className="text-xs text-gray-500 mt-2">
              Letztes Update: {new Date(data.meta.lastUpdate).toLocaleDateString('de-DE')}
            </p>
          )}
        </div>
        
        <div className="flex space-x-2">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="text-xs sm:text-sm border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={30}>30T</option>
            <option value={90}>3M</option>
            <option value={180}>6M</option>
            <option value={365}>1J</option>
            <option value={730}>2J</option>
          </select>
          
          {/* Refresh Button */}
          <button
            onClick={triggerUpdate}
            disabled={updating}
            className={classNames(
              "text-xs px-3 py-1 rounded border",
              updating 
                ? "bg-gray-100 text-gray-400 border-gray-200" 
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            )}
          >
            <ArrowPathIcon className={classNames(
              "w-3 h-3",
              updating ? "animate-spin" : ""
            )} />
          </button>
        </div>
      </div>

      {/* Portfolio Chart */}
      <div className="hidden sm:block min-w-0">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data.chart}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              className="text-gray-500 text-sm"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              className="text-gray-500 text-sm"
              tick={{ fontSize: 10 }}
              tickFormatter={valueFormatter}
              width={70}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="Portfolio"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={false}
              name="Portfolio"
            />
            <Line
              type="monotone"
              dataKey="MSCI World"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="MSCI World"
            />
            <Line
              type="monotone"
              dataKey="S&P 500"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
              name="S&P 500"
            />
            <Line
              type="monotone"
              dataKey="DAX"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              name="DAX"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Mobile Chart */}
      <div className="block sm:hidden min-w-0">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data.chart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
            <XAxis 
              dataKey="date" 
              tick={false}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              hide={false}
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => `${(value/1000).toFixed(0)}k`}
              width={35}
              axisLine={false}
              tickLine={false}
              className="text-gray-400"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="Portfolio"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="MSCI World"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="S&P 500"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="DAX"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Portfolio Positionen Tabelle */}
      <KInvestPortfolioTable />

      {/* Debug Info (nur in Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 text-xs text-gray-400 border-t border-gray-100 pt-4">
          <p>Debug: {data.meta.dataPoints} Datenpunkte | {data.meta.dateRange.start} bis {data.meta.dateRange.end}</p>
          <p>Transaktionen (30T): {data.recentTransactions.length}</p>
          <p>Portfolio Wert: {valueFormatter(data.summary.total_value)} | Gewinn: {valueFormatter(data.summary.total_gain)} ({data.summary.total_gain_pct.toFixed(1)}%)</p>
        </div>
      )}
    </div>
  );
}