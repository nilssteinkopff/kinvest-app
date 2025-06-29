export interface Position {
  name: string
  ticker: string
  shares: number
  avgPrice: number
  currentPrice: number
  value: number
  gain: number
  gainPct: number
  weight: number
  bgColor: string
  changeType: 'positive' | 'negative'
}
export interface PortfolioSummary {
  total_value: number
  total_gain: number
  total_gain_pct: number
  total_invested?: number
}

export interface BenchmarkData {
  name: string
  value: number
  gain: number
  gainPct: number
  bgColor: string
  changeType: 'positive' | 'negative'
}

export type StatusType = 'live' | 'updated' | 'outperforming' | 'underperforming' | 'neutral'
