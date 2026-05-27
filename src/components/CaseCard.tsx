/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FailureCase } from '../types';

interface CaseCardProps {
  item: FailureCase;
  index: number;
  onSelect: (caseId: string) => void;
  isHighlighted?: boolean;
}

const SEVERITY_TAG: Record<string, string> = {
  Critical: 'clay',
  High: 'amber',
  Silent: 'amber',
  Medium: '',
};

export function CaseCard({ item, index, onSelect, isHighlighted = false }: CaseCardProps) {
  const [badgeHovered, setBadgeHovered] = useState(false);

  return (
    <div
      onClick={() => onSelect(item.id)}
      className={`case-card group relative bg-[var(--bg-card)] border border-[var(--border)] border-l-[3px] border-l-[var(--amber)] rounded-[2px] p-[28px_26px] cursor-pointer ${
        isHighlighted ? 'case-card-flash' : ''
      }`}
      id={`case-card-${item.id}`}
    >
      {/* Top row */}
      <div className="flex justify-between items-start mb-3">
        <span
          onMouseEnter={() => setBadgeHovered(true)}
          onMouseLeave={() => setBadgeHovered(false)}
          className={`font-mono text-[10px] uppercase tracking-[0.14em] select-none transition-all duration-[250ms] text-[var(--amber)] ${
            badgeHovered ? 'scale-[1.04]' : ''
          } ${isHighlighted ? 'case-badge-scale-anim' : ''}`}
        >
          CASE {item.id}
        </span>
        <div className="flex flex-col items-end gap-1">
          <span className="font-mono text-[9px] text-[var(--text-3)] tracking-[0.06em]">
            {item.seenBy} builders reported this
          </span>
          <span className="font-sans text-[12px] font-medium text-[var(--text-3)] group-hover:text-[var(--amber)] transition-colors duration-200 flex items-center gap-1">
            I've seen this
            <span className="transition-transform duration-200 group-hover:translate-x-[3px] inline-block">→</span>
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-serif text-[20px] md:text-[22px] font-normal leading-snug text-[var(--text-0)] tracking-[-0.01em] mt-2 mb-5">
        {item.title}
      </h3>

      <div className="h-[1px] bg-[var(--border)] mb-4" />

      {/* Data rows */}
      <div className="space-y-0">
        {[
          { label: 'WHAT CHANGED', value: item.whatChanged },
          { label: 'WHAT BROKE',   value: item.whatBroke },
          { label: 'WHY IT MATTERS', value: item.whyItMatters },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between items-baseline py-[9px] border-b border-[var(--border)]">
            <span className="font-mono text-[9px] uppercase text-[var(--text-3)] tracking-[0.1em] shrink-0">{label}</span>
            <span className="font-sans text-[13px] text-[var(--text-1)] max-w-[58%] text-right">{value}</span>
          </div>
        ))}
        <div className="flex justify-between items-baseline py-[9px]">
          <span className="font-mono text-[9px] uppercase text-[var(--text-3)] tracking-[0.1em] shrink-0">RISK</span>
          <span className="font-sans text-[13px] font-medium text-[var(--clay)] max-w-[58%] text-right">{item.risk}</span>
        </div>
      </div>

      {/* Museum metadata */}
      <div className="flex flex-wrap gap-[6px] pt-4 mt-3 border-t border-[var(--border)]">
        <span className={`museum-tag ${SEVERITY_TAG[item.severity] || ''}`}>{item.type}</span>
        <span className="museum-tag">Surface: {item.surface}</span>
        <span className={`museum-tag ${SEVERITY_TAG[item.severity] || ''}`}>{item.severity}</span>
        <span className="museum-tag">{item.status}</span>
      </div>

      {/* Bottom quote */}
      <div className="pt-4">
        <p className="font-serif italic font-light text-[13px] text-[var(--text-3)] leading-relaxed group-hover:text-[var(--text-2)] transition-colors duration-200">
          "This should have been a regression test."
        </p>
      </div>

      {/* Prompt */}
      <div className="mt-3">
        <span className="font-sans text-[12px] text-[var(--text-3)] italic">
          Seen this in a project? Open the case.
        </span>
      </div>
    </div>
  );
}
