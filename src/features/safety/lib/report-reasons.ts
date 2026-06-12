/** Canned report reasons (MVP). The id is stored in reports.reason. */
export const REPORT_REASONS = [
  { id: 'harassment', labelKey: 'safety.reasonHarassment' },
  { id: 'inappropriate', labelKey: 'safety.reasonInappropriate' },
  { id: 'spam', labelKey: 'safety.reasonSpam' },
  { id: 'safety', labelKey: 'safety.reasonSafety' },
  { id: 'other', labelKey: 'safety.reasonOther' },
] as const;

export type ReportReasonId = (typeof REPORT_REASONS)[number]['id'];
