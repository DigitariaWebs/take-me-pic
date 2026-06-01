import type { Post, User } from '@/data/mock';

export type { Post, User };

export type FeedTab = 'pour-toi' | 'suivis' | 'pres';

export type Comment = { author: User; text: string; relative: string; hearts?: number };

/** Per-post UI state held by the feed screen. */
export type PostState = { liked: boolean; saved: boolean; likeCount: number };

/** 1248 → "1,2k". */
export function formatCount(n: number): string {
  if (n >= 1000) {
    const v = (n / 1000).toFixed(1).replace('.0', '').replace('.', ',');
    return `${v}k`;
  }
  return String(n);
}
