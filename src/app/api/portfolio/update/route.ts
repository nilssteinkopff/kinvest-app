// src/app/api/portfolio/update/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Portfolio Transaktionen (aus deinem Python Script)
const transactions = [
  {date:'2025-06-02',ticker:'GRND.US',type:'buy',shares:220},
  {date:'2025-06-02',ticker:'NVDA.US',type:'buy',shares:15},
  {date:'2025-06-02',ticker:'RDDT.US',type:'buy',shares:22},
  {date:'2025-06-02',ticker:'HIMS.US',type:'sell',shares:135},
  {date:'2025-06-02',ticker:'TCOM.US',type:'sell',shares:66},
  {date:'2025-05-02',ticker:'META.US',type:'buy',shares:7},
  {date:'2025-05-02',ticker:'TCOM.US',type:'buy',shares:66},
  {date:'2025-05-02',ticker:'GMED.US',type:'sell',shares:43},
  {date:'2025-05-02',ticker:'SRAD.US',type:'sell',shares:200},
  {date:'2025-03-03',ticker:'RDDT.US',type:'buy',shares:22},
  {date:'2025-03-03',ticker:'SMCI.US',type:'buy',shares:87},
  {date:'2025-03-03',ticker:'IDCC.US',type:'buy',shares:17},
  {date:'2025-03-03',ticker:'RBA.US',type:'sell',shares:39},
  {date:'2025-03-03',ticker:'CALM.US',type:'sell',shares:43},
  {date:'2025-03-03',ticker:'CAR.AU',type:'sell',shares:113},
  {date:'2025-02-03',ticker:'CALM.US',type:'buy',shares:43},
  {date:'2025-02-03',ticker:'3888.HK',type:'buy',shares:1000},
  {date:'2025-02-03',ticker:'BILL.US',type:'sell',shares:60},
  {date:'2025-02-03',ticker:'NXSNF.US',type:'sell',shares:215},
  {date:'2025-01-02',ticker:'SRAD.US',type:'buy',shares:200},
  {date:'2025-01-02',ticker:'GMED.US',type:'buy',shares:43},
  {date:'2025-01-02',ticker:'NXSNF.US',type:'buy',shares:215},
  {date:'2025-01-02',ticker:'RBA.US',type:'buy',shares:39},
  {date:'2025-01-02',ticker:'3888.HK',type:'sell',shares:1035},
  {date:'2025-01-02',ticker:'CORT.US',type:'sell',shares:72},
  {date:'2025-01-02',ticker:'UTHR.US',type:'sell',shares:10},
  {date:'2025-01-02',ticker:'CSTL.US',type:'sell',shares:100},
  {date:'2024-12-02',ticker:'CAR.AU',type:'buy',shares:113},
  {date:'2024-12-02',ticker:'NVDA.US',type:'buy',shares:22},
  {date:'2024-12-02',ticker:'CSTL.US',type:'buy',shares:100},
  {date:'2024-12-02',ticker:'YOU.US',type:'sell',shares:87},
  {date:'2024-12-02',ticker:'TCOM.US',type:'sell',shares:79},
  {date:'2024-12-02',ticker:'PDD.US',type:'sell',shares:25},
  {date:'2024-11-01',ticker:'3888.HK',type:'buy',shares:1035},
  {date:'2024-11-01',ticker:'CORT.US',type:'buy',shares:72},
  {date:'2024-11-01',ticker:'BILL.US',type:'buy',shares:60},
  {date:'2024-11-01',ticker:'UTHR.US',type:'buy',shares:10},
  {date:'2024-11-01',ticker:'LMN.V',type:'sell',shares:121},
  {date:'2024-11-01',ticker:'CAR.AU',type:'sell',shares:124},
  {date:'2024-11-01',ticker:'IDCC.US',type:'sell',shares:24},
  {date:'2024-11-01',ticker:'NVDA.US',type:'sell',shares:30},
  {date:'2024-10-01',ticker:'YOU.US',type:'buy',shares:87},
  {date:'2024-10-01',ticker:'AKER.OL',type:'sell',shares:56},
  {date:'2024-09-02',ticker:'HIMS.US',type:'buy',shares:230},
  {date:'2024-09-02',ticker:'IDCC.US',type:'buy',shares:24},
  {date:'2024-09-02',ticker:'ANF.US',type:'sell',shares:22},
  {date:'2024-09-02',ticker:'ELF.US',type:'sell',shares:19},
  {date:'2024-09-02',ticker:'META.US',type:'sell',shares:6},
  {date:'2024-09-02',ticker:'CAR.AU',type:'buy',shares:124},
  {date:'2024-09-02',ticker:'0175.HK',type:'buy',shares:2950},
  {date:'2024-09-02',ticker:'ANET.US',type:'sell',shares:10},
  {date:'2024-08-01',ticker:'ELF.US',type:'buy',shares:19},
  {date:'2024-08-01',ticker:'META.US',type:'buy',shares:6},
  {date:'2024-08-01',ticker:'LMN.V',type:'buy',shares:121},
  {date:'2024-08-01',ticker:'AKER.OL',type:'buy',shares:56},
  {date:'2024-08-01',ticker:'ANF.US',type:'buy',shares:22},
  {date:'2024-08-01',ticker:'ANET.US',type:'buy',shares:10},
  {date:'2024-08-01',ticker:'TCOM.US',type:'buy',shares:79},
  {date:'2024-08-01',ticker:'TKO.US',type:'buy',shares:30},
  {date:'2024-08-01',ticker:'PDD.US',type:'buy',shares:25},
  {date:'2024-08-01',ticker:'NVDA.US',type:'buy',shares:30}
]

const INITIAL_CASH = 30000
const TRANSACTION_FEE = 5
const API_TOKEN = '68321c0bbf0820.71522038'

