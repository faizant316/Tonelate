
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";

export default function ActivityChart({ rewrites, isLoading }) {
  const getChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: date.toDateString(),
        rewrites: 0,
        accepted: 0
      };
    });

    rewrites.forEach(rewrite => {
      const rewriteDate = new Date(rewrite.created_date).toDateString();
      const dayData = last7Days.find(day => day.fullDate === rewriteDate);
      if (dayData) {
        dayData.rewrites += 1;
        if (rewrite.user_action === 'accepted') {
          dayData.accepted += 1;
        }
      }
    });

    return last7Days;
  };

  return (
    <Card className="border-[var(--border-primary)] shadow-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <BarChart3 className="w-5 h-5 text-purple-500" />
          7-Day Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/4" style={{ backgroundColor: 'var(--bg-tertiary)' }}/>
            <Skeleton className="h-48 w-full" style={{ backgroundColor: 'var(--bg-tertiary)' }}/>
          </div>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getChartData()} margin={{ top: 5, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--text-tertiary)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--text-tertiary)"
                  fontSize={12}
                  width={30}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  cursor={{ fill: 'var(--bg-tertiary)' }}
                />
                <Bar 
                  dataKey="rewrites" 
                  fill="#818cf8" 
                  radius={[2, 2, 0, 0]}
                  name="Total Rewrites"
                />
                <Bar 
                  dataKey="accepted" 
                  fill="#a78bfa" 
                  radius={[2, 2, 0, 0]}
                  name="Accepted"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
