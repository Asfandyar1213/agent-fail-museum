/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SubmissionData } from '../types';
import { CustomDropdown } from './CustomDropdown';

interface SubmissionFlowProps {
  curatedCasesOptions: string[];
  selectedCuratedId: string | null;
  onClearCuratedSelection: () => void;
  onClose?: () => void;
}

const WHAT_BUILDING_OPTIONS = ['Agent', 'RAG App', 'Chatbot', 'Copilot', 'Automation', 'Research Project', 'Other'];
const WHAT_CHANGED_OPTIONS  = ['Prompt', 'Model Version', 'Tool / Function', 'Retrieval', 'Dataset', 'Memory', 'System Prompt', 'Other'];
const POLL_OPTIONS = [
  { label: 'Prompt broke old behavior',    caseId: '01' },
  { label: 'Model upgrade changed output', caseId: '02' },
  { label: 'RAG retrieved wrong context',  caseId: '03' },
  { label: 'Tool call failed',             caseId: '04' },
  { label: 'Agent got stuck in a loop',    caseId: '10' },
  { label: 'Hallucination returned',       caseId: '06' },
  { label: 'Other',                        caseId: null },
];

export function SubmissionFlow({ curatedCasesOptions, selectedCuratedId, onClearCuratedSelection, onClose }: SubmissionFlowProps) {
  const [formData, setFormData] = useState<SubmissionData>({
    failurePattern: '', whatWereYouBuilding: [], whatChanged: [],
    whatBroke: '', usersSeen: '', howHandleToday: '', followUp: false, nameEmail: ''
  });
  const [pollSelection, setPollSelection]   = useState<string | null>(null);
  const [pollCommitted, setPollCommitted]   = useState(false);
  const [isAnonymous, setIsAnonymous]       = useState(false);
  const [submitPhase, setSubmitPhase]       = useState<'idle' | 'fading-out' | 'completed'>('idle');
  const [drawLine, setDrawLine]             = useState(false);
  const [copied, setCopied]                 = useState(false);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [caseId, setCaseId]                 = useState('');

  useEffect(() => {
    if (selectedCuratedId) {
      const match = curatedCasesOptions.find(o => o.startsWith(`Case ${selectedCuratedId}`));
      if (match) { setFormData(p => ({ ...p, failurePattern: match })); setPollCommitted(true); }
    }
  }, [selectedCuratedId, curatedCasesOptions]);

  const handlePollSelect = (opt: { label: string; caseId: string | null }) => {
    setPollSelection(opt.label);
    if (opt.caseId) {
      const match = curatedCasesOptions.find(o => o.startsWith(`Case ${opt.caseId}`));
      if (match) setFormData(p => ({ ...p, failurePattern: match }));
    }
    setTimeout(() => setPollCommitted(true), 350);
  };

  const toggle = (field: 'whatWereYouBuilding' | 'whatChanged', opt: string) => {
    setFormData(p => {
      const list = p[field];
      return { ...p, [field]: list.includes(opt) ? list.filter(i => i !== opt) : [...list, opt] };
    });
  };

  const getBadgeTier = (id: string) => {
    const num = parseInt(id.replace('AFM-', ''), 10);
    if (num <= 50)  return { label: 'FOUNDING CONTRIBUTOR', color: 'amber' };
    if (num <= 200) return { label: 'EARLY CONTRIBUTOR',    color: 'amber' };
    return               { label: 'ARCHIVE CONTRIBUTOR',   color: ''      };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let newId = 'AFM-0048';
    try {
      const prev = JSON.parse(localStorage.getItem('afm_failures') || '[]') as unknown[];
      newId = `AFM-${String(47 + prev.length + 1).padStart(4, '0')}`;
      localStorage.setItem('afm_failures', JSON.stringify([...prev, formData]));
    } catch (_) {}
    setCaseId(newId);
    try {
      const fd = new FormData();
      fd.append('access_key', '57e76241-afcc-4b26-8c53-c84d9350d5e4');
      fd.append('subject', `Failure Pattern: ${formData.failurePattern || 'General'}`);
      fd.append('Failure Pattern', formData.failurePattern || 'N/A');
      fd.append('What Were You Building', formData.whatWereYouBuilding.join(', ') || 'N/A');
      fd.append('What Changed', formData.whatChanged.join(', ') || 'N/A');
      fd.append('Describe The Failure', formData.whatBroke || 'N/A');
      fd.append('Did Users Experience This', formData.usersSeen || 'N/A');
      fd.append('How Do You Catch This', formData.howHandleToday || 'N/A');
      fd.append('Can We Follow Up', formData.followUp ? 'Yes' : 'No');
      fd.append('Name & Email', isAnonymous ? 'Anonymous' : formData.nameEmail || 'Anonymous');
      await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd });
    } catch (_) {}
    setIsSubmitting(false);
    setSubmitPhase('fading-out');
    setTimeout(() => { setSubmitPhase('completed'); setDrawLine(true); }, 400);
  };

  const handleReset = () => {
    setFormData({ failurePattern: '', whatWereYouBuilding: [], whatChanged: [], whatBroke: '', usersSeen: '', howHandleToday: '', followUp: false, nameEmail: '' });
    setDrawLine(false); setSubmitPhase('idle'); setPollSelection(null); setPollCommitted(false); setIsAnonymous(false); setCaseId('');
    onClearCuratedSelection();
    if (onClose) {
      onClose();
    } else {
      document.getElementById('archive-section')?.scrollIntoView({ behavior: 'smooth' }) ?? window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('I recorded a failure pattern in the Agent Fail Museum. The same AI failure should not happen twice. agentfailmuseum.com').then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  };

  // Derived display values
  const patternShort    = formData.failurePattern ? formData.failurePattern.replace(/^Case \d+ : /, '') : 'Not specified';
  const replayInput     = formData.whatWereYouBuilding.length > 0 ? formData.whatWereYouBuilding.join(' + ') + ' workflow' : 'Generic AI agent workflow';
  const expectedBehavior = formData.whatChanged.length > 0 ? `No regression after ${formData.whatChanged.join(', ')} change` : 'No regression on operational logic';
  const failureBehavior = formData.whatBroke.trim() ? (formData.whatBroke.length > 90 ? formData.whatBroke.slice(0, 90) + '…' : formData.whatBroke) : 'Agent returned malformed or unexpected output';
  const changeTrigger   = formData.whatChanged.length > 0 ? formData.whatChanged.join(' · ') : 'System parameters modified';

  if (submitPhase === 'completed') {
    const badge = getBadgeTier(caseId);
    return (
      <div className="space-y-6" id="post-submit-view">
        {/* Case ID + Badge — the "unboxing" moment */}
        <div className="p-5 border border-[rgba(47,125,92,0.4)] bg-[var(--emerald-dim)] rounded-[2px] flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] uppercase text-[var(--emerald)] tracking-[0.14em] mb-1">YOUR CASE NUMBER</p>
            <span className="font-mono text-[32px] md:text-[38px] font-medium tracking-[0.04em]" style={{ color: 'var(--emerald)' }}>{caseId}</span>
            <p className="font-sans text-[12px] text-[var(--text-2)] mt-1 leading-relaxed">Keep this. It's your permanent failure record.</p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className={`museum-tag ${badge.color}`}>{badge.label}</span>
            <p className="font-sans text-[11px] text-[var(--text-3)] mt-1.5">Archive badge</p>
          </div>
        </div>

        <div className="space-y-2">
          <span className="font-mono text-[10px] uppercase text-[var(--emerald)] tracking-[0.16em]">REGRESSION TEST DRAFT CREATED</span>
          <h2 className="font-serif text-[26px] md:text-[30px] font-light text-[var(--text-0)] tracking-[-0.015em] leading-snug">
            Your failure became a test draft.
          </h2>
          <p className="font-sans text-[15px] text-[var(--text-2)] leading-relaxed">
            This is what a release gate check for this failure pattern would look like.
          </p>
        </div>

        {/* Regression test card */}
        <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-[2px] p-[28px_26px] overflow-hidden">
          <div style={{ width: drawLine ? '100%' : '0%' }} className="absolute top-0 left-0 h-[2px] bg-[var(--emerald)] transition-all duration-[1100ms] ease-out" />
          <div className="flex items-center justify-between mb-5">
            <span className="font-mono text-[10px] uppercase text-[var(--emerald)] tracking-[0.14em]">REGRESSION TEST DRAFT</span>
            <span className="museum-tag emerald">Status: Draft</span>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {[
              { label: 'FAILURE PATTERN',   value: patternShort },
              { label: 'WHAT CHANGED',      value: changeTrigger },
              { label: 'WHAT BROKE',        value: failureBehavior },
              { label: 'REPLAY INPUT',      value: replayInput },
              { label: 'EXPECTED BEHAVIOR', value: expectedBehavior },
              { label: 'FAILURE BEHAVIOR',  value: `"${failureBehavior}"` },
              { label: 'PASS / FAIL RULE',  value: 'Output matches pre-change baseline', emerald: true },
              { label: 'RELEASE GATE',      value: `Before any ${formData.whatChanged.length > 0 ? formData.whatChanged.join(', ') : 'system'} change` },
              { label: 'STATUS',            value: 'Draft created', emerald: true },
            ].map(({ label, value, emerald }) => (
              <div key={label} className="flex justify-between items-baseline py-[10px] first:pt-0 last:pb-0">
                <span className="font-mono text-[9px] uppercase text-[var(--text-3)] tracking-[0.1em] shrink-0 min-w-[150px]">{label}</span>
                <span className={`font-sans text-[13px] text-right max-w-[55%] leading-snug ${emerald ? 'text-[var(--emerald)] font-medium' : 'text-[var(--text-1)]'}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Failure receipt */}
        <div className="receipt-card space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase text-[var(--emerald)] tracking-[0.14em]">FAILURE RECEIPT</span>
            <span className="museum-tag emerald">Recorded</span>
          </div>
          <div className="divide-y divide-[rgba(47,125,92,0.1)]">
            {[
              { label: 'CASE ID',        value: caseId },
              { label: 'PATTERN',        value: patternShort },
              { label: 'CHANGED',        value: changeTrigger },
              { label: 'BROKE',          value: failureBehavior },
              { label: 'CONVERTED INTO', value: 'Regression test draft' },
              { label: 'STATUS',         value: 'Recorded' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-baseline py-[9px] first:pt-0 last:pb-0">
                <span className="font-mono text-[9px] uppercase text-[var(--text-3)] tracking-[0.1em] shrink-0">{label}</span>
                <span className="font-sans text-[13px] text-[var(--text-1)] text-right max-w-[60%]">{value}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="w-full mt-1 py-3 border border-[rgba(47,125,92,0.35)] rounded-[2px] font-sans text-[13px] font-medium text-[var(--emerald)] hover:bg-[var(--emerald-dim)] transition-all duration-200 cursor-pointer"
          >
            {copied ? '✓ Copied' : 'Copy share text'}
          </button>
        </div>

        <p className="font-sans text-[13px] text-[var(--text-3)] leading-relaxed">
          Save this. The best failures become public case files. Credit if you want it, anonymous if you prefer.
        </p>
        <button onClick={handleReset} className="font-sans text-[13px] text-[var(--text-2)] hover:text-[var(--text-0)] font-medium hover:underline transition-colors bg-transparent border-none p-0 cursor-pointer">
          ← Back to the archive
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[600px] mx-auto" id="submission-container">
      <div className={`transition-all duration-400 ${submitPhase === 'fading-out' ? 'opacity-0 scale-[0.98] pointer-events-none' : 'opacity-100 scale-100'}`}>

        {/* ── Poll ── */}
        {!pollCommitted ? (
          <div className="mb-10 space-y-5">
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.14em]">QUICK RECOGNITION</span>
              <h3 className="font-serif text-[22px] font-light text-[var(--text-0)] tracking-[-0.01em] leading-snug">
                Which failure have you seen?
              </h3>
            </div>
            <div className="space-y-2">
              {POLL_OPTIONS.map(opt => (
                <button key={opt.label} type="button" onClick={() => handlePollSelect(opt)}
                  className={`poll-option ${pollSelection === opt.label ? 'selected' : ''}`}>
                  {opt.label}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setPollCommitted(true)}
              className="font-sans text-[13px] text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors bg-transparent border-none p-0 cursor-pointer">
              Skip to full form ↓
            </button>
          </div>
        ) : pollSelection ? (
          <div className="mb-8 p-4 border border-[rgba(184,135,59,0.3)] bg-[var(--amber-dim)] rounded-[2px] space-y-2">
            <span className="font-mono text-[9px] uppercase text-[var(--amber)] tracking-[0.12em]">PATTERN RECOGNIZED</span>
            <p className="font-sans text-[15px] text-[var(--text-0)] font-medium">"{pollSelection}"</p>
            <p className="font-sans text-[13px] text-[var(--text-2)]">
              That's enough. Add one sentence and we'll turn it into a test draft.
            </p>
          </div>
        ) : null}

        {/* ── Reward preview ── */}
        {pollCommitted && (
          <div className="mb-8 p-5 border border-[var(--border)] bg-[var(--bg-card)] rounded-[2px] space-y-2">
            <span className="font-mono text-[9px] uppercase text-[var(--olive)] tracking-[0.12em]">WHAT YOU GET BACK</span>
            <p className="font-sans text-[15px] font-medium text-[var(--text-0)]">You submit a failure. We turn it into a test draft.</p>
            <p className="font-sans text-[14px] text-[var(--text-2)] leading-relaxed">
              A regression test draft with replay input, expected behavior, failure behavior, pass/fail rule, and release gate.
            </p>
          </div>
        )}

        {/* ── Form ── */}
        <form id="case-file-form" onSubmit={handleSubmit} className="space-y-7">
          <div className="space-y-2">
            <span className="font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.12em]">OPEN A CASE FILE</span>
            <h2 className="font-serif text-[26px] md:text-[30px] font-light text-[var(--text-0)] tracking-[-0.015em] leading-[1.2]">
              No perfect explanation needed.
            </h2>
            <p className="font-sans text-[15px] text-[var(--text-2)] leading-relaxed">
              Tell us what changed and what broke. One sentence is enough.
            </p>
          </div>

          <div className="h-[1px] bg-[var(--border)]" />

          {/* Anonymous toggle */}
          <div className="p-4 border border-[var(--border)] bg-[var(--bg-card-3)] rounded-[2px]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-sans text-[15px] font-medium text-[var(--text-0)]">Submit anonymously</p>
                <p className="font-sans text-[13px] text-[var(--text-2)] mt-0.5 leading-relaxed">No names. No companies. No judgment. Just the pattern.</p>
              </div>
              <label className="toggle-switch flex-shrink-0">
                <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
                <span className="slider" />
              </label>
            </div>
          </div>

          {/* Failure pattern */}
          <div className="space-y-2">
            <span className="block font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.1em]">FAILURE PATTERN</span>
            <CustomDropdown
              id="failure-pattern"
              options={curatedCasesOptions}
              selected={formData.failurePattern}
              onSelect={opt => setFormData(p => ({ ...p, failurePattern: opt }))}
            />
          </div>

          {/* What were you building */}
          <div className="space-y-2">
            <span className="block font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.1em]">WHAT WERE YOU BUILDING?</span>
            <div className="flex flex-wrap gap-2 pt-1">
              {WHAT_BUILDING_OPTIONS.map(opt => (
                <button key={opt} type="button" onClick={() => toggle('whatWereYouBuilding', opt)}
                  className={`pill-btn ${formData.whatWereYouBuilding.includes(opt) ? 'selected' : ''}`}>{opt}</button>
              ))}
            </div>
          </div>

          {/* What changed */}
          <div className="space-y-2">
            <span className="block font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.1em]">WHAT CHANGED BEFORE IT BROKE?</span>
            <div className="flex flex-wrap gap-2 pt-1">
              {WHAT_CHANGED_OPTIONS.map(opt => (
                <button key={opt} type="button" onClick={() => toggle('whatChanged', opt)}
                  className={`pill-btn ${formData.whatChanged.includes(opt) ? 'selected' : ''}`}>{opt}</button>
              ))}
            </div>
          </div>

          {/* Describe */}
          <div className="space-y-2">
            <label htmlFor="what-broke-field" className="block font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.1em]">DESCRIBE THE FAILURE</label>
            <textarea id="what-broke-field" rows={4} value={formData.whatBroke}
              onChange={e => setFormData(p => ({ ...p, whatBroke: e.target.value }))}
              placeholder="What was it supposed to do, and what did it do instead? One sentence is enough."
              className="form-field" />
          </div>

          {/* Did users experience this */}
          <div className="space-y-2">
            <span className="block font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.1em]">DID USERS EXPERIENCE THIS?</span>
            <div className="flex gap-2 pt-1">
              {(['Yes', 'No', 'Not Sure'] as const).map(opt => (
                <button key={opt} type="button" onClick={() => setFormData(p => ({ ...p, usersSeen: opt }))}
                  className={`pill-btn flex-1 text-center ${formData.usersSeen === opt ? 'selected' : ''}`}>{opt}</button>
              ))}
            </div>
          </div>

          {/* How catch today */}
          <div className="space-y-2">
            <label htmlFor="how-handle-field" className="block font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.1em]">HOW DO YOU CATCH THIS TODAY?</label>
            <textarea id="how-handle-field" rows={3} value={formData.howHandleToday}
              onChange={e => setFormData(p => ({ ...p, howHandleToday: e.target.value }))}
              placeholder="Manual review? Nothing? There's no wrong answer."
              className="form-field" />
          </div>

          {/* Follow-up */}
          {!isAnonymous && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.1em]">CAN WE FOLLOW UP?</span>
                <label className="toggle-switch">
                  <input type="checkbox" checked={formData.followUp} onChange={e => setFormData(p => ({ ...p, followUp: e.target.checked }))} />
                  <span className="slider" />
                </label>
              </div>
              <div className={`overflow-hidden transition-all duration-400 ${formData.followUp ? 'max-h-[80px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <input id="name-email-field" type="text" value={formData.nameEmail}
                  onChange={e => setFormData(p => ({ ...p, nameEmail: e.target.value }))}
                  placeholder="Name or email (optional, leave blank to stay anonymous)"
                  className="form-field mt-2" />
              </div>
            </div>
          )}

          {/* Privacy */}
          <p className="font-sans text-[12px] text-[var(--text-3)] leading-relaxed border border-[var(--border)] rounded-[2px] px-4 py-3 bg-[var(--bg-card)]">
            Anonymous by default. We will never publish your name, company, or project details without permission.
          </p>

          {/* Submit */}
          <button type="submit" disabled={isSubmitting}
            className="group relative w-full h-[54px] overflow-hidden rounded-[2px] font-sans text-[15px] font-semibold cursor-pointer bg-[var(--amber)] text-white hover:bg-[var(--amber-2)] transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed">
            {isSubmitting ? (
              <span className="absolute inset-0 flex items-center justify-center gap-2.5">
                <span className="inline-block w-[18px] h-[18px] border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Recording failure…
              </span>
            ) : (
              <>
                <span className="absolute inset-0 flex items-center justify-center transition-all duration-300 group-hover:-translate-y-full group-hover:opacity-0">
                  Turn This Failure Into a Test
                </span>
                <span className="absolute inset-0 flex items-center justify-center transition-all duration-300 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                  Turn This Failure Into a Test →
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
