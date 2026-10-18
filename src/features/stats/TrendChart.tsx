import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

export interface TrendDatum {
  label: string
  value: number
}

interface TrendChartProps {
  data: TrendDatum[]
  color: string
  unit: string
  /** Force the y-axis to at least this max so tiny values still read sensibly. */
  minMax?: number
  /** XAxis tick interval (0 shows every label). */
  xInterval?: number
}

function ChartTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
  unit: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs shadow-card">
      <p className="font-medium text-content">{label}</p>
      <p className="text-content-muted">
        {payload[0].value} {unit}
      </p>
    </div>
  )
}

export function TrendChart({ data, color, unit, minMax = 1, xInterval = 0 }: TrendChartProps) {
  const dataMax = Math.max(...data.map((d) => d.value), 0)
  const domainMax = Math.max(dataMax, minMax)
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div
      className="h-44 w-full text-content-subtle"
      role="img"
      aria-label={`Bar chart over ${data.length} days. Total ${total} ${unit}, peak ${dataMax} ${unit}.`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.12} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval={xInterval}
            tick={{ fill: 'currentColor', fontSize: 11 }}
            dy={4}
          />
          <YAxis
            allowDecimals={false}
            domain={[0, domainMax]}
            tickLine={false}
            axisLine={false}
            width={32}
            tick={{ fill: 'currentColor', fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: 'currentColor', fillOpacity: 0.06 }}
            content={<ChartTooltip unit={unit} />}
          />
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} maxBarSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
