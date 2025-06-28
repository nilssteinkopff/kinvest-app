// src/app/api/portfolio/performance/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '365')
    const includePositions = searchParams.get('positions') === 'true'

    // Datum Range berechnen
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    // Portfolio Performance laden
    const { data: portfolioData, error: portfolioError } = await supabase
      .from('portfolio_performance')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (portfolioError) {
      console.error('Portfolio Error:', portfolioError)
      return NextResponse.json({ error: 'Failed to fetch portfolio data' }, { status: 500 })
    }

    // Benchmark Performance laden
    const { data: benchmarkData, error: benchmarkError } = await supabase
      .from('benchmark_performance')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (benchmarkError) {
      console.error('Benchmark Error:', benchmarkError)
      return NextResponse.json({ error: 'Failed to fetch benchmark data' }, { status: 500 })
    }

    // Portfolio Summary laden
    const { data: summaryData, error: summaryError } = await supabase
      .from('portfolio_summary')
      .select('*')
      .order('calculation_date', { ascending: false })
      .limit(1)
      .single()

    if (summaryError) {
      console.error('Summary Error:', summaryError)
    }

    // Daten für Chart formatieren
    const chartData = portfolioData.map(portfolioRow => {
      const date = new Date(portfolioRow.date).toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: 'short' 
      })
      
      const result: any = {
        date,
        Portfolio: portfolioRow.portfolio_value
      }

      // Benchmark Daten für dasselbe Datum hinzufügen
      const benchmarkRows = benchmarkData.filter(b => b.date === portfolioRow.date)
      benchmarkRows.forEach(benchmark => {
        if (benchmark.benchmark_name === 'MSCI_WORLD') {
          result['MSCI World'] = benchmark.normalized_value
        } else if (benchmark.benchmark_name === 'SP500') {
          result['S&P 500'] = benchmark.normalized_value
        } else if (benchmark.benchmark_name === 'DAX') {
          result['DAX'] = benchmark.normalized_value
        }
      })

      return result
    })

    // Position Details (optional)
    let positionData = null
    if (includePositions) {
      const { data: positions, error: posError } = await supabase
        .from('position_performance')
        .select('*')
        .eq('date', portfolioData[portfolioData.length - 1]?.date || endDate.toISOString().split('T')[0])

      if (!posError) {
        positionData = positions
      }
    }

    // Aktuelle Transaktionen laden (letzte 30 Tage)
    const recentDate = new Date()
    recentDate.setDate(recentDate.getDate() - 30)
    
    const { data: recentTransactions } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', recentDate.toISOString().split('T')[0])
      .order('date', { ascending: false })

    // Response zusammenstellen
    const response = {
      success: true,
      data: {
        chart: chartData,
        summary: summaryData || {
          total_value: portfolioData[portfolioData.length - 1]?.portfolio_value || 0,
          total_gain: 0,
          total_gain_pct: 0,
          cash_position: portfolioData[portfolioData.length - 1]?.cash_value || 0
        },
        positions: positionData,
        recentTransactions: recentTransactions || [],
        meta: {
          dataPoints: chartData.length,
          dateRange: {
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
          },
          lastUpdate: portfolioData[portfolioData.length - 1]?.date || null
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// POST Methode für Portfolio Update Trigger
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'trigger_update') {
      // Hier könnte ein Python Script Trigger oder anderer Update-Mechanismus eingefügt werden
      // Für jetzt geben wir nur eine Bestätigung zurück
      
      return NextResponse.json({
        success: true,
        message: 'Portfolio update triggered',
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('POST API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
