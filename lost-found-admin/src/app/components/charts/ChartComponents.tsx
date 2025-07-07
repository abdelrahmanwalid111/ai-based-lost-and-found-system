"use client";

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
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { useTheme } from '@/contexts/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ title, children, className = '' }) => {
  const { colors } = useTheme();
  
  return (
    <div 
      className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm ${className}`}
      style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        boxShadow: colors.shadow,
      }}
    >
      <h3 
        className="text-lg font-semibold mb-4"
        style={{ color: colors.textPrimary }}
      >
        {title}
      </h3>
      <div className="h-80">
        {children}
      </div>
    </div>
  );
};

interface LineChartProps {
  data: any[];
  xKey: string;
  yKeys: { key: string; label: string; color: string }[];
  title: string;
}

export const LineChart: React.FC<LineChartProps> = ({ data, xKey, yKeys, title }) => {
  const { theme } = useTheme();
  
  const chartData = {
    labels: data.map(item => item[xKey]),
    datasets: yKeys.map(yKey => ({
      label: yKey.label,
      data: data.map(item => item[yKey.key]),
      borderColor: yKey.color,
      backgroundColor: yKey.color + '20',
      tension: 0.4,
      fill: false,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme === 'dark' ? '#e2e8f0' : '#374151',
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: theme === 'dark' ? '#94a3b8' : '#6b7280',
        },
        grid: {
          color: theme === 'dark' ? '#334155' : '#e5e7eb',
        },
      },
      y: {
        ticks: {
          color: theme === 'dark' ? '#94a3b8' : '#6b7280',
        },
        grid: {
          color: theme === 'dark' ? '#334155' : '#e5e7eb',
        },
      },
    },
  };

  return (
    <ChartContainer title={title}>
      <Line data={chartData} options={options} />
    </ChartContainer>
  );
};

interface BarChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  title: string;
  color?: string;
}

export const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  xKey, 
  yKey, 
  title, 
  color = '#3b82f6' 
}) => {
  const { theme } = useTheme();
  
  const chartData = {
    labels: data.map(item => item[xKey]),
    datasets: [
      {
        label: 'Count',
        data: data.map(item => item[yKey]),
        backgroundColor: color + '80',
        borderColor: color,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: theme === 'dark' ? '#94a3b8' : '#6b7280',
          maxRotation: 45,
        },
        grid: {
          color: theme === 'dark' ? '#334155' : '#e5e7eb',
        },
      },
      y: {
        ticks: {
          color: theme === 'dark' ? '#94a3b8' : '#6b7280',
        },
        grid: {
          color: theme === 'dark' ? '#334155' : '#e5e7eb',
        },
      },
    },
  };

  return (
    <ChartContainer title={title}>
      <Bar data={chartData} options={options} />
    </ChartContainer>
  );
};

interface PieChartProps {
  data: { name: string; value: number; color: string }[];
  title: string;
  type?: 'pie' | 'doughnut';
}

export const PieChart: React.FC<PieChartProps> = ({ data, title, type = 'doughnut' }) => {
  const { theme } = useTheme();
  
  // Ensure we show all data, even zero values, but with a minimum value for visibility
  const processedData = data.map(item => ({
    ...item,
    value: item.value === 0 ? 0.1 : item.value // Show tiny slice for zero values
  }));
  
  const chartData = {
    labels: data.map(item => `${item.name} (${item.value})`), // Show actual values in labels
    datasets: [
      {
        data: processedData.map(item => item.value),
        backgroundColor: data.map(item => item.color + '80'),
        borderColor: data.map(item => item.color),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: theme === 'dark' ? '#e2e8f0' : '#374151',
          padding: 20,
          usePointStyle: true,
          generateLabels: (chart: any) => {
            const original = ChartJS.defaults.plugins.legend.labels.generateLabels;
            const labels = original.call(this, chart);
            
            // Customize labels to show actual values
            labels.forEach((label: any, index: number) => {
              const actualValue = data[index]?.value || 0;
              label.text = `${data[index]?.name}: ${actualValue}`;
            });
            
            return labels;
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const dataIndex = context.dataIndex;
            const actualValue = data[dataIndex]?.value || 0;
            const name = data[dataIndex]?.name || '';
            return `${name}: ${actualValue}`;
          }
        }
      }
    },
  };

  const ChartComponent = type === 'pie' ? Pie : Doughnut;

  return (
    <ChartContainer title={title}>
      <ChartComponent data={chartData} options={options} />
    </ChartContainer>
  );
};

interface TrendChartProps {
  monthlyData: any[];
  title: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ monthlyData, title }) => {
  const { theme } = useTheme();
  
  // Format the data for display
  const formattedData = monthlyData.map(item => ({
    month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    lost: item.lostCount || 0,
    found: item.foundCount || 0,
    total: item.totalCount || 0,
  }));

  const chartData = {
    labels: formattedData.map(item => {
      const [year, month] = item.month.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }),
    datasets: [
      {
        label: 'Lost Items',
        data: formattedData.map(item => item.lost),
        borderColor: '#ef4444',
        backgroundColor: '#ef444420',
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Found Items',
        data: formattedData.map(item => item.found),
        borderColor: '#22c55e',
        backgroundColor: '#22c55e20',
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Total Reports',
        data: formattedData.map(item => item.total),
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f620',
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme === 'dark' ? '#e2e8f0' : '#374151',
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: theme === 'dark' ? '#94a3b8' : '#6b7280',
        },
        grid: {
          color: theme === 'dark' ? '#334155' : '#e5e7eb',
        },
      },
      y: {
        ticks: {
          color: theme === 'dark' ? '#94a3b8' : '#6b7280',
        },
        grid: {
          color: theme === 'dark' ? '#334155' : '#e5e7eb',
        },
      },
    },
  };

  return (
    <ChartContainer title={title}>
      <Line data={chartData} options={options} />
    </ChartContainer>
  );
}; 