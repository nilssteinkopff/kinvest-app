'use client'

import { PaperClipIcon, PlusCircleIcon, MinusCircleIcon, CurrencyEuroIcon } from '@heroicons/react/20/solid'
import { PlusSmallIcon, MinusSmallIcon } from '@heroicons/react/24/outline'
import { useState, Fragment } from 'react'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'

export default function Example() {
  const [copied, setCopied] = useState(false)
  
  const copyIsin = async () => {
    try {
      await navigator.clipboard.writeText('US0378331005')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy ISIN:', err)
    }
  }

  const transactions = [
    {
      id: 6,
      type: 'sell',
      shares: 50,
      price: 227.52,
      total: 11376,
      profit: 4671.50,
      profitPercent: 69.6,
      date: '12. Januar 2025',
      description: 'Gewinnmitnahme bei Allzeithoch'
    },
    {
      id: 5,
      type: 'buy',
      shares: 75,
      price: 134.18,
      total: 10063.50,
      date: '28. Oktober 2022',
      description: 'Nachkauf im Tief'
    },
    {
      id: 4,
      type: 'sell',
      shares: 25,
      price: 145.09,
      total: 3627.25,
      profit: -1098.75,
      profitPercent: -23.2,
      date: '3. März 2022',
      description: 'Teilverkauf während Korrektur'
    },
    {
      id: 3,
      type: 'dividend',
      amount: 168.75,
      yield: 0.82,
      date: '15. Februar 2021',
      description: 'Quartalsdividende Q4 2020'
    },
    {
      id: 2,
      type: 'buy',
      shares: 50,
      price: 195.80,
      total: 9790,
      date: '22. Juni 2019',
      description: 'Aufstockung nach Q1 Earnings'
    },
    {
      id: 1,
      type: 'buy',
      shares: 100,
      price: 189.25,
      total: 18925,
      date: '15. März 2019',
      description: 'Erstinvestition'
    }
  ]

  const chartData = [
    { date: 'Jan 01', 'Apple (AAPL)': 189.25, 'Microsoft (MSFT)': 158.62, 'Google (GOOGL)': 1520.74 },
    { date: 'Jan 15', 'Apple (AAPL)': 195.80, 'Microsoft (MSFT)': 165.22, 'Google (GOOGL)': 1587.55 },
    { date: 'Feb 01', 'Apple (AAPL)': 201.45, 'Microsoft (MSFT)': 171.78, 'Google (GOOGL)': 1623.12 },
    { date: 'Feb 15', 'Apple (AAPL)': 198.73, 'Microsoft (MSFT)': 168.45, 'Google (GOOGL)': 1595.88 },
    { date: 'Mar 01', 'Apple (AAPL)': 205.12, 'Microsoft (MSFT)': 175.33, 'Google (GOOGL)': 1654.23 },
    { date: 'Mar 15', 'Apple (AAPL)': 189.25, 'Microsoft (MSFT)': 162.14, 'Google (GOOGL)': 1534.67 },
    { date: 'Apr 01', 'Apple (AAPL)': 183.67, 'Microsoft (MSFT)': 157.89, 'Google (GOOGL)': 1489.23 },
    { date: 'Apr 15', 'Apple (AAPL)': 178.45, 'Microsoft (MSFT)': 154.22, 'Google (GOOGL)': 1456.78 },
    { date: 'Mai 01', 'Apple (AAPL)': 172.88, 'Microsoft (MSFT)': 149.67, 'Google (GOOGL)': 1423.45 },
    { date: 'Mai 15', 'Apple (AAPL)': 145.09, 'Microsoft (MSFT)': 125.44, 'Google (GOOGL)': 1198.76 },
    { date: 'Jun 01', 'Apple (AAPL)': 134.18, 'Microsoft (MSFT)': 116.23, 'Google (GOOGL)': 1134.56 },
    { date: 'Jun 15', 'Apple (AAPL)': 142.67, 'Microsoft (MSFT)': 123.78, 'Google (GOOGL)': 1176.89 },
    { date: 'Jul 01', 'Apple (AAPL)': 156.89, 'Microsoft (MSFT)': 136.45, 'Google (GOOGL)': 1289.34 },
    { date: 'Jul 15', 'Apple (AAPL)': 168.34, 'Microsoft (MSFT)': 146.78, 'Google (GOOGL)': 1345.67 },
    { date: 'Aug 01', 'Apple (AAPL)': 179.23, 'Microsoft (MSFT)': 156.89, 'Google (GOOGL)': 1398.45 },
    { date: 'Aug 15', 'Apple (AAPL)': 187.45, 'Microsoft (MSFT)': 164.33, 'Google (GOOGL)': 1434.78 },
    { date: 'Sep 01', 'Apple (AAPL)': 195.67, 'Microsoft (MSFT)': 171.45, 'Google (GOOGL)': 1478.23 },
    { date: 'Sep 15', 'Apple (AAPL)': 203.89, 'Microsoft (MSFT)': 178.67, 'Google (GOOGL)': 1512.45 },
    { date: 'Okt 01', 'Apple (AAPL)': 212.34, 'Microsoft (MSFT)': 186.23, 'Google (GOOGL)': 1567.89 },
    { date: 'Okt 15', 'Apple (AAPL)': 219.67, 'Microsoft (MSFT)': 192.45, 'Google (GOOGL)': 1598.34 },
    { date: 'Nov 01', 'Apple (AAPL)': 226.89, 'Microsoft (MSFT)': 198.78, 'Google (GOOGL)': 1634.56 },
    { date: 'Nov 15', 'Apple (AAPL)': 232.45, 'Microsoft (MSFT)': 203.67, 'Google (GOOGL)': 1656.78 },
    { date: 'Dez 01', 'Apple (AAPL)': 227.52, 'Microsoft (MSFT)': 199.34, 'Google (GOOGL)': 1623.45 },
    { date: 'Dez 15', 'Apple (AAPL)': 234.50, 'Microsoft (MSFT)': 205.89, 'Google (GOOGL)': 1678.90 }
  ]

  const summary = [
    {
      name: 'Apple (AAPL)',
      value: '$234.50',
      change: '+1.2%',
      color: '#3B82F6'
    },
    {
      name: 'Microsoft (MSFT)', 
      value: '$205.89',
      change: '+0.8%',
      color: '#8B5CF6'
    },
    {
      name: 'Google (GOOGL)',
      value: '$1,678.90',
      change: '+3.5%',
      color: '#EC4899'
    }
  ]

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }
  
  return (
    <div>
      <div className="px-4 sm:px-0">
        <div className="flex items-center gap-4">
          {/* Square Logo */}
          <img 
            src="https://img.logo.dev/apple.com?token=pk_Hhqjv42mT8CGbu6WJADM8w" 
            alt="Apple Logo" 
            className="w-16 h-16 rounded-lg shadow-md flex-shrink-0 object-contain bg-white p-2"
          />
          
          {/* Header Text */}
          <div className="flex-1">
            <h3 className="text-base/7 font-semibold text-gray-900">Unternehmensübersicht</h3>
            <p className="mt-1 max-w-2xl text-sm/6 text-gray-500">Portfolio-Position und Kennzahlen.</p>
          </div>
        </div>
      </div>
      <div className="mt-6 border-t border-gray-100">
        <dl className="divide-y divide-gray-100">
          <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">Unternehmen</dt>
            <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              <div className="flex items-center gap-3">
                <span>Apple Inc. (AAPL)</span>
                <button 
                  onClick={copyIsin}
                  className={`group flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors duration-200 ${
                    copied 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
                  }`}
                  title={copied ? "ISIN kopiert!" : "ISIN kopieren"}
                >
                  <span className="font-mono">US0378331005</span>
                  {copied ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </dd>
          </div>
          <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">Branche</dt>
            <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">Technologie - Unterhaltungselektronik</dd>
          </div>
          <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">Aktueller Kurs</dt>
            <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">$234,50 (+1,2%)</dd>
          </div>
          <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">Portfolio-Gewichtung</dt>
            <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">8,5% (€425.000)</dd>
          </div>
          <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">Einstiegspreis</dt>
            <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">$189,25 (März 2019)</dd>
          </div>
          <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">Performance</dt>
            <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">YTD: +12,3% | 1 Jahr: +28,7% | Gesamt: +123,9%</dd>
          </div>
          <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">Kennzahlen</dt>
            <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">KGV: 28,4 | Dividendenrendite: 0,44% | Marktkapitalisierung: $3,6 Billionen</dd>
          </div>
          <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">Beschreibung</dt>
            <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              Apple ist ein multinationaler Technologiekonzern mit Fokus auf Unterhaltungselektronik, Software und Online-Services. Das Unternehmen ist bekannt für innovative Produkte wie iPhone, iPad, Mac, Apple Watch sowie Services wie App Store, Apple Music und iCloud. Apple gehört konstant zu den wertvollsten Unternehmen weltweit und zeichnet sich durch Premium-Design und herausragende Nutzererfahrung aus.
            </dd>
          </div>
          <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">Dokumente</dt>
            <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <ul role="list" className="divide-y divide-gray-100 rounded-md border border-gray-200">
                <li className="flex items-center justify-between py-4 pr-5 pl-4 text-sm/6">
                  <div className="flex w-0 flex-1 items-center">
                    <PaperClipIcon aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
                    <div className="ml-4 flex min-w-0 flex-1 gap-2">
                      <span className="truncate font-medium">apple_quartalsbericht_q1_2025.pdf</span>
                      <span className="shrink-0 text-gray-400">3,2 MB</span>
                    </div>
                  </div>
                  <div className="ml-4 shrink-0">
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Download
                    </a>
                  </div>
                </li>
                <li className="flex items-center justify-between py-4 pr-5 pl-4 text-sm/6">
                  <div className="flex w-0 flex-1 items-center">
                    <PaperClipIcon aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
                    <div className="ml-4 flex min-w-0 flex-1 gap-2">
                      <span className="truncate font-medium">analysten_research_apple_2025.pdf</span>
                      <span className="shrink-0 text-gray-400">1,8 MB</span>
                    </div>
                  </div>
                  <div className="ml-4 shrink-0">
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Download
                    </a>
                  </div>
                </li>
                <li className="flex items-center justify-between py-4 pr-5 pl-4 text-sm/6">
                  <div className="flex w-0 flex-1 items-center">
                    <PaperClipIcon aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
                    <div className="ml-4 flex min-w-0 flex-1 gap-2">
                      <span className="truncate font-medium">portfolio_transaktionen_aapl.xlsx</span>
                      <span className="shrink-0 text-gray-400">245 KB</span>
                    </div>
                  </div>
                  <div className="ml-4 shrink-0">
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Download
                    </a>
                  </div>
                </li>
              </ul>
            </dd>
          </div>
        </dl>
      </div>

      {/* Performance Chart */}
      <div className="mt-8">
        <h3 className="text-base font-semibold text-gray-900">
          Performance-Vergleich
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Kursentwicklung der letzten 12 Monate im Vergleich zu anderen Tech-Aktien
        </p>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(value) => `${value}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="Apple (AAPL)" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#3B82F6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Microsoft (MSFT)" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#8B5CF6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Google (GOOGL)" 
                  stroke="#EC4899" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#EC4899' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 p-6">
            <ul role="list" className="divide-y divide-gray-100">
              {summary.map((item) => (
                <li key={item.name} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
                  <div 
                    className="w-1 h-8 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {item.value}
                      </p>
                      <p className="text-xs text-green-600">
                        {item.change}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              <PlusSmallIcon className="w-4 h-4" />
              Aktie vergleichen
            </button>
          </div>
        </div>
      </div>

      {/* Transaktionshistorie */}
      <div className="mt-8">
        <Disclosure as="div">
          <DisclosureButton className="group flex w-full items-center justify-between text-left">
            <h4 className="text-base font-semibold text-gray-900">Transaktionshistorie</h4>
            <span className="ml-6 flex h-7 items-center">
              <PlusSmallIcon aria-hidden="true" className="size-6 group-data-[open]:hidden" />
              <MinusSmallIcon aria-hidden="true" className="size-6 group-[&:not([data-open])]:hidden" />
            </span>
          </DisclosureButton>
          <DisclosurePanel className="mt-4">
            <div className="flow-root">
              <ul role="list" className="-mb-8">
                {transactions.map((transaction, transactionIdx) => (
                  <li key={transaction.id}>
                    <div className="relative pb-8">
                      {transactionIdx !== transactions.length - 1 ? (
                        <span aria-hidden="true" className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" />
                      ) : null}
                      <div className="relative flex items-start space-x-3">
                        {transaction.type === 'buy' ? (
                          <>
                            <div>
                              <div className="relative px-1">
                                <div className="flex size-8 items-center justify-center rounded-full bg-green-100 ring-8 ring-white">
                                  <PlusCircleIcon aria-hidden="true" className="size-5 text-green-600" />
                                </div>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1 py-1.5">
                              <div className="text-sm text-gray-500">
                                <span className="font-medium text-gray-900">Kauf von {transaction.shares} Aktien</span>
                                {' '} zu ${transaction.price} je Aktie
                                <span className="whitespace-nowrap ml-2">{transaction.date}</span>
                              </div>
                              <div className="mt-1 text-sm text-gray-600">
                                Gesamtvolumen: ${transaction.total.toLocaleString()}
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                {transaction.description}
                              </div>
                            </div>
                          </>
                        ) : transaction.type === 'sell' ? (
                          <>
                            <div>
                              <div className="relative px-1">
                                <div className="flex size-8 items-center justify-center rounded-full bg-red-100 ring-8 ring-white">
                                  <MinusCircleIcon aria-hidden="true" className="size-5 text-red-600" />
                                </div>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1 py-1.5">
                              <div className="text-sm text-gray-500">
                                <span className="font-medium text-gray-900">Verkauf von {transaction.shares} Aktien</span>
                                {' '} zu ${transaction.price} je Aktie
                                <span className="whitespace-nowrap ml-2">{transaction.date}</span>
                              </div>
                              <div className="mt-1 text-sm text-gray-600">
                                Erlös: ${transaction.total.toLocaleString()}
                              </div>
                              <div className={`mt-1 text-sm font-medium ${transaction.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.profit > 0 ? 'Gewinn' : 'Verlust'}: ${Math.abs(transaction.profit).toLocaleString()} ({transaction.profitPercent > 0 ? '+' : ''}{transaction.profitPercent}%)
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                {transaction.description}
                              </div>
                            </div>
                          </>
                        ) : transaction.type === 'dividend' ? (
                          <>
                            <div>
                              <div className="relative px-1">
                                <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 ring-8 ring-white">
                                  <CurrencyEuroIcon aria-hidden="true" className="size-5 text-blue-600" />
                                </div>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1 py-1.5">
                              <div className="text-sm text-gray-500">
                                <span className="font-medium text-gray-900">Dividendenzahlung</span>
                                <span className="whitespace-nowrap ml-2">{transaction.date}</span>
                              </div>
                              <div className="mt-1 text-sm text-gray-600">
                                Betrag: ${transaction.amount} (${transaction.yield} je Aktie)
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                {transaction.description}
                              </div>
                            </div>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </DisclosurePanel>
        </Disclosure>
      </div>
    </div>
  )
}