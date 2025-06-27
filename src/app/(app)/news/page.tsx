'use client'

import { useState } from 'react'
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

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const data = [
  { date: 'Aug 01', 'ETF Shares Vital': 2100.2, 'Vitainvest Core': 4434.1, 'iShares Tech Growth': 7943.2 },
  { date: 'Aug 02', 'ETF Shares Vital': 2943.0, 'Vitainvest Core': 4954.1, 'iShares Tech Growth': 8954.1 },
  { date: 'Aug 03', 'ETF Shares Vital': 4889.5, 'Vitainvest Core': 6100.2, 'iShares Tech Growth': 9123.7 },
  { date: 'Aug 04', 'ETF Shares Vital': 3909.8, 'Vitainvest Core': 4909.7, 'iShares Tech Growth': 7478.4 },
  { date: 'Aug 05', 'ETF Shares Vital': 5778.7, 'Vitainvest Core': 7103.1, 'iShares Tech Growth': 9504.3 },
  { date: 'Aug 06', 'ETF Shares Vital': 5900.9, 'Vitainvest Core': 7534.3, 'iShares Tech Growth': 9943.4 },
  { date: 'Aug 07', 'ETF Shares Vital': 4129.4, 'Vitainvest Core': 7412.1, 'iShares Tech Growth': 10112.2 },
  { date: 'Aug 08', 'ETF Shares Vital': 6021.2, 'Vitainvest Core': 7834.4, 'iShares Tech Growth': 10290.2 },
  { date: 'Aug 09', 'ETF Shares Vital': 6279.8, 'Vitainvest Core': 8159.1, 'iShares Tech Growth': 10349.6 },
  { date: 'Aug 10', 'ETF Shares Vital': 6224.5, 'Vitainvest Core': 8260.6, 'iShares Tech Growth': 10415.4 },
  { date: 'Aug 11', 'ETF Shares Vital': 6380.6, 'Vitainvest Core': 8965.3, 'iShares Tech Growth': 10636.3 },
  { date: 'Aug 12', 'ETF Shares Vital': 6414.4, 'Vitainvest Core': 7989.3, 'iShares Tech Growth': 10900.5 },
  { date: 'Aug 13', 'ETF Shares Vital': 6540.1, 'Vitainvest Core': 7839.6, 'iShares Tech Growth': 11040.4 },
  { date: 'Aug 14', 'ETF Shares Vital': 6634.4, 'Vitainvest Core': 7343.8, 'iShares Tech Growth': 11390.5 },
  { date: 'Aug 15', 'ETF Shares Vital': 7124.6, 'Vitainvest Core': 6903.7, 'iShares Tech Growth': 11423.1 },
  { date: 'Aug 16', 'ETF Shares Vital': 7934.5, 'Vitainvest Core': 6273.6, 'iShares Tech Growth': 12134.4 },
  { date: 'Aug 17', 'ETF Shares Vital': 10287.8, 'Vitainvest Core': 5900.3, 'iShares Tech Growth': 12034.4 },
  { date: 'Aug 18', 'ETF Shares Vital': 10323.2, 'Vitainvest Core': 5732.1, 'iShares Tech Growth': 11011.7 },
  { date: 'Aug 19', 'ETF Shares Vital': 10511.4, 'Vitainvest Core': 5523.1, 'iShares Tech Growth': 11834.8 },
  { date: 'Aug 20', 'ETF Shares Vital': 11043.9, 'Vitainvest Core': 5422.3, 'iShares Tech Growth': 12387.1 },
  { date: 'Sep 01', 'ETF Shares Vital': 12347.2, 'Vitainvest Core': 4839.1, 'iShares Tech Growth': 14532.1 },
  { date: 'Sep 05', 'ETF Shares Vital': 12489.5, 'Vitainvest Core': 5741.1, 'iShares Tech Growth': 13539.2 },
  { date: 'Sep 10', 'ETF Shares Vital': 13649.0, 'Vitainvest Core': 10139.2, 'iShares Tech Growth': 11143.8 },
  { date: 'Sep 15', 'ETF Shares Vital': 12012.8, 'Vitainvest Core': 11412.3, 'iShares Tech Growth': 7100.4 },
  { date: 'Sep 20', 'ETF Shares Vital': 13132.6, 'Vitainvest Core': 12132.3, 'iShares Tech Growth': 6900.2 },
  { date: 'Sep 25', 'ETF Shares Vital': 15967.5, 'Vitainvest Core': 9700.1, 'iShares Tech Growth': 4123.2 },
  { date: 'Sep 26', 'ETF Shares Vital': 17349.3, 'Vitainvest Core': 10943.4, 'iShares Tech Growth': 3935.1 },
];

const summary = [
  {
    name: 'ETF Shares Vital',
    value: '$21,349.36',
    invested: '$19,698.65',
    cashflow: '$14,033.74',
    gain: '+$11,012.39',
    realized: '+$177.48',
    dividends: '+$490.97',
    bgColor: 'bg-blue-500',
    lineColor: '#3b82f6',
    changeType: 'positive',
  },
  {
    name: 'Vitainvest Core',
    value: '$25,943.43',
    invested: '$23,698.65',
    cashflow: '$11,033.74',
    gain: '+$3,012.39',
    realized: '+$565.41',
    dividends: '+$290.97',
    bgColor: 'bg-violet-500',
    lineColor: '#8b5cf6',
    changeType: 'positive',
  },
  {
    name: 'iShares Tech Growth',
    value: '$9,443.46',
    invested: '$14,698.65',
    cashflow: '$2,033.74',
    gain: '-$5,012.39',
    realized: '-$634.42',
    dividends: '-$990.97',
    bgColor: 'bg-fuchsia-500',
    lineColor: '#d946ef',
    changeType: 'negative',
  },
];

