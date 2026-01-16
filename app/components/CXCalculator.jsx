'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Area, ComposedChart } from 'recharts';

export default function CXCalculator() {
  const [pricePerAgent, setPricePerAgent] = useState(49);
  const [agentsUsingPlatform, setAgentsUsingPlatform] = useState(100);
  const [activeCustomers, setActiveCustomers] = useState(1000);
  const [churnRate, setChurnRate] = useState(20);
  const [avgRevenuePerCustomer, setAvgRevenuePerCustomer] = useState(5000);
  const [grossMargin, setGrossMargin] = useState(100);
  const [additionalCost, setAdditionalCost] = useState(0);

  const [results, setResults] = useState(null);

  useEffect(() => {
    calculateROI();
  }, [pricePerAgent, agentsUsingPlatform, activeCustomers, churnRate, avgRevenuePerCustomer, grossMargin, additionalCost]);

  const calculateROI = () => {
    // Current performance
    const annualInvestment = (pricePerAgent * agentsUsingPlatform * 12) + additionalCost;
    const marginMultiplier = grossMargin / 100;

    // Current churn impact
    const customersLostAnnually = Math.round(activeCustomers * (churnRate / 100));
    const totalAnnualChurnCost = customersLostAnnually * avgRevenuePerCustomer * marginMultiplier;

    // Scenario calculations - reducing churn by 5% and 10% (absolute percentage points)
    const scenarios = [
      { reduction: 5, label: '5% reduction' },
      { reduction: 10, label: '10% reduction' }
    ].map(scenario => {
      const newChurnRate = Math.max(0, churnRate - scenario.reduction);
      const newCustomersLost = Math.round(activeCustomers * (newChurnRate / 100));
      const customersRetained = customersLostAnnually - newCustomersLost;
      const retainedRevenue = customersRetained * avgRevenuePerCustomer * marginMultiplier;
      const netGain = retainedRevenue - annualInvestment;
      const roi = annualInvestment > 0 ? ((retainedRevenue - annualInvestment) / annualInvestment) * 100 : 0;
      const paybackPeriodMonths = retainedRevenue > 0 ? (annualInvestment / (retainedRevenue / 12)) : null;

      return {
        ...scenario,
        newChurnRate,
        customersRetained,
        retainedRevenue,
        netGain,
        roi,
        paybackPeriodMonths
      };
    });

    // Chart data for 12 month period - showing cumulative retained revenue vs annual investment cost
    const chartData = [];
    const periodCount = 12;

    for (let month = 0; month <= periodCount; month++) {
      // Cumulative retained revenue for each scenario - monthly
      const scenario1Value = (scenarios[0].retainedRevenue / 12) * month;
      const scenario2Value = (scenarios[1].retainedRevenue / 12) * month;

      chartData.push({
        period: month,
        scenario1: scenario1Value,
        scenario2: scenario2Value,
        cost: annualInvestment
      });
    }

    // Find break-even points for each scenario (in months)
    const breakEvenPeriod1 = scenarios[0].retainedRevenue > 0
      ? annualInvestment / (scenarios[0].retainedRevenue / 12)
      : null;
    const breakEvenPeriod2 = scenarios[1].retainedRevenue > 0
      ? annualInvestment / (scenarios[1].retainedRevenue / 12)
      : null;

    setResults({
      annualInvestment,
      customersLostAnnually,
      totalAnnualChurnCost,
      scenarios,
      chartData,
      breakEvenPeriod1,
      breakEvenPeriod2
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
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">CX Intelligence — ROI Calculator</h1>
              <p className="text-slate-500 mt-1">Estimate revenue retention from reducing customer churn vs. your investment.</p>
            </div>
            <div className="flex gap-6">
              <div className="text-right">
                <label className="text-slate-400 text-sm">Price per agent</label>
                <div className="flex items-baseline gap-1 mt-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-700">$</span>
                    <input
                      type="number"
                      value={pricePerAgent}
                      onChange={(e) => setPricePerAgent(Number(e.target.value) || 0)}
                      className="w-24 text-2xl font-bold text-slate-700 text-right border border-slate-300 rounded-lg py-1 px-3 pr-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <span className="text-slate-500">/month</span>
                </div>
              </div>
              <div className="text-right">
                <label className="text-slate-400 text-sm">Additional cost</label>
                <div className="flex items-baseline gap-1 mt-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-700">$</span>
                    <input
                      type="number"
                      value={additionalCost}
                      onChange={(e) => setAdditionalCost(Number(e.target.value) || 0)}
                      className="w-32 text-2xl font-bold text-slate-700 text-right border border-slate-300 rounded-lg py-1 px-3 pr-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <span className="text-slate-500">/year</span>
                </div>
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
                    Agents using platform
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={agentsUsingPlatform}
                      onChange={(e) => setAgentsUsingPlatform(Number(e.target.value) || 0)}
                      className="flex-1 border border-slate-300 rounded-lg py-3 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <span className="text-slate-500">agents</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Active customers
                  </label>
                  <input
                    type="number"
                    value={activeCustomers}
                    onChange={(e) => setActiveCustomers(Number(e.target.value) || 0)}
                    placeholder="e.g., 1000"
                    className="w-full border border-slate-300 rounded-lg py-3 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <div className="flex justify-between items-center">
                      <span>Annual churn rate</span>
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-bold">{formatPercent(churnRate)}</span>
                    </div>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    step="1"
                    value={churnRate}
                    onChange={(e) => setChurnRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-sm text-slate-400 mt-1">
                    <span>1%</span>
                    <span>60%</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    The percentage of customers who cancel or don't renew annually.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Avg. annual revenue per customer
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={avgRevenuePerCustomer}
                      onChange={(e) => setAvgRevenuePerCustomer(Number(e.target.value) || 0)}
                      className="w-full border border-slate-300 rounded-lg py-3 pl-8 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <div className="flex justify-between items-center">
                      <span>Gross margin</span>
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-bold">{formatPercent(grossMargin)}</span>
                    </div>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={grossMargin}
                    onChange={(e) => setGrossMargin(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-500"
                  />
                  <div className="flex justify-between text-sm text-slate-400 mt-1">
                    <span>10%</span>
                    <span>100%</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    Optional: Apply gross margin to calculate net revenue impact.
                  </p>
                </div>
              </div>
            </div>

            {/* How churn reduction is modeled */}
            <div className="bg-emerald-50 rounded-xl p-6">
              <h3 className="font-bold text-slate-800 mb-2">How churn reduction is modeled</h3>
              <p className="text-slate-600 text-sm">
                Scenarios reduce your churn rate by <span className="font-semibold">percentage points</span>: 5% and 10%. Example: {formatPercent(churnRate)} → {formatPercent(Math.max(0, churnRate - 5))} (5% reduction), {formatPercent(Math.max(0, churnRate - 10))} (10% reduction).
              </p>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Current Performance */}
            {results && (
              <>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-800 mb-4">Your Current Situation</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Customers lost annually</span>
                      <span className="font-bold text-slate-800">{results.customersLostAnnually.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Annual churn cost</span>
                      <span className="font-bold text-red-600 text-xl">{formatFullCurrency(results.totalAnnualChurnCost)}</span>
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
                      index === 0 ? 'bg-emerald-600 border-emerald-400' :
                      'bg-emerald-700 border-emerald-500'
                    }`}
                  >
                    <h3 className="font-bold text-white mb-3">Scenario: {scenario.label}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-200">New churn rate</span>
                        <span className="font-bold text-white">{formatPercent(scenario.newChurnRate)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-200">Customers retained</span>
                        <span className="font-bold text-white">{scenario.customersRetained.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-200">Retained revenue</span>
                        <span className="font-bold text-white">{formatFullCurrency(scenario.retainedRevenue)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-200">ROI</span>
                        <span className={`font-bold text-xl ${scenario.roi >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{Math.round(scenario.roi).toLocaleString()}%</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Net Gain Impact */}
                <div className="bg-slate-800 rounded-xl p-6 text-center">
                  <h3 className="font-bold text-emerald-300 mb-2">Net Gain After Investment</h3>
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {formatFullCurrency(results.scenarios[0].netGain)} –<br/>{formatFullCurrency(results.scenarios[1].netGain)}
                  </div>
                  <p className="text-slate-400 mt-2 text-sm">
                    Range of net gain (from 5% to 10% churn reduction)
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
              Shows when cumulative retained revenue from reduced churn pays back the annual investment of <span className="font-semibold text-slate-600">{formatFullCurrency(results.annualInvestment)}</span> ({agentsUsingPlatform} agents x ${pricePerAgent}/mo x 12{additionalCost > 0 ? ` + ${formatFullCurrency(additionalCost)} additional` : ''})
            </p>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={results.chartData} margin={{ top: 20, right: 40, left: 20, bottom: 40 }}>
                  <defs>
                    {/* Gradient fill for the area after break-even (profit zone) */}
                    <linearGradient id="profitGradientCX" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.05}/>
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
                        scenario1: '5% Reduction Revenue',
                        scenario2: '10% Reduction Revenue',
                        cost: 'Annual Investment'
                      };
                      return [formatFullCurrency(value), labels[name] || name];
                    }}
                    labelFormatter={(label) => `Month ${label}`}
                  />

                  {/* Area fill under the 10% reduction curve */}
                  <Area
                    type="monotone"
                    dataKey="scenario2"
                    stroke="none"
                    fill="url(#profitGradientCX)"
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
                    stroke="#6ee7b7"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: '#6ee7b7' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="scenario2"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: '#059669' }}
                  />

                  {/* Break-even point markers */}
                  {results.breakEvenPeriod1 !== null && results.breakEvenPeriod1 <= 12 && (
                    <ReferenceLine
                      x={results.breakEvenPeriod1}
                      stroke="#6ee7b7"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />
                  )}
                  {results.breakEvenPeriod2 !== null && results.breakEvenPeriod2 <= 12 && (
                    <ReferenceLine
                      x={results.breakEvenPeriod2}
                      stroke="#059669"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      label={{
                        value: 'Payback',
                        position: 'top',
                        fill: '#059669',
                        fontSize: 12,
                        fontWeight: 'bold'
                      }}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 rounded" style={{ backgroundColor: '#6ee7b7' }}></div>
                <span className="text-slate-500">5% Churn Reduction</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 rounded" style={{ backgroundColor: '#059669' }}></div>
                <span className="text-slate-500">10% Churn Reduction</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 rounded" style={{ backgroundColor: 'rgba(234, 88, 12, 0.7)' }}></div>
                <span className="text-slate-500">Annual Investment ({formatFullCurrency(results.annualInvestment)})</span>
              </div>
            </div>

            {/* Break-even summary */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-lg p-4 text-center border-2 border-emerald-200">
                <p className="text-sm text-slate-500 mb-1">5% Reduction Payback</p>
                <p className="font-bold text-emerald-700 text-lg">
                  {results.breakEvenPeriod1 !== null ?
                    (results.breakEvenPeriod1 < 0.1 ? 'Immediate' :
                     results.breakEvenPeriod1 > 12 ? '12+ mo' :
                     `${results.breakEvenPeriod1.toFixed(1)} mo`)
                    : 'N/A'}
                </p>
              </div>
              <div className="bg-emerald-100 rounded-lg p-4 text-center border-2 border-emerald-300">
                <p className="text-sm text-slate-500 mb-1">10% Reduction Payback</p>
                <p className="font-bold text-emerald-800 text-lg">
                  {results.breakEvenPeriod2 !== null ?
                    (results.breakEvenPeriod2 < 0.1 ? 'Immediate' :
                     results.breakEvenPeriod2 > 12 ? '12+ mo' :
                     `${results.breakEvenPeriod2.toFixed(1)} mo`)
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
