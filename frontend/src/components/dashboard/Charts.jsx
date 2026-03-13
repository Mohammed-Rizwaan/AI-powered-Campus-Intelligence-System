import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#94a3b8',
        font: { family: 'Inter', size: 12 },
        usePointStyle: true,
        padding: 20,
      },
    },
    tooltip: {
      backgroundColor: '#12121a',
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      padding: 12,
      displayColors: true,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.02)' },
      ticks: { color: '#64748b' },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.02)' },
      ticks: { color: '#64748b' },
    },
  },
};

export function RiskDoughnut({ data }) {
  if (!data) return null;
  const chartData = {
    labels: data.labels,
    datasets: [{
      data: data.data,
      backgroundColor: ['#10b981', '#f59e0b', '#f97316', '#ef4444'],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };
  return <Doughnut data={chartData} options={commonOptions} />;
}

function normalizeSeries(input) {
  if (!input) return null;

  // Preferred shape: { labels: string[], data: number[] }
  if (Array.isArray(input?.labels) && Array.isArray(input?.data)) {
    return { labels: input.labels, data: input.data };
  }

  // Accept arrays (common API variants in demos).
  if (Array.isArray(input)) {
    // Array of numbers
    if (input.every((v) => typeof v === 'number')) {
      return { labels: input.map((_, i) => `${i + 1}`), data: input };
    }

    // Array of objects; try common keys.
    const labels = input.map((p, i) => {
      const v = p?.label ?? p?.date ?? p?.day ?? p?.x ?? p?.name;
      return v != null ? String(v) : `${i + 1}`;
    });
    const data = input.map((p) => {
      const v = p?.value ?? p?.score ?? p?.risk_score ?? p?.mood_score ?? p?.y;
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    });
    return { labels, data };
  }

  return null;
}

export function TrendLine({ data, label, color = '#3b82f6' }) {
  const series = normalizeSeries(data);
  if (!series) return null;
  const chartData = {
    labels: series.labels,
    datasets: [{
      label: label,
      data: series.data,
      borderColor: color,
      backgroundColor: `${color}20`,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: color,
    }],
  };
  return <Line data={chartData} options={commonOptions} />;
}

export function ResourceBar({ data, label, color = '#06b6d4' }) {
  if (!data) return null;
  const chartData = {
    labels: data.labels,
    datasets: [{
      label: label,
      data: data.data,
      backgroundColor: color,
      borderRadius: 8,
      barThickness: 30,
    }],
  };
  return <Bar data={chartData} options={commonOptions} />;
}
