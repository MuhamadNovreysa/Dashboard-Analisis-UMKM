"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, Target, AlertTriangle, Lightbulb } from "lucide-react"
import { useDataStore } from "@/hooks/use-data-store"

export function AIInsights() {
  const { data } = useDataStore()
  const [insights, setInsights] = useState<any>(null)

  useEffect(() => {
    if (data) {
      generateInsightsFromData(data)
    }
  }, [data])

  const generateInsightsFromData = (processedData: any) => {
    const highValueSegment = processedData.segments.find((s: any) => s.name === "High Value")
    const potentialSegment = processedData.segments.find((s: any) => s.name === "Potential")
    const lowValueSegment = processedData.segments.find((s: any) => s.name === "Low Value")
    const mediumValueSegment = processedData.segments.find((s: any) => s.name === "Medium Value")

    const totalRevenue = processedData.metrics.totalRevenue
    const highValueRevenue = highValueSegment?.avgValue * highValueSegment?.count || 0
    const highValuePercentage = ((highValueRevenue / totalRevenue) * 100).toFixed(1)

    setInsights({
      summary: `Berdasarkan analisis K-Means clustering terhadap ${processedData.metrics.totalCustomers.toLocaleString("id-ID")} customer, teridentifikasi 4 segmen utama dengan karakteristik yang berbeda. High Value segment dengan ${highValueSegment?.count || 0} customer berkontribusi ${highValuePercentage}% dari total revenue sebesar Rp ${(totalRevenue / 1000000).toFixed(1)}M.`,
      opportunities: [
        {
          title: "Optimasi High Value Segment",
          description: `${highValueSegment?.count || 0} customer di segment ini berkontribusi Rp ${(highValueRevenue / 1000000).toFixed(1)}M. Implementasi program loyalitas premium dapat meningkatkan retention rate hingga 35%.`,
          impact: "high",
          priority: 1,
        },
        {
          title: "Aktivasi Potential Customers",
          description: `${potentialSegment?.count || 0} customer dengan potensi tinggi. Cross-selling strategy dapat meningkatkan ARPU 40-60%.`,
          impact: "high",
          priority: 2,
        },
        {
          title: "Re-engagement Low Value Segment",
          description: `${lowValueSegment?.count || 0} customer dengan engagement rendah. Personalized email campaign dengan discount 15-20% dapat reaktivasi 25% dari segment ini.`,
          impact: "medium",
          priority: 3,
        },
      ],
      risks: [
        {
          title: "Konsentrasi Revenue",
          description: `${highValuePercentage}% revenue bergantung pada ${((highValueSegment?.count / processedData.metrics.totalCustomers) * 100).toFixed(1)}% customer (High Value). Diversifikasi diperlukan untuk mengurangi risiko.`,
          severity: "high",
        },
        {
          title: "Segment Imbalance",
          description: `Distribusi customer tidak merata dengan ${lowValueSegment?.count || 0} customer di Low Value segment. Perlu strategi untuk meningkatkan value per customer.`,
          severity: "medium",
        },
      ],
      recommendations: [
        "Implementasi tiered loyalty program dengan benefit eksklusif untuk High Value customers",
        `Launch bundle product campaign untuk ${potentialSegment?.count || 0} Potential customers dengan target konversi 30%`,
        "Automated re-engagement flow untuk Low Value segment menggunakan personalized content",
        "Predictive churn model untuk early warning system pada Medium Value segment",
        "Diversifikasi strategi akuisisi untuk mengurangi konsentrasi revenue",
      ],
    })
  }

  if (!data || !insights) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-background border-2">
        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
          <p>Upload data untuk melihat AI insights</p>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-background border-2">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">AI-Powered Insights & Recommendations</h2>
              <p className="text-sm text-muted-foreground">Analisis cerdas dan saran strategis berbasis data</p>
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 rounded-lg bg-card border">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            Executive Summary
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{insights.summary}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              Peluang Strategis
            </h3>
            <div className="space-y-3">
              {insights.opportunities.map((opp: any, idx: number) => (
                <Card key={idx} className="p-4 border-l-4 border-l-green-500">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{opp.title}</h4>
                    <Badge variant={opp.impact === "high" ? "default" : "secondary"} className="text-xs">
                      Priority {opp.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{opp.description}</p>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Risk & Challenges
            </h3>
            <div className="space-y-3">
              {insights.risks.map((risk: any, idx: number) => (
                <Card key={idx} className="p-4 border-l-4 border-l-orange-500">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{risk.title}</h4>
                    <Badge variant={risk.severity === "high" ? "destructive" : "secondary"} className="text-xs">
                      {risk.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{risk.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Rekomendasi Aksi
          </h3>
          <ul className="space-y-2">
            {insights.recommendations.map((rec: string, idx: number) => (
              <li key={idx} className="text-sm flex items-start gap-3">
                <span className="text-primary font-bold mt-0.5">{idx + 1}.</span>
                <span className="text-muted-foreground">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

    </>
  )
}
