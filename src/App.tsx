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
import { ActivityTicker } from './components/ActivityTicker';

export default function App() {
  const [navScrolled, setNavScrolled]             = useState(false);
  const [selectedCaseId, setSelectedCaseId]       = useState<string | null>(null);
  const [highlightedCaseId, setHighlightedCaseId] = useState<string | null>(null);
  const [mobileSearchActive, setMobileSearchActive] = useState(false);
  const [showMobileCta, setShowMobileCta]         = useState(false);
  const [showModal, setShowModal]                  = useState(false);
  const [submissionCount, setSubmissionCount]      = useState(0);
  const BASE_SUBMISSIONS = 47;

  const caseCardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setNavScrolled(y > 50);
      setShowMobileCta(y > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  useEffect(() => {
    let stored = 0;
    try { stored = (JSON.parse(localStorage.getItem('afm_failures') || '[]') as unknown[]).length; } catch (_) {}
    const target = BASE_SUBMISSIONS + stored;
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 36));
    const id = setInterval(() => {
      current = Math.min(current + step, target);
      setSubmissionCount(current);
      if (current >= target) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, []);

  const openModal  = () => setShowModal(true);
  const closeModal = () => { setShowModal(false); setSelectedCaseId(null); };
  const scrollToCards = () => caseCardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const handleCaseSelect = (caseId: string) => {
    setSelectedCaseId(caseId);
    openModal();
  };

  const handleSearchCaseSelect = (caseId: string) => {
    setSelectedCaseId(caseId);
    setHighlightedCaseId(caseId);
    document.getElementById(`case-card-${caseId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => setHighlightedCaseId(null), 2200);
  };

  const dropdownOptions = [
    ...FAILURE_CASES.map(c => `Case ${c.id} : ${c.title}`),
    'Case 11: Something else'
  ];

  const WEEKLY_BOUNTY = {
    caseId: '03',
    title: 'RAG Retrieval Drift',
    description: 'Embedding and chunking changes are the most under-documented failure trigger. We need real examples before they repeat.',
    hunters: 12,
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: 'var(--bg-stone)', color: 'var(--text-0)' }}>
      <div className="noise-overlay" />

      {/* ══ NAV ══ */}
      <nav
        style={{
          background: navScrolled ? 'rgba(244,241,234,0.96)' : 'transparent',
          backdropFilter: navScrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: navScrolled ? 'blur(16px)' : 'none',
          borderBottom: navScrolled ? '1px solid var(--border)' : '1px solid transparent',
        }}
        className="fixed top-0 left-0 right-0 h-[58px] z-50 flex items-center justify-between px-5 md:px-10 transition-all duration-300"
      >
        {mobileSearchActive ? (
          <div className="w-full flex items-center gap-3">
            <div className="flex-1">
              <SearchExperience
                onSelectCase={id => { handleSearchCaseSelect(id); setMobileSearchActive(false); }}
                openSubmitForm={() => { openModal(); setMobileSearchActive(false); }}
              />
            </div>
            <button onClick={() => setMobileSearchActive(false)}
              className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-2)] cursor-pointer bg-transparent border-none p-2">
              CLOSE
            </button>
          </div>
        ) : (
          <>
            {/* Logo */}
            <div className="flex items-center shrink-0">
              <svg width="180" height="40" viewBox="0 0 190 42" fill="none" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer select-none">
                <g transform="translate(4, 5)">
                  <path d="M26 2 L34 2 C34.8 2 35.4 2.4 35.1 3.2 L33.6 6.8 C33.3 7.6 32.3 8 31.5 8 L23.5 8 C22.7 8 22.1 7.6 22.4 6.8 L23.9 3.2 C24.2 2.4 25.2 2 26 2 Z" fill="#7A7068" />
                  <path d="M19 10 L31 10 C31.8 10 32.4 10.4 32.1 11.2 L30.3 14.8 C30.0 15.6 29.0 16 28.2 16 L16.2 16 C15.4 16 14.8 15.6 15.1 14.8 L16.9 11.2 C17.2 10.4 18.2 10 19 10 Z" fill="#5A5248" />
                  <path d="M12 18 L28 18 C28.8 18 29.4 18.4 29.1 19.2 L26.9 22.8 C26.6 23.6 25.6 24 24.8 24 L8.8 24 C8.0 24 7.4 23.6 7.7 22.8 L9.9 19.2 C10.2 18.4 11.2 18 12 18 Z" fill="#3D3830" />
                  <path d="M5 26 L25 26 C25.8 26 26.4 26.4 26.0 27.2 L23.4 30.8 C23.0 31.6 22.0 32 21.2 32 L1.2 32 C0.4 32 -0.2 31.6 0.1 30.8 L2.7 27.2 C3.1 26.4 4.2 26 5 26 Z" fill="#2C2820" />
                </g>
                <line x1="47" y1="8" x2="47" y2="34" stroke="var(--border)" strokeWidth="1" />
                <text x="56" y="23" fill="var(--text-0)" fontFamily="Fraunces, Georgia, serif" fontSize="17" fontWeight="300" letterSpacing="0.01em">Stonepath</text>
                <text x="57" y="34" fill="var(--text-3)" fontFamily="JetBrains Mono, monospace" fontSize="8.5" letterSpacing="0.24em">LAB</text>
              </svg>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <SearchExperience onSelectCase={handleSearchCaseSelect} openSubmitForm={openModal} />
              </div>
              <button onClick={() => setMobileSearchActive(true)}
                className="md:hidden p-2 text-[var(--text-2)] hover:text-[var(--text-0)] cursor-pointer" aria-label="Search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
              <button onClick={openModal}
                className="hidden md:inline-flex font-sans text-[13px] font-semibold text-white bg-[var(--amber)] hover:bg-[var(--amber-2)] px-5 py-[8px] rounded-[2px] transition-colors duration-200 cursor-pointer whitespace-nowrap">
                Submit a failure
              </button>
            </div>
          </>
        )}
      </nav>

      {/* ══ HERO ══ */}
      <header
        className="relative w-full md:min-h-[88vh] flex flex-col justify-center items-center text-center px-5 md:px-[8vw] xl:px-[120px] pt-[88px] md:pt-[100px] pb-[52px]"
        style={{ background: 'var(--bg-stone)' }}
      >
        <div className="max-w-[980px] w-full mx-auto flex flex-col items-center gap-5 md:gap-6">

          {/* Signboard */}
          <div className="reveal visible flex flex-col items-center w-full max-w-[560px]" style={{ '--delay': '0ms' } as React.CSSProperties}>
            <div className="flex items-center justify-between w-full border-b border-[var(--border)] pb-2.5 mb-3.5">
              <span className="font-mono text-[9px] uppercase text-[var(--text-3)] tracking-[0.22em]">PERMANENT EXHIBITION</span>
              <span className="font-mono text-[9px] uppercase text-[var(--text-3)] tracking-[0.22em]">EST. 2026</span>
            </div>
            <h1 className="font-serif text-[clamp(26px,4vw,48px)] text-[var(--text-0)] font-light tracking-tight leading-tight uppercase italic">
              Agent Fail Museum
            </h1>
            <div className="flex items-center justify-between w-full border-t border-[var(--border)] pt-2.5 mt-3.5">
              <span className="font-mono text-[9px] uppercase text-[var(--text-3)] tracking-[0.22em]">STONEPATH LABS REPOSITORY</span>
              <span className="font-mono text-[9px] uppercase text-[var(--text-3)] tracking-[0.22em]">[ PUBLIC ARCHIVE ]</span>
            </div>
          </div>

          {/* Main headline */}
          <WordRevealText
            lines={[['The', 'same', 'AI', 'failure'], ['should', 'not', 'happen', 'twice.']]}
            startDelay={150}
          />

          {/* Animated counter */}
          <div className="reveal visible" style={{ '--delay': '600ms' } as React.CSSProperties}>
            <div className="flex items-center justify-center gap-8 md:gap-12">
              <div className="text-center">
                <span className="font-serif text-[clamp(30px,5vw,52px)] font-light text-[var(--text-0)] tracking-[-0.025em] tabular-nums leading-none">{submissionCount}</span>
                <p className="font-mono text-[9px] uppercase text-[var(--text-3)] tracking-[0.16em] mt-2">Failures documented</p>
              </div>
              <div className="w-[1px] h-12 bg-[var(--border)]" />
              <div className="text-center">
                <span className="font-serif text-[clamp(30px,5vw,52px)] font-light tracking-[-0.025em] leading-none" style={{ color: 'var(--emerald)' }}>0</span>
                <p className="font-mono text-[9px] uppercase text-[var(--text-3)] tracking-[0.16em] mt-2">Happened twice</p>
              </div>
            </div>
          </div>

          {/* Subheadline */}
          <div className="reveal visible" style={{ '--delay': '700ms' } as React.CSSProperties}>
            <p className="font-sans text-[clamp(15px,1.4vw,17px)] text-[var(--text-2)] leading-[1.8] max-w-[500px] text-center">
              The builders who document failures are the ones who don't repeat them. Pick the pattern you've seen. One sentence is enough. Walk away with a regression test draft.
            </p>
          </div>

          {/* CTAs */}
          <div className="reveal visible flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-[440px] sm:max-w-none justify-center" style={{ '--delay': '900ms' } as React.CSSProperties}>
            <button onClick={openModal}
              className="group relative h-[50px] px-8 min-w-[190px] bg-[var(--amber)] text-white rounded-[2px] font-sans text-[15px] font-semibold overflow-hidden cursor-pointer hover:bg-[var(--amber-2)] transition-colors duration-200">
              <span className="absolute inset-0 flex items-center justify-center transition-all duration-300 group-hover:-translate-y-full group-hover:opacity-0">I've seen a failure</span>
              <span className="absolute inset-0 flex items-center justify-center transition-all duration-300 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100">I've seen a failure →</span>
            </button>
            <button onClick={scrollToCards}
              className="h-[50px] font-sans text-[14px] text-[var(--text-2)] hover:text-[var(--text-0)] border border-[var(--border)] hover:border-[var(--amber)] px-8 rounded-[2px] cursor-pointer transition-all duration-200">
              View known patterns ↓
            </button>
          </div>

          {/* Social proof + trust */}
          <div className="reveal visible space-y-1.5" style={{ '--delay': '1050ms' } as React.CSSProperties}>
            <p className="font-sans text-[13px] font-medium text-[var(--text-1)] text-center">
              Join {submissionCount} builders who documented a failure.
            </p>
            <p className="font-sans text-[12px] text-[var(--text-3)] text-center">
              One sentence is enough.&nbsp;&nbsp;Anonymous by default.&nbsp;&nbsp;Credit only if you want it.
            </p>
          </div>

          {/* Test draft preview — what they walk away with */}
          <div className="reveal visible w-full max-w-[480px]" style={{ '--delay': '1200ms' } as React.CSSProperties}>
            <div className="border border-[var(--border)] bg-[var(--bg-card)] rounded-[2px] overflow-hidden text-left">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)]" style={{ background: 'var(--bg-card-2)' }}>
                <span className="font-mono text-[8px] uppercase text-[var(--emerald)] tracking-[0.14em]">WHAT YOU WALK AWAY WITH</span>
                <span className="museum-tag emerald">Free · Instant</span>
              </div>
              <div className="px-4 py-3 divide-y divide-[var(--border)]">
                {([
                  { label: 'REPLAY INPUT',   value: 'Your workflow → replayable',  em: false },
                  { label: 'PASS/FAIL RULE', value: 'Output matches baseline',     em: true  },
                  { label: 'RELEASE GATE',   value: 'Before every deploy',         em: true  },
                  { label: 'STATUS',         value: 'Draft created',               em: true  },
                ] as { label: string; value: string; em: boolean }[]).map(({ label, value, em }) => (
                  <div key={label} className="flex justify-between items-baseline py-[6px] first:pt-0 last:pb-0">
                    <span className="font-mono text-[8px] uppercase text-[var(--text-4)] tracking-[0.08em]">{label}</span>
                    <span className={`font-sans text-[11px] ${em ? 'text-[var(--emerald)] font-medium' : 'text-[var(--text-3)]'}`}>{value}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-[var(--border)]" style={{ background: 'var(--bg-card-2)' }}>
                <p className="font-sans text-[11px] text-[var(--text-3)]">One sentence from you → a regression test draft back. No account needed.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-50">
          <div className="w-[1px] h-7 bg-[var(--border)]" />
          <span className="font-mono text-[8px] uppercase text-[var(--text-4)] tracking-[0.15em] mt-2">SCROLL</span>
        </div>
      </header>

      {/* ══ ACTIVITY TICKER ══ */}
      <ActivityTicker />

      {/* ══ THREE-STEP STRIP ══ */}
      <section style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
        className="px-5 md:px-[8vw] xl:px-[120px] py-10 md:py-14">
        <div className="max-w-[860px] mx-auto">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row items-start md:items-start gap-8 md:gap-0 justify-between">
              {[
                  { n: '01', color: 'var(--amber)',   title: "Pick a failure you've seen",    body: 'Known patterns, growing over time. If one looks familiar, click it. If none fit, open a new case.' },
                { n: '02', color: 'var(--amber)',   title: 'Add one sentence',               body: 'What changed. What broke. The pattern matters more than the details.' },
                { n: '03', color: 'var(--emerald)', title: 'Get a regression test draft',    body: 'Your failure becomes a structured, replayable test. Save it before it happens again.' },
              ].map(({ n, color, title, body }, i) => (
                <React.Fragment key={n}>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-mono text-[11px] font-medium tracking-[0.1em]" style={{ color }}>{n}</span>
                      <div className="h-[1px] w-5" style={{ background: color, opacity: 0.3 }} />
                    </div>
                    <h3 className="font-serif text-[18px] md:text-[19px] font-normal text-[var(--text-0)] leading-snug">{title}</h3>
                    <p className="font-sans text-[14px] text-[var(--text-2)] leading-relaxed">{body}</p>
                  </div>
                  {i < 2 && <div className="hidden md:block step-connector mx-8 mt-8" />}
                </React.Fragment>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══ CASE CARDS ══ */}
      <section ref={caseCardsRef} id="archive-section"
        className="px-5 md:px-[8vw] xl:px-[120px] py-12 md:py-16"
        style={{ background: 'var(--bg-stone)' }}>
        <div className="max-w-[1200px] mx-auto space-y-8">
          <ScrollReveal className="space-y-3">
            <span className="font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.16em]">KNOWN FAILURE PATTERNS</span>
            <h2 className="font-serif text-display text-[var(--text-0)]">
              Known failure patterns.<br className="hidden md:block" /> More are being added.
            </h2>
            <p className="font-sans text-[16px] text-[var(--text-2)] max-w-[480px] leading-relaxed mt-1">
              The archive starts here. If your failure does not fit, open a new case file.
            </p>
            <p className="font-sans text-[14px] text-[var(--text-3)]">
              If your failure does not fit, that is exactly why we need it.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAILURE_CASES.map((item, idx) => (
              <ScrollReveal key={item.id} delay={(idx % 2) * 60}>
                <CaseCard item={item} index={idx} onSelect={handleCaseSelect} isHighlighted={highlightedCaseId === item.id} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PATTERN RECOGNITION ══ */}
      <section style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
        className="px-5 md:px-[8vw] xl:px-[120px] py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">

          <ScrollReveal className="space-y-4 max-w-[420px]">
            <span className="font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.16em]">PATTERN RECOGNITION</span>
            <h2 className="font-serif text-display text-[var(--text-0)]">Which failure have you seen?</h2>
            <p className="font-sans text-[16px] text-[var(--text-2)] leading-[1.8]">
              Don't write a report. Just tell us which pattern you saw, what changed, and what broke. One sentence is enough.
            </p>
            <p className="font-sans text-[14px] text-[var(--text-2)] leading-relaxed italic">
              "The archive starts with known patterns. It grows with yours."
            </p>
            <p className="font-sans text-[13px] text-[var(--text-3)] leading-relaxed">
              Anonymous by default. We will never publish your name, company, or project details without permission.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={120} className="space-y-4">
            <span className="font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.12em]">SELECT THE PATTERN YOU SAW</span>
            <div className="flex flex-wrap gap-2 pt-1" role="group">
              {FAILURE_CASES.map(item => {
                const sel = selectedCaseId === item.id;
                return (
                  <button key={item.id} onClick={() => handleCaseSelect(item.id)}
                    className={`font-mono text-[11px] uppercase px-4 py-3 rounded-[2px] border transition-all duration-200 cursor-pointer ${
                      sel
                        ? 'bg-[var(--amber-sub)] border-[var(--amber)] text-[var(--amber)] font-medium'
                        : 'border-[var(--border)] text-[var(--text-2)] bg-[var(--bg-stone)] hover:border-[var(--amber)] hover:text-[var(--text-0)]'
                    }`}>
                    CASE {item.id}
                  </button>
                );
              })}
            </div>
            <p className="font-sans text-[13px] text-[var(--text-3)]">
              Select a case above to pre-fill your submission below.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ══ NO SHAME ══ */}
      <section className="px-5 md:px-[8vw] xl:px-[120px] py-10 md:py-14"
        style={{ background: 'var(--bg-stone)' }}>
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal>
            <div className="border border-[var(--border)] rounded-[2px] p-7 md:p-12 max-w-[660px]">
              <span className="font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.16em] block mb-4">ARCHIVE ETHOS</span>
              <h2 className="font-serif text-[clamp(22px,2.8vw,36px)] font-normal text-[var(--text-0)] tracking-[-0.01em] leading-snug mb-4">
                No shame. Just systems.
              </h2>
              <p className="font-sans text-[16px] text-[var(--text-2)] leading-[1.8] max-w-[480px]">
                Good builders don't hide failures. They make sure the same failure does not happen twice.
              </p>
              <p className="font-sans text-[15px] text-[var(--text-2)] leading-[1.75] mt-3 max-w-[460px]">
                Small failures count. Student projects count. Broken prototypes count. If it broke once, it deserves a test.
              </p>
              <p className="font-sans text-[14px] text-[var(--text-3)] leading-relaxed mt-4">
                Raw failures are more useful than polished stories. You do not need the technical name. Just tell us what changed and what broke.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══ WHAT HAPPENS ══ */}
      <section style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
        className="px-5 md:px-[8vw] xl:px-[120px] py-10 md:py-14">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal className="space-y-7">
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.16em]">WHAT HAPPENS NEXT</span>
              <h2 className="font-serif text-display text-[var(--text-0)]">What happens when you submit?</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[680px]">
              {[
                { n: '01', text: 'We classify the failure pattern.',                         c: 'amber' },
                { n: '02', text: 'We turn it into a regression test draft.',                 c: 'emerald' },
                { n: '03', text: 'With your permission, it may become a public case file.',  c: '' },
                { n: '04', text: 'Anonymous submissions are welcome by default.',             c: '' },
              ].map(({ n, text, c }) => (
                <div key={n} className="flex items-start gap-4 p-5 border border-[var(--border)] rounded-[2px] bg-[var(--bg-stone)]">
                  <span className="font-mono text-[11px] tracking-[0.1em] shrink-0 mt-[2px]"
                    style={{ color: c === 'amber' ? 'var(--amber)' : c === 'emerald' ? 'var(--emerald)' : 'var(--text-4)' }}>
                    {n}
                  </span>
                  <p className="font-sans text-[14px] text-[var(--text-1)] leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
            <p className="font-sans text-[14px] text-[var(--text-3)]">
              Strong submissions may become public case files, with your permission.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ══ DARK: MISSION (single dark section) ══ */}
      <section className="px-5 md:px-[8vw] xl:px-[120px] py-12 md:py-20"
        style={{ background: 'var(--bg-dark)' }}>
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal className="max-w-[640px] space-y-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: '#6A6258' }}>MISSION</span>
            <h2 className="font-serif text-[clamp(22px,3vw,40px)] font-normal tracking-[-0.01em] leading-[1.2]" style={{ color: '#F4F1EA' }}>
              The enemy is silent regression.
            </h2>
            <p className="font-sans text-[16px] leading-[1.85]" style={{ color: '#9A9088' }}>
              AI teams fix a failure once, then lose it in logs, screenshots, chat threads, or memory. Later, a prompt, model, retrieval, tool, dataset, or memory change brings the same failure back. The archive exists to make those failures impossible to forget.
            </p>
            <p className="font-sans text-[15px] leading-[1.75]" style={{ color: '#6A6258' }}>
              Most AI failures are not new. They are forgotten. A one-line failure today can prevent tomorrow's repeated bug.
            </p>
            <div className="pt-3 border-t" style={{ borderColor: '#222' }}>
              <p className="font-serif italic text-[17px] leading-relaxed" style={{ color: '#5A5248' }}>
                "Logs remember what happened. Tests prevent it from happening again."
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══ ARCHIVE STATUS + BOUNTY ══ */}
      <section style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}
        className="px-5 md:px-[8vw] xl:px-[120px] py-10 md:py-14">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">

          <ScrollReveal className="space-y-4">
            <span className="font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.16em]">ARCHIVE STATUS</span>
            <div className="divide-y divide-[var(--border)]">
              {[
                { label: 'Failure patterns mapped', value: String(FAILURE_CASES.length), pill: 'amber' },
                { label: 'Submissions',              value: 'Opening now',               pill: 'amber' },
                { label: 'Anonymous submissions',    value: 'Allowed',                   pill: '' },
                { label: 'Public case files',        value: 'Coming soon',               pill: '' },
              ].map(({ label, value, pill }) => (
                <div key={label} className="flex items-center justify-between py-3">
                  <span className="font-sans text-[14px] text-[var(--text-1)]">{label}</span>
                  <span className={`status-pill ${pill}`}><span className="dot" />{value}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: 'var(--amber)' }}>THIS WEEK'S BOUNTY</span>
              <span className="status-pill amber"><span className="dot" />Active</span>
            </div>
            <div className="p-4 border border-[rgba(184,135,59,0.3)] bg-[var(--amber-dim)] rounded-[2px] space-y-2">
              <span className="font-mono text-[9px] uppercase text-[var(--amber)] tracking-[0.1em]">CASE {WEEKLY_BOUNTY.caseId}</span>
              <h3 className="font-serif text-[18px] md:text-[20px] font-normal text-[var(--text-0)] leading-snug">{WEEKLY_BOUNTY.title}</h3>
              <p className="font-sans text-[13px] text-[var(--text-2)] leading-relaxed pt-0.5">{WEEKLY_BOUNTY.description}</p>
            </div>
            <div className="flex items-center gap-3 text-[13px]">
              <span className="font-sans text-[var(--text-3)]">
                <span className="font-medium text-[var(--text-1)]">{WEEKLY_BOUNTY.hunters} builders</span> hunting this pattern
              </span>
              <span style={{ color: 'var(--border)' }}>·</span>
              <span className="font-sans text-[var(--text-3)]">Resets Sunday</span>
            </div>
            <button onClick={() => { setSelectedCaseId(WEEKLY_BOUNTY.caseId); openModal(); }}
              className="inline-flex items-center gap-2 font-sans text-[14px] font-medium border rounded-[2px] px-5 py-3 transition-all duration-200 cursor-pointer"
              style={{ borderColor: 'rgba(184,135,59,0.4)', color: 'var(--amber)', background: 'var(--amber-dim)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--amber-sub)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--amber-dim)')}>
              Submit a {WEEKLY_BOUNTY.title} failure →
            </button>
            <p className="font-sans text-[12px] text-[var(--text-3)]">
              Your sentence prevents the next builder from hitting this blind. Anonymous is fine.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ══ CONTRIBUTORS ══ */}
      <section style={{ background: 'var(--bg-stone)', borderBottom: '1px solid var(--border)' }}
        className="px-5 md:px-[8vw] xl:px-[120px] py-8 md:py-10">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1 max-w-[480px]">
                <span className="font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.16em]">CONTRIBUTORS</span>
                <p className="font-sans text-[14px] text-[var(--text-2)] leading-relaxed mt-1">
                  Builders who contribute and opt in will be credited here. Anonymous is always allowed. Good builders don't hide failures. They make them impossible to repeat.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 flex-shrink-0">
                <span className="museum-tag">Submissions open</span>
                <span className="museum-tag amber">Anonymous allowed</span>
                <span className="museum-tag">Credit optional</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: 'var(--bg-dark)', borderTop: '1px solid #1e1e1e' }}
        className="px-5 md:px-[8vw] xl:px-[120px] py-10 pb-8">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 items-start">
          <div className="space-y-1">
            <span className="block font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: '#4A4640' }}>STONEPATH LABS</span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: 'var(--amber)' }}>TAQ</span>
          </div>
          <div className="space-y-1">
            <span className="block font-sans text-[13px]" style={{ color: '#4A4640' }}>hello@stonepathlab.net</span>
            <a href="https://stonepathlab.net" target="_blank" rel="noopener noreferrer"
              className="block font-sans text-[13px] hover:underline transition-colors"
              style={{ color: '#4A4640' }}>stonepathlab.net</a>
          </div>
          <div className="md:text-right space-y-1">
            <span className="block font-sans text-[12px]" style={{ color: '#4A4640' }}>Agent Fail Museum</span>
            <span className="block font-sans text-[12px]" style={{ color: '#2E2C2A' }}>Public Archive · 2026</span>
          </div>
        </div>
        <div className="mt-8 pt-5" style={{ borderTop: '1px solid #1e1e1e' }}>
          <p className="font-sans text-[11px] text-center tracking-[0.04em]" style={{ color: '#2E2C2A' }}>
            The same AI failure should not happen twice.
          </p>
        </div>
      </footer>

      {/* ══ STICKY MOBILE CTA ══ */}
      <div className={`sticky-mobile-cta transition-opacity duration-300 ${showMobileCta && !showModal ? 'visible opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button onClick={openModal}
          className="w-full h-[50px] rounded-[2px] font-sans text-[15px] font-semibold text-white cursor-pointer transition-colors duration-200"
          style={{ background: 'var(--amber)' }}>
          Submit a failure
        </button>
      </div>

      {/* ══ SUBMIT MODAL ══ */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: 'var(--bg-stone)' }}>
          <div
            className="flex items-center justify-between px-5 md:px-10 h-[58px] flex-shrink-0 border-b border-[var(--border)]"
            style={{ background: 'var(--bg-card)' }}
          >
            <span className="font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.16em]">OPEN A CASE FILE</span>
            <button
              onClick={closeModal}
              className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-2)] hover:text-[var(--text-0)] transition-colors cursor-pointer bg-transparent border-none p-2"
              aria-label="Close"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 md:px-10 py-8 md:py-12">
            <div className="max-w-[600px] mx-auto">
              <SubmissionFlow
                curatedCasesOptions={dropdownOptions}
                selectedCuratedId={selectedCaseId}
                onClearCuratedSelection={() => setSelectedCaseId(null)}
                onClose={closeModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
