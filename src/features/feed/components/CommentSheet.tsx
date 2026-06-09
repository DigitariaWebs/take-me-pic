import React, { useMemo, useState, useRef } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Heart, MessageCircle, CornerDownRight } from 'lucide-react-native';

import { fonts, hardShadow, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { Avatar } from '@/shared/ui/Avatar';
import { Tape } from '@/shared/ui/Tape';
import { me } from '@/shared/data/mock';
import type { Post, Comment } from '@/features/feed/types';
import { t } from '@/shared/lib/i18n';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CommentSheetProps {
  visible: boolean;
  post: Post | null;
  comments: Comment[];
  onClose: () => void;
  onAddComment: (text: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function HardShadowBox({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.shadowWrap, style]}>
      {/* offset shadow layer */}
      <View
        style={[
          styles.shadowLayer,
          {
            left: hardShadow.ink.offsetX,
            top: hardShadow.ink.offsetY,
            backgroundColor: colors.ink,
          },
        ]}
      />
      {/* surface */}
      <View style={styles.shadowSurface}>{children}</View>
    </View>
  );
}

// ─── Comment Row ──────────────────────────────────────────────────────────────

function CommentRow({ comment }: { comment: Comment }) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [liked, setLiked] = useState(false);
  const hearts = (comment.hearts ?? 0) + (liked ? 1 : 0);

  return (
    <View style={styles.commentRow}>
      {/* avatar */}
      <Avatar
        source={{ uri: comment.author.avatar }}
        size={36}
        style={styles.commentAvatar}
      />

      {/* paper note */}
      <HardShadowBox style={styles.noteWrap}>
        {/* tape accent on corner */}
        <Tape color="cream" width={28} height={12} rotate={-3} style={styles.noteTape} />

        {/* author name */}
        <Text style={styles.noteAuthor} numberOfLines={1}>
          {comment.author.firstName} {comment.author.lastName}
        </Text>

        {/* comment body */}
        <Text style={styles.noteText}>{comment.text}</Text>

        {/* meta row */}
        <View style={styles.noteMeta}>
          <Text style={styles.noteRelative}>{comment.relative}</Text>
          <Pressable style={styles.replyBtn}>
            <CornerDownRight size={11} color={colors.inkFaded} />
            <Text style={styles.replyLabel}>{t('feed.repondre')}</Text>
          </Pressable>
          {/* heart */}
          <Pressable
            onPress={() => setLiked((v) => !v)}
            style={styles.heartBtn}
            hitSlop={8}
          >
            <Heart
              size={13}
              color={liked ? colors.stampRed : colors.inkFaded}
              fill={liked ? colors.stampRed : 'transparent'}
            />
            {hearts > 0 && (
              <Text style={[styles.heartCount, liked && styles.heartCountActive]}>
                {hearts}
              </Text>
            )}
          </Pressable>
        </View>
      </HardShadowBox>
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.emptyWrap}>
      <MessageCircle size={32} color={colors.inkFaded} strokeWidth={1.5} />
      <Text style={styles.emptyText}>{t('feed.soisPremier')}</Text>
    </View>
  );
}

// ─── CommentSheet ─────────────────────────────────────────────────────────────

