import React from "react";

export default function Loading(): React.ReactElement {
  return (
    <div className="space-y-4 p-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/[0.04]" />
      ))}
    </div>
  );
}
