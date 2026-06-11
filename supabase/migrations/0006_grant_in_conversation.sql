-- Fix: the conversations/participants/messages RLS policies call
-- private.in_conversation(conversation_id), but 0001 revoked EXECUTE on it from
-- authenticated — so every participant read/send was denied
-- ("permission denied for function in_conversation"). The function is
-- SECURITY DEFINER and returns only a boolean (is the current user a member of
-- this conversation), so authenticated must be able to execute it for RLS.

grant execute on function private.in_conversation(bigint) to authenticated;
