
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import TimeAgo from "../shared/TimeAgo"; // New import for the TimeAgo component
import { 
  ArrowRight, 
  Globe, 
  CheckCircle, 
  XCircle, 
  Clock,
  Edit,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const getActionIcon = (action) => {
  switch (action) {
    case 'accepted':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'dismissed':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'modified':
      return <Edit className="w-4 h-4 text-blue-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

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
      className="w-7 h-7 absolute top-1 right-1 text-slate-400 hover:text-slate-600"
    >
      {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
    </Button>
  );
};

export default function RecentRewrites({ rewrites, isLoading }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card className="border-[var(--border-primary)] shadow-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Sparkles className="w-5 h-5 text-blue-500" />
            Your Recent Transformations
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
            style={{ color: 'var(--text-secondary)' }}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <CardContent className="space-y-6">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-1/4" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                    <Skeleton className="h-6 w-3/4" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                    <Skeleton className="h-4 w-1/2" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                  </div>
                ))
              ) : rewrites.length === 0 ? (
                <div className="py-12 text-center" style={{ color: 'var(--text-secondary)' }}>
                  <MessageSquare className="w-10 h-10 mx-auto mb-2" style={{ color: 'var(--text-tertiary)' }} />
                  <p className="font-medium">No rewrites yet.</p>
                  <p className="text-sm">Your transformations will appear here.</p>
                </div>
              ) : (
                rewrites.map((rewrite) => (
                  <div key={rewrite.id} className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-2" style={{ color: 'var(--text-tertiary)' }}>
                      <div className="flex items-center gap-2">
                        {getActionIcon(rewrite.user_action)}
                        <span className="font-medium capitalize">{rewrite.user_action || 'Generated'}</span>
                      </div>
                      {/* Replaced formatTimeAgo with the new TimeAgo component */}
                      <span><TimeAgo dateString={rewrite.created_date} /></span>
                    </div>
                    
                    <div className="p-4 border rounded-lg space-y-2" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-secondary)' }}>
                      <div className="relative">
                        <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>BEFORE</p>
                        <p className="italic mt-1 break-words pr-8" style={{ color: 'var(--text-primary)' }}>"{rewrite.original_text}"</p>
                        <CopyButton text={rewrite.original_text} />
                      </div>
                      <div className="border-t" style={{ borderColor: 'var(--border-secondary)' }}></div>
                      <div className="relative">
                        <p className="text-xs text-green-500 font-semibold uppercase">AFTER</p>
                        <p className="font-medium mt-1 break-words pr-8" style={{ color: 'var(--text-primary)' }}>"{rewrite.rewritten_text}"</p>
                        <CopyButton text={rewrite.rewritten_text} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
