/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Loader } from 'lucide-react';
import { FailureCase } from '../types';
import { FAILURE_CASES } from '../data';

interface SearchExperienceProps {
  onSelectCase: (caseId: string) => void;
  openSubmitForm: () => void;
}

// Map of category slug to included case ids
const FILTERS_MAP: Record<string, string[]> = {
  all: [],
  retrieval: ['03', '09'],
  prompt: ['01', '05', '06'],
  tool: ['04', '10'],
  model: ['02', '07', '08']
};

const FILTERS = [
  { slug: 'all', label: 'All Patterns' },
  { slug: 'retrieval', label: 'Retrieval' },
  { slug: 'prompt', label: 'Prompt' },
  { slug: 'tool', label: 'Tool' },
  { slug: 'model', label: 'Model' }
];

export function SearchExperience({ onSelectCase, openSubmitForm }: SearchExperienceProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeCursor, setActiveCursor] = useState(-1);
  const [recentlyViewed, setRecentlyViewed] = useState<FailureCase[]>([]);
  const [isAnnouncing, setIsAnnouncing] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Read recently viewed from sessionStorage safely
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('recently_viewed_cases');
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error reading recently viewed cases", e);
    }
  }, []);

  // Handle click outside to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Weighted fuzzy search score calculation
  const searchResults = useMemo(() => {
    if (!isFocused) return [];

    let cases = FAILURE_CASES;

    // 1. Filter by category
    if (selectedFilter !== 'all') {
      const allowedIds = FILTERS_MAP[selectedFilter] || [];
      cases = cases.filter(c => allowedIds.includes(c.id));
    }

    // 2. No query? Return empty array (Recently viewed lists will render instead)
    if (!query.trim()) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);

    const scored = cases.map(c => {
      let score = 0;
      
      const titleMatches = queryWords.filter(word => c.title.toLowerCase().includes(word)).length;
      const changedMatches = queryWords.filter(word => c.whatChanged.toLowerCase().includes(word)).length;
      const brokeMatches = queryWords.filter(word => c.whatBroke.toLowerCase().includes(word)).length;
      const whyMatches = queryWords.filter(word => c.whyItMatters.toLowerCase().includes(word)).length;

      // Weighting: Title (3x), whatChanged (2x), whatBroke (2x), whyItMatters (1x)
      score += titleMatches * 30;
      score += changedMatches * 20;
      score += brokeMatches * 20;
      score += whyMatches * 10;

      // Exact phrase match bonus
      if (c.title.toLowerCase().includes(normalizedQuery)) score += 50;
      if (c.whatChanged.toLowerCase().includes(normalizedQuery)) score += 30;
      if (c.whatBroke.toLowerCase().includes(normalizedQuery)) score += 30;

      return { case: c, score };
    });

    // Filter out non-matching cases (score must be > 0), and sort in descending score order
    const filtered = scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.case);

    return filtered;
  }, [query, selectedFilter, isFocused]);

  // Screen reader interactive announcements
  useEffect(() => {
    if (searchResults.length > 0) {
      setIsAnnouncing(`${searchResults.length} failure patterns found.`);
    } else if (query.trim() && searchResults.length === 0) {
      setIsAnnouncing('No matching patterns found.');
    }
  }, [searchResults, query]);

  // Handle case selection
  const handleCaseSelect = (item: FailureCase) => {
    // Scroll and highlight
    onSelectCase(item.id);
    
    // Save to recently viewed cases lists (max 3 items)
    setRecentlyViewed(prev => {
      const filtered = prev.filter(c => c.id !== item.id);
      const updated = [item, ...filtered].slice(0, 3);
      try {
        sessionStorage.setItem('recently_viewed_cases', JSON.stringify(updated));
      } catch (e) {
        console.error("Error storing recently viewed cases", e);
      }
      return updated;
    });

    // Reset input fields
    setIsFocused(false);
    setQuery('');
  };

  // Keyboard navigation bindings
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If empty states or no dropdown, do standard inputs
    const resultsCount = query.trim() ? searchResults.length : recentlyViewed.length;
    const activeItems = query.trim() ? searchResults : recentlyViewed;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveCursor(prev => (prev < resultsCount - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveCursor(prev => (prev > 0 ? prev - 1 : resultsCount - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeCursor >= 0 && activeCursor < resultsCount) {
        handleCaseSelect(activeItems[activeCursor]);
      } else if (searchResults.length > 0) {
        handleCaseSelect(searchResults[0]);
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  // Highlight matching segments helper supporting casing matching aesthetics
  const highlightMatches = (text: string, search: string) => {
    if (!search.trim()) return text;
    const keywords = search.trim().split(/\s+/).filter(Boolean);
    // Build alternate pattern match
    const regexStr = keywords.map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${regexStr})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, i) => 
          regex.test(part) ? (
            <span key={i} className="highlight-text font-medium">{part}</span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const isActive = isFocused || query.length > 0;

  return (
    <div 
      ref={containerRef} 
      className={`search-container h-[38px] flex items-center ${isActive ? 'active' : ''}`}
      id="museum-nav-search-module"
    >
      {/* Hidden ARIA Announcements Live Region */}
      <div className="sr-only" aria-live="polite">
        {isAnnouncing}
      </div>

      <div className="relative w-full">
        {/* Search magnifying glass button or X reset icon */}
        <div className="absolute left-[12px] top-1/2 -translate-y-1/2 z-10 text-[var(--text-3)]">
          <Search className="w-4 h-4 text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveCursor(-1);
          }}
          onFocus={() => {
            setIsFocused(true);
            setActiveCursor(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search failure patterns..."
          aria-label="Search failure patterns"
          aria-haspopup="listbox"
          aria-expanded={isActive}
          className="search-input"
        />

        {isActive && (
          <button
            onClick={() => {
              setQuery('');
              setIsFocused(false);
              setSelectedFilter('all');
            }}
            type="button"
            className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[var(--text-3)] hover:text-[var(--text-1)] cursor-pointer"
            aria-label="Clear search query"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* ================= SEARCH DROPDOWN OR RECENTS ================= */}
        <div 
          className={`search-dropdown ${isActive ? 'visible' : ''}`}
          role="listbox"
        >
          {/* Sub Filters listed beautifully below input box inside dropdown */}
          <div className="px-4 py-3 bg-[var(--bg-0)] border-b border-[var(--bg-4)] flex items-center gap-1.5 overflow-x-auto whitespace-nowrap min-w-0">
            {FILTERS.map(f => (
              <button
                key={f.slug}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFilter(f.slug);
                  setActiveCursor(-1);
                }}
                className={`font-mono text-[9px] uppercase px-2.5 py-1.5 rounded-[2px] transition-all duration-150 border cursor-pointer ${
                  selectedFilter === f.slug
                    ? 'bg-white border-white text-black font-semibold'
                    : 'bg-[var(--bg-2)] border-[var(--bg-4)] text-[var(--text-3)] hover:text-[var(--text-1)] hover:border-[var(--text-2)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Core Dropdown Contents */}
          <div className="divide-y divide-[rgba(255,255,255,0.03)] bg-[var(--bg-2)] max-h-[300px] overflow-y-auto">
            
            {/* Case A: Active Search Results */}
            {query.trim().length > 0 && searchResults.length > 0 && (
              searchResults.map((item, idx) => {
                const isItemActive = activeCursor === idx;
                return (
                  <div
                    key={item.id}
                    role="option"
                    aria-selected={isItemActive}
                    onClick={() => handleCaseSelect(item)}
                    style={{ '--result-delay': `${idx * 40}ms` } as React.CSSProperties}
                    className={`search-result search-result-animated flex flex-col gap-1.5 ${
                      isItemActive ? 'active-key bg-[var(--bg-3)]' : ''
                    }`}
                  >
                    <div className="flex justify-between items-baseline font-mono text-[9px] tracking-[0.08em]">
                      <span className="text-white font-medium">CASE {item.id}</span>
                      <span className="text-[var(--text-4)] uppercase">RECONSTITUTE →</span>
                    </div>
                    <div className="font-serif text-[14px] text-[var(--text-1)] font-light leading-snug">
                      {highlightMatches(item.title, query)}
                    </div>
                    <div className="text-[12px] font-sans text-[var(--text-3)] truncate leading-normal">
                      Changed:{' '}
                      <span className="text-[var(--text-2)]">
                        {highlightMatches(item.whatChanged, query)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {/* Case B: Empty Query showing Recently Viewed list with nice title */}
            {!query.trim() && recentlyViewed.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-black/40 font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--text-3)]">
                  RECENTLY VIEWED
                </div>
                {recentlyViewed.map((item, idx) => {
                  const isItemActive = activeCursor === idx;
                  return (
                    <div
                      key={item.id}
                      role="option"
                      aria-selected={isItemActive}
                      onClick={() => handleCaseSelect(item)}
                      className={`search-result flex flex-col gap-1.5 ${
                        isItemActive ? 'active-key bg-[var(--bg-3)]' : ''
                      }`}
                    >
                      <div className="flex justify-between items-baseline font-mono text-[9px]">
                        <span className="text-white">CASE {item.id}</span>
                        <span className="text-[var(--text-4)]">HISTORY</span>
                      </div>
                      <div className="font-serif text-[14px] text-[var(--text-1)] font-light">
                        {item.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Case C: No results found */}
            {query.trim().length > 0 && searchResults.length === 0 && (
              <div className="p-8 text-center space-y-4">
                <span className="block font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.18em]">
                  NO MATCHING PATTERNS
                </span>
                <p className="font-sans text-[13px] text-[var(--text-3)] leading-relaxed max-w-[240px] mx-auto">
                  We couldn't find a pattern matching your search. This might be a new failure type worth documenting.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFocused(false);
                    openSubmitForm();
                  }}
                  className="inline-block font-sans text-[12px] text-black bg-white select-none px-4 py-2 border-none rounded-[2px] font-medium tracking-wide active:scale-95 transition-all duration-150 cursor-pointer"
                >
                  Record This Pattern
                </button>
              </div>
            )}

            {/* Case D: Empty state completely (no query and no recently viewed cases) */}
            {!query.trim() && recentlyViewed.length === 0 && (
              <div className="p-6 text-center text-stone-600 font-sans text-[12px] italic">
                Type case number, system, or issue to begin...
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
