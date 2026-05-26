/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FailureCase {
  id: string; // e.g. "01"
  title: string;
  whatChanged: string;
  whatBroke: string;
  whyItMatters: string;
}

export interface SubmissionData {
  failurePattern: string; // "01: The Prompt Regression", etc.
  whatWereYouBuilding: string[]; // ['Agent', 'RAG App', ...]
  whatChanged: string[]; // ['Prompt', 'Model Version', ...]
  whatBroke: string;
  usersSeen: 'Yes' | 'No' | 'Not Sure' | '';
  howHandleToday: string;
  followUp: boolean;
  nameEmail: string;
}
