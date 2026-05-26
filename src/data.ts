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
    whyItMatters: "No way to verify old fixes held before shipping",
    risk: "Same bug reaches users again",
    severity: "Silent",
    type: "Regression",
    surface: "Prompt",
    status: "Common"
  },
  {
    id: "02",
    title: "The Model Upgrade Break",
    whatChanged: "Underlying model version",
    whatBroke: "Behavior that passed on the old model failed on the new one",
    whyItMatters: "Teams assume model upgrades are safe without evidence",
    risk: "Shipping broken behavior to production",
    severity: "High",
    type: "Regression",
    surface: "Model",
    status: "Common"
  },
  {
    id: "03",
    title: "RAG Retrieval Drift",
    whatChanged: "Embedding index or chunking strategy",
    whatBroke: "Agent began returning outdated or irrelevant context",
    whyItMatters: "Retrieval changes are almost never tested against known cases",
    risk: "Users receive wrong information",
    severity: "High",
    type: "Drift",
    surface: "Retrieval",
    status: "Common"
  },
  {
    id: "04",
    title: "The Tool Call Mistake",
    whatChanged: "Tool schema or parameter names",
    whatBroke: "Agent called the wrong tool or passed malformed arguments",
    whyItMatters: "Tool changes look minor but silently break downstream steps",
    risk: "Downstream workflow breaks silently",
    severity: "Silent",
    type: "Integration",
    surface: "Tool",
    status: "Common"
  },
  {
    id: "05",
    title: "The Policy Bypass",
    whatChanged: "Guardrail prompt layer",
    whatBroke: "A working content policy stopped working after a prompt edit",
    whyItMatters: "Safety behavior is not regression-tested like functional behavior",
    risk: "Safety failure reaches users",
    severity: "Critical",
    type: "Safety",
    surface: "Guardrail",
    status: "Rare"
  },
  {
    id: "06",
    title: "The Hallucination Return",
    whatChanged: "Prompt or context window size",
    whatBroke: "A grounding fix that worked stopped working after an update",
    whyItMatters: "Hallucination fixes are fragile without locked test cases",
    risk: "Trusted output becomes unreliable",
    severity: "High",
    type: "Regression",
    surface: "Grounding",
    status: "Common"
  },
  {
    id: "07",
    title: "The Wrong Escalation",
    whatChanged: "Agent routing logic",
    whatBroke: "Agent escalated to a human on tasks it should have handled",
    whyItMatters: "Routing behavior changed invisibly after a prompt restructure",
    risk: "Automation fails silently",
    severity: "Medium",
    type: "Routing",
    surface: "Orchestration",
    status: "Common"
  },
  {
    id: "08",
    title: "The Memory Collapse",
    whatChanged: "Context management logic",
    whatBroke: "Agent lost conversation state at a specific input length",
    whyItMatters: "Memory behavior is nearly impossible to test without replay",
    risk: "Context lost mid-conversation",
    severity: "High",
    type: "State",
    surface: "Memory",
    status: "Common"
  },
  {
    id: "09",
    title: "The Dataset Update Break",
    whatChanged: "Retrieval corpus or training data",
    whatBroke: "Correct answers became wrong after data changed",
    whyItMatters: "Data changes are treated as safe when they can break everything",
    risk: "Correct answers become wrong",
    severity: "High",
    type: "Data",
    surface: "Corpus",
    status: "Common"
  },
  {
    id: "10",
    title: "The Loop That Never Ended",
    whatChanged: "Multi-step orchestration logic",
    whatBroke: "Agent entered a tool-calling loop with no exit condition",
    whyItMatters: "Complex agent flows are rarely tested for edge-case paths",
    risk: "Infinite cost and frozen agent",
    severity: "Critical",
    type: "Control",
    surface: "Orchestration",
    status: "Rare"
  }
];
