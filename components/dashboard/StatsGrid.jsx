
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  CheckCircle,
} from "lucide-react";

export default function StatsGrid({ stats, isLoading }) {
  const statCards = [
    {
      title: "Total Rewrites",
      value: stats.totalRewrites,
      icon: Zap,
      color: "text-blue-500",
    },
    {
      title: "Today's Activity",
      value: stats.todayRewrites,
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "Acceptance Rate",
      value: `${Math.round(stats.acceptanceRate)}%`,
      icon: CheckCircle,
      color: "text-purple-500",
    },
    {
      title: "Avg. Response",
      value: `${stats.avgProcessingTime}ms`,
      icon: Clock,
      color: "text-orange-500",
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow duration-300 border-[var(--border-primary)]" style={{ backgroundColor: 'var(--bg-card)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {stat.title}
            </CardTitle>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mt-1" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
            ) : (
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stat.value}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
