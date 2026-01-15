'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Area, ComposedChart, BarChart, Bar } from 'recharts';

export default function ROICalculator() {
  const [pricePerAgent, setPricePerAgent] = useState(79);
  const [salesAgents, setSalesAgents] = useState(100);
  const [leadsPerMonth, setLeadsPerMonth] = useState(500);
  const [closeRate, setCloseRate] = useState(3.5);
  const [avgDealValue, setAvgDealValue] = useState(42000);

  const [results, setResults] = useState(null);

  useEffect(() => {
    calculateROI();
  }, [pricePerAgent, salesAgents, leadsPerMonth, closeRate, avgDealValue]);

  const calculateROI = () => {
    // Current performance
    const closedDealsPerMonth = Math.round(leadsPerMonth * (closeRate / 100));
    const currentAnnualRevenue = closedDealsPerMonth * avgDealValue * 12;
    const annualInvestment = pricePerAgent * salesAgents * 12;

    // Scenario calculations
    const scenarios = [
      { lift: 1, label: '+1 point' },
      { lift: 5, label: '+5 points' },
      { lift: 10, label: '+10 points' }
    ].map(scenario => {
      const newCloseRate = closeRate + scenario.lift;
      const newClosedDeals = Math.round(leadsPerMonth * (newCloseRate / 100));
      const newAnnualRevenue = newClosedDeals * avgDealValue * 12;
      const incrementalRevenue = newAnnualRevenue - currentAnnualRevenue;
      const roi = ((incrementalRevenue - annualInvestment) / annualInvestment) * 100;
      const netGain = incrementalRevenue - annualInvestment;

      return {
        ...scenario,
        newCloseRate,
        incrementalRevenue,
        roi,
        netGain
      };
    });

    // Chart data for 12 month period - showing cumulative incremental value vs annual investment cost
    const chartData = [];
    const periodCount = 12;

    for (let month = 0; month <= periodCount; month++) {
      // Cumulative incremental revenue (value generated) for each scenario - monthly
      const scenario1Value = (scenarios[0].incrementalRevenue / 12) * month;
      const scenario2Value = (scenarios[1].incrementalRevenue / 12) * month;
      const scenario3Value = (scenarios[2].incrementalRevenue / 12) * month;

      chartData.push({
        period: month,
        scenario1: scenario1Value,
        scenario2: scenario2Value,
        scenario3: scenario3Value,
        cost: annualInvestment
      });
    }

    // Find break-even points for each scenario (in months)
    const breakEvenPeriod1 = scenarios[0].incrementalRevenue > 0
      ? annualInvestment / (scenarios[0].incrementalRevenue / 12)
      : null;
    const breakEvenPeriod2 = scenarios[1].incrementalRevenue > 0
      ? annualInvestment / (scenarios[1].incrementalRevenue / 12)
      : null;
    const breakEvenPeriod3 = scenarios[2].incrementalRevenue > 0
      ? annualInvestment / (scenarios[2].incrementalRevenue / 12)
      : null;

    setResults({
      closedDealsPerMonth,
      currentAnnualRevenue,
      annualInvestment,
      scenarios,
      chartData,
      breakEvenPeriod1,
      breakEvenPeriod2,
      breakEvenPeriod3
    });
  };

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return '$' + (value / 1000000).toFixed(1) + 'M';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatFullCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value) => {
    return value.toFixed(1) + '%';
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Revenue Intelligence — ROI Calculator</h1>
              <p className="text-slate-500 mt-1">Estimate incremental revenue from improving sales conversion rate vs. your investment.</p>
            </div>
            <div className="text-right">
              <label className="text-slate-400 text-sm">Price per agent</label>
              <div className="flex items-baseline gap-1 mt-1">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-700">$</span>
                  <input
                    type="number"
                    value={pricePerAgent}
                    onChange={(e) => setPricePerAgent(Number(e.target.value) || 0)}
                    className="w-24 text-2xl font-bold text-slate-700 text-right border border-slate-300 rounded-lg py-1 px-3 pr-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
                <span className="text-slate-500">/month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Inputs */}
          <div className="space-y-6">
            {/* Your Inputs */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-5">Your Inputs</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Sales agents using platform
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={salesAgents}
                      onChange={(e) => setSalesAgents(Number(e.target.value) || 0)}
                      className="flex-1 border border-slate-300 rounded-lg py-3 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                    <span className="text-slate-500">agents</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Qualified leads per month
                  </label>
                  <input
                    type="number"
                    value={leadsPerMonth}
                    onChange={(e) => setLeadsPerMonth(Number(e.target.value) || 0)}
                    placeholder="e.g., 500"
                    className="w-full border border-slate-300 rounded-lg py-3 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <div className="flex justify-between items-center">
                      <span>Current close rate</span>
                      <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-lg font-bold">{formatPercent(closeRate)}</span>
                    </div>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="40"
                    step="0.5"
                    value={closeRate}
                    onChange={(e) => setCloseRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                  <div className="flex justify-between text-sm text-slate-400 mt-1">
                    <span>1%</span>
                    <span>40%</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    Use your current observed win rate. (Example: 3% means 3 closed deals per 100 qualified leads.)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Average deal value
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={avgDealValue}
                      onChange={(e) => setAvgDealValue(Number(e.target.value) || 0)}
                      className="w-full border border-slate-300 rounded-lg py-3 pl-8 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* How lifts are modeled */}
            <div className="bg-sky-50 rounded-xl p-6">
              <h3 className="font-bold text-slate-800 mb-2">How lifts are modeled</h3>
              <p className="text-slate-600 text-sm">
                Scenarios add <span className="font-semibold">percentage points</span> to your close rate: +1 point, +5 points, +10 points. Example: {formatPercent(closeRate)} → {formatPercent(closeRate + 1)} (+1), {formatPercent(closeRate + 5)} (+5), {formatPercent(closeRate + 10)} (+10).
              </p>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Current Performance */}
            {results && (
              <>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-800 mb-4">Your Current Performance</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Closed deals per month</span>
                      <span className="font-bold text-slate-800">{results.closedDealsPerMonth}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Current annual revenue</span>
                      <span className="font-bold text-slate-800 text-xl">{formatFullCurrency(results.currentAnnualRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Annual investment</span>
                      <span className="font-bold text-slate-800">{formatFullCurrency(results.annualInvestment)}</span>
                    </div>
                  </div>
                </div>

                {/* Scenarios */}
                {results.scenarios.map((scenario, index) => (
                  <div
                    key={index}
                    className={`rounded-xl p-5 shadow-sm border-l-4 ${
                      index === 0 ? 'bg-sky-600 border-sky-400' :
                      index === 1 ? 'bg-sky-700 border-sky-500' :
                      'bg-sky-800 border-sky-600'
                    }`}
                  >
                    <h3 className="font-bold text-white mb-3">Scenario: {scenario.label} close rate</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sky-200">New close rate</span>
                        <span className="font-bold text-white">{formatPercent(scenario.newCloseRate)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sky-200">Incremental annual revenue</span>
                        <span className="font-bold text-white">{formatFullCurrency(scenario.incrementalRevenue)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sky-200">ROI</span>
                        <span className={`font-bold text-xl ${scenario.roi >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{Math.round(scenario.roi).toLocaleString()}%</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Incremental Revenue Impact */}
                <div className="bg-slate-800 rounded-xl p-6 text-center">
                  <h3 className="font-bold text-sky-300 mb-2">Incremental Revenue Impact</h3>
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {formatFullCurrency(results.scenarios[0].netGain)} –<br/>{formatFullCurrency(results.scenarios[2].netGain)}
                  </div>
                  <p className="text-slate-400 mt-2 text-sm">
                    Net gain after investment (from +1 to +10 point lift)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Chart Section */}
        {results && (
          <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Return on Investment (ROI)</h2>
            <p className="text-slate-500 mb-2">Payback Period Analysis</p>
            <p className="text-sm text-slate-400 mb-6">
              Shows when cumulative incremental revenue from improved close rates pays back the annual investment of <span className="font-semibold text-slate-600">{formatFullCurrency(results.annualInvestment)}</span> ({salesAgents} agents × ${pricePerAgent}/mo × 12)
            </p>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={results.chartData} margin={{ top: 20, right: 40, left: 20, bottom: 40 }}>
                  <defs>
                    {/* Gradient fill for the area after break-even (profit zone) */}
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="period"
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={{ stroke: '#cbd5e1' }}
                    label={{ value: 'Months', position: 'bottom', offset: 0, fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => formatCurrency(value)}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={{ stroke: '#cbd5e1' }}
                    domain={[0, 'auto']}
                    label={{ value: 'Cumulative Value', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(value, name) => {
                      const labels = {
                        scenario1: '+1 Point Revenue',
                        scenario2: '+5 Points Revenue',
                        scenario3: '+10 Points Revenue',
                        cost: 'Annual Investment'
                      };
                      return [formatFullCurrency(value), labels[name] || name];
                    }}
                    labelFormatter={(label) => `Month ${label}`}
                  />

                  {/* Area fill under the +5 points curve */}
                  <Area
                    type="monotone"
                    dataKey="scenario2"
                    stroke="none"
                    fill="url(#profitGradient)"
                  />

                  {/* Annual Investment cost line (horizontal) */}
                  <ReferenceLine
                    y={results.annualInvestment}
                    stroke="rgba(234, 88, 12, 0.7)"
                    strokeWidth={3}
                    label={{
                      value: `Cost: ${formatFullCurrency(results.annualInvestment)}`,
                      position: 'insideTopRight',
                      fill: '#ea580c',
                      fontSize: 12,
                      fontWeight: 'bold'
                    }}
                  />

                  {/* Value curves for each scenario */}
                  <Line
                    type="monotone"
                    dataKey="scenario1"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: '#94a3b8' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="scenario2"
                    stroke="#475569"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: '#475569' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="scenario3"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: '#0ea5e9' }}
                  />

                  {/* Break-even point markers */}
                  {results.breakEvenPeriod1 !== null && results.breakEvenPeriod1 <= 12 && (
                    <ReferenceLine
                      x={results.breakEvenPeriod1}
                      stroke="#94a3b8"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />
                  )}
                  {results.breakEvenPeriod2 !== null && results.breakEvenPeriod2 <= 12 && (
                    <ReferenceLine
                      x={results.breakEvenPeriod2}
                      stroke="#475569"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      label={{
                        value: 'Payback',
                        position: 'top',
                        fill: '#475569',
                        fontSize: 12,
                        fontWeight: 'bold'
                      }}
                    />
                  )}
                  {results.breakEvenPeriod3 !== null && results.breakEvenPeriod3 <= 12 && (
                    <ReferenceLine
                      x={results.breakEvenPeriod3}
                      stroke="#0ea5e9"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 rounded" style={{ backgroundColor: '#94a3b8' }}></div>
                <span className="text-slate-500">+1 Point</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 rounded" style={{ backgroundColor: '#475569' }}></div>
                <span className="text-slate-500">+5 Points</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 rounded" style={{ backgroundColor: '#0ea5e9' }}></div>
                <span className="text-slate-500">+10 Points</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 rounded" style={{ backgroundColor: 'rgba(234, 88, 12, 0.7)' }}></div>
                <span className="text-slate-500">Annual Investment ({formatFullCurrency(results.annualInvestment)})</span>
              </div>
            </div>

            {/* Break-even summary */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-lg p-4 text-center border-2 border-slate-200">
                <p className="text-sm text-slate-500 mb-1">+1 Point Payback</p>
                <p className="font-bold text-slate-700 text-lg">
                  {results.breakEvenPeriod1 !== null ?
                    (results.breakEvenPeriod1 < 0.1 ? 'Immediate' : `${results.breakEvenPeriod1.toFixed(1)} mo`)
                    : 'N/A'}
                </p>
              </div>
              <div className="bg-slate-100 rounded-lg p-4 text-center border-2 border-slate-300">
                <p className="text-sm text-slate-500 mb-1">+5 Points Payback</p>
                <p className="font-bold text-slate-800 text-lg">
                  {results.breakEvenPeriod2 !== null ?
                    (results.breakEvenPeriod2 < 0.1 ? 'Immediate' : `${results.breakEvenPeriod2.toFixed(1)} mo`)
                    : 'N/A'}
                </p>
              </div>
              <div className="bg-sky-50 rounded-lg p-4 text-center border-2 border-sky-200">
                <p className="text-sm text-slate-500 mb-1">+10 Points Payback</p>
                <p className="font-bold text-sky-700 text-lg">
                  {results.breakEvenPeriod3 !== null ?
                    (results.breakEvenPeriod3 < 0.1 ? 'Immediate' : `${results.breakEvenPeriod3.toFixed(1)} mo`)
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}