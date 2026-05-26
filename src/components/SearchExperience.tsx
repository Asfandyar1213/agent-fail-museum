/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { FailureCase } from '../types';
import { FAILURE_CASES } from '../data';

interface SearchExperienceProps {
  onSelectCase: (caseId: string) => void;
  openSubmitForm: () => void;
}

const FILTERS_MAP: Record<string, string[]> = {
  all: [],
  retrieval: ['03', '09'],
  prompt: ['01', '05', '06'],
  tool: ['04', '10'],
  model: ['02', '07', '08']
};
const FILTERS = [
  { slug: 'all',       label: 'All' },
  { slug: 'retrieval', label: 'Retrieval' },
  { slug: 'prompt',    label: 'Prompt' },
  { slug: 'tool',      label: 'Tool' },
  { slug: 'model',     label: 'Model' }
];

export function SearchExperience({ onSelectCase, openSubmitForm }: SearchExperienceProps) {
  const [query, setQuery]               = useState('');
  const [isFocused, setIsFocused]       = useState(false);
  const [selectedFilter, setFilter]     = useState('all');
  const [activeCursor, setActiveCursor] = useState(-1);
  const [recentlyViewed, setRecent]     = useState<FailureCase[]>([]);
  const [announced, setAnnounced]       = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const s = sessionStorage.getItem('recently_viewed_cases');
      if (s) setRecent(JSON.parse(s));
    } catch (_) {}
  }, []);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsFocused(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const searchResults = useMemo(() => {
    if (!isFocused || !query.trim()) return [];
    let cases = FAILURE_CASES;
    if (selectedFilter !== 'all') cases = cases.filter(c => (FILTERS_MAP[selectedFilter] || []).includes(c.id));
    const q = query.toLowerCase().trim();
    const words = q.split(/\s+/).filter(Boolean);
    return cases
      .map(c => {
        let score = words.filter(w => c.title.toLowerCase().includes(w)).length * 30
          + words.filter(w => c.whatChanged.toLowerCase().includes(w)).length * 20
          + words.filter(w => c.whatBroke.toLowerCase().includes(w)).length * 20
          + words.filter(w => c.whyItMatters.toLowerCase().includes(w)).length * 10;
        if (c.title.toLowerCase().includes(q)) score += 50;
        if (c.whatChanged.toLowerCase().includes(q)) score += 30;
        return { c, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(x => x.c);
  }, [query, selectedFilter, isFocused]);

  useEffect(() => {
    if (searchResults.length > 0) setAnnounced(`${searchResults.length} patterns found.`);
    else if (query.trim()) setAnnounced('No matching patterns.');
  }, [searchResults, query]);

  const handleSelect = (item: FailureCase) => {
    onSelectCase(item.id);
    setRecent(prev => {
      const updated = [item, ...prev.filter(c => c.id !== item.id)].slice(0, 3);
      try { sessionStorage.setItem('recently_viewed_cases', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    setIsFocused(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const items = query.trim() ? searchResults : recentlyViewed;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveCursor(p => (p < items.length - 1 ? p + 1 : 0)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveCursor(p => (p > 0 ? p - 1 : items.length - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (activeCursor >= 0 && items[activeCursor]) handleSelect(items[activeCursor]); else if (searchResults[0]) handleSelect(searchResults[0]); }
    else if (e.key === 'Escape') { setIsFocused(false); inputRef.current?.blur(); }
  };

  const highlight = (text: string, search: string) => {
    if (!search.trim()) return text;
    const regex = new RegExp(`(${search.trim().split(/\s+/).map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})`, 'gi');
    return <>{text.split(regex).map((p, i) => regex.test(p) ? <span key={i} className="highlight-text font-medium">{p}</span> : p)}</>;
  };

  const isActive = isFocused || query.length > 0;

  return (
    <div ref={containerRef} className={`search-container h-[36px] flex items-center ${isActive ? 'active' : ''}`}>
      <div className="sr-only" aria-live="polite">{announced}</div>
      <div className="relative w-full">
        <div className="absolute left-[10px] top-1/2 -translate-y-1/2 z-10">
          <Search className="w-[14px] h-[14px] text-[var(--text-3)]" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setActiveCursor(-1); }}
          onFocus={() => { setIsFocused(true); setActiveCursor(-1); }}
          onKeyDown={handleKeyDown}
          placeholder="Search patterns..."
          aria-label="Search failure patterns"
          aria-haspopup="listbox"
          aria-expanded={isActive}
          className="search-input"
        />
        {isActive && (
          <button onClick={() => { setQuery(''); setIsFocused(false); setFilter('all'); }} type="button"
            className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[var(--text-3)] hover:text-[var(--text-0)] cursor-pointer">
            <X className="w-[14px] h-[14px]" />
          </button>
        )}

        <div className={`search-dropdown ${isActive ? 'visible' : ''}`} role="listbox">
          <div className="px-3 py-2 bg-[var(--bg-card)] border-b border-[var(--border)] flex gap-1.5 overflow-x-auto">
            {FILTERS.map(f => (
              <button key={f.slug} onClick={e => { e.stopPropagation(); setFilter(f.slug); setActiveCursor(-1); }}
                className={`font-mono text-[9px] uppercase px-2.5 py-1.5 rounded-[2px] border transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  selectedFilter === f.slug
                    ? 'bg-[var(--amber)] border-[var(--amber)] text-white font-semibold'
                    : 'bg-[var(--bg-stone)] border-[var(--border)] text-[var(--text-3)] hover:text-[var(--text-0)] hover:border-[var(--amber)]'
                }`}>
                {f.label}
              </button>
            ))}
          </div>

          <div className="divide-y divide-[var(--border)] bg-[var(--bg-stone)] max-h-[280px] overflow-y-auto">
            {query.trim().length > 0 && searchResults.length > 0 && searchResults.map((item, idx) => (
              <div key={item.id} role="option" aria-selected={activeCursor === idx}
                onClick={() => handleSelect(item)}
                style={{ '--result-delay': `${idx * 35}ms` } as React.CSSProperties}
                className={`search-result search-result-animated flex flex-col gap-1 ${activeCursor === idx ? 'active-key' : ''}`}>
                <div className="flex justify-between items-baseline font-mono text-[9px] tracking-[0.08em]">
                  <span className="text-[var(--amber)] font-medium">CASE {item.id}</span>
                  <span className="text-[var(--text-4)] uppercase">Select →</span>
                </div>
                <div className="font-serif text-[14px] text-[var(--text-0)] font-light leading-snug">{highlight(item.title, query)}</div>
                <div className="text-[12px] font-sans text-[var(--text-3)] truncate">Changed: <span className="text-[var(--text-2)]">{highlight(item.whatChanged, query)}</span></div>
              </div>
            ))}

            {!query.trim() && recentlyViewed.length > 0 && (
              <div>
                <div className="px-3 py-2 bg-[var(--bg-card)] font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--text-3)]">RECENTLY VIEWED</div>
                {recentlyViewed.map((item, idx) => (
                  <div key={item.id} role="option" aria-selected={activeCursor === idx}
                    onClick={() => handleSelect(item)}
                    className={`search-result flex flex-col gap-1 ${activeCursor === idx ? 'active-key' : ''}`}>
                    <div className="flex justify-between items-baseline font-mono text-[9px]">
                      <span className="text-[var(--amber)]">CASE {item.id}</span>
                      <span className="text-[var(--text-4)]">HISTORY</span>
                    </div>
                    <div className="font-serif text-[14px] text-[var(--text-0)] font-light">{item.title}</div>
                  </div>
                ))}
              </div>
            )}

            {query.trim().length > 0 && searchResults.length === 0 && (
              <div className="p-6 text-center space-y-3">
                <span className="block font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.18em]">NO MATCHING PATTERNS</span>
                <p className="font-sans text-[13px] text-[var(--text-3)] leading-relaxed max-w-[220px] mx-auto">
                  This might be a new failure worth documenting.
                </p>
                <button type="button" onClick={e => { e.stopPropagation(); setIsFocused(false); openSubmitForm(); }}
                  className="font-sans text-[12px] font-medium text-white bg-[var(--amber)] px-4 py-2 rounded-[2px] cursor-pointer hover:bg-[var(--amber-2)] transition-colors">
                  Record this pattern
                </button>
              </div>
            )}

            {!query.trim() && recentlyViewed.length === 0 && (
              <div className="p-5 text-center font-sans text-[12px] italic text-[var(--text-3)]">
                Search by case number, system, or failure type...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
