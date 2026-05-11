<template>
  <svg viewBox="0 0 320 180" style="width: 100%; height: 100%">
    <defs>
      <pattern id="dots-1" width="14" height="14" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="oklch(28% 0.008 150)" />
      </pattern>
      <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M0 0 L10 5 L0 10 z" fill="var(--brand)" />
      </marker>
    </defs>
    <rect width="320" height="180" fill="url(#dots-1)" opacity="0.5" />
    <g opacity="0.35">
      <rect x="20" y="30"  width="100" height="22" rx="3" fill="none" stroke="oklch(50% 0.008 150)" stroke-width="1" />
      <text x="30" y="45" fill="oklch(60% 0.008 150)" font-family="var(--font-mono)" font-size="10">ckb-indexer</text>
      <rect x="20" y="58"  width="100" height="22" rx="3" fill="none" stroke="oklch(50% 0.008 150)" stroke-width="1" />
      <text x="30" y="73" fill="oklch(60% 0.008 150)" font-family="var(--font-mono)" font-size="10">postgres</text>
      <rect x="20" y="86"  width="100" height="22" rx="3" fill="none" stroke="oklch(50% 0.008 150)" stroke-width="1" />
      <text x="30" y="101" fill="oklch(60% 0.008 150)" font-family="var(--font-mono)" font-size="10">snapshots</text>
      <rect x="20" y="114" width="100" height="22" rx="3" fill="none" stroke="oklch(50% 0.008 150)" stroke-width="1" />
      <text x="30" y="129" fill="oklch(60% 0.008 150)" font-family="var(--font-mono)" font-size="10">reorg handler</text>
      <line x1="20" y1="145" x2="120" y2="145" stroke="oklch(50% 0.008 150)" stroke-dasharray="3 3" />
      <text x="20" y="160" fill="oklch(55% 0.008 150)" font-family="var(--font-mono)" font-size="9">on-call rotation</text>
    </g>
    <g stroke="var(--brand)" fill="none" stroke-width="1.4">
      <path d="M130 90 L 175 90" marker-end="url(#arr)" />
    </g>
    <rect x="190" y="60" width="110" height="60" rx="6" fill="var(--brand-tint)" stroke="var(--brand)" stroke-width="1.4" />
    <text x="245" y="89" text-anchor="middle" fill="var(--brand-strong)" font-family="var(--font-mono)" font-size="12" font-weight="600">cellora</text>
    <text x="245" y="103" text-anchor="middle" fill="var(--brand)" font-family="var(--font-mono)" font-size="9">api.cellora.dev</text>
  </svg>
</template>
