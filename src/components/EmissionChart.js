// ─── EmissionChart.js ────────────────────────────────────────────
// Interactive charts using react-chartjs-2.
// Renders a doughnut chart for category breakdown and bar chart for comparison.
import React from 'react';
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { CATEGORY_LABELS, getCategoryColor } from '../utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const pluginDefaults = {
  legend: {
    display: true,
    position: 'bottom',
    labels: {
      color: '#9ca3af',
      padding: 20,
      font: { family: 'Inter', size: 12 },
      boxWidth: 14,
      usePointStyle: true,
    },
  },
  tooltip: {
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    titleColor: '#f9fafb',
    bodyColor: '#9ca3af',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    padding: 12,
    callbacks: {
      label: (ctx) => ` ${ctx.label}: ${ctx.parsed.toFixed(1)} kg CO₂`,
    },
  },
};

export function DoughnutChart({ breakdown }) {
  const labels   = Object.keys(breakdown).map((k) => CATEGORY_LABELS[k] || k);
  const data     = Object.values(breakdown);
  const colors   = Object.keys(breakdown).map(getCategoryColor);
  const total    = data.reduce((a, b) => a + b, 0);

  const chartData = {
    labels,
    datasets: [{
      data,
      backgroundColor: colors.map((c) => `${c}cc`),
      borderColor: colors,
      borderWidth: 2,
      hoverOffset: 8,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '68%',
    plugins: {
      ...pluginDefaults,
      // Center text plugin
    },
  };

  // Center text plugin
  const centerTextPlugin = {
    id: 'centerText',
    beforeDraw(chart) {
      const { ctx, chartArea: { left, right, top, bottom } } = chart;
      const cx = (left + right) / 2;
      const cy = (top + bottom) / 2;
      ctx.save();
      ctx.fillStyle = '#f9fafb';
      ctx.font = `bold 22px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${total.toFixed(0)}`, cx, cy - 10);
      ctx.font = `12px Inter, sans-serif`;
      ctx.fillStyle = '#9ca3af';
      ctx.fillText('kg CO₂/mo', cx, cy + 12);
      ctx.restore();
    },
  };

  return (
    <div style={{ position: 'relative', maxWidth: 340, margin: '0 auto' }}>
      <Doughnut data={chartData} options={options} plugins={[centerTextPlugin]} />
    </div>
  );
}

export function BarChart({ breakdown, compareBreakdown }) {
  const labels  = Object.keys(breakdown).map((k) => CATEGORY_LABELS[k] || k);
  const current = Object.values(breakdown);
  const colors  = Object.keys(breakdown).map(getCategoryColor);

  const datasets = [
    {
      label: 'Current',
      data: current,
      backgroundColor: colors.map((c) => `${c}99`),
      borderColor: colors,
      borderWidth: 2,
      borderRadius: 6,
    },
  ];

  if (compareBreakdown) {
    const compareColors = colors.map(() => 'rgba(59,130,246,0.5)');
    datasets.push({
      label: 'After Optimization',
      data: Object.values(compareBreakdown),
      backgroundColor: compareColors,
      borderColor: colors.map(() => '#3b82f6'),
      borderWidth: 2,
      borderRadius: 6,
    });
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      ...pluginDefaults,
      legend: {
        ...pluginDefaults.legend,
        display: !!compareBreakdown,
      },
      title: { display: false },
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af', font: { family: 'Inter', size: 11 } },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      y: {
        ticks: {
          color: '#9ca3af',
          font: { family: 'Inter', size: 11 },
          callback: (v) => `${v} kg`,
        },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
    },
  };

  return (
    <Bar
      data={{ labels, datasets }}
      options={options}
    />
  );
}