const valueFormatter = (number) =>
  `$${Intl.NumberFormat('us').format(number).toString()}`;

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
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8 min-w-[320px]">
      <div className="min-w-0">
        <h3 className="text-xs sm:text-sm text-gray-600 truncate">Portfolio performance</h3>
        <p className="mt-1 text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 truncate">$32,227.40</p>
        <p className="mt-1 text-xs sm:text-sm font-medium">
          <span className="text-emerald-700">+$430.90 (4.1%)</span>{' '}
          <span className="font-normal text-gray-600 hidden sm:inline">Letzte 30 Tage</span>
          <span className="font-normal text-gray-600 sm:hidden">30 Tage</span>
        </p>
      </div>

      <div className="hidden sm:block min-w-0">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data}>
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
              dataKey="ETF Shares Vital"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="ETF Shares"
            />
            <Line
              type="monotone"
              dataKey="Vitainvest Core"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
              name="Vitainvest"
            />
            <Line
              type="monotone"
              dataKey="iShares Tech Growth"
              stroke="#d946ef"
              strokeWidth={2}
              dot={false}
              name="iShares Tech"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="block sm:hidden min-w-0">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
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
              dataKey="ETF Shares Vital"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Vitainvest Core"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="iShares Tech Growth"
              stroke="#d946ef"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

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
                              Dividends: <span className={classNames(
                                item.changeType === 'positive'
                                  ? 'text-emerald-700'
                                  : 'text-red-700',
                                'font-medium'
                              )}>
                                {item.dividends}
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
                          <div className="text-xs font-medium text-gray-500">Value</div>
                          <div className="text-sm font-medium text-gray-900">{item.value}</div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500">Invested</div>
                          <div className="text-sm font-medium text-gray-900">{item.invested}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs font-medium text-gray-500">Gain</div>
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
                          <div className="text-xs font-medium text-gray-500">Realized</div>
                          <div className={classNames(
                            item.changeType === 'positive'
                              ? 'text-emerald-700'
                              : 'text-red-700',
                            'text-sm font-medium'
                          )}>
                            {item.realized}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1">
                        <div>
                          <div className="text-xs font-medium text-gray-500">Cashflow</div>
                          <div className="text-sm font-medium text-gray-900">{item.cashflow}</div>
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
                Name
              </th>
              <th className="px-1 py-2 sm:py-3.5 text-right text-xs sm:text-sm font-semibold text-gray-900 sm:hidden">
                Dividends
              </th>
              <th className="px-1 py-2 sm:py-3.5 text-right text-xs sm:text-sm font-semibold text-gray-900 hidden sm:table-cell">
                Value
              </th>
              <th className="px-1 py-2 sm:py-3.5 text-right text-xs sm:text-sm font-semibold text-gray-900 hidden sm:table-cell">
                Gain
              </th>
              <th className="px-1 py-2 sm:py-3.5 text-right text-xs sm:text-sm font-semibold text-gray-900 hidden md:table-cell">
                Realized
              </th>
              <th className="px-1 py-2 sm:py-3.5 text-right text-xs sm:text-sm font-semibold text-gray-900 hidden lg:table-cell">
                Invested
              </th>
              <th className="px-1 py-2 sm:py-3.5 text-right text-xs sm:text-sm font-semibold text-gray-900 hidden xl:table-cell">
                Dividends
              </th>
              <th className="px-1 py-2 sm:py-3.5 text-right text-xs sm:text-sm font-semibold text-gray-900 hidden md:table-cell lg:table-cell xl:hidden">
                Dividends
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
                      <span className="sm:hidden">{item.name.split(' ')[0]}</span>
                      <span className="hidden sm:inline">{item.name}</span>
                    </span>
                  </div>
                </td>
                <td className="px-1 py-2 sm:py-3 text-xs sm:text-sm text-right sm:hidden">
                  <span
                    className={classNames(
                      item.changeType === 'positive'
                        ? 'text-emerald-700'
                        : 'text-red-700',
                    )}
                  >
                    {item.dividends}
                  </span>
                </td>
                <td className="px-1 py-2 sm:py-3 text-xs sm:text-sm text-gray-500 text-right hidden sm:table-cell">
                  <span className="sm:hidden">{item.value.replace(',', '').slice(0, -6) + 'k'}</span>
                  <span className="hidden sm:inline">{item.value}</span>
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
                <td className="px-1 py-2 sm:py-3 text-xs sm:text-sm text-right hidden md:table-cell">
                  <span
                    className={classNames(
                      item.changeType === 'positive'
                        ? 'text-emerald-700'
                        : 'text-red-700',
                    )}
                  >
                    {item.realized}
                  </span>
                </td>
                <td className="px-1 py-2 sm:py-3 text-xs sm:text-sm text-gray-500 text-right hidden lg:table-cell">{item.invested}</td>
                <td className="px-1 py-2 sm:py-3 text-xs sm:text-sm text-right hidden xl:table-cell">
                  <span
                    className={classNames(
                      item.changeType === 'positive'
                        ? 'text-emerald-700'
                        : 'text-red-700',
                    )}
                  >
                    {item.dividends}
                  </span>
                </td>
                <td className="px-1 py-2 sm:py-3 text-xs sm:text-sm text-right hidden md:table-cell lg:table-cell xl:hidden">
                  <span
                    className={classNames(
                      item.changeType === 'positive'
                        ? 'text-emerald-700'
                        : 'text-red-700',
                    )}
                  >
                    {item.dividends}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}