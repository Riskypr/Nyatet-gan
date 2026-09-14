'use client';

import React, { useState } from 'react';
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
  '#C86446', // Primary
  '#4A6B53', // Secondary
  '#A84D32', // Tertiary
  '#2D2A26', // Neutral
  '#C98A3A', // Mustard
  '#3D7068', // Teal
  '#B0473C', // Clay red
  '#68635B', // Muted brown
];

export function ExpensePieChart({ data, totalExpense }: ExpensePieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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
                  stroke="#FAF7F2"
                  strokeWidth={2}
                  className="transition-all duration-200 hover:opacity-85"
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [formatRupiah(Number(value) || 0), 'Pengeluaran']}
              contentStyle={{
                backgroundColor: '#FAF7F2',
                borderColor: '#E5DCD0',
                borderRadius: '16px',
                color: '#2D2A26',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(45, 42, 38, 0.08)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Indicator (Donut Center) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          {activeItem ? (
            <>
              <span className="text-[11px] font-semibold text-[#68635B] truncate max-w-[120px]">
                {activeItem.name}
              </span>
              <span className="text-base font-bold text-[#2D2A26]">
                {activeItem.percentage}%
              </span>
              <span className="text-[10px] text-[#9E968B]">
                {formatRupiah(activeItem.value)}
              </span>
            </>
          ) : (
            <>
              <span className="text-[11px] font-semibold text-[#68635B]">Total Keluar</span>
              <span className="text-sm sm:text-base font-bold text-[#B0473C]">
                {formatRupiah(totalExpense)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Breakdown List */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-bold text-[#2D2A26] tracking-wide uppercase">
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
                    ? 'bg-[#FAF7F2] border-[#C86446]'
                    : 'bg-white border-[#E5DCD0]/70 hover:bg-[#FAF7F2]/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#2D2A26] truncate">{item.name}</p>
                    <p className="text-[10px] text-[#68635B]">{item.count} transaksi</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-[#2D2A26]">{formatRupiah(item.value)}</p>
                  <p className="text-[10px] font-semibold text-[#C86446]">{item.percentage}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
