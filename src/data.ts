/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FailureCase } from './types';

export const FAILURE_CASES: FailureCase[] = [
  {
    id: "01",
    title: "The Prompt Regression",
    whatChanged: "System prompt wording",
    whatBroke: "A previously fixed output failure returned silently",
    whyItMatters: "No way to verify old fixes held before shipping"
  },
  {
    id: "02",
    title: "The Model Upgrade Break",
    whatChanged: "Underlying model version",
    whatBroke: "Behavior that passed on the old model failed on the new one",
    whyItMatters: "Teams assume model upgrades are safe without evidence"
  },
  {
    id: "03",
    title: "RAG Retrieval Drift",
    whatChanged: "Embedding index or chunking",
    whatBroke: "Agent began returning outdated, irrelevant context",
    whyItMatters: "Retrieval changes are almost never tested against known cases"
  },
  {
    id: "04",
    title: "The Tool Call Mistake",
    whatChanged: "Tool schema or parameter names",
    whatBroke: "Agent called the wrong tool or passed malformed arguments",
    whyItMatters: "Tool changes look minor but silently break downstream steps"
  },
  {
    id: "05",
    title: "The Policy Bypass",
    whatChanged: "Guardrail prompt layer",
    whatBroke: "A working content policy stopped working after a prompt edit",
    whyItMatters: "Safety behavior is not regression-tested like functional behavior"
  },
  {
    id: "06",
    title: "The Hallucination Return",
    whatChanged: "Prompt or context window size",
    whatBroke: "A grounding fix that worked stopped working after an update",
    whyItMatters: "Hallucination fixes are fragile without locked test cases"
  },
  {
    id: "07",
    title: "The Wrong Escalation",
    whatChanged: "Agent routing logic",
    whatBroke: "Agent escalated to a human on tasks it should have handled",
    whyItMatters: "Routing behavior changed invisibly after a prompt restructure"
  },
  {
    id: "08",
    title: "The Memory Collapse",
    whatChanged: "Context management logic",
    whatBroke: "Agent lost conversation state at a specific input length",
    whyItMatters: "Memory behavior is nearly impossible to test without replay"
  },
  {
    id: "09",
    title: "The Dataset Update Break",
    whatChanged: "Retrieval corpus or training data",
    whatBroke: "Correct answers became wrong after data changed",
    whyItMatters: "Data changes are treated as safe when they can break everything"
  },
  {
    id: "10",
    title: "The Loop That Never Ended",
    whatChanged: "Multi-step orchestration logic",
    whatBroke: "Agent entered a tool-calling loop with no exit condition",
    whyItMatters: "Complex agent flows are rarely tested for edge-case paths"
  }
];
