import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

const PALETTE = ['#1a56db', '#147d4b', '#d9a033', '#8b7bd8', '#38bdf8', '#e11d48', '#0ea576', '#b45309'];

export function useChartTheme() {
  const { resolved } = useTheme();
  return {
    grid: resolved === 'dark' ? '#1e293b' : '#e2e8f0',
    tick: resolved === 'dark' ? '#94a3b8' : '#64748b',
    tooltip: { backgroundColor: resolved === 'dark' ? '#0f172a' : '#fff', border: '1px solid ' + (resolved === 'dark' ? '#334155' : '#e2e8f0'), borderRadius: 12, color: resolved === 'dark' ? '#e2e8f0' : '#0f172a' },
  };
}

export function SimpleBar({ data, xKey, yKey, color = '#1a56db', height = 280, layout = 'vertical', stacked = false, dataKeys }: any) {
  const t = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={layout} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={t.grid} horizontal={layout === 'vertical'} vertical={layout !== 'vertical'} />
        {layout === 'vertical' ? (
          <>
            <XAxis type="number" tick={{ fill: t.tick, fontSize: 12 }} />
            <YAxis type="category" dataKey={yKey} width={110} tick={{ fill: t.tick, fontSize: 12 }} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fill: t.tick, fontSize: 12 }} />
            <YAxis tick={{ fill: t.tick, fontSize: 12 }} />
          </>
        )}
        <Tooltip contentStyle={t.tooltip} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
        {stacked && dataKeys ? (
          dataKeys.map((k: string, i: number) => <Bar key={k} dataKey={k} stackId="a" fill={PALETTE[i % PALETTE.length]} radius={[0, 0, 0, 0]} />)
        ) : (
          <Bar dataKey={xKey || 'value'} fill={color} radius={[0, 8, 8, 0]} maxBarSize={26} />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SimpleLine({ data, xKey, yKey, color = '#147d4b', height = 280 }: any) {
  const t = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
        <XAxis dataKey={xKey} tick={{ fill: t.tick, fontSize: 12 }} />
        <YAxis tick={{ fill: t.tick, fontSize: 12 }} />
        <Tooltip contentStyle={t.tooltip} />
        <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SimpleArea({ data, xKey, yKey, color = '#1a56db', height = 280 }: any) {
  const t = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id={`g-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
        <XAxis dataKey={xKey} tick={{ fill: t.tick, fontSize: 12 }} />
        <YAxis tick={{ fill: t.tick, fontSize: 12 }} />
        <Tooltip contentStyle={t.tooltip} />
        <Area type="monotone" dataKey={yKey} stroke={color} strokeWidth={2.5} fill={`url(#g-${color.replace('#', '')})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function Donut({ data, height = 260 }: { data: { name: string; value: number }[]; height?: number }) {
  const t = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
        </Pie>
        <Tooltip contentStyle={t.tooltip} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MultiLine({ data, lines, height = 280, xKey = 'name' }: { data: any[]; lines: { key: string; color: string; name: string }[]; height?: number; xKey?: string }) {
  const t = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
        <XAxis dataKey={xKey} tick={{ fill: t.tick, fontSize: 12 }} />
        <YAxis tick={{ fill: t.tick, fontSize: 12 }} />
        <Tooltip contentStyle={t.tooltip} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {lines.map((l) => <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color} strokeWidth={2.4} dot={false} />)}
      </LineChart>
    </ResponsiveContainer>
  );
}
