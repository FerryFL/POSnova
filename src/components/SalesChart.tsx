"use client"

import * as React from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area, AreaChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import type { ChartConfig } from "~/components/ui/chart"
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "~/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { salesData, formatRupiah } from "~/data/chartData"

const chartConfig: ChartConfig = {
  sales: {
    label: "Penjualan",
  },
  totalTransactions: {
    label: "Total Transaksi",
    color: "hsl(var(--chart-1))",
  },
  totalRevenue: {
    label: "Pemasukan (Juta Rp)",
    color: "hsl(var(--chart-2))",
  },
}

export function SalesChart() {
  const [timeRange, setTimeRange] = React.useState("30d")

  const filteredData = React.useMemo(() => {
    return salesData.filter((item) => {
      const date = new Date(item.date)
      const referenceDate = new Date("2024-06-30")
      let daysToSubtract = 30
      if (timeRange === "7d") {
        daysToSubtract = 7
      } else if (timeRange === "14d") {
        daysToSubtract = 14
      }
      const startDate = new Date(referenceDate)
      startDate.setDate(startDate.getDate() - daysToSubtract)
      return date >= startDate
    })
  }, [timeRange])

  // Calculate totals for display
  const totalTransactions = filteredData.reduce((sum, item) => sum + item.totalTransactions, 0)
  const totalRevenue = filteredData.reduce((sum, item) => sum + item.totalRevenue, 0)

  // Convert revenue to millions for better chart display
  const chartData = filteredData.map(item => ({
    ...item,
    totalRevenueMillion: item.totalRevenue / 1000000, // Convert to millions
  }))

  return (
    <Card className="w-full">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Grafik Transaksi</CardTitle>
          <CardDescription>
            Total Transaksi: {totalTransactions.toLocaleString('id-ID')} | Total Omzet: {formatRupiah(totalRevenue)}
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg"
            aria-label="Select time range"
          >
            <SelectValue placeholder="30 hari terakhir" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="30d" className="rounded-lg">
              30 hari terakhir
            </SelectItem>
            <SelectItem value="14d" className="rounded-lg">
              14 hari terakhir
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              7 hari terakhir
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[400px] w-full"
        >
          <AreaChart data={chartData} margin={{ top: 20, right: 50, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="transactionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" strokeOpacity={0.3} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string) => {
                const date = new Date(value)
                return date.toLocaleDateString("id-ID", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            {/* Left Y-axis for Transactions */}
            <YAxis 
              yAxisId="transactions" 
              orientation="left"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--chart-1))" }}
              width={60}
              label={{ 
                value: 'Transaksi', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: "hsl(var(--chart-1))" }
              }}
            />
            {/* Right Y-axis for Revenue (in millions) */}
            <YAxis 
              yAxisId="revenue" 
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--chart-2))" }}
              width={80}
              tickFormatter={(value: number) => `${value.toFixed(1)}JT`}
              label={{ 
                value: 'Pemasukan (Juta Rp)', 
                angle: 90, 
                position: 'insideRight',
                style: { textAnchor: 'middle', fill: "hsl(var(--chart-2))" }
              }}
            />
            <Tooltip
              content={
                <ChartTooltipContent
                  config={chartConfig}
                  labelFormatter={(value) => {
                    return new Date(value as string).toLocaleDateString("id-ID", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  formatter={(value, name, props) => {
                    if (name === "totalTransactions") {
                      return [ "Total Transaksi: ", `${value} transaksi`]
                    }
                    if (name === "totalRevenueMillion") {
                      const actualRevenue = (value as number) * 1000000
                      return ["Pemasukan: ", formatRupiah(actualRevenue)]
                    }
                    return [value, name]
                  }}
                  indicator="dot"
                />
              }
            />
            {/* Transaction Area */}
            <Area
              yAxisId="transactions"
              type="monotone"
              dataKey="totalTransactions"
              stroke="var(--color-totalTransactions)"
              strokeWidth={3}
              fill="url(#transactionGradient)"
              fillOpacity={0.6}
              name="totalTransactions"
              connectNulls={true}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Revenue Area */}
            <Area
              yAxisId="revenue"
              type="monotone"
              dataKey="totalRevenueMillion"
              stroke="var(--color-totalRevenue)"
              strokeWidth={3}
              fill="url(#revenueGradient)"
              fillOpacity={0.4}
              name="totalRevenueMillion"
              connectNulls={true}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Legend 
              content={
                <ChartLegendContent 
                  config={{
                    totalTransactions: {
                      label: "Total Transaksi",
                      color: "hsl(var(--chart-1))",
                    },
                    totalRevenueMillion: {
                      label: "Pemasukan (Juta Rp)",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                />
              }
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}