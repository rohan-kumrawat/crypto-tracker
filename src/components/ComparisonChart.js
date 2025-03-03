import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const ComparisonChart = ({ selectedCryptos, timeRange, currency }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current && selectedCryptos.length > 0) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      const isDarkMode = document.documentElement.classList.contains('dark');
      
      // Chart configuration
      const chartConfig = {
        type: 'bar',
        data: {
          labels: ['Current Price', '% Change', 'Market Cap (B)', 'Volume (B)'],
          datasets: selectedCryptos.map((crypto, index) => ({
            label: crypto.name,
            data: [
              crypto.current_price,
              crypto[timeRange === '1h' ? 'price_change_percentage_1h_in_currency' : 
                timeRange === '7d' ? 'price_change_percentage_7d_in_currency' :
                'price_change_percentage_24h_in_currency'],
              crypto.market_cap / 1e9,
              crypto.total_volume / 1e9
            ],
            backgroundColor: [
              'rgba(93, 92, 222, 0.8)',
              'rgba(255, 99, 132, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(255, 206, 86, 0.8)'
            ][index % 4],
            borderColor: [
              'rgba(93, 92, 222, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(255, 206, 86, 1)'
            ][index % 4],
            borderWidth: 1
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              ticks: { color: isDarkMode ? '#E5E7EB' : '#374151' },
              grid: { color: isDarkMode ? 'rgba(229, 231, 235, 0.1)' : 'rgba(107, 114, 128, 0.1)' }
            },
            x: {
              ticks: { color: isDarkMode ? '#E5E7EB' : '#374151' },
              grid: { color: isDarkMode ? 'rgba(229, 231, 235, 0.1)' : 'rgba(107, 114, 128, 0.1)' }
            }
          },
          plugins: {
            legend: { labels: { color: isDarkMode ? '#E5E7EB' : '#374151' } },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y;
                  if (context.label === 'Current Price') return `${label}: ₹${value.toFixed(2)}`;
                  if (context.label === '% Change') return `${label}: ${value.toFixed(2)}%`;
                  return `${label}: ${value.toFixed(2)}B`;
                }
              }
            }
          }
        }
      };

      chartInstance.current = new Chart(ctx, chartConfig);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [selectedCryptos, timeRange, currency]);

  return (
    <div className="mt-4 mb-8 h-64 sm:h-80 w-full">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default ComparisonChart;