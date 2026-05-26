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

export function CaseCard({ item, index, onSelect, isHighlighted = false }: CaseCardProps) {
  const [badgeHovered, setBadgeHovered] = useState(false);

  return (
    <div
      onClick={() => onSelect(item.id)}
      className={`case-card group relative bg-[var(--bg-2)] border border-[var(--bg-4)] border-l-2 border-l-[rgba(255,255,255,0.15)] rounded-[2px] p-[36px_32px] cursor-pointer ${
        isHighlighted ? 'case-card-flash' : ''
      }`}
      id={`case-card-${item.id}`}
    >
      {/* Top row */}
      <div className="flex justify-between items-baseline mb-3">
        <span
          onMouseEnter={() => setBadgeHovered(true)}
          onMouseLeave={() => setBadgeHovered(false)}
          className={`font-mono text-[10px] uppercase text-[var(--accent)] tracking-[0.12em] select-none transition-transform duration-[280ms] ease-out ${
            badgeHovered ? 'scale-[1.04]' : ''
          } ${isHighlighted ? 'case-badge-scale-anim' : ''}`}
        >
          CASE {item.id}
        </span>
        <span className="font-sans text-[11px] text-[var(--text-3)] transition-colors duration-200 group-hover:text-[var(--text-1)]">
          SELECT →
        </span>
      </div>

      {/* Card title */}
      <h3 className="font-serif text-[22px] md:text-[24px] font-normal leading-snug text-[var(--text-1)] tracking-[-0.015em] mt-3 mb-6">
        {item.title}
      </h3>

      {/* Divider */}
      <div className="h-[1px] bg-[var(--bg-4)] my-6" />

      {/* Data Rows */}
      <div className="space-y-1">
        <div className="flex justify-between items-baseline py-2 border-b border-white/[0.04]">
          <span className="font-mono text-[9px] uppercase text-[var(--text-3)] tracking-[0.1em] shrink-0">
            WHAT CHANGED
          </span>
          <span className="font-sans text-[13px] font-normal text-[var(--text-2)] max-w-[60%] text-right self-center">
            {item.whatChanged}
          </span>
        </div>

        <div className="flex justify-between items-baseline py-2 border-b border-white/[0.04]">
          <span className="font-mono text-[9px] uppercase text-[var(--text-3)] tracking-[0.1em] shrink-0">
            WHAT BROKE
          </span>
          <span className="font-sans text-[13px] font-normal text-[var(--text-2)] max-w-[60%] text-right self-center">
            {item.whatBroke}
          </span>
        </div>

        <div className="flex justify-between items-baseline py-2 border-b border-white/[0.04]">
          <span className="font-mono text-[9px] uppercase text-[var(--text-3)] tracking-[0.1em] shrink-0">
            WHY IT MATTERS
          </span>
          <span className="font-sans text-[13px] font-normal text-[var(--text-2)] max-w-[60%] text-right self-center">
            {item.whyItMatters}
          </span>
        </div>
      </div>

      {/* Bottom line */}
      <div className="pt-5 mt-4 border-t border-transparent">
        <p className="font-serif italic font-light text-[15px] text-[var(--text-3)] leading-relaxed group-hover:text-[var(--text-2)] transition-colors duration-200">
          "This should have been a regression test."
        </p>
      </div>
    </div>
  );
}
