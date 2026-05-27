/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const FEED = [
  { caseId: '01', title: 'The Prompt Regression',    location: 'San Francisco', minsAgo: 11  },
  { caseId: '06', title: 'The Hallucination Return',  location: 'Berlin',        minsAgo: 34  },
  { caseId: '03', title: 'RAG Retrieval Drift',       location: 'London',        minsAgo: 58  },
  { caseId: '02', title: 'The Model Upgrade Break',   location: 'Toronto',       minsAgo: 112 },
  { caseId: '08', title: 'The Memory Collapse',       location: 'Singapore',     minsAgo: 179 },
  { caseId: '10', title: 'The Loop That Never Ended', location: 'Amsterdam',     minsAgo: 243 },
  { caseId: '04', title: 'The Tool Call Mistake',     location: 'New York',      minsAgo: 307 },
  { caseId: '06', title: 'The Hallucination Return',  location: 'Sydney',        minsAgo: 381 },
  { caseId: '01', title: 'The Prompt Regression',    location: 'Austin',        minsAgo: 456 },
  { caseId: '03', title: 'RAG Retrieval Drift',       location: 'Tokyo',         minsAgo: 518 },
];

const fmt = (mins: number) =>
  mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ago`;

export function ActivityTicker() {
  const items = [...FEED, ...FEED];

  return (
    <div
      className="ticker-strip"
      style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-card)',
        overflow: 'hidden',
      }}
    >
      <div className="ticker-track">
        {items.map((item, i) => (
          <span key={i} className="ticker-item">
            <span className="ticker-dot" />
            <span className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: 'var(--amber)' }}>
              CASE {item.caseId}
            </span>
            <span className="font-sans text-[12px] text-[var(--text-1)]">{item.title}</span>
            <span className="font-sans text-[11px] text-[var(--text-3)]">{item.location}</span>
            <span className="font-mono text-[9px] text-[var(--text-4)] tracking-[0.06em]">{fmt(item.minsAgo)}</span>
            <span className="ticker-sep" />
          </span>
        ))}
      </div>
    </div>
  );
}
