
import React, { useState, useEffect, useCallback } from "react";
import { Rewrite } from "@/entities/Rewrite";
import { User } from "@/entities/User"; // Added User import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  History as HistoryIcon, 
  Search, 
  ArrowRight,
  ArrowDown,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Sparkles,
  Copy 
} from "lucide-react";
import TimeAgo from "../components/shared/TimeAgo"; // Added TimeAgo import

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className="w-7 h-7 absolute top-2 right-2 text-slate-400 hover:text-slate-600"
    >
      {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
    </Button>
  );
};

export default function History() {
  const [rewrites, setRewrites] = useState([]);
  const [filteredRewrites, setFilteredRewrites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null); // Added user state

  const loadRewrites = async () => {
    setIsLoading(true);
    setError(null); // Clear any previous errors
    try {
      // First get current user
      const userData = await User.me();
      setUser(userData);
      
      // Then filter rewrites by current user's email
      const data = await Rewrite.filter({ created_by: userData.email }, "-created_date", 200);
      setRewrites(data);
    } catch (e) {
      console.error("Error loading rewrites:", e);
      if (e.message?.includes("Network Error")) {
        setError("Could not connect to the server. Please check your internet connection and ensure 'Core' integration is enabled.");
      } else {
        setError("An unexpected error occurred while loading your history.");
      }
      setRewrites([]); // Clear rewrites to show empty state or error
    }
    setIsLoading(false);
  };

  // Memoize filterRewrites to ensure its identity is stable across renders
  // This prevents an infinite loop when it's used as a dependency in useEffect
  const filterRewrites = useCallback(() => {
    let filtered = rewrites;

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(rewrite => (rewrite.user_action || 'generated') === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(rewrite => 
        rewrite.original_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rewrite.rewritten_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rewrite.website?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRewrites(filtered);
  }, [rewrites, searchTerm, filterStatus]); // Dependencies for useCallback

  useEffect(() => {
    loadRewrites();
  }, []);

  useEffect(() => {
    filterRewrites();
  }, [rewrites, searchTerm, filterStatus, filterRewrites]); // Added filterRewrites to dependencies

  const getActionIcon = (action) => {
    switch (action) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'dismissed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'modified':
        return <Edit className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>History</h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Browse and review all your past transformations.
          </p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <span className="font-medium">Connection Issue:</span>
              <span>{error}</span>
            </div>
            <button 
              onClick={loadRewrites}
              className="mt-2 text-sm text-red-600 underline hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
            <Input
              placeholder="Search by text, website..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 shadow-sm bg-[var(--bg-input)] border-[var(--border-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]"
            />
          </div>
          <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-full md:w-auto">
            <div className="overflow-x-auto scrollbar-hide">
              <TabsList className="inline-flex gap-2 p-2 rounded-xl shadow-sm min-w-max" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <TabsTrigger value="all" className="data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] text-[var(--text-secondary)] rounded-lg data-[state=active]:shadow-sm px-4 py-2.5 font-medium whitespace-nowrap">All</TabsTrigger>
                <TabsTrigger value="accepted" className="data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] text-[var(--text-secondary)] rounded-lg data-[state=active]:shadow-sm px-4 py-2.5 font-medium whitespace-nowrap">Accepted</TabsTrigger>
                <TabsTrigger value="dismissed" className="data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] text-[var(--text-secondary)] rounded-lg data-[state=active]:shadow-sm px-4 py-2.5 font-medium whitespace-nowrap">Dismissed</TabsTrigger>
                <TabsTrigger value="generated" className="data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] text-[var(--text-secondary)] rounded-lg data-[state=active]:shadow-sm px-4 py-2.5 font-medium whitespace-nowrap">Generated</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <Card key={i} className="shadow-sm p-6 border-[var(--border-primary)]" style={{ backgroundColor: 'var(--bg-card)' }}>
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-4 bg-[var(--bg-tertiary)] rounded w-1/4" />
                  <Skeleton className="h-4 bg-[var(--bg-tertiary)] rounded w-1/4" />
                </div>
                <Skeleton className="h-6 bg-[var(--bg-tertiary)] rounded w-full mb-2" />
                <Skeleton className="h-6 bg-[var(--bg-tertiary)] rounded w-3/4" />
              </Card>
            ))
          ) : filteredRewrites.length === 0 && !error ? ( // Only show "No History Found" if no error
            <div className="text-center py-20 rounded-lg shadow-sm" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
              <HistoryIcon className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }}/>
              <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>No History Found</h3>
              <p className="text-sm">Your past rewrites will appear here once you've made some.</p>
            </div>
          ) : (
            filteredRewrites.map((rewrite) => (
              <Card key={rewrite.id} className="p-4 hover:shadow-md transition-shadow duration-300 border-[var(--border-primary)]" style={{ backgroundColor: 'var(--bg-card)' }}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                    <div className="flex items-center gap-2">
                      {getActionIcon(rewrite.user_action)}
                      <span className="font-semibold capitalize" style={{ color: 'var(--text-secondary)' }}>{rewrite.user_action || 'Generated'}</span>
                      {rewrite.website && (
                        <>
                          <span style={{ color: 'var(--border-secondary)' }}>|</span>
                          <Globe className="w-3 h-3" />
                          <span>{rewrite.website}</span>
                        </>
                      )}
                    </div>
                    <span><TimeAgo dateString={rewrite.created_date} /></span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border relative" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                      <p className="text-xs text-red-400 font-semibold uppercase tracking-wide mb-2">Before</p>
                      <p className="italic pr-10" style={{ color: 'var(--text-secondary)' }}>"{rewrite.original_text}"</p>
                      <CopyButton text={rewrite.original_text} />
                    </div>

                    <div className="flex items-center justify-center">
                        <ArrowDown className="w-4 h-4" style={{ color: 'var(--border-secondary)' }} />
                    </div>

                    <div className="p-4 rounded-lg border relative" style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                      <div className="flex items-center gap-2 text-xs text-green-400 font-semibold uppercase tracking-wide mb-2">
                        <Sparkles className="w-3 h-3"/>
                        <span>After</span>
                      </div>
                      <p className="font-medium pr-10" style={{ color: 'var(--text-primary)' }}>"{rewrite.rewritten_text}"</p>
                      <CopyButton text={rewrite.rewritten_text} />
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
