'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ExpenseByCategorySummary } from '@/lib/types';
import { formatRupiah } from '@/lib/utils/currency';
import { EmptyState } from '@/components/ui/EmptyState';
import { PieChart as PieIcon } from 'lucide-react';

export interface ExpensePieChartProps {
  data: ExpenseByCategorySummary[];
  totalExpense: number;
}

const NEW_PALETTE_COLORS = [
  '#0A66C2', // LinkedIn Blue
  '#057642', // LinkedIn Green
  '#0073B1', // Professional Blue
  '#E7A33E', // Warm Gold
  '#2D6A6A', // Teal
  '#CC1016', // Alert Red
  '#5E8C6A', // Sage
  '#56687A', // Slate
];

export function ExpensePieChart({ data, totalExpense }: ExpensePieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    return () => observer.disconnect();
  }, []);

  if (!data || data.length === 0 || totalExpense === 0) {
    return (
      <EmptyState
        icon={PieIcon}
        title="Belum Ada Pengeluaran"
        description="Catat pengeluaran bulan ini untuk melihat grafik komposisi berdasarkan kategori."
      />
    );
  }

  const chartData = data.map((item, index) => ({
    name: item.categoryName,
    value: item.totalAmount,
    color: item.color || NEW_PALETTE_COLORS[index % NEW_PALETTE_COLORS.length],
    percentage: item.percentage,
    icon: item.categoryIcon,
    count: item.count,
  }));

  const activeItem = activeIndex !== null ? chartData[activeIndex] : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Chart Canvas */}
      <div className="relative w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={(_, index) => setActiveIndex(index)}
              cursor="pointer"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={isDark ? '#262B30' : '#FFFFFF'}
                  strokeWidth={2}
                  className="transition-all duration-200 hover:opacity-85"
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: unknown) => [formatRupiah(Number(value) || 0), 'Pengeluaran']}
              contentStyle={{
                backgroundColor: isDark ? '#262B30' : '#FFFFFF',
                borderColor: isDark ? '#3D4449' : '#D4D7DC',
                borderRadius: '16px',
                color: isDark ? '#E8E8E8' : '#191919',
                fontSize: '12px',
                boxShadow: isDark ? '0 8px 24px rgba(0, 0, 0, 0.4)' : '0 4px 16px rgba(0, 0, 0, 0.08)',
              }}
              itemStyle={{
                color: isDark ? '#E8E8E8' : '#191919',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Indicator (Donut Center) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          {activeItem ? (
            <>
              <span className="text-[11px] font-semibold text-text-secondary truncate max-w-[120px]">
                {activeItem.name}
              </span>
              <span className="text-base font-bold text-text-primary">
                {activeItem.percentage}%
              </span>
              <span className="text-[10px] text-text-muted">
                {formatRupiah(activeItem.value)}
              </span>
            </>
          ) : (
            <>
              <span className="text-[11px] font-semibold text-text-secondary">Total Keluar</span>
              <span className="text-sm sm:text-base font-bold text-danger">
                {formatRupiah(totalExpense)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Breakdown List */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-bold text-text-primary tracking-wide uppercase">
          Rincian Kategori
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {chartData.map((item, index) => {
            const isHovered = activeIndex === index;
            return (
              <div
                key={item.name}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isHovered
                    ? 'bg-primary/10 border-primary shadow-xs'
                    : 'bg-surface border-border/80 hover:bg-surface-alt/70'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-text-primary truncate">{item.name}</p>
                    <p className="text-[10px] text-text-secondary">{item.count} transaksi</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-text-primary">{formatRupiah(item.value)}</p>
                  <p className="text-[10px] font-semibold text-primary">{item.percentage}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
