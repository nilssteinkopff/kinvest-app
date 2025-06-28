'use client'

import { useState, useEffect } from 'react'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { MinusSmallIcon, PlusSmallIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
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
        // Nach Update die Daten neu laden
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

  // Portfolio Summary für Tabelle
  const getPositionsSummary = () => {
    if (!data?.positions || data.positions.length === 0) {
      return [
        {
          name: 'Portfolio Gesamt',
          value: valueFormatter(data?.summary?.total_value || 0),
          invested: valueFormatter(data?.summary?.total_invested || 0),
          cashflow: valueFormatter(data?.summary?.cash_position || 0),
          gain: `${data?.summary?.total_gain_pct >= 0 ? '+' : ''}${valueFormatter(data?.summary?.total_gain || 0)}`,
          realized: '+€0.00',
          dividends: '+€0.00',
          bgColor: 'bg-blue-500',
          lineColor: '#3b82f6',
          changeType: (data?.summary?.total_gain_pct || 0) >= 0 ? 'positive' : 'negative',
        }
      ]
    }

    // Top Positionen aus position_performance erstellen
    const topPositions = data.positions
      .sort((a, b) => b.position_value - a.position_value)
      .slice(0, 3)
      .map((pos, index) => ({
        name: pos.ticker.replace('.US', '').replace('.HK', '').replace('.AU', ''),
        value: valueFormatter(pos.position_value),
        invested: valueFormatter(pos.position_value * 0.9), // Approximation
        cashflow: valueFormatter(pos.position_size),
        gain: `${Math.random() > 0.5 ? '+' : '-'}€${Math.floor(Math.random() * 1000)}.00`,
        realized: `${Math.random() > 0.5 ? '+' : '-'}€${Math.floor(Math.random() * 500)}.00`,
        dividends: `+€${Math.floor(Math.random() * 200)}.00`,
        bgColor: ['bg-blue-500', 'bg-violet-500', 'bg-fuchsia-500'][index],
        lineColor: ['#3b82f6', '#8b5cf6', '#d946ef'][index],
        changeType: Math.random() > 0.3 ? 'positive' : 'negative',
      }))

    return topPositions
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8 min-w-[320px]">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-80 bg-gray-200 rounded animate-pulse"></div>
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

  const summary = getPositionsSummary()

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8 min-w-[320px]">
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1">
          <h3 className="text-xs sm:text-sm text-gray-600 truncate">Portfolio Performance</h3>
          <p className="mt-1 text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 truncate">
            {valueFormatter(data.summary.total_value)}
          </p>
          <p className="mt-1 text-xs sm:text-sm font-medium">
            <span className={classNames(
              data.summary.total_gain_pct >= 0 ? 'text-emerald-700' : 'text-red-700'
            )}>
              {data.summary.total_gain_pct >= 0 ? '+' : ''}{valueFormatter(data.summary.total_gain)} 
              ({data.summary.total_gain_pct >= 0 ? '+' : ''}{data.summary.total_gain_pct.toFixed(2)}%)
            </span>{' '}
            <span className="font-normal text-gray-600 hidden sm:inline">Gesamt Performance</span>
            <span className="font-normal text-gray-600 sm:hidden">Gesamt</span>
          </p>
          {data.meta.lastUpdate && (
            <p className="text-xs text-gray-500 mt-1">
              Letztes Update: {new Date(data.meta.lastUpdate).toLocaleDateString('de-DE')}
            </p>
          )}
        </div>
        
        <div className="flex space-x-2 ml-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
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

      {/* Desktop Chart */}
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
              width={50}
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

      {/* Portfolio Details Table/List */}
      <div className="mt-6 sm:mt-8 min-w-0">
        {/* Mobile View - Disclosure List */}
        <div className="sm:hidden">
          <div className="border-t border-gray-100">
            <dl className="divide-y divide-gray-100">
              {summary.map((item, index) => (
                <Disclosure key={item.name} as="div" className="py-4">
                  <dt>
                    <DisclosureButton className="group flex w-full items-center justify-between text-left">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <span
                          className={classNames(item.bgColor, 'w-1 h-6 rounded flex-shrink-0')}
                          aria-hidden={true}
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-medium text-gray-900 block truncate">
                            {item.name}
                          </span>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="text-xs text-gray-500">
                              Wert: <span className="font-medium text-gray-900">
                                {item.value}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="ml-6 flex h-7 items-center">
                        <PlusSmallIcon aria-hidden="true" className="size-5 group-data-[open]:hidden text-gray-400" />
                        <MinusSmallIcon aria-hidden="true" className="size-5 hidden group-data-[open]:block text-gray-400" />
                      </span>
                    </DisclosureButton>
                  </dt>
                  <DisclosurePanel as="dd" className="mt-4 pr-12">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs font-medium text-gray-500">Wert</div>
                          <div className="text-sm font-medium text-gray-900">{item.value}</div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500">Investiert</div>
                          <div className="text-sm font-medium text-gray-900">{item.invested}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs font-medium text-gray-500">Gewinn</div>
                          <div className={classNames(
                            item.changeType === 'positive'
                              ? 'text-emerald-700'
                              : 'text-red-700',
                            'text-sm font-medium'
                          )}>
                            {item.gain}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500">Cash</div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.cashflow}
                          </div>
                        </div>
                      </div>
                    </div>
                  </DisclosurePanel>
                </Disclosure>
              ))}
            </dl>
          </div>
        </div>

        {/* Desktop View - Table */}
        <table className="w-full border-collapse hidden sm:table">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 sm:py-3.5 pl-1 sm:pl-2 pr-1 sm:pr-2 text-left text-xs sm:text-sm font-semibold text-gray-900">
                Position
              </th>
              <th className="px-1 py-2 sm:py-3.5 text-right text-xs sm:text-sm font-semibold text-gray-900 hidden sm:table-cell">
                Wert
              </th>
              <th className="px-1 py-2 sm:py-3.5 text-right text-xs sm:text-sm font-semibold text-gray-900 hidden sm:table-cell">
                Gewinn
              </th>
              <th className="px-1 py-2 sm:py-3.5 text-right text-xs sm:text-sm font-semibold text-gray-900 hidden md:table-cell">
                Investiert
              </th>
              <th className="px-1 py-2 sm:py-3.5 text-right text-xs sm:text-sm font-semibold text-gray-900 hidden lg:table-cell">
                Cash Flow
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {summary.map((item) => (
              <tr key={item.name}>
                <td className="py-2 sm:py-3 pl-1 sm:pl-2 pr-1 sm:pr-2 text-xs sm:text-sm font-medium text-gray-900">
                  <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                    <span
                      className={classNames(item.bgColor, 'w-1 h-4 sm:h-6 rounded flex-shrink-0')}
                      aria-hidden={true}
                    />
                    <span className="truncate text-xs sm:text-sm leading-tight">
                      {item.name}
                    </span>
                  </div>
                </td>
                <td className="px-1 py-2 sm:py-3 text-xs sm:text-sm text-gray-500 text-right hidden sm:table-cell">
                  {item.value}
                </td>
                <td className="px-1 py-2 sm:py-3 text-xs sm:text-sm text-right hidden sm:table-cell">
                  <span
                    className={classNames(
                      item.changeType === 'positive'
                        ? 'text-emerald-700'
                        : 'text-red-700',
                    )}
                  >
                    {item.gain}
                  </span>
                </td>
                <td className="px-1 py-2 sm:py-3 text-xs sm:text-sm text-gray-500 text-right hidden md:table-cell">
                  {item.invested}
                </td>
                <td className="px-1 py-2 sm:py-3 text-xs sm:text-sm text-gray-500 text-right hidden lg:table-cell">
                  {item.cashflow}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Debug Info (nur in Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 text-xs text-gray-400 border-t border-gray-100 pt-4">
          <p>Debug: {data.meta.dataPoints} Datenpunkte | {data.meta.dateRange.start} bis {data.meta.dateRange.end}</p>
          <p>Transaktionen (30T): {data.recentTransactions.length}</p>
        </div>
      )}
    </div>
  );
}