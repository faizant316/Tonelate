
import React, { useState, useEffect } from "react";
import { Rewrite, User } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Zap, 
  TrendingUp, 
  Globe,
  MessageSquare,
  ArrowRight,
  Brain,
  Star,
  Sparkles,
  Users,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import StatsGrid from "../components/dashboard/StatsGrid";
import RecentRewrites from "../components/dashboard/RecentRewrites";
import ActivityChart from "../components/dashboard/ActivityChart";
import TopWebsites from "../components/dashboard/TopWebsites";
import PrimaryTone from "../components/dashboard/PrimaryTone";
// QuickActions component is removed as per the outline

export default function Dashboard() {
  const [rewrites, setRewrites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      // Get current user first
      const userData = await User.me();
      
      // Filter rewrites to only show current user's data
      const data = await Rewrite.filter({ created_by: userData.email }, "-created_date", 50);
      setRewrites(data);
    } catch (e) {
      console.error("Error loading dashboard data:", e);
      if (e.message?.includes("Network Error")) {
        setError("Could not connect to the server. Please check your internet connection and ensure 'Core' integration is enabled.");
      } else {
        setError("An unexpected error occurred while loading your dashboard.");
      }
      setRewrites([]);
    }
    setIsLoading(false);
  };

  const calculateStats = () => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const todayRewrites = rewrites.filter(r => new Date(r.created_date) >= todayStart);
    const acceptedRewrites = rewrites.filter(r => r.user_action === 'accepted');
    const avgProcessingTime = rewrites.length > 0 
      ? rewrites.reduce((sum, r) => sum + (r.processing_time || 0), 0) / rewrites.length 
      : 0;
    
    return {
      totalRewrites: rewrites.length,
      todayRewrites: todayRewrites.length,
      acceptanceRate: rewrites.length > 0 ? (acceptedRewrites.length / rewrites.length * 100) : 0,
      avgProcessingTime: Math.round(avgProcessingTime)
    };
  };

  const stats = calculateStats();

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Here's a snapshot of your recent activity.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <span className="font-medium">Connection Issue:</span>
              <span>{error}</span>
            </div>
            <button 
              onClick={loadData}
              className="mt-2 text-sm text-red-600 underline hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <StatsGrid 
          stats={stats}
          isLoading={isLoading}
        />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <RecentRewrites 
              rewrites={rewrites.slice(0, 5)}
              isLoading={isLoading}
            />
          </div>

          <div className="space-y-8">
            <PrimaryTone 
              rewrites={rewrites}
              isLoading={isLoading}
            />
            <ActivityChart 
              rewrites={rewrites}
              isLoading={isLoading}
            />
            <TopWebsites 
              rewrites={rewrites}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
