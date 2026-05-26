/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';

interface WordRevealTextProps {
  lines: string[][]; // A grid representing [LineIndex][WordIndex]
  startDelay?: number; // Starting offset in ms
}

export function WordRevealText({ lines, startDelay = 200 }: WordRevealTextProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, startDelay);
    return () => clearTimeout(timer);
  }, [startDelay]);

  // Flatten the lines to count global word indices for accurate continuous delay
  let cumulativeWordIndex = 0;

  return (
    <div className="font-serif text-hero text-[var(--text-0)] selection:bg-[var(--accent-sub)] selection:text-[var(--text-0)] leading-[1.03] tracking-[-0.03em]">
      {lines.map((lineWords, lineIdx) => {
        return (
          <div key={lineIdx} className="block overflow-hidden pb-1">
            {lineWords.map((word, wordIdx) => {
              const currentGlobalIndex = cumulativeWordIndex++;
              const delayMs = currentGlobalIndex * 35; // 35ms stagger
              
              const isLastWordOfAll = 
                lineIdx === lines.length - 1 && wordIdx === lineWords.length - 1;
              
              let renderedWord: React.ReactNode = word;
              if (isLastWordOfAll && word.endsWith('.')) {
                const base = word.slice(0, -1);
                renderedWord = (
                  <>
                    {base}
                    <span className="text-[var(--text-0)]">.</span>
                  </>
                );
              }

              return (
                <span
                  key={wordIdx}
                  style={{ '--word-delay': `${delayMs}ms` } as React.CSSProperties}
                  className={`word-reveal mr-[0.3em] inline-block ${mounted ? 'visible' : ''}`}
                >
                  {renderedWord}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
