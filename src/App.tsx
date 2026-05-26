/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { FAILURE_CASES } from './data';
import { CaseCard } from './components/CaseCard';
import { ScrollReveal, ScrollLine } from './components/ScrollReveal';
import { WordRevealText } from './components/WordRevealText';
import { SubmissionFlow } from './components/SubmissionFlow';
import { SearchExperience } from './components/SearchExperience';

export default function App() {
  // Navigation alpha transition state (Rule 12)
  const [navScrolled, setNavScrolled] = useState(false);
  
  // High-performance scroll tracking for background parallax (Rule 10)
  const heroRef = useRef<HTMLDivElement>(null);

  // Selector state for selected Case ID to sync with Section 5 Form Intake
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Selector state for highlighted search match card
  const [highlightedCaseId, setHighlightedCaseId] = useState<string | null>(null);

  // Mobile search overlay state (Rule 12/Desktop responsive separation)
  const [mobileSearchActive, setMobileSearchActive] = useState(false);

  // References to section scroll anchoring
  const caseCardsRef = useRef<HTMLDivElement>(null);
  const submissionSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      
      // Toggle navigation background past 60px scroll (Rule 12)
      if (y > 60) {
        setNavScrolled(true);
      } else {
        setNavScrolled(false);
      }

      // Parallax effect on hero background (Rule 10)
      if (heroRef.current) {
        heroRef.current.style.backgroundPosition = `50% ${50 + y * 0.012}%`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handler for case number clicks to prefill form and scroll (Rule 6 removing friction)
  const handleCaseSelect = (caseId: string) => {
    setSelectedCaseId(caseId);
    
    // Smooth scroll down to submission section
    if (submissionSectionRef.current) {
      submissionSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handler for search result selection
  const handleSearchCaseSelect = (caseId: string) => {
    setSelectedCaseId(caseId);         // Sync form intake state
    setHighlightedCaseId(caseId);     // Trigger custom Apple style flash trigger

    // Scroll to the card
    const cardEl = document.getElementById(`case-card-${caseId}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // After 2.2 seconds (matching .case-card-flash animation), clear highlight style safely
    setTimeout(() => {
      setHighlightedCaseId(null);
    }, 2200);
  };

  const handleOpenSubmitForm = () => {
    if (submissionSectionRef.current) {
      submissionSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Curated lists parsed as dropdown options
  const dropdownOptions = [
    ...FAILURE_CASES.map(item => `Case ${item.id} : ${item.title}`),
    "Case 11: Something else"
  ];

  return (
    <div className="relative min-h-screen bg-[var(--bg-1)] selection:bg-[var(--accent-sub)] selection:text-[var(--text-0)] text-[var(--text-1)] overflow-x-hidden">
      
      {/* Absolute high-contrast grain filter overlay (Rule 11) */}
      <div className="noise-overlay" />

      {/* ================= NAVIGATION (Rule 12 Frosted Glass) ================= */}
      <nav
        style={{
          background: navScrolled ? 'rgba(0, 0, 0, 0.92)' : 'transparent',
          backdropFilter: navScrolled ? 'blur(24px) saturate(180%)' : 'none',
          WebkitBackdropFilter: navScrolled ? 'blur(24px) saturate(180%)' : 'none',
          borderBottom: navScrolled ? '1px solid var(--bg-4)' : '1px solid transparent'
        }}
        className="fixed top-0 left-0 right-0 h-[60px] z-50 flex items-center justify-between px-4 md:px-12 transition-all duration-400 ease-out"
      >
        {/* Mobile Search Active State Overlay */}
        {mobileSearchActive ? (
          <div className="w-full h-full flex items-center gap-4 px-2" id="nav-mobile-search-overlay-container">
            <div className="flex-1">
              <SearchExperience 
                onSelectCase={(id) => {
                  handleSearchCaseSelect(id);
                  setMobileSearchActive(false);
                }}
                openSubmitForm={() => {
                  handleOpenSubmitForm();
                  setMobileSearchActive(false);
                }}
              />
            </div>
            <button
              onClick={() => setMobileSearchActive(false)}
              className="p-2 text-[var(--text-3)] hover:text-[var(--text-1)] font-mono text-[11px] uppercase tracking-[0.05em] cursor-pointer"
              aria-label="Close search overlay"
            >
              CLOSE
            </button>
          </div>
        ) : (
          <>
            {/* Logo Container */}
            <div className="flex items-center shrink-0">
              {/* SVG logo: Stonepath Labs mark */}
              <svg width="190" height="42" viewBox="0 0 190 42" fill="none" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer select-none">
                <g transform="translate(4, 5)">
                  {/* 4 stacked diagonal stone shapes in grayscale gradient */}
                  {/* Slab 1 (Top): Smallest */}
                  <path d="M26 2 L34 2 C34.8 2 35.4 2.4 35.1 3.2 L33.6 6.8 C33.3 7.6 32.3 8 31.5 8 L23.5 8 C22.7 8 22.1 7.6 22.4 6.8 L23.9 3.2 C24.2 2.4 25.2 2 26 2 Z" fill="#E5E5E5" />
                  {/* Slab 2 */}
                  <path d="M19 10 L31 10 C31.8 10 32.4 10.4 32.1 11.2 L30.3 14.8 C30.0 15.6 29.0 16 28.2 16 L16.2 16 C15.4 16 14.8 15.6 15.1 14.8 L16.9 11.2 C17.2 10.4 18.2 10 19 10 Z" fill="#D4D4D4" />
                  {/* Slab 3 */}
                  <path d="M12 18 L28 18 C28.8 18 29.4 18.4 29.1 19.2 L26.9 22.8 C26.6 23.6 25.6 24 24.8 24 L8.8 24 C8.0 24 7.4 23.6 7.7 22.8 L9.9 19.2 C10.2 18.4 11.2 18 12 18 Z" fill="#A3A3A3" />
                  {/* Slab 4 (Bottom): Widest, most rounded/slanted */}
                  <path d="M5 26 L25 26 C25.8 26 26.4 26.4 26.0 27.2 L23.4 30.8 C23.0 31.6 22.0 32 21.2 32 L1.2 32 C0.4 32 -0.2 31.6 0.1 30.8 L2.7 27.2 C3.1 26.4 4.2 26 5 26 Z" fill="#737373" />
                </g>
                {/* Vertical line separator */}
                <line x1="47" y1="6" x2="47" y2="36" stroke="#404040" strokeWidth="1" />
                {/* Text "Stonepath" */}
                <text x="56" y="24" fill="#FFFFFF" fontFamily="Fraunces, Georgia, serif" fontSize="19" fontWeight="300" letterSpacing="0.01em">Stonepath</text>
                {/* Text "LAB" */}
                <text x="57" y="34" fill="#a3a3a3" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="0.25em">LAB</text>
              </svg>
            </div>

            {/* Right container containing Desktop Search, Desktop CTA, and Mobile Quick Controls */}
            <div className="flex items-center gap-4">
              {/* Desktop Only Inline Search (Before CTA) */}
              <div className="hidden md:block">
                <SearchExperience 
                  onSelectCase={handleSearchCaseSelect}
                  openSubmitForm={handleOpenSubmitForm}
                />
              </div>

              {/* Mobile Only: Magnifying action trigger icon */}
              <button
                onClick={() => setMobileSearchActive(true)}
                className="md:hidden p-2 text-[var(--text-3)] hover:text-[var(--text-1)] cursor-pointer"
                aria-label="Open search patterns"
              >
                {/* Minimal magnifying glass SVG (16px) */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>

              {/* Submit CTA button */}
              <button
                onClick={handleOpenSubmitForm}
                className="font-sans text-[11px] md:text-[13px] font-medium text-[var(--text-1)] border border-[rgba(255,255,255,0.25)] px-4 md:px-[20px] py-[6px] md:py-[8px] rounded-[2px] bg-transparent hover:bg-[rgba(255,255,255,0.06)] transition-all duration-200 cursor-pointer"
              >
                Submit a Failure
              </button>
            </div>
          </>
        )}
      </nav>

      {/* ================= SECTION 1: HERO ================= */}
      <header
        ref={heroRef}
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.012) 0%, transparent 60%)
          `
        }}
        className="relative w-full min-h-screen flex flex-col justify-center items-center text-center px-6 md:px-[8vw] xl:px-[120px] pt-[120px] md:pt-[140px] pb-[80px] bg-black transition-all duration-150"
      >
        {/* Vertically centered container with generous breathing room */}
        <div className="max-w-[1200px] w-full mx-auto mt-0 space-y-10 flex flex-col items-center">
          
          {/* Custom Big Heading: Creative Museum Signboard (Delay 0ms) */}
          <div className="reveal visible flex flex-col items-center text-center w-full max-w-[680px] mx-auto pb-4" style={{ '--delay': '0ms' } as React.CSSProperties}>
            <div className="flex items-center justify-between w-full border-b border-[rgba(255,255,255,0.1)] pb-3 mb-4">
              <span className="font-mono text-[9px] text-[var(--text-3)] uppercase tracking-[0.25em] select-none">PERMANENT EXHIBITION</span>
              <span className="font-mono text-[9px] text-[var(--text-3)] uppercase tracking-[0.25em] select-none">EST. 2026</span>
            </div>
            
            <h1 className="font-serif text-[clamp(38px,6vw,72px)] text-[var(--text-0)] font-extralight tracking-tight leading-none uppercase italic py-2">
              Agent Fail Museum
            </h1>
            
            <div className="flex items-center justify-between w-full border-t border-[rgba(255,255,255,0.1)] pt-3 mt-4">
              <span className="font-mono text-[9px] text-[var(--text-3)] uppercase tracking-[0.25em] select-none">STONEPATH LABS REPOSITORY</span>
              <span className="font-mono text-[9px] text-[var(--text-3)] uppercase tracking-[0.25em] select-none">[ PUBLIC ARCHIVE ]</span>
            </div>
          </div>

          {/* Word-by-Word Headline Reveal (Delay 180ms) */}
          <div className="pt-2 text-center">
            <WordRevealText
              lines={[
                ["AI", "agents", "are", "starting", "to", "break"],
                ["in", "ways", "software", "teams"],
                ["are", "not", "ready", "for."]
              ]}
              startDelay={180}
            />
          </div>

          {/* Subheadline (Delay 900ms) */}
          <div 
            className="reveal visible pt-2 flex justify-center" 
            style={{ '--delay': '900ms' } as React.CSSProperties}
          >
            <p className="font-sans text-body-custom font-light text-[var(--text-2)] leading-[1.75] max-w-[620px] text-center">
              We're documenting failure patterns from teams building agents, RAG systems, copilots, and LLM workflows, so these failures become replayable tests instead of repeated mistakes.
            </p>
          </div>

          {/* CTAs (Delay 1100ms) */}
          <div 
            className="reveal visible flex flex-col sm:flex-row items-center justify-center gap-[28px] pt-4 w-full" 
            style={{ '--delay': '1100ms' } as React.CSSProperties}
          >
            {/* Primary Magnetic CTA */}
            <button
              onClick={() => {
                if (submissionSectionRef.current) {
                  submissionSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="group relative w-[240px] sm:w-[250px] h-[52px] bg-white text-black overflow-hidden rounded-[2px] font-sans text-[14px] font-semibold tracking-[0.03em] cursor-pointer"
            >
              {/* Layer 1 */}
              <span className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out transform group-hover:-translate-y-full group-hover:opacity-0 bg-white text-black">
                Submit a Failure Pattern
              </span>
              {/* Layer 2 */}
              <span className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 bg-white text-black">
                Submit a Failure Pattern →
              </span>
            </button>

            {/* Secondary Link Scroll */}
            <button
              onClick={() => {
                if (caseCardsRef.current) {
                  caseCardsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="font-sans text-[14px] font-normal text-[var(--text-3)] hover:text-[var(--text-2)] hover:underline bg-transparent border-none p-0 cursor-pointer transition-colors duration-150"
            >
              View failure cards ↓
            </button>
          </div>
        </div>

        {/* Scroll Indicator at bottom (80px from bottom) */}
        <div className="absolute bottom-[80px] left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <div className="w-[1px] bg-[var(--bg-4)] pulse-scroll-line" />
          <span className="font-mono text-[9px] uppercase text-[var(--text-4)] tracking-[0.15em] mt-3 select-none">
            SCROLL
          </span>
        </div>
      </header>

      {/* ================= SECTION 2: STATEMENT ================= */}
      <section className="px-6 md:px-[8vw] xl:px-[120px] py-[clamp(100px,14vw,200px)] flex flex-col items-center justify-center text-center">
        {/* Animated rule line */}
        <ScrollLine className="mb-14" />

        <div className="max-w-[1000px] space-y-4">
          <ScrollReveal delay={100}>
            <p className="font-serif text-display italic text-[var(--text-1)]">
              "Failed agent runs should not disappear into logs."
            </p>
          </ScrollReveal>

          <ScrollReveal delay={250}>
            <p className="font-serif text-display text-[var(--text-3)] pt-1">
              "They should become tests."
            </p>
          </ScrollReveal>

          <ScrollReveal delay={450}>
            <p className="font-sans text-body-custom text-[var(--text-3)] max-w-[480px] mx-auto pt-10">
              The demo era is ending. The release era is starting.
            </p>
          </ScrollReveal>
        </div>

        {/* Animated rule line */}
        <ScrollLine className="mt-14" />
      </section>

      {/* ================= SECTION 3: CASE CARDS ================= */}
      <section
        ref={caseCardsRef}
        id="archive-section"
        className="px-6 md:px-[8vw] xl:px-[120px] py-[clamp(80px,10vw,140px)]"
      >
        <div className="max-w-[1200px] mx-auto space-y-12">
          
          {/* Section Header */}
          <ScrollReveal delay={0} className="space-y-4">
            <span className="font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.16em]">
              DOCUMENTED FAILURE PATTERNS
            </span>
            <h2 className="font-serif text-display text-[var(--text-1)] mt-4">
              Ten failures every AI builder should recognize.
            </h2>
            <p className="font-sans text-body-custom text-[var(--text-3)] mt-[20px] max-w-[520px]">
              Have you seen one of these? Click the case number to pre-fill your submission.
            </p>
          </ScrollReveal>

          {/* Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-8">
            {FAILURE_CASES.map((item, idx) => {
              // Stagger cards in pairs by 80ms increments (Rule 7)
              const staggerDelay = (idx % 2) * 80;
              return (
                <ScrollReveal key={item.id} delay={staggerDelay}>
                  <CaseCard
                    item={item}
                    index={idx}
                    onSelect={handleCaseSelect}
                    isHighlighted={highlightedCaseId === item.id}
                  />
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= SECTION 4: PATTERN RECOGNITION ================= */}
      <section className="px-6 md:px-[8vw] xl:px-[120px] py-[clamp(80px,10vw,140px)] bg-black/20">
        <ScrollLine className="mb-16" />

        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
          
          {/* Left Column Text */}
          <ScrollReveal delay={0} className="space-y-7 max-w-[480px]">
            <div className="space-y-4">
              <span className="font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.16em]">
                PATTERN RECOGNITION
              </span>
              <h2 className="font-serif text-display text-[var(--text-1)] mt-4">
                Have you seen one of these?
              </h2>
            </div>

            <p className="font-sans text-body-custom text-[var(--text-2)] leading-[1.75] mt-7">
              You don't need to write a full report. Just tell us which pattern you saw, what you were building, and what changed. The best submissions become public case cards.
            </p>

            <p className="font-sans text-[13px] text-[var(--text-3)] leading-[1.65] mt-9">
              Anonymous submissions are always welcome. We will never publish your name, company, or project details without your explicit permission.
            </p>
          </ScrollReveal>

          {/* Right Column Interactive Grid */}
          <ScrollReveal delay={150} className="space-y-5">
            <span className="block font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.12em]">
              SELECT THE PATTERN YOU SAW
            </span>

            <div className="flex flex-wrap gap-[10px] pt-[20px]" role="group" aria-label="Quick Select Case">
              {FAILURE_CASES.map((item) => {
                const isSelected = selectedCaseId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleCaseSelect(item.id)}
                    className={`font-mono text-[10px] uppercase rounded-[2px] p-[10px_16px] border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--accent-sub)] border-[rgba(255,255,255,0.5)] text-[var(--text-0)]'
                        : 'border-[var(--bg-4)] text-[var(--text-3)] hover:border-[rgba(255,255,255,0.25)] hover:text-[var(--text-1)]'
                    }`}
                  >
                    CASE {item.id}
                  </button>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ================= SECTION 5: SUBMISSION FORM & SECTION 6: POST-SUBMIT ================= */}
      <section className="px-6 md:px-[8vw] xl:px-[120px] py-[clamp(80px,10vw,140px)] border-t border-[var(--bg-4)]">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal delay={0}>
            <SubmissionFlow
              curatedCasesOptions={dropdownOptions}
              selectedCuratedId={selectedCaseId}
              onClearCuratedSelection={() => setSelectedCaseId(null)}
              formRef={submissionSectionRef}
            />
          </ScrollReveal>
        </div>
      </section>

      {/* ================= SECTION 7: FOOTER ================= */}
      <footer className="border-t border-[var(--bg-4)] px-6 md:px-[8vw] xl:px-[120px] py-[80px] pb-[56px] bg-[#000000]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-start">
          
          {/* Left info */}
          <div className="space-y-1">
            <span className="block font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.14em]">
              STONEPATH LABS
            </span>
            <span className="block font-mono text-[10px] uppercase text-[var(--text-1)] tracking-[0.14em]">
              TAQ
            </span>
          </div>

          {/* Center Contact (Rule 1) */}
          <div className="space-y-1">
            <span className="block font-sans text-[13px] text-[var(--text-3)]">
              hello@stonepathlab.net
            </span>
            <span className="block font-sans text-[13px] hover:text-[var(--text-1)] transition-colors duration-200 text-[var(--text-3)]">
              <a href="https://stonepathlab.net" target="_blank" rel="noopener noreferrer">stonepathlab.net</a>
            </span>
          </div>

          {/* Right Credit labels */}
          <div className="md:text-right space-y-1">
            <span className="block font-sans text-[12px] text-[var(--text-3)]">
              Agent Fail Museum
            </span>
            <span className="block font-sans text-[12px] text-[var(--text-4)]">
              Public Archive · 2025
            </span>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="border-t border-[var(--bg-4)] mt-14 pt-6 text-center">
          <p className="font-sans text-[11px] text-[var(--text-3)] tracking-[0.06em]">
            Serious AI infrastructure can be built from anywhere.
          </p>
        </div>
      </footer>
    </div>
  );
}
