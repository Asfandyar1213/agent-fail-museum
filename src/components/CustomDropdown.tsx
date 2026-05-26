/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomDropdownProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
  placeholder?: string;
  id?: string;
}

export function CustomDropdown({ options, selected, onSelect, placeholder = "Select a known pattern or describe a new one", id }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full" id={id}>
      <button
        type="button"
        id={`${id}-trigger`}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center bg-[var(--bg-card)] text-[var(--text-0)] border border-[var(--border)] rounded-[2px] p-[13px_15px] text-left font-sans text-[15px] focus:outline-none focus:border-[var(--amber)] focus:shadow-[0_0_0_3px_var(--amber-dim)] transition-all duration-200 cursor-pointer hover:border-[var(--amber)]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selected ? "text-[var(--text-0)]" : "text-[var(--text-3)] italic"}>
          {selected || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[var(--text-3)] transition-transform duration-250 flex-shrink-0 ml-2 ${isOpen ? 'rotate-180 text-[var(--amber)]' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-[var(--bg-stone)] border border-[var(--border)] rounded-[2px] custom-dropdown-panel overflow-hidden">
          <ul className="max-h-[260px] overflow-y-auto divide-y divide-[var(--border)]" role="listbox">
            {options.map((option, index) => {
              const isSelected = selected === option;
              return (
                <li
                  key={index}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => { onSelect(option); setIsOpen(false); }}
                  className={`p-[13px_15px] font-sans text-[14px] transition-colors duration-120 cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--amber-sub)] text-[var(--amber)] font-medium'
                      : 'text-[var(--text-1)] hover:bg-[var(--bg-card)] hover:text-[var(--text-0)]'
                  }`}
                >
                  {option}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