export function CommentSheet({
  visible,
  post,
  comments,
  onClose,
  onAddComment,
}: CommentSheetProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');
  const inputRef = useRef<TextInput>(null);

  function handlePublish() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAddComment(trimmed);
    setDraft('');
    inputRef.current?.blur();
  }

  const commentCount = comments.length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.sheet, { paddingTop: insets.top > 0 ? insets.top + 4 : 16 }]}>
        {/* ── Header ── */}
        <View style={styles.header}>
          {/* decorative tape strip */}
          <Tape color="red" width={44} height={16} rotate={-4} style={styles.headerTape} />

          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>{t('feed.commentaires')}</Text>
              {post && (
                <Text style={styles.headerSub} numberOfLines={1}>
                  {post.author.firstName} · {post.city}
                </Text>
              )}
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.headerCount}>{commentCount}</Text>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                style={styles.closeBtn}
                accessibilityLabel="fermer"
              >
                <X size={20} color={colors.ink} strokeWidth={2.2} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── List ── */}
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={8}
        >
          <FlatList
            data={comments}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => <CommentRow comment={item} />}
            contentContainerStyle={[
              styles.listContent,
              commentCount === 0 && styles.listContentEmpty,
            ]}
            ListEmptyComponent={<EmptyState />}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />

          {/* ── Composer ── */}
          <View
            style={[
              styles.composer,
              { paddingBottom: Math.max(insets.bottom, 12) },
            ]}
          >
            {/* dashed separator */}
            <View style={styles.composerDivider} />

            <View style={styles.composerRow}>
              {/* current user avatar */}
              <Avatar
                source={{ uri: me.avatar }}
                size={34}
                style={styles.composerAvatar}
              />

              {/* input + button wrapper with hard-shadow style */}
              <View style={styles.composerInputWrap}>
                <View style={styles.composerShadowLayer} />
                <View style={styles.composerSurface}>
                  <TextInput
                    ref={inputRef}
                    value={draft}
                    onChangeText={setDraft}
                    placeholder={t('feed.unMot')}
                    placeholderTextColor={colors.inkFaded}
                    style={styles.composerInput}
                    multiline
                    maxLength={400}
                    returnKeyType="default"
                    blurOnSubmit={false}
                  />
                  <Pressable
                    onPress={handlePublish}
                    disabled={draft.trim().length === 0}
                    style={({ pressed }) => [
                      styles.publishBtn,
                      draft.trim().length === 0 && styles.publishBtnDisabled,
                      pressed && styles.publishBtnPressed,
                    ]}
                    accessibilityLabel={t('feed.publier')}
                  >
                    <Text
                      style={[
                        styles.publishLabel,
                        draft.trim().length === 0 && styles.publishLabelDisabled,
                      ]}
                    >
                      {t('feed.publier')}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  flex: { flex: 1 },

  // Sheet
  sheet: {
    flex: 1,
    backgroundColor: colors.paper,
  },

  // Header
  header: {
    paddingHorizontal: 22,
    paddingBottom: 10,
    overflow: 'visible',
  },
  headerTape: {
    position: 'absolute',
    top: -6,
    left: 18,
    zIndex: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  headerTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontFamily: fonts.type,
    fontSize: 11,
    color: colors.inkFaded,
    marginTop: 2,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 4,
  },
  headerCount: {
    fontFamily: fonts.type,
    fontSize: 14,
    color: colors.inkFaded,
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardWhite,
  },

  // Divider
  divider: {
    height: 1.5,
    backgroundColor: colors.ink,
    marginHorizontal: 0,
    opacity: 0.18,
  },

  // List
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 16,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },

  // Empty
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontFamily: fonts.hand,
    fontSize: 18,
    color: colors.inkFaded,
    textAlign: 'center',
  },

  // Comment row
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  commentAvatar: {
    marginTop: 6,
  },
  noteWrap: {
    flex: 1,
  },

  // HardShadowBox
  shadowWrap: {
    position: 'relative',
  },
  shadowLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 3,
  },
  shadowSurface: {
    backgroundColor: colors.cardWhite,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 10,
    position: 'relative',
    overflow: 'visible',
  },

  // Note content
  noteTape: {
    position: 'absolute',
    top: -7,
    left: 10,
    zIndex: 2,
  },
  noteAuthor: {
    fontFamily: fonts.serifBold,
    fontSize: 13,
    color: colors.ink,
    marginBottom: 3,
  },
  noteText: {
    fontFamily: fonts.hand,
    fontSize: 16,
    color: colors.ink2,
    lineHeight: 22,
  },
  noteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  noteRelative: {
    fontFamily: fonts.type,
    fontSize: 10,
    color: colors.inkFaded,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    flex: 1,
  },
  replyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  replyLabel: {
    fontFamily: fonts.type,
    fontSize: 10,
    color: colors.inkFaded,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  heartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  heartCount: {
    fontFamily: fonts.type,
    fontSize: 10,
    color: colors.inkFaded,
    letterSpacing: 0.3,
  },
  heartCountActive: {
    color: colors.stampRed,
  },

  // Composer
  composer: {
    paddingHorizontal: 18,
    backgroundColor: colors.paper,
  },
  composerDivider: {
    height: 1.5,
    borderTopWidth: 1.5,
    borderColor: colors.ink,
    borderStyle: 'dashed',
    opacity: 0.25,
    marginBottom: 12,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  composerAvatar: {
    marginBottom: 2,
  },
  composerInputWrap: {
    flex: 1,
    position: 'relative',
  },
  composerShadowLayer: {
    position: 'absolute',
    top: hardShadow.ink.offsetY,
    left: hardShadow.ink.offsetX,
    right: -hardShadow.ink.offsetX,
    bottom: -hardShadow.ink.offsetY,
    backgroundColor: colors.ink,
    borderRadius: 4,
  },
  composerSurface: {
    backgroundColor: colors.cardWhite,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    position: 'relative',
  },
  composerInput: {
    flex: 1,
    fontFamily: fonts.hand,
    fontSize: 17,
    color: colors.ink,
    minHeight: 36,
    maxHeight: 100,
    paddingTop: Platform.OS === 'ios' ? 4 : 2,
    paddingBottom: Platform.OS === 'ios' ? 4 : 2,
    paddingRight: 6,
  },
  publishBtn: {
    backgroundColor: colors.inkSurface,
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 1,
  },
  publishBtnDisabled: {
    backgroundColor: colors.inkFaded,
    opacity: 0.4,
  },
  publishBtnPressed: {
    opacity: 0.75,
  },
  publishLabel: {
    fontFamily: fonts.type,
    fontSize: 12,
    color: colors.onInk,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  publishLabelDisabled: {
    color: colors.paper,
  },
});
