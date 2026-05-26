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
  formRef: React.RefObject<HTMLDivElement>;
}

const WHAT_BUILDING_OPTIONS = [
  'Agent',
  'RAG App',
  'Chatbot',
  'Copilot',
  'Automation',
  'Research Project',
  'Other'
];

const WHAT_CHANGED_OPTIONS = [
  'Prompt',
  'Model Version',
  'Tool / Function',
  'Retrieval',
  'Dataset',
  'Memory',
  'System Prompt',
  'Other'
];

export function SubmissionFlow({
  curatedCasesOptions,
  selectedCuratedId,
  onClearCuratedSelection,
  formRef
}: SubmissionFlowProps) {
  // Main form state
  const [formData, setFormData] = useState<SubmissionData>({
    failurePattern: '',
    whatWereYouBuilding: [],
    whatChanged: [],
    whatBroke: '',
    usersSeen: '',
    howHandleToday: '',
    followUp: false,
    nameEmail: ''
  });

  // Flow & Animation control states for the ceremonial Rule 9 transition
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<'idle' | 'fading-out' | 'fading-in' | 'completed'>('idle');
  const [drawAccentLine, setDrawAccentLine] = useState(false);

  // Sync curated selection from Case Cards click or Pattern selector grid
  useEffect(() => {
    if (selectedCuratedId) {
      const match = curatedCasesOptions.find(opt => opt.startsWith(`Case ${selectedCuratedId}`));
      if (match) {
        setFormData(prev => ({ ...prev, failurePattern: match }));
      }
    }
  }, [selectedCuratedId, curatedCasesOptions]);

  // Handle building tags click (multi-select)
  const handleWhatBuildingToggle = (opt: string) => {
    setFormData(prev => {
      const prevList = prev.whatWereYouBuilding;
      const isSelected = prevList.includes(opt);
      const updated = isSelected 
        ? prevList.filter(item => item !== opt) 
        : [...prevList, opt];
      return { ...prev, whatWereYouBuilding: updated };
    });
  };

  // Handle changed factors click (multi-select)
  const handleWhatChangedToggle = (opt: string) => {
    setFormData(prev => {
      const prevList = prev.whatChanged;
      const isSelected = prevList.includes(opt);
      const updated = isSelected 
        ? prevList.filter(item => item !== opt) 
        : [...prevList, opt];
      return { ...prev, whatChanged: updated };
    });
  };

  // Handle Submit Flow
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Log final form submission structured data inside the console as requested
    console.log("STONEPATH LABS : Agent Failure Museum Saved Object:", formData);

    // Save submission to localStorage so that user can see they are persistent
    try {
      const prevSubmissions = JSON.parse(localStorage.getItem('stonepath_failures') || '[]');
      localStorage.setItem('stonepath_failures', JSON.stringify([...prevSubmissions, formData]));
    } catch (err) {
      console.error("Local storage saving error:", err);
    }

    // Submit to Web3Forms using the provided access key
    try {
      const web3FormData = new FormData();
      web3FormData.append("access_key", "57e76241-afcc-4b26-8c53-c84d9350d5e4");
      web3FormData.append("subject", `New Failure Pattern: ${formData.failurePattern || 'General'}`);
      web3FormData.append("Failure Pattern", formData.failurePattern || "N/A");
      web3FormData.append("What Were You Building", formData.whatWereYouBuilding.join(', ') || "N/A");
      web3FormData.append("What Changed Before It Broke", formData.whatChanged.join(', ') || "N/A");
      web3FormData.append("Describe The Failure", formData.whatBroke || "N/A");
      web3FormData.append("Did Users Experience This", formData.usersSeen || "N/A");
      web3FormData.append("How Do You Catch This Today", formData.howHandleToday || "N/A");
      web3FormData.append("Can We Follow Up", formData.followUp ? "Yes" : "No");
      web3FormData.append("Name & Email", formData.nameEmail || "Anonymous");

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: web3FormData
      });
      const data = await response.json();
      if (!data.success) {
        console.warn("Web3Forms submission responded with error:", data);
      }
    } catch (err) {
      console.error("Web3Forms submission error:", err);
    }

    // Coordinate state phases from Rule 9:
    // 1. Fade out the form over 500ms
    setSubmitPhase('fading-out');

    // 2. Overlap by 300ms, start fading in the regression test card
    setTimeout(() => {
      setSubmitPhase('fading-in');
    }, 300);

    // 3. Mark transition as completely active and initiate white accent line drawing
    setTimeout(() => {
      setSubmitPhase('completed');
      setDrawAccentLine(true);
    }, 550);
  };

  // Reset the State and scroll key elements into position
  const handleResetFlow = () => {
    setFormData({
      failurePattern: '',
      whatWereYouBuilding: [],
      whatChanged: [],
      whatBroke: '',
      usersSeen: '',
      howHandleToday: '',
      followUp: false,
      nameEmail: ''
    });
    setDrawAccentLine(false);
    setSubmitPhase('idle');
    setIsSubmitting(false);
    onClearCuratedSelection();

    // Smooth scroll to top of Case Cards Archive
    const dest = document.getElementById('archive-section');
    if (dest) {
      dest.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Helper strings built dynamically for final regression simulation rows
  const derivedOriginalInput = formData.whatWereYouBuilding.length > 0 
    ? formData.whatWereYouBuilding.join(' + ') + ' Workflow'
    : 'Generic AI Agent System / Prompt';

  const derivedExpectedBehavior = formData.whatChanged.length > 0
    ? `No regression on ${formData.whatChanged.join(', ')} adjustments`
    : 'No regression on operational logic';

  const derivedFailureBehavior = formData.whatBroke.trim() 
    ? (formData.whatBroke.length > 80 ? `${formData.whatBroke.substring(0, 80)}...` : formData.whatBroke)
    : 'Agent returned malformed or unverified output';

  const derivedChangeThatCausedIt = formData.whatChanged.length > 0
    ? formData.whatChanged.join(' · ')
    : 'System parameters modified (Default)';

  return (
    <div ref={formRef} className="relative w-full max-w-[660px] mx-auto min-h-[500px]" id="submission-container">
      
      {/* ================= PHASE A: FORM (Visible when not completed) ================= */}
      {submitPhase !== 'completed' && (
        <form
          onSubmit={handleSubmit}
          className={`space-y-[36px] transition-all duration-500 ease-in-out ${
            submitPhase === 'fading-out' ? 'opacity-0 scale-[0.98] pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
          {/* Header */}
          <div className="space-y-[12px]">
            <span className="font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.1em]">
              SUBMIT A FAILURE PATTERN
            </span>
            <h2 className="font-serif text-[32px] font-light text-[var(--text-1)] tracking-[-0.015em] leading-[1.2]">
              Record a failure worth remembering.
            </h2>
            <p className="font-sans text-body-custom text-[var(--text-3)]">
              Every failure you submit gets converted into a regression test draft.
            </p>
          </div>

          <div className="h-[1px] bg-[var(--bg-4)]" />

          {/* Field 1: FAILURE PATTERN */}
          <div className="space-y-3">
            <span className="block font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.1em]">
              FAILURE PATTERN
            </span>
            <CustomDropdown
              id="failure-pattern"
              options={curatedCasesOptions}
              selected={formData.failurePattern}
              onSelect={(opt) => setFormData(prev => ({ ...prev, failurePattern: opt }))}
              placeholder="Select from museum database or something else"
            />
          </div>

          {/* Field 2: WHAT WERE YOU BUILDING? (Multi-select pills) */}
          <div className="space-y-3">
            <span className="block font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.1em]">
              WHAT WERE YOU BUILDING?
            </span>
            <div className="flex flex-wrap gap-2 pt-1" role="group" aria-label="Target Application Types">
              {WHAT_BUILDING_OPTIONS.map((opt, idx) => {
                const isSelected = formData.whatWereYouBuilding.includes(opt);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleWhatBuildingToggle(opt)}
                    className={`font-mono text-[10px] uppercase rounded-[2px] p-[10px_16px] border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--accent-sub)] border-[rgba(255,255,255,0.5)] text-[var(--text-0)] font-medium'
                        : 'border-[var(--bg-4)] text-[var(--text-3)] hover:border-[rgba(255,255,255,0.25)] hover:text-[var(--text-1)]'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field 3: WHAT CHANGED BEFORE IT BROKE? (Multi-select pills) */}
          <div className="space-y-3">
            <span className="block font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.1em]">
              WHAT CHANGED BEFORE IT BROKE?
            </span>
            <div className="flex flex-wrap gap-2 pt-1" role="group" aria-label="Variables Altered">
              {WHAT_CHANGED_OPTIONS.map((opt, idx) => {
                const isSelected = formData.whatChanged.includes(opt);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleWhatChangedToggle(opt)}
                    className={`font-mono text-[10px] uppercase rounded-[2px] p-[10px_16px] border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--accent-sub)] border-[rgba(255,255,255,0.5)] text-[var(--text-0)] font-medium'
                        : 'border-[var(--bg-4)] text-[var(--text-3)] hover:border-[rgba(255,255,255,0.25)] hover:text-[var(--text-1)]'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field 4: DESCRIBE THE FAILURE (Textarea) */}
          <div className="space-y-3">
            <label htmlFor="what-broke-field" className="block font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.1em]">
              DESCRIBE THE FAILURE
            </label>
            <textarea
              id="what-broke-field"
              rows={4}
              value={formData.whatBroke}
              onChange={(e) => setFormData(prev => ({ ...prev, whatBroke: e.target.value }))}
              placeholder="Even one sentence is enough. What was the agent supposed to do, and what did it do instead?"
              className="w-full bg-[var(--bg-2)] border border-[var(--bg-4)] text-[var(--text-1)] rounded-[2px] p-[14px_16px] font-sans text-body-custom focus:outline-none focus:border-[rgba(255,255,255,0.3)] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)] transition-all duration-200 resize-y"
            />
          </div>

          {/* Field 5: DID USERS EXPERIENCE THIS? (Single select pills) */}
          <div className="space-y-3">
            <span className="block font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.1em]">
              DID USERS EXPERIENCE THIS?
            </span>
            <div className="flex gap-2 pt-1" role="radiogroup" aria-label="User Facing Experience">
              {['Yes', 'No', 'Not Sure'].map((opt) => {
                const isSelected = formData.usersSeen === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, usersSeen: opt as any }))}
                    role="radio"
                    aria-checked={isSelected}
                    className={`font-mono text-[10px] uppercase rounded-[2px] p-[10px_16px] border transition-all duration-200 flex-1 text-center cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--accent-sub)] border-[rgba(255,255,255,0.5)] text-[var(--text-0)] font-medium'
                        : 'border-[var(--bg-4)] text-[var(--text-3)] hover:border-[rgba(255,255,255,0.25)] hover:text-[var(--text-1)]'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field 6: HOW DO YOU CATCH THIS TODAY? (Textarea) */}
          <div className="space-y-3">
            <label htmlFor="how-handle-today-field" className="block font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.1em]">
              HOW DO YOU CATCH THIS TODAY?
            </label>
            <textarea
              id="how-handle-today-field"
              rows={3}
              value={formData.howHandleToday}
              onChange={(e) => setFormData(prev => ({ ...prev, howHandleToday: e.target.value }))}
              placeholder="Manual review? Nothing? Something custom? There's no wrong answer."
              className="w-full bg-[var(--bg-2)] border border-[var(--bg-4)] text-[var(--text-1)] rounded-[2px] p-[14px_16px] font-sans text-body-custom focus:outline-none focus:border-[rgba(255,255,255,0.3)] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)] transition-all duration-200 resize-y"
            />
          </div>

          {/* Field 7: FOLLOW-UP TOGGLE */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.1em]">
                CAN WE FOLLOW UP WITH YOU?
              </span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.followUp}
                  onChange={(e) => setFormData(prev => ({ ...prev, followUp: e.target.checked }))}
                />
                <span className="slider text-white"></span>
              </label>
            </div>

            {/* Collapsible Follow Up Input */}
            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                formData.followUp ? 'max-h-[120px] opacity-100 mt-3 pb-2' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="space-y-3">
                <label htmlFor="name-email-field" className="block font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.1em]">
                  NAME & EMAIL
                </label>
                <input
                  id="name-email-field"
                  type="text"
                  value={formData.nameEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameEmail: e.target.value }))}
                  placeholder="Optional: leave blank for anonymous"
                  className="w-full bg-[var(--bg-2)] border border-[var(--bg-4)] text-[var(--text-1)] rounded-[2px] p-[14px_16px] font-sans text-body-custom focus:outline-none focus:border-[rgba(255,255,255,0.3)] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)] transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Submit Button (Rule 8 Magnetic Text Swap) */}
          <div className="pt-4">
            <button
              id="record-failure-submit-button"
              type="submit"
              className="group relative w-full h-[60px] bg-white text-black overflow-hidden rounded-[2px] font-sans text-[15px] font-semibold tracking-[0.03em] cursor-pointer"
            >
              {/* Layer 1 */}
              <span className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out transform group-hover:-translate-y-full group-hover:opacity-0 bg-white text-black">
                Record This Failure
              </span>
              {/* Layer 2 */}
              <span className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 bg-white text-black">
                Record This Failure →
              </span>
            </button>
            <p className="font-sans text-[12px] text-[var(--text-3)] text-center leading-[1.6] mt-5">
              We will never publish your name, company, or project details without permission.<br />
              Anonymous submissions are always welcome.
            </p>
          </div>
        </form>
      )}

      {/* ================= PHASE B: POST-SUBMIT REGRESSION CARD (Animated Entry) (Rule 9) ================= */}
      {submitPhase === 'completed' && (
        <div
          className="relative bg-[var(--bg-2)] border border-[var(--bg-4)] rounded-[2px] p-[48px] overflow-hidden shadow-2xl transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
          id="post-submit-regression-card"
        >
          {/* Top white line animation */}
          <div
            style={{ width: drawAccentLine ? '100%' : '0%' }}
            className="absolute top-0 left-0 h-[2px] bg-white transition-all duration-[1200ms] ease-out"
          />

          {/* Header */}
          <div className="space-y-[16px]">
            <span className="font-mono text-[10px] uppercase text-[var(--text-3)] tracking-[0.16em]">
              REGRESSION TEST DRAFT  ·  CASE LOGGED
            </span>
            <h2 className="font-serif text-[28px] font-light text-[var(--text-1)] tracking-[-0.015em] leading-snug">
              Your failure has been added to the archive.
            </h2>
            <p className="font-sans text-[14px] text-[var(--text-3)] leading-relaxed">
              We've drafted a regression test from your submission. This is what a release gate check for this failure would look like.
            </p>
          </div>

          <div className="h-[1px] bg-[var(--bg-4)] my-8" />

          {/* Dynamic 6 Data Rows */}
          <div className="space-y-1 divide-y divide-[rgba(255,255,255,0.05)]">
            <div className="flex justify-between items-baseline py-[14px] first:pt-0">
              <span className="font-mono text-[9px] uppercase text-[var(--text-3)] tracking-[0.1em] shrink-0 min-w-[200px] text-left">
                ORIGINAL INPUT
              </span>
              <span className="font-sans text-[13px] text-[var(--text-2)] text-right max-w-[60%] truncate">
                {derivedOriginalInput}
              </span>
            </div>

            <div className="flex justify-between items-baseline py-[14px]">
              <span className="font-mono text-[9px] uppercase text-[var(--text-3)] tracking-[0.1em] shrink-0 min-w-[200px] text-left">
                EXPECTED BEHAVIOR
              </span>
              <span className="font-sans text-[13px] text-[var(--text-2)] text-right max-w-[60%]">
                {derivedExpectedBehavior}
              </span>
            </div>

            <div className="flex justify-between items-baseline py-[14px]">
              <span className="font-mono text-[9px] uppercase text-[var(--text-3)] tracking-[0.1em] shrink-0 min-w-[200px] text-left">
                FAILURE BEHAVIOR
              </span>
              <span className="font-sans text-[13px] text-[var(--text-2)] text-right max-w-[60%] leading-normal italic font-light">
                "{derivedFailureBehavior}"
              </span>
            </div>

            <div className="flex justify-between items-baseline py-[14px]">
              <span className="font-mono text-[9px] uppercase text-[var(--text-3)] tracking-[0.1em] shrink-0 min-w-[200px] text-left">
                CHANGE THAT CAUSED IT
              </span>
              <span className="font-sans text-[13px] text-[var(--text-2)] text-right max-w-[60%]">
                {derivedChangeThatCausedIt}
              </span>
            </div>

            <div className="flex justify-between items-baseline py-[14px]">
              <span className="font-mono text-[9px] uppercase text-[var(--text-3)] tracking-[0.1em] shrink-0 min-w-[200px] text-left">
                PASS / FAIL CONDITION
              </span>
              <span className="font-sans text-[13px] text-white text-right max-w-[60%] font-medium">
                Behavior matches pre-change baseline
              </span>
            </div>

            <div className="flex justify-between items-baseline py-[14px]">
              <span className="font-mono text-[9px] uppercase text-[var(--text-3)] tracking-[0.1em] shrink-0 min-w-[200px] text-left">
                REPLAY BEFORE
              </span>
              <span className="font-sans text-[13px] text-[var(--text-2)] text-right max-w-[60%] last:pb-0">
                Any prompt, model, tool, or retrieval change
              </span>
            </div>
          </div>

          <div className="h-[1px] bg-[var(--bg-4)] my-8" />

          {/* Footer of the card */}
          <div className="space-y-[28px]">
            <p className="font-sans text-[13px] text-[var(--text-3)] leading-[1.65]">
              If you agreed to follow-up, we'll be in touch. Your failure pattern helps us map what breaks when AI systems move from demo to real release.
            </p>
            <button
              onClick={handleResetFlow}
              className="inline-block font-sans text-[13px] text-[var(--text-2)] hover:text-[var(--text-0)] transition-colors duration-200 bg-transparent border-none p-0 cursor-pointer outline-none font-medium hover:underline"
            >
              ← Back to the archive
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
