"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis } from "recharts"
import { ChartPeriodSelector, ChartPeriod } from "./chart-period-selector"
import { PaymentOverviewData } from "@/types/statistics"
import { useCurrency } from "@/components/currency-provider"

interface PaymentOverviewProps {
  paymentData: PaymentOverviewData
  period: ChartPeriod
  onPeriodChange: (period: ChartPeriod) => void
}

const COLORS = {
  paid: "#22C55E", // Green
  unpaid: "#EF4444", // Red
}

import { useTranslations } from 'next-intl'

export const PaymentOverview: React.FC<PaymentOverviewProps> = ({ paymentData, period, onPeriodChange }) => {
  const t = useTranslations('StatisticsPage.paymentOverview')
  const tStats = useTranslations('StatisticsPage')
  const { formatCurrency } = useCurrency()
  const chartConfig = {
    paid: {
      label: t('paid'),
      color: COLORS.paid,
    },
    unpaid: {
      label: t('unpaid'),
      color: COLORS.unpaid,
    },
  };

  const totalAmount = paymentData.overview.reduce((sum, item) => sum + item.amount, 0);
  const debtChartConfig = {
    totalUnpaid: {
      label: t('outstanding'),
      color: "#10B981",
    },
  } satisfies Record<string, { label: string; color: string }>;
  const barHeight = Math.max(200, paymentData.byStudent.length * 48);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('paymentStatus')}</CardTitle>
            <CardDescription>{t('statusDescription')}</CardDescription>
          </div>
          <ChartPeriodSelector value={period} onChange={onPeriodChange} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {paymentData.overview.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">{t('noData')}</div>
        ) : (
          <>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentData.overview as any[]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="amount"
                  >
                    {paymentData.overview.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === "Paid" ? COLORS.paid : COLORS.unpaid} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [formatCurrency(Number(value)), name === "Paid" ? t('paid') : t('unpaid')]}
                  />
                  <Legend formatter={(value) => value === "Paid" ? t('paid') : t('unpaid')} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="grid grid-cols-2 gap-4">
              {paymentData.overview.map((item) => (
                <div key={item.name} className="text-center">
                  <div className="text-2xl font-bold">{formatCurrency(item.amount)}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.name === "Paid" ? t('paid') : t('unpaid')} ({item.value} {tStats('revenueChart.sessions', { count: item.value })})
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {totalAmount > 0 ? ((item.amount / totalAmount) * 100).toFixed(1) : 0}% {t('ofTotal')}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        <div>
          <h3 className="text-sm font-medium mb-3">{t('outstandingByStudent')}</h3>
          {paymentData.byStudent.length === 0 ? (
            <div className="text-sm text-muted-foreground">{t('allPaid')}</div>
          ) : (
            <ChartContainer config={debtChartConfig}>
              <ResponsiveContainer width="100%" height={barHeight}>
                <BarChart
                  data={paymentData.byStudent}
                  layout="vertical"
                  margin={{ top: 8, right: 16, left: 80, bottom: 8 }}
                >
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => formatCurrency(Number(value))}
                  />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} stroke="hsl(var(--muted-foreground))" width={140} />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value) => [formatCurrency(Number(value)), t('outstanding')]}
                    labelFormatter={(label, payload) => {
                      const unpaidSessions = payload?.[0]?.payload?.unpaidSessions || 0
                      return `${label} • ${unpaidSessions} ${tStats('revenueChart.sessions', { count: unpaidSessions })}`
                    }}
                  />
                  <Bar dataKey="totalUnpaid" fill={debtChartConfig.totalUnpaid.color} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
