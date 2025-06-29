//src/components/portfolio/PortfolioTable.tsx
import { useState, useMemo, Fragment } from 'react'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { 
  MinusSmallIcon, 
  PlusSmallIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  FunnelIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { PerformanceBadge } from './PerformanceBadge'
import { StatusBadge } from './StatusBadge'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const valueFormatter = (number: number): string =>
  `€${Intl.NumberFormat('de-DE').format(number).toString()}`

// Extended Position interface für die Komponente
interface ExtendedPosition {
  name: string
  ticker: string
  shares: number
  currentPrice: number
  value: number
  gain: number
  gainPct: number
  weight: number
  bgColor: string
  changeType: 'positive' | 'negative' | 'neutral'
  avgCost: number
  totalInvested: number
  sector: string
  market: string
  exchange: string
}

interface PortfolioData {
  totalValue: number
  totalInvested: number
  totalGain: number
  totalGainPct: number
  cashPosition: number
  positions: ExtendedPosition[]
}

type SortField = 'name' | 'value' | 'gainPct' | 'gain' | 'weight' | 'shares'
type SortDirection = 'asc' | 'desc'

export const KInvestPortfolioTable = () => {
  const [sortField, setSortField] = useState<SortField>('weight')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [filterSector, setFilterSector] = useState<string>('all')
  const [filterPerformance, setFilterPerformance] = useState<string>('all')
  const [showCash, setShowCash] = useState<boolean>(true)

  // Echte Portfolio Daten basierend auf Ihren Positionen
  const portfolioData: PortfolioData = useMemo(() => {
    const positions: ExtendedPosition[] = [
      {
        name: "NVIDIA Corporation",
        ticker: "NVDA",
        shares: 37,
        currentPrice: 348.10,
        value: 12879.70,
        gain: 3679.70,
        gainPct: 39.9,
        weight: 27.9,
        bgColor: "bg-green-500",
        changeType: "positive",
        avgCost: 248.65,
        totalInvested: 9200.00,
        sector: "Technologie",
        market: "US",
        exchange: "NASDAQ"
      },
      {
        name: "Meta Platforms, Inc.",
        ticker: "META",
        shares: 7,
        currentPrice: 563.33,
        value: 3943.31,
        gainPct: 55.6,
        gain: 1413.31,
        weight: 8.5,
        bgColor: "bg-blue-500",
        changeType: "positive",
        avgCost: 361.43,
        totalInvested: 2530.00,
        sector: "Technologie",
        market: "US",
        exchange: "NASDAQ"
      },
      {
        name: "Reddit, Inc.",
        ticker: "RDDT",
        shares: 44,
        currentPrice: 181.20,
        value: 7972.80,
        gainPct: 193.8,
        gain: 5259.80,
        weight: 17.3,
        bgColor: "bg-orange-500",
        changeType: "positive",
        avgCost: 61.66,
        totalInvested: 2713.00,
        sector: "Kommunikation",
        market: "US",
        exchange: "NYSE"
      },
      {
        name: "Super Micro Computer, Inc.",
        ticker: "SMCI",
        shares: 12,
        currentPrice: 22.85,
        value: 274.20,
        gainPct: -77.8,
        gain: -961.80,
        weight: 0.6,
        bgColor: "bg-red-500",
        changeType: "negative",
        avgCost: 103.00,
        totalInvested: 1236.00,
        sector: "Technologie",
        market: "US",
        exchange: "NASDAQ"
      },
      {
        name: "Hims & Hers Health, Inc.",
        ticker: "HIMS",
        shares: 125,
        currentPrice: 17.45,
        value: 2181.25,
        gainPct: 8.9,
        gain: 178.25,
        weight: 4.7,
        bgColor: "bg-emerald-500",
        changeType: "positive",
        avgCost: 16.02,
        totalInvested: 2003.00,
        sector: "Gesundheitswesen",
        market: "US",
        exchange: "NYSE"
      },
      {
        name: "InterDigital, Inc.",
        ticker: "IDCC",
        shares: 18,
        currentPrice: 114.25,
        value: 2056.50,
        gainPct: 14.3,
        gain: 256.50,
        weight: 4.5,
        bgColor: "bg-purple-500",
        changeType: "positive",
        avgCost: 100.00,
        totalInvested: 1800.00,
        sector: "Technologie",
        market: "US",
        exchange: "NASDAQ"
      },
      {
        name: "Grindr Inc.",
        ticker: "GRND",
        shares: 85,
        currentPrice: 14.20,
        value: 1207.00,
        gainPct: -28.5,
        gain: -481.00,
        weight: 2.6,
        bgColor: "bg-pink-500",
        changeType: "negative",
        avgCost: 19.86,
        totalInvested: 1688.00,
        sector: "Technologie",
        market: "US",
        exchange: "NYSE"
      },
      {
        name: "TKO Group Holdings, Inc.",
        ticker: "TKO",
        shares: 35,
        currentPrice: 125.80,
        value: 4403.00,
        gainPct: 22.1,
        gain: 798.00,
        weight: 9.5,
        bgColor: "bg-yellow-500",
        changeType: "positive",
        avgCost: 103.00,
        totalInvested: 3605.00,
        sector: "Unterhaltung",
        market: "US",
        exchange: "NYSE"
      },
      {
        name: "Geely Automobile Holdings Limited",
        ticker: "0175.HK",
        shares: 800,
        currentPrice: 1.85,
        value: 1480.00,
        gainPct: -7.5,
        gain: -120.00,
        weight: 3.2,
        bgColor: "bg-indigo-500",
        changeType: "negative",
        avgCost: 2.00,
        totalInvested: 1600.00,
        sector: "Automobil",
        market: "HK",
        exchange: "HKEX"
      },
      {
        name: "Kingsoft Corporation Limited",
        ticker: "3888.HK",
        shares: 200,
        currentPrice: 4.12,
        value: 824.00,
        gainPct: -17.6,
        gain: -176.00,
        weight: 1.8,
        bgColor: "bg-cyan-500",
        changeType: "negative",
        avgCost: 5.00,
        totalInvested: 1000.00,
        sector: "Software",
        market: "HK",
        exchange: "HKEX"
      }
    ]

    const totalPositionsValue = positions.reduce((sum, pos) => sum + pos.value, 0)
    const totalInvested = positions.reduce((sum, pos) => sum + pos.totalInvested, 0)
    const cashPosition = 9000.00 // €9,000 Cash
    const totalValue = totalPositionsValue + cashPosition

    // Recalculate weights including cash
    const updatedPositions = positions.map(pos => ({
      ...pos,
      weight: (pos.value / totalValue) * 100
    }))

    return {
      totalValue,
      totalInvested,
      totalGain: totalPositionsValue - totalInvested,
      totalGainPct: ((totalPositionsValue - totalInvested) / totalInvested) * 100,
      cashPosition,
      positions: updatedPositions
    }
  }, [])

  // Sortierung
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Filterung
  const filteredPositions = portfolioData.positions.filter(position => {
    const sectorMatch = filterSector === 'all' || position.sector === filterSector
    const performanceMatch = filterPerformance === 'all' || 
      (filterPerformance === 'positive' && position.gainPct > 0) ||
      (filterPerformance === 'negative' && position.gainPct < 0)
    return sectorMatch && performanceMatch
  })

  // Sortierung anwenden
  const sortedPositions = [...filteredPositions].sort((a, b) => {
    let aValue: number, bValue: number
    
    switch (sortField) {
      case 'name':
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      case 'value':
        aValue = a.value
        bValue = b.value
        break
      case 'gainPct':
        aValue = a.gainPct
        bValue = b.gainPct
        break
      case 'gain':
        aValue = a.gain
        bValue = b.gain
        break
      case 'weight':
        aValue = a.weight
        bValue = b.weight
        break
      case 'shares':
        aValue = a.shares
        bValue = b.shares
        break
      default:
        return 0
    }
    
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
  })

  // Unique Sektoren für Filter
  const sectors = Array.from(new Set(portfolioData.positions.map(p => p.sector)))

  const SortButton = ({ field, children }: { field: SortField, children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left text-xs sm:text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors"
    >
      <span>{children}</span>
      {sortField === field && (
        sortDirection === 'asc' ? 
          <ArrowUpIcon className="w-3 h-3" /> : 
          <ArrowDownIcon className="w-3 h-3" />
      )}
    </button>
  )

  // Cash Position als separate Row (wenn eingeschaltet)
  const cashRow = showCash ? [{
    name: "Cash Position",
    ticker: "CASH",
    shares: 1,
    currentPrice: 1.00,
    value: portfolioData.cashPosition,
    gain: 0,
    gainPct: 0,
    weight: (portfolioData.cashPosition / portfolioData.totalValue) * 100,
    bgColor: "bg-gray-400",
    changeType: "neutral" as const,
    avgCost: 1.00,
    totalInvested: portfolioData.cashPosition,
    sector: "Liquidität",
    market: "EUR",
    exchange: "CASH"
  }] : []

  const allDisplayItems = [...sortedPositions, ...cashRow]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Portfolio Positionen</h3>
            <p className="text-sm text-gray-500 mt-1">
              {sortedPositions.length} Positionen
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <StatusBadge status="live" />
            <span className="text-xs text-gray-500">
              {new Date().toLocaleString('de-DE')}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-700">Filter:</span>
          </div>
          
          <select
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
            className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white"
          >
            <option value="all">Alle Sektoren ({portfolioData.positions.length})</option>
            {sectors.map(sector => {
              const count = portfolioData.positions.filter(p => p.sector === sector).length
              return (
                <option key={sector} value={sector}>{sector} ({count})</option>
              )
            })}
          </select>
          
          <select
            value={filterPerformance}
            onChange={(e) => setFilterPerformance(e.target.value)}
            className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white"
          >
            <option value="all">Alle Performance</option>
            <option value="positive">Nur Gewinne ({portfolioData.positions.filter(p => p.gainPct > 0).length})</option>
            <option value="negative">Nur Verluste ({portfolioData.positions.filter(p => p.gainPct < 0).length})</option>
          </select>
        </div>
      </div>

      {/* Mobile View - Aktien-Positionen */}
      <div className="sm:hidden">
        <div className="divide-y divide-gray-200 border-b border-gray-200">
          {sortedPositions.map((position) => (
            <Disclosure key={position.ticker} as="div">
              <DisclosureButton className="w-full px-4 py-4 text-left hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className={classNames(position.bgColor, 'w-1 h-8 rounded flex-shrink-0')} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {position.name}
                          </p>
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {position.sector}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm font-semibold text-gray-900">
                            {valueFormatter(position.value)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {position.weight.toFixed(1)}% Portfolio
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center">
                    <PlusSmallIcon className="w-5 h-5 text-gray-400 group-data-[open]:hidden" />
                    <MinusSmallIcon className="w-5 h-5 text-gray-400 group-data-[open]:block hidden" />
                  </div>
                </div>
              </DisclosureButton>
              
              <DisclosurePanel className="px-4 pb-4 bg-gray-50">
                <div className="space-y-3">
                  {/* Wert & Gewinn Übersicht */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-medium text-gray-500">Berechnung</div>
                      <div className="flex items-center space-x-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {position.shares.toLocaleString('de-DE')}
                        </span>
                        <span className="text-xs text-gray-500">× {valueFormatter(position.currentPrice)}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500">Performance</div>
                      <div>
                        <PerformanceBadge percentage={position.gainPct} />
                      </div>
                    </div>
                  </div>

                  {/* Gewinn */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <div className="text-xs font-medium text-gray-500">Gewinn</div>
                      <div className="space-y-1">
                        <div className={classNames(
                          position.gain >= 0 ? 'text-emerald-700' : 'text-red-700',
                          'text-sm font-semibold'
                        )}>
                          {valueFormatter(position.gain)}
                        </div>
                        <div>
                          <span className={classNames(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                            position.gainPct >= 0 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-red-100 text-red-800'
                          )}>
                            {position.gainPct >= 0 ? '+' : ''}{position.gainPct.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Weitere Details */}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-xs font-medium text-gray-500">Ticker</div>
                        <div className="font-medium text-gray-900">{position.ticker}</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500">Aktueller Preis</div>
                        <div className="font-medium text-gray-900">{valueFormatter(position.currentPrice)}</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500">Ø Einstandskurs</div>
                        <div className="font-medium text-gray-900">{valueFormatter(position.avgCost)}</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500">Investiert</div>
                        <div className="font-medium text-gray-900">{valueFormatter(position.totalInvested)}</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500">Börse</div>
                        <div className="font-medium text-gray-900">{position.exchange}</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500">Markt</div>
                        <div className="font-medium text-gray-900">{position.market}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </DisclosurePanel>
            </Disclosure>
          ))}
        </div>

        {/* Mobile Cash Position - Subtile Trennung */}
        {showCash && (
          <div className="bg-gray-50 border-t border-gray-200">
            <div className="px-4 py-4">
              <div className="flex items-center space-x-3">
                <span className="w-1 h-8 bg-gray-400 rounded flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Cash Position</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                        Liquidität
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {valueFormatter(portfolioData.cashPosition)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {((portfolioData.cashPosition / portfolioData.totalValue) * 100).toFixed(1)}% Portfolio
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Portfolio Summary */}
        <div className="bg-blue-50 px-4 py-4">
          <div className="text-center mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Portfolio Zusammenfassung</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-xs font-medium text-gray-500">Positionen</div>
              <div className="text-lg font-semibold text-gray-900">{sortedPositions.length}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500">Investiert</div>
              <div className="text-lg font-semibold text-gray-900">
                {valueFormatter(portfolioData.totalInvested)}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500">Aktueller Wert</div>
              <div className="text-lg font-semibold text-gray-900">
                {valueFormatter(portfolioData.totalValue)}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500">Performance</div>
              <div className="flex justify-center">
                <PerformanceBadge percentage={portfolioData.totalGainPct} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop View - Ein einziges Table mit festen Spalten */}
      <div className="hidden sm:block">
        <div className="overflow-hidden">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-2/5 px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
                  <div className="flex items-center">
                    <SortButton field="name">Unternehmen</SortButton>
                  </div>
                </th>
                <th className="w-1/6 px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wide">
                  <div className="flex justify-end">
                    <SortButton field="weight">Gewichtung</SortButton>
                  </div>
                </th>
                <th className="w-1/6 px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wide">
                  <div className="flex justify-end">
                    <SortButton field="value">Wert</SortButton>
                  </div>
                </th>
                <th className="w-1/5 px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wide">
                  <div className="flex justify-end">
                    <SortButton field="gain">Gewinn</SortButton>
                  </div>
                </th>
                <th className="w-16 px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wide">
                  <div className="flex justify-end">
                    Details
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Aktien-Positionen */}
              {sortedPositions.map((position) => (
                <Disclosure key={position.ticker}>
                  {({ open }) => (
                    <>
                      <DisclosureButton as="tr" className="hover:bg-gray-50 transition-colors w-full">
                        <td className="w-2/5 px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <span className={classNames(position.bgColor, 'w-1 h-8 rounded flex-shrink-0')} />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {position.name}
                              </div>
                              <div className="mt-1">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {position.sector}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="w-1/6 px-4 py-4 text-right">
                          <span className="text-sm font-semibold text-gray-900">
                            {position.weight.toFixed(1)}%
                          </span>
                        </td>
                        <td className="w-1/6 px-4 py-4 text-right">
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-gray-900">
                              {valueFormatter(position.value)}
                            </div>
                            <div className="flex items-center justify-end space-x-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {position.shares.toLocaleString('de-DE')}
                              </span>
                              <span className="text-xs text-gray-500">× {valueFormatter(position.currentPrice)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="w-1/5 px-4 py-4 text-right">
                          <div className="space-y-1">
                            <div className={classNames(
                              position.gain >= 0 ? 'text-emerald-700' : 'text-red-700',
                              'text-sm font-medium'
                            )}>
                              {valueFormatter(position.gain)}
                            </div>
                            <div>
                              <span className={classNames(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                position.gainPct >= 0 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : 'bg-red-100 text-red-800'
                              )}>
                                {position.gainPct >= 0 ? '+' : ''}{position.gainPct.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="w-16 px-6 py-4 text-right">
                          <div className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                            <span className="sr-only">Details anzeigen</span>
                            <PlusSmallIcon aria-hidden="true" className={classNames("w-5 h-5", open ? "hidden" : "block")} />
                            <MinusSmallIcon aria-hidden="true" className={classNames("w-5 h-5", open ? "block" : "hidden")} />
                          </div>
                        </td>
                      </DisclosureButton>
                      {open && (
                        <tr>
                          <td colSpan={5} className="px-0 py-0">
                            <DisclosurePanel static className="bg-gray-50 border-t border-gray-200">
                              <div className="px-6 py-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                                  <div>
                                    <div className="text-xs font-medium text-gray-500 mb-1">Ticker Symbol</div>
                                    <div className="font-medium text-gray-900">{position.ticker}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs font-medium text-gray-500 mb-1">Performance</div>
                                    <div className="font-medium text-gray-900">
                                      <PerformanceBadge percentage={position.gainPct} />
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs font-medium text-gray-500 mb-1">Ø Einstandskurs</div>
                                    <div className="font-medium text-gray-900">{valueFormatter(position.avgCost)}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs font-medium text-gray-500 mb-1">Investiert</div>
                                    <div className="font-medium text-gray-900">{valueFormatter(position.totalInvested)}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs font-medium text-gray-500 mb-1">Börse</div>
                                    <div className="font-medium text-gray-900">{position.exchange}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs font-medium text-gray-500 mb-1">Markt</div>
                                    <div className="font-medium text-gray-900">{position.market}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs font-medium text-gray-500 mb-1">Gewinn/Verlust absolut</div>
                                    <div className={classNames(
                                      position.gain >= 0 ? 'text-emerald-700' : 'text-red-700',
                                      'font-medium'
                                    )}>
                                      {valueFormatter(position.gain)}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs font-medium text-gray-500 mb-1">Performance %</div>
                                    <div className={classNames(
                                      position.gainPct >= 0 ? 'text-emerald-700' : 'text-red-700',
                                      'font-medium'
                                    )}>
                                      {position.gainPct >= 0 ? '+' : ''}{position.gainPct.toFixed(2)}%
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </DisclosurePanel>
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </Disclosure>
              ))}

              {/* Cash Position - Subtile Trennung */}
              {showCash && (
                <tr className="bg-gray-50">
                  <td className="w-2/5 px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <span className="w-1 h-8 bg-gray-400 rounded flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900">Cash Position</div>
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Liquidität
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="w-1/6 px-4 py-4 text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {((portfolioData.cashPosition / portfolioData.totalValue) * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="w-1/6 px-4 py-4 text-right">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-gray-900">
                        {valueFormatter(portfolioData.cashPosition)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Verfügbar
                      </div>
                    </div>
                  </td>
                  <td className="w-1/5 px-4 py-4 text-right">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-700">€0.00</div>
                      <div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          0.0%
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="w-16 px-6 py-4 text-right">
                    {/* Leer - kein "-" mehr */}
                  </td>
                </tr>
              )}

              {/* Portfolio Summary - Integriert in die Tabelle */}
              <tr className="bg-blue-50 border-t border-blue-200">
                <td className="w-2/5 px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900">Zusammenfassung</div>
                  <div className="text-xs text-gray-500 mt-1">{sortedPositions.length} Positionen</div>
                </td>
                <td className="w-1/6 px-4 py-4 text-right">
                  <div className="text-xs font-medium text-gray-500">Aktien</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {(((portfolioData.totalValue - portfolioData.cashPosition) / portfolioData.totalValue) * 100).toFixed(1)}%
                  </div>
                </td>
                <td className="w-1/6 px-4 py-4 text-right">
                  <div className="text-xs font-medium text-gray-500">Gesamtwert</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {valueFormatter(portfolioData.totalValue)}
                  </div>
                </td>
                <td className="w-1/5 px-4 py-4 text-right">
                  <div className="space-y-1">
                    <div className={classNames(
                      portfolioData.totalGain >= 0 ? 'text-emerald-700' : 'text-red-700',
                      'text-sm font-medium'
                    )}>
                      {valueFormatter(portfolioData.totalGain)}
                    </div>
                    <div>
                      <span className={classNames(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                        portfolioData.totalGainPct >= 0 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-red-100 text-red-800'
                      )}>
                        {portfolioData.totalGainPct >= 0 ? '+' : ''}{portfolioData.totalGainPct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </td>
                <td className="w-16 px-6 py-4 text-right">
                  {/* Leer */}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {sortedPositions.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-12 text-center">
            <div className="text-gray-500 mb-2">
              Keine Positionen entsprechen den Filterkriterien
            </div>
            <button
              onClick={() => {
                setFilterSector('all')
                setFilterPerformance('all')
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Filter zurücksetzen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}