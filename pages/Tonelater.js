import React from "react";
import SmartRewriterComponent from "../components/smart/SmartRewriter";

export default function TonelaterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center py-8 sm:py-12 pb-24 sm:pb-12" style={{ color: 'var(--text-secondary)' }}>
      <div className="w-full max-w-6xl space-y-8 px-4">
        {/* Title Section */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-3" style={{ color: 'var(--text-primary)' }}>
            Tonelater
          </h1>
          <p className="mt-2 text-base max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Transform any message into clear, effective communication—instantly.
          </p>
        </div>

        {/* The Core Tool */}
        <SmartRewriterComponent />
      </div>
    </div>
  );
}
