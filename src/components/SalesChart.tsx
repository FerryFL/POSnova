"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip, Legend } from "recharts"
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
    label: "Pemasukan",
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
          className="aspect-auto h-[300px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillTransactions" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-totalTransactions)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-totalTransactions)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-totalRevenue)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-totalRevenue)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
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
                    if (name === "totalRevenue") {
                      return ["Pemasukan: ", formatRupiah(value as number) ]
                    }
                    return [value, name]
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="totalRevenue"
              type="natural"
              fill="url(#fillRevenue)"
              stroke="var(--color-totalRevenue)"
              stackId="a"
            />
            <Area
              dataKey="totalTransactions"
              type="natural"
              fill="url(#fillTransactions)"
              stroke="var(--color-totalTransactions)"
              stackId="a"
            />
            <Legend 
              content={<ChartLegendContent config={chartConfig} />}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}