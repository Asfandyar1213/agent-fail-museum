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

export function CustomDropdown({ options, selected, onSelect, placeholder = "Select failure pattern", id }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (option: string) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full" id={id}>
      <button
        type="button"
        id={`${id}-trigger`}
        onClick={handleToggle}
        className="w-full flex justify-between items-center bg-[var(--bg-2)] text-[var(--text-1)] border border-[var(--bg-4)] rounded-[2px] p-[14px_16px] text-left font-sans text-body-custom focus:outline-none focus:border-[rgba(255,255,255,0.3)] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)] transition-all duration-200 cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selected ? "text-[var(--text-1)]" : "text-[var(--text-3)] italic"}>
          {selected || placeholder}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-[var(--text-3)] transition-transform duration-300 ${isOpen ? 'transform rotate-180 text-[var(--text-0)]' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-[var(--bg-2)] border border-[rgba(255,255,255,0.25)] rounded-[2px] custom-dropdown-panel overflow-hidden transition-all duration-200">
          <ul 
            className="max-h-[280px] overflow-y-auto divide-y divide-[var(--bg-4)]"
            role="listbox"
          >
            {options.map((option, index) => {
              const isSelected = selected === option;
              return (
                <li
                  key={index}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option)}
                  className={`p-[14px_16px] text-[14px] font-sans transition-colors duration-150 cursor-pointer text-left ${
                    isSelected 
                      ? 'bg-[var(--accent-sub)] text-[var(--text-0)] font-medium' 
                      : 'hover:bg-[var(--bg-3)] hover:text-[var(--text-0)] text-[var(--text-2)]'
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
