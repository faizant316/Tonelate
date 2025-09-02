
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, ExternalLink } from "lucide-react";

export default function TopWebsites({ rewrites, isLoading }) {
  const getTopWebsites = () => {
    const websiteCounts = {};
    
    rewrites.forEach(rewrite => {
      if (rewrite.website) {
        websiteCounts[rewrite.website] = (websiteCounts[rewrite.website] || 0) + 1;
      }
    });

    return Object.entries(websiteCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([website, count]) => ({
        website,
        count,
        percentage: Math.round((count / rewrites.length) * 100)
      }));
  };

  const getDomainIcon = (website) => {
    const domain = website.toLowerCase();
    if (domain.includes('gmail') || domain.includes('email')) return '📧';
    if (domain.includes('twitter') || domain.includes('x.com')) return '🐦';
    if (domain.includes('linkedin')) return '💼';
    if (domain.includes('slack')) return '💬';
    if (domain.includes('discord')) return '🎮';
    return '🌐';
  };

  const topWebsites = getTopWebsites();

  return (
    <Card className="border-[var(--border-primary)] shadow-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Globe className="w-5 h-5 text-green-500" />
          Top Websites
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" style={{ backgroundColor: 'var(--bg-tertiary)' }}/>
                  <Skeleton className="h-4 w-24" style={{ backgroundColor: 'var(--bg-tertiary)' }}/>
                </div>
                <Skeleton className="h-6 w-12" style={{ backgroundColor: 'var(--bg-tertiary)' }}/>
              </div>
            ))}
          </div>
        ) : topWebsites.length === 0 ? (
          <div className="py-8 text-center" style={{ color: 'var(--text-secondary)' }}>
            <Globe className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-tertiary)' }} />
            <p className="font-medium">No website data yet.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {topWebsites.map((item) => (
              <div key={item.website} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-hover)]">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    {getDomainIcon(item.website)}
                  </div>
                  <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                    {item.website === 'SmartRewriter Page' ? 'Tonelater' : item.website}
                  </p>
                </div>
                <Badge variant="secondary" className="flex-shrink-0" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{item.count}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
