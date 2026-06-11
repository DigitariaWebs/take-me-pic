export { default as MessagesScreen } from './screens/MessagesScreen';
export { default as ChatScreen } from './screens/ChatScreen';

export { ChatHeader } from './components/ChatHeader';
export { MessageBubble } from './components/MessageBubble';
export { TypingIndicator } from './components/TypingIndicator';
export { QuickReplies } from './components/QuickReplies';
export { Composer } from './components/Composer';
export { AttachmentSheet } from './components/AttachmentSheet';

export { chatApi, type Message } from './api/chat-api';
export { useConversation, type ChatItem } from './hooks/useConversation';

export { fmtDuration } from './types';
export type {
  ChatMessage,
  ChatPartner,
  MessageStatus,
  AttachmentKind,
} from './types';
