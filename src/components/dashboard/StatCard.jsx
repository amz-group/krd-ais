import React from 'react';

export default function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className={`grid place-items-center h-11 w-11 rounded-2xl mb-3 ${accent || 'bg-primary/10 text-primary'}`}>
        {Icon && <Icon className="h-5 w-5" />}
      </div>
      <div className="text-3xl font-extrabold tracking-tight">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}