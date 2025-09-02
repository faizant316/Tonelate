
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Added this import
import { Check, Star, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const ProFeatures = [
  "2,000 rewrites per month",
  "Advanced AI models",
  "Team collaboration features",
  "Priority support"
];

const FreeFeatures = [
  "100 rewrites per month",
  "Standard AI model",
  "For personal use"
];

export default function UpgradeModal({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] p-0">
        <div className="p-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold flex items-center gap-3">
              <Star className="w-8 h-8" />
              Upgrade to Pro
            </DialogTitle>
            <DialogDescription className="text-blue-100 text-lg">
              You've reached your monthly limit of 100 rewrites.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-6">
          <p className="text-slate-600">
            Unlock your full potential by upgrading to Pro. Get more rewrites, access to our most powerful AI, and advanced features to supercharge your communication.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-500">Free Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {FreeFeatures.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-500">{feature}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-blue-500 border-2 shadow-xl">
              <CardHeader>
                <CardTitle className="text-blue-600 flex items-center justify-between">
                  Pro Plan
                  <Badge className="bg-blue-100 text-blue-700">Recommended</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ProFeatures.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                    <span className="text-slate-800 font-medium">{feature}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="sm:justify-center">
            <Link to={createPageUrl("Settings?tab=billing")} onClick={onClose} className="w-full">
              <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Upgrade Now for $9.99/month
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
