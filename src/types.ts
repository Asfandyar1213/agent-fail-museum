/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FailureCase {
  id: string;
  title: string;
  whatChanged: string;
  whatBroke: string;
  whyItMatters: string;
  risk: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Silent';
  type: string;
  surface: string;
  status: string;
  seenBy: number;
}

export interface SubmissionData {
  failurePattern: string;
  whatWereYouBuilding: string[];
  whatChanged: string[];
  whatBroke: string;
  usersSeen: 'Yes' | 'No' | 'Not Sure' | '';
  howHandleToday: string;
  followUp: boolean;
  nameEmail: string;
}
