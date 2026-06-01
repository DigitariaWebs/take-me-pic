import type { User } from '@/data/mock';

/** Delivery state for an outgoing message. */
export type MessageStatus = 'sending' | 'sent' | 'read';

/** A single chat message. `incoming` = sent by the other person. */
export type ChatMessage = {
  id: string;
  kind: 'text' | 'image' | 'voice' | 'system';
  text?: string;
  imageUri?: string;
  voiceSeconds?: number;
  incoming: boolean;
  time: string; // e.g. "9:42"
  status?: MessageStatus; // outgoing only
  rotate?: number; // tiny paper tilt for the carnet feel
};

export type ChatPartner = User;

/** What the attachment sheet can return. */
export type AttachmentKind = 'photo' | 'camera' | 'position' | 'document';

/** mm:ss helper for voice durations / timers. */
export function fmtDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