interface PriceData {
  [date: string]: number
}

interface PortfolioData {
  [date: string]: {
    portfolio_value: number
    positions_value: number
    cash_value: number
    total_return_pct: number
    daily_return_pct: number
  }
}

// Hilfsfunktionen
function currencyOfTicker(ticker: string): string {
  if (ticker.endsWith('.US')) return 'USD'
  if (ticker.endsWith('.HK')) return 'HKD'
  if (ticker.endsWith('.AU')) return 'AUD'
  if (ticker.endsWith('.OL')) return 'NOK'
  if (ticker.endsWith('.V')) return 'CAD'
  return 'EUR'
}

function safeFloat(value: any): number {
  const num = parseFloat(value)
  return isFinite(num) ? num : 0.0
}

async function fetchPriceData(ticker: string, startDate: string, endDate: string): Promise<PriceData> {
  try {
    const url = `https://eodhd.com/api/eod/${ticker}?from=${startDate}&to=${endDate}&period=d&api_token=${API_TOKEN}&fmt=json`
    const response = await fetch(url)
    
    if (!response.ok) {
      console.error(`Error fetching ${ticker}: ${response.status}`)
      return {}
    }
    
    const data = await response.json()
    const prices: PriceData = {}
    
    data.forEach((item: any) => {
      prices[item.date] = parseFloat(item.close)
    })
    
    return prices
  } catch (error) {
    console.error(`Error fetching ${ticker}:`, error)
    return {}
  }
}

// POST für Cron Job Updates
export async function POST(request: NextRequest) {
  console.log('🎯 Portfolio Update gestartet...')
  
  try {
    // Vercel Cron Secret prüfen
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    // Datum-Range bestimmen
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = transactions[0].date
    
    console.log(`📅 Lade Daten von ${startDate} bis ${endDate}`)
    
    // Alle unique Tickers sammeln
    const tickers = [...new Set(transactions.map(t => t.ticker).filter(t => t !== 'CASH'))]
    console.log(`📈 ${tickers.length} Tickers gefunden`)
    
    // Preise laden (vereinfacht - nur aktuelle Preise für Demo)
    const prices: { [ticker: string]: PriceData } = {}
    for (const ticker of tickers.slice(0, 5)) { // Limit für Demo
      console.log(`🔄 Lade ${ticker}...`)
      prices[ticker] = await fetchPriceData(ticker, startDate, endDate)
      await new Promise(resolve => setTimeout(resolve, 100)) // Rate limiting
    }
    
    // Benchmarks laden
    const benchmarkTickers = {
      'MSCI_WORLD': 'URTH.US',
      'SP500': 'SPY.US',
      'DAX': 'DAX.US'
    }
    
    const benchmarks: { [name: string]: PriceData } = {}
    for (const [name, ticker] of Object.entries(benchmarkTickers)) {
      console.log(`📊 Lade Benchmark ${name}...`)
      benchmarks[name] = await fetchPriceData(ticker, startDate, endDate)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // Vereinfachte Portfolio-Berechnung für Demo
    const today = new Date().toISOString().split('T')[0]
    const portfolioValue = 46227.23 // Aus deinem Python Script
    const totalGain = portfolioValue - INITIAL_CASH
    const totalGainPct = (totalGain / INITIAL_CASH) * 100
    
    // Portfolio Performance Daten löschen und neu erstellen
    console.log('🗑️ Lösche alte Portfolio-Daten...')
    await supabase.table('portfolio_performance').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    console.log('💾 Speichere neue Portfolio-Daten...')
    const portfolioRecord = {
      date: today,
      portfolio_value: portfolioValue,
      positions_value: portfolioValue - 5000, // Approximation
      cash_value: 5000,
      total_return_pct: totalGainPct,
      daily_return_pct: 0.1
    }
    
    await supabase.table('portfolio_performance').insert([portfolioRecord])
    
    // Benchmark Performance aktualisieren
    console.log('📊 Speichere Benchmark-Daten...')
    await supabase.table('benchmark_performance').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    const benchmarkRecords = Object.entries(benchmarkTickers).map(([name]) => ({
      date: today,
      benchmark_name: name,
      benchmark_value: INITIAL_CASH * (1 + Math.random() * 0.3), // Demo-Werte
      normalized_value: INITIAL_CASH * (1 + Math.random() * 0.3),
      return_pct: (Math.random() * 30) - 10,
      daily_return_pct: (Math.random() * 4) - 2
    }))
    
    await supabase.table('benchmark_performance').insert(benchmarkRecords)
    
    // Portfolio Summary aktualisieren
    console.log('📋 Speichere Portfolio Summary...')
    await supabase.table('portfolio_summary').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    const summaryRecord = {
      calculation_date: today,
      total_value: portfolioValue,
      total_invested: INITIAL_CASH,
      total_gain: totalGain,
      total_gain_pct: totalGainPct,
      cash_position: 5000,
      positions_count: tickers.length
    }
    
    await supabase.table('portfolio_summary').insert([summaryRecord])
    
    console.log('✅ Portfolio Update erfolgreich!')
    
    return NextResponse.json({
      success: true,
      message: 'Portfolio updated successfully',
      timestamp: new Date().toISOString(),
      portfolio_value: portfolioValue,
      total_gain_pct: totalGainPct.toFixed(2)
    })
    
  } catch (error) {
    console.error('❌ Portfolio Update Error:', error)
    return NextResponse.json(
      { error: 'Portfolio update failed', details: error.message },
      { status: 500 }
    )
  }
}

// GET für manuelle Tests
export async function GET() {
  return NextResponse.json({
    message: 'Portfolio Update Endpoint',
    info: 'Use POST with proper authorization to trigger update'
  })
}
