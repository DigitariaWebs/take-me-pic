# Contract: Realtime Chat Events

## Message Insert Event

```json
{
  "type": "message.inserted",
  "conversationId": "123",
  "message": {
    "id": "456",
    "clientMessageId": "device-uuid-1",
    "senderId": "user-uuid",
    "kind": "text",
    "body": "Je suis devant la fontaine",
    "metadata": {},
    "createdAt": "2026-06-08T14:30:00Z"
  }
}
```

## Message Attachment Event

```json
{
  "type": "message.inserted",
  "conversationId": "123",
  "message": {
    "id": "457",
    "clientMessageId": "device-uuid-2",
    "senderId": "user-uuid",
    "kind": "image",
    "body": null,
    "attachments": [
      {
        "kind": "image",
        "bucketId": "session-photos",
        "storagePath": "requests/987/messages/457/photo.jpg",
        "mimeType": "image/jpeg",
        "width": 1200,
        "height": 1600
      }
    ],
    "createdAt": "2026-06-08T14:30:10Z"
  }
}
```

## Read Cursor Event

```json
{
  "type": "conversation.read_cursor_updated",
  "conversationId": "123",
  "userId": "reader-uuid",
  "lastReadMessageId": "457",
  "readAt": "2026-06-08T14:31:00Z"
}
```

## Typing Broadcast Event

```json
{
  "type": "typing",
  "conversationId": "123",
  "userId": "user-uuid",
  "state": "started",
  "sentAt": "2026-06-08T14:30:20Z"
}
```

Typing events are ephemeral Realtime Broadcast messages and must not be stored in Postgres.

