"use client"

import * as React from "react"
import { ResponsiveContainer } from "recharts"
import { cn } from "~/lib/utils"

export type ChartConfig = Record<string, {
  label?: React.ReactNode
  icon?: React.ComponentType
  color?: string
  theme?: Record<string, string>
}>

export interface ChartContainerProps
  extends React.ComponentPropsWithoutRef<"div"> {
  config: ChartConfig
  children: React.ComponentProps<typeof ResponsiveContainer>["children"]
}

// Define proper types for chart data
interface ChartPayloadItem {
  dataKey?: string
  name?: string
  value?: number | string
  payload?: Record<string, unknown>
  color?: string
  fill?: string
}

export interface ChartTooltipProps {
  active?: boolean
  payload?: ChartPayloadItem[]
  label?: string | number
  indicator?: "line" | "dot" | "dashed"
  hideLabel?: boolean
  hideIndicator?: boolean
  labelFormatter?: (value: string | number, payload?: ChartPayloadItem[]) => React.ReactNode
  labelClassName?: string
  formatter?: (value: number | string, name: string, props: ChartPayloadItem) => React.ReactNode
  color?: string
  nameKey?: string
  labelKey?: string
}

export interface ChartTooltipContentProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "content">,
    ChartTooltipProps {
  config?: ChartConfig
}

export interface ChartLegendProps {
  payload?: ChartPayloadItem[]
  verticalAlign?: "top" | "bottom"
  iconType?: "line" | "rect" | "circle"
}

export interface ChartLegendContentProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "content">,
    ChartLegendProps {
  hideIcon?: boolean
  nameKey?: string
  config?: ChartConfig
}

function ChartContainer({ id, className, children, config, ...props }: ChartContainerProps) {
  const uniqueId = React.useId()
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`

  return (
    <div
      data-chart={chartId}
      className={cn(
        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/25 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
        className
      )}
      {...props}
    >
      <ChartStyle id={chartId} config={config} />
      <ResponsiveContainer>{children}</ResponsiveContainer>
    </div>
  )
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(
    ([, itemConfig]) => itemConfig.theme ?? itemConfig.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
:root {
  --chart-1: 220 70% 50%;
  --chart-2: 160 60% 45%;
  --chart-3: 30 80% 55%;
  --chart-4: 280 65% 60%;
  --chart-5: 340 75% 55%;
}

.dark {
  --chart-1: 220 70% 50%;
  --chart-2: 160 60% 45%;
  --chart-3: 30 80% 55%;
  --chart-4: 280 65% 60%;
  --chart-5: 340 75% 55%;
}

[data-chart=${id}] {
  ${colorConfig
    .map(([key, itemConfig]) => {
      const color = itemConfig.color ?? `var(--chart-${key.slice(-1)})`
      return `--color-${key}: ${color};`
    })
    .join("\n")}
}
        `,
      }}
    />
  )
}

function ChartTooltip(props: ChartTooltipProps) {
  // This component is handled by recharts internally
  return null
}

function ChartTooltipContent({
  active,
  payload,
  label,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
  config = {},
  className,
  ...props
}: ChartTooltipContentProps) {
  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    if (!item) return null

    const key = `${labelKey ?? item.dataKey ?? item.name ?? "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === "string"
        ? config[label]?.label ?? label
        : itemConfig?.label

    if (labelFormatter) {
      return labelFormatter(value as string | number, payload)
    }

    return value
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelKey,
    config,
  ])

  if (!active || !payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== "dot"

  return (
    <div
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
      {...props}
    >
      {!nestLabel ? (
        <div className={cn("font-medium", labelClassName)}>
          {tooltipLabel}
        </div>
      ) : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)
          const indicatorColor = color ?? item.payload?.fill ?? item.color

          return (
            <div
              key={item.dataKey ?? index}
              className={cn(
                "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                indicator === "dot" && "items-center"
              )}
            >
              {formatter && item?.value !== undefined && item.name ? (
                formatter(item.value, item.name, item)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn(
                          "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                          indicator === "dot" && "h-2.5 w-2.5",
                          indicator === "line" && "w-1",
                          indicator === "dashed" && "w-0 border-[1.5px] border-dashed bg-transparent",
                          nestLabel && indicator === "dashed" && "my-0.5"
                        )}
                        style={
                          {
                            "--color-bg": indicatorColor,
                            "--color-border": indicatorColor,
                          } as React.CSSProperties
                        }
                      />
                    )
                  )}
                  <div
                    className={cn(
                      "flex flex-1 justify-between leading-none",
                      nestLabel ? "items-end" : "items-center"
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? (
                        <div className={cn("font-medium", labelClassName)}>
                          {tooltipLabel}
                        </div>
                      ) : null}
                      <div className="flex items-center gap-0.5 text-muted-foreground">
                        {itemConfig?.label ?? item.name}
                      </div>
                    </div>
                    {item.value && (
                      <div className="font-mono font-medium tabular-nums text-foreground">
                        {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ChartLegend(props: ChartLegendProps) {
  // This component is handled by recharts internally
  return null
}

function ChartLegendContent({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey, config = {}, ...props }: ChartLegendContentProps) {
  if (!payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
      {...props}
    >
      {payload.map((item, index) => {
        const key = `${nameKey ?? item.dataKey ?? "value"}`
        const itemConfig = getPayloadConfigFromPayload(config, item, key)

        return (
          <div
            key={item.value ?? index}
            className={cn(
              "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
            )}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        )
      })}
    </div>
  )
}

// Helper function to get payload config
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: ChartPayloadItem,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadData =
    payload.payload && typeof payload.payload === "object"
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof (payload as Record<string, unknown>)[key] === "string"
  ) {
    configLabelKey = (payload as Record<string, unknown>)[key] as string
  } else if (
    payloadData &&
    key in payloadData &&
    typeof payloadData[key] === "string"
  ) {
    configLabelKey = payloadData[key]
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
}