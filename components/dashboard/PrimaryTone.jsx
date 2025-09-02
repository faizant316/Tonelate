
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function PrimaryTone({ rewrites, isLoading }) {
  const calculatePrimaryTone = () => {
    if (!rewrites || rewrites.length === 0) return "Professional";
    
    // Count tone usage based on rewrite patterns
    const toneCount = {};
    
    rewrites.forEach(rewrite => {
      // We can infer tone from the rewrite characteristics or add tone tracking
      // For now, we'll use a simple heuristic based on text characteristics
      const originalText = rewrite.original_text || "";
      const rewrittenText = rewrite.rewritten_text || "";
      
      // Simple tone detection based on text patterns
      let inferredTone = "Professional"; // default
      
      if (originalText.includes("yo ") || originalText.includes("lol") || originalText.includes("omg")) {
        inferredTone = "Casual";
      } else if (rewrittenText.includes("Dear") || rewrittenText.includes("Sincerely") || rewrittenText.includes("respectfully")) {
        inferredTone = "Formal";
      } else if (rewrittenText.includes("Thanks") || rewrittenText.includes("Hope") || rewrittenText.includes("!")) {
        inferredTone = "Friendly";
      } else if (rewrittenText.includes("please find") || rewrittenText.includes("kindly") || rewrittenText.includes("I am writing to")) {
        inferredTone = "Business";
      }
      
      toneCount[inferredTone] = (toneCount[inferredTone] || 0) + 1;
    });
    
    // Find the most frequent tone
    const primaryTone = Object.entries(toneCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "Professional";
    
    return primaryTone;
  };

  const primaryTone = calculatePrimaryTone();

  return (
    <Card className="border-[var(--border-primary)] shadow-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Primary Tone</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <MessageSquare className="w-6 h-6 text-[var(--accent-primary)]" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
              Your most frequent communication style
            </p>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {primaryTone}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
