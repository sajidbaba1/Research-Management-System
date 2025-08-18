import React, { useEffect, useMemo, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

interface AnalyticsData {
  id: number;
  projectTitle: string;
  completionRate: number;
  durationDays: number;
  actualDurationDays: number;
  onTimeCompletion: boolean;
  calculatedDate: string;
  project?: {
    title: string;
  };
}

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Advanced analytics controls
  const [mcRuns, setMcRuns] = useState(2000); // Monte Carlo iterations
  const [uncertaintyFactor, setUncertaintyFactor] = useState(1.0); // scales pessimistic bound
  const [capacityBufferPct, setCapacityBufferPct] = useState(0); // buffer on durations
  const [forecastHorizon, setForecastHorizon] = useState(30); // days
  const [ewmaAlpha, setEwmaAlpha] = useState(0.3);
  const [holtAlpha, setHoltAlpha] = useState(0.3);
  const [holtBeta, setHoltBeta] = useState(0.1);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const data = await response.json();
      setAnalytics(data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
      setAnalytics([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/analytics/calculate-all', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to calculate analytics');
      }
      await fetchAnalytics(); // Refresh data after calculation
    } catch (error) {
      console.error('Error calculating analytics:', error);
      setError('Failed to calculate analytics');
    } finally {
      setLoading(false);
    }
  };

  // Advanced analytics computations (must be declared before any early return)
  const advanced = useMemo(() => {
    const day = 1;
    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
    const safeNum = (v: any, d = 0) => (Number.isFinite(v) ? Number(v) : d);

    const items = Array.isArray(analytics) ? analytics : [];
    const planned = items.map(a => Math.max(1, safeNum(a.durationDays, 1)));
    const actual = items.map(a => Math.max(1, safeNum(a.actualDurationDays, safeNum(a.durationDays, 1))));
    const completion = items.map(a => clamp(safeNum(a.completionRate, 0) / 100, 0, 1));

    // PERT parameters per project
    const mDur = actual.map((v, i) => (v || planned[i] || 1));
    const oDur = mDur.map(m => Math.max(day, 0.85 * m));
    const pDur = mDur.map(m => Math.max(oDur[0], 1.25 * m * clamp(uncertaintyFactor, 0.5, 2.0)));
    const variances = mDur.map((_, i) => Math.pow(((pDur[i] - oDur[i]) / 6), 2));

    // Monte Carlo portfolio sum
    const runs = clamp(mcRuns, 100, 20000);
    const triSample = (o: number, m: number, p: number) => {
      const F = (m - o) / (p - o);
      const u = Math.random();
      if (u < F) return o + Math.sqrt(u * (p - o) * (m - o));
      return p - Math.sqrt((1 - u) * (p - o) * (p - m));
    };
    const totals: number[] = [];
    for (let r = 0; r < runs; r++) {
      let sum = 0;
      for (let i = 0; i < mDur.length; i++) {
        const dur = triSample(oDur[i], mDur[i], pDur[i]) * (1 + capacityBufferPct / 100);
        sum += dur;
      }
      totals.push(sum);
    }
    totals.sort((a, b) => a - b);
    const mean = totals.reduce((a, b) => a + b, 0) / Math.max(1, totals.length);
    const std = Math.sqrt(Math.max(0, totals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / Math.max(1, totals.length - 1)));
    const q = (p: number) => totals[Math.min(totals.length - 1, Math.max(0, Math.floor((totals.length - 1) * p)))]
    const p50 = q(0.5), p80 = q(0.8), p90 = q(0.9);
    const plannedTotal = planned.reduce((a, b) => a + b, 0);
    const onTimeVsPlan = totals.filter(v => v <= plannedTotal).length / Math.max(1, totals.length);

    // Histogram
    const bins = 20;
    const minV = totals[0] ?? 0;
    const maxV = totals[totals.length - 1] ?? 0;
    const binWidth = (maxV - minV) / Math.max(1, bins);
    const histCounts = new Array(bins).fill(0);
    const histLabels: string[] = [];
    for (let i = 0; i < bins; i++) {
      const lo = minV + i * binWidth;
      const hi = lo + binWidth;
      histLabels.push(`${Math.round(lo)}-${Math.round(hi)}`);
    }
    totals.forEach(v => {
      const idx = Math.min(bins - 1, Math.max(0, Math.floor((v - minV) / Math.max(binWidth, 1e-6))));
      histCounts[idx]++;
    });

    // Risk ranking
    const riskRows = items.map((a, i) => {
      const plan = planned[i];
      const act = actual[i];
      const overrun = plan > 0 ? act / plan : 1;
      const incomplete = 1 - completion[i];
      const varDays = Math.sqrt(Math.max(0, variances[i]));
      const score = 0.6 * overrun + 0.3 * incomplete + 0.1 * (varDays / Math.max(1, plan));
      return { projectTitle: a.projectTitle || a.project?.title || `Project ${i+1}`, overrun, completion: completion[i], varianceDays: varDays, score };
    }).sort((a, b) => b.score - a.score).slice(0, 5);

    // Progress time series and Holt forecast
    const byDate = new Map<string, number[]>();
    items.forEach(a => {
      const d = a.calculatedDate ? String(a.calculatedDate).slice(0, 10) : 'N/A';
      if (!byDate.has(d)) byDate.set(d, []);
      byDate.get(d)!.push(clamp(safeNum(a.completionRate, 0) / 100, 0, 1));
    });
    const series = Array.from(byDate.entries())
      .filter(([d]) => d !== 'N/A')
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([d, arr]) => ({ date: d, value: arr.reduce((x, y) => x + y, 0) / arr.length }));
    const histValues = series.map(s => s.value);

    const ewma = (arr: number[], alpha: number) => {
      if (!arr.length) return [] as number[];
      const out: number[] = [arr[0]];
      for (let i = 1; i < arr.length; i++) out.push(alpha * arr[i] + (1 - alpha) * out[i - 1]);
      return out;
    };
    const holt = (arr: number[], alpha: number, beta: number, h: number) => {
      if (arr.length < 2) return { fit: arr.slice(), forecast: Array(h).fill(arr[arr.length - 1] || 0) };
      let l = arr[0];
      let b = arr[1] - arr[0];
      const fit = [l];
      for (let t = 1; t < arr.length; t++) {
        const prevL = l;
        l = alpha * arr[t] + (1 - alpha) * (l + b);
        b = beta * (l - prevL) + (1 - beta) * b;
        fit.push(l + b);
      }
      const f: number[] = [];
      for (let k = 1; k <= h; k++) f.push(l + k * b);
      return { fit, forecast: f };
    };

    const ew = ewma(histValues, clamp(ewmaAlpha, 0.01, 0.99));
    const holtRes = holt(histValues, clamp(holtAlpha, 0.01, 0.99), clamp(holtBeta, 0.01, 0.99), clamp(forecastHorizon, 1, 120));
    const residuals = histValues.slice(-holtRes.fit.length).map((v, i) => v - holtRes.fit[i]);
    const residStd = residuals.length > 1 ? Math.sqrt(residuals.reduce((a, b) => a + b * b, 0) / (residuals.length - 1)) : 0;
    const ciLo = holtRes.forecast.map(v => Math.max(0, v - 1.96 * residStd));
    const ciHi = holtRes.forecast.map(v => Math.min(1, v + 1.96 * residStd));

    return {
      mc: { runs, mean, std, p50, p80, p90, plannedTotal, onTimeVsPlan, hist: { labels: histLabels, counts: histCounts } },
      pert: { oDur, mDur, pDur, variances },
      riskTop: riskRows,
      progress: { series, ewma: ew, holt: holtRes, ciLo, ciHi },
    };
  }, [analytics, mcRuns, uncertaintyFactor, capacityBufferPct, forecastHorizon, ewmaAlpha, holtAlpha, holtBeta]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={calculateAnalytics}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Calculate Analytics
          </button>
        </div>
      </div>
    );
  }

  if (!analytics || analytics.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-600">No analytics data available</p>
          <button 
            onClick={calculateAnalytics}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Calculate Analytics
          </button>
        </div>
      </div>
    );
  }

  const projectStatusData = {
    labels: analytics.map(a => a.projectTitle || a.project?.title || 'Unknown Project'),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: analytics.map(a => Math.max(0, Math.min(100, a.completionRate || 0))),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const completedCount = analytics.filter(a => (a.completionRate || 0) >= 100).length;
  const inProgressCount = analytics.filter(a => (a.completionRate || 0) > 0 && (a.completionRate || 0) < 100).length;
  const pendingCount = analytics.filter(a => (a.completionRate || 0) === 0).length;

  const statusDistribution = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [
      {
        data: [completedCount, inProgressCount, pendingCount],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderWidth: 2,
      },
    ],
  };

  const progressOverTime = {
    labels: analytics.map(a => a.projectTitle || a.project?.title || 'Unknown Project'),
    datasets: [
      {
        label: 'Progress Over Time',
        data: analytics.map(a => Math.max(0, Math.min(100, a.completionRate || 0))),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return context.dataset.label + ': ' + Math.round(context.raw) + '%';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          }
        }
      }
    }
  };

  const exportMonteCarloCSV = () => {
    const rows = [
      ['runs','meanDays','stdDays','p50Days','p80Days','p90Days','plannedTotalDays','onTimeVsPlan'].join(','),
      [advanced.mc.runs, advanced.mc.mean.toFixed(3), advanced.mc.std.toFixed(3), advanced.mc.p50.toFixed(3), advanced.mc.p80.toFixed(3), advanced.mc.p90.toFixed(3), advanced.mc.plannedTotal.toFixed(3), advanced.mc.onTimeVsPlan.toFixed(4)].join(',')
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'monte_carlo_summary.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportForecastCSV = () => {
    const headers = ['step','holt','ciLo','ciHi'];
    const rows = [headers.join(',')];
    for (let i = 0; i < (advanced.progress.holt.forecast.length || 0); i++) {
      rows.push([String(i+1), advanced.progress.holt.forecast[i].toFixed(4), advanced.progress.ciLo[i].toFixed(4), advanced.progress.ciHi[i].toFixed(4)].join(','));
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'forecast.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <button 
          onClick={calculateAnalytics}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Calculating...' : 'Refresh Analytics'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Project Completion Rates</h2>
          <div className="h-64">
            <Bar data={projectStatusData} options={chartOptions} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Status Distribution</h2>
          <div className="h-64">
            <Doughnut data={statusDistribution} options={chartOptions} />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Progress Over Time</h2>
        <div className="h-64">
          <Line data={progressOverTime} options={chartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-green-600">Completed</h3>
          <p className="text-2xl font-bold">{completedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-yellow-600">In Progress</h3>
          <p className="text-2xl font-bold">{inProgressCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-red-600">Pending</h3>
          <p className="text-2xl font-bold">{pendingCount}</p>
        </div>
      </div>

      {/* Advanced Analytics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Advanced Analytics</h2>
          <div className="flex gap-2">
            <button onClick={exportMonteCarloCSV} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm">Export MC CSV</button>
            <button onClick={exportForecastCSV} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm">Export Forecast CSV</button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded p-4">
            <h3 className="font-semibold mb-2">Controls</h3>
            <div className="space-y-2 text-sm">
              <label className="flex items-center justify-between gap-2"><span>Monte Carlo Runs</span><input type="number" min={100} max={20000} value={mcRuns} onChange={e=>setMcRuns(Number(e.target.value))} className="border rounded px-2 py-1 w-28"/></label>
              <label className="flex items-center justify-between gap-2"><span>Uncertainty Factor</span><input type="number" step={0.1} min={0.5} max={2} value={uncertaintyFactor} onChange={e=>setUncertaintyFactor(Number(e.target.value))} className="border rounded px-2 py-1 w-28"/></label>
              <label className="flex items-center justify-between gap-2"><span>Capacity Buffer %</span><input type="number" step={1} min={-20} max={200} value={capacityBufferPct} onChange={e=>setCapacityBufferPct(Number(e.target.value))} className="border rounded px-2 py-1 w-28"/></label>
              <label className="flex items-center justify-between gap-2"><span>Forecast Horizon (days)</span><input type="number" min={1} max={120} value={forecastHorizon} onChange={e=>setForecastHorizon(Number(e.target.value))} className="border rounded px-2 py-1 w-28"/></label>
              <label className="flex items-center justify-between gap-2"><span>EWMA α</span><input type="number" step={0.05} min={0.01} max={0.99} value={ewmaAlpha} onChange={e=>setEwmaAlpha(Number(e.target.value))} className="border rounded px-2 py-1 w-28"/></label>
              <label className="flex items-center justify-between gap-2"><span>Holt α</span><input type="number" step={0.05} min={0.01} max={0.99} value={holtAlpha} onChange={e=>setHoltAlpha(Number(e.target.value))} className="border rounded px-2 py-1 w-28"/></label>
              <label className="flex items-center justify-between gap-2"><span>Holt β</span><input type="number" step={0.05} min={0.01} max={0.99} value={holtBeta} onChange={e=>setHoltBeta(Number(e.target.value))} className="border rounded px-2 py-1 w-28"/></label>
            </div>
          </div>
          <div className="bg-gray-50 rounded p-4">
            <h3 className="font-semibold mb-2">Monte Carlo (Portfolio Days)</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><div className="text-gray-500">P50</div><div className="font-semibold">{advanced.mc.p50.toFixed(1)} d</div></div>
              <div><div className="text-gray-500">P80</div><div className="font-semibold">{advanced.mc.p80.toFixed(1)} d</div></div>
              <div><div className="text-gray-500">P90</div><div className="font-semibold">{advanced.mc.p90.toFixed(1)} d</div></div>
              <div><div className="text-gray-500">Mean ± Std</div><div className="font-semibold">{advanced.mc.mean.toFixed(1)} ± {advanced.mc.std.toFixed(1)} d</div></div>
              <div><div className="text-gray-500">Planned Total</div><div className="font-semibold">{advanced.mc.plannedTotal.toFixed(1)} d</div></div>
              <div><div className="text-gray-500">On-time vs Plan</div><div className="font-semibold">{(advanced.mc.onTimeVsPlan*100).toFixed(1)}%</div></div>
            </div>
            <div className="h-40 mt-3">
              <Bar data={{
                labels: advanced.mc.hist.labels,
                datasets: [{ label: 'Simulated Total Days (freq)', data: advanced.mc.hist.counts, backgroundColor: 'rgba(99,102,241,0.7)' }]
              }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>
          <div className="bg-gray-50 rounded p-4">
            <h3 className="font-semibold mb-2">Top Risk Projects</h3>
            <div className="text-xs text-gray-600 mb-2">Score combines overrun, incompletion, and uncertainty.</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-1 pr-2">Project</th>
                    <th className="py-1 pr-2">Overrun</th>
                    <th className="py-1 pr-2">Done</th>
                    <th className="py-1 pr-2">σ (days)</th>
                    <th className="py-1 pr-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {advanced.riskTop.map((r, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="py-1 pr-2">{r.projectTitle}</td>
                      <td className="py-1 pr-2">{r.overrun.toFixed(2)}x</td>
                      <td className="py-1 pr-2">{(r.completion*100).toFixed(0)}%</td>
                      <td className="py-1 pr-2">{r.varianceDays.toFixed(2)}</td>
                      <td className="py-1 pr-2">{r.score.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Portfolio Progress Forecast</h3>
          <div className="h-56">
            <Line data={{
              labels: [
                ...advanced.progress.series.map(s => s.date),
                ...advanced.progress.holt.forecast.map((_, i) => `+${i+1}`)
              ],
              datasets: [
                { label: 'Observed avg completion', data: advanced.progress.series.map(s => Math.round(s.value*100)), borderColor: 'rgb(59,130,246)', backgroundColor: 'rgba(59,130,246,0.15)', tension: 0.3 },
                { label: 'Holt forecast', data: [
                    ...advanced.progress.series.map(s => Math.round(s.value*100)),
                    ...advanced.progress.holt.forecast.map(v => Math.round(v*100))
                  ], borderColor: 'rgb(16,185,129)', backgroundColor: 'rgba(16,185,129,0.15)', borderDash: [6,4], tension: 0.3 },
                { label: 'CI Low', data: [
                    ...new Array(advanced.progress.series.length).fill(null),
                    ...advanced.progress.ciLo.map(v => Math.round(v*100))
                  ], borderColor: 'rgba(107,114,128,0.7)', borderDash: [2,2], pointRadius: 0, fill: false },
                { label: 'CI High', data: [
                    ...new Array(advanced.progress.series.length).fill(null),
                    ...advanced.progress.ciHi.map(v => Math.round(v*100))
                  ], borderColor: 'rgba(107,114,128,0.7)', borderDash: [2,2], pointRadius: 0, fill: false }
              ]
            }} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } } }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
