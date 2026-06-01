/**
 * PostCard — scrapbook-style post card for the feed.
 * Carnet de voyage aesthetic: cardWhite surface, 1.5px ink border,
 * hard ink-offset shadow, Fraunces / Caveat / Special Elite typography.
 */

import React, { useMemo, useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
} from 'lucide-react-native';

import type { Post } from '@/components/feed/types';
import { formatCount } from '@/components/feed/types';
import { Avatar } from '@/components/Avatar';
import { Stamp } from '@/components/Stamp';
import { Tape } from '@/components/Tape';
import { fonts, hardShadow, type ThemeColors } from '@/theme/tokens';
import { useThemeColors } from '@/components/ThemeContext';
import { t } from '@/i18n';

// ─── props ────────────────────────────────────────────────────────────────────

export interface PostCardProps {
  post: Post;
  liked: boolean;
  saved: boolean;
  likeCount: number;
  commentCount: number;
  onToggleLike: () => void;
  onToggleSave: () => void;
  onOpen: () => void;
  onOpenComments: () => void;
  onOpenAuthor: () => void;
  onShare: () => void;
}

// ─── component ────────────────────────────────────────────────────────────────

export function PostCard({
  post,
  liked,
  saved,
  likeCount,
  commentCount,
  onToggleLike,
  onToggleSave,
  onOpen,
  onOpenComments,
  onOpenAuthor,
  onShare,
}: PostCardProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // Double-tap detection via a ref (no module-scope state)
  const lastTapRef = useRef<number>(0);

  // Heart burst animation
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;

  function triggerHeartBurst() {
    heartScale.setValue(0);
    heartOpacity.setValue(1);
    Animated.parallel([
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(350),
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }

  function handleImagePress() {
    const now = Date.now();
    const delta = now - lastTapRef.current;
    lastTapRef.current = now;

    if (delta < 300) {
      // Double-tap: like (only to like, never unlike)
      if (!liked) {
        onToggleLike();
      }
      triggerHeartBurst();
    } else {
      // Single-tap: open post
      onOpen();
    }
  }

  const firstComment = post.comments?.[0] ?? null;

  return (
    // Hard ink-offset shadow: render a shifted background layer behind the card
    <View style={styles.shadowWrapper}>
      {/* The hard ink shadow layer */}
      <View
        style={[
          styles.shadowBlock,
          {
            left: hardShadow.ink.offsetX,
            top: hardShadow.ink.offsetY,
            backgroundColor: colors.ink,
          },
        ]}
      />

      {/* Main card */}
      <View style={styles.card}>

        {/* Tape accent top-left */}
        <Tape
          color="cream"
          width={48}
          height={18}
          rotate={-3}
          style={styles.tapeAccent}
        />

        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Pressable onPress={onOpenAuthor} style={styles.avatarHitArea}>
            <Avatar
              source={{ uri: post.author.avatar }}
              size={38}
              style={styles.avatar}
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.authorName} numberOfLines={1}>
              {post.author.firstName} {post.author.lastName}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {post.city} · {post.relative}
            </Text>
          </View>

          <Pressable hitSlop={8} style={styles.moreBtn}>
            <MoreHorizontal size={20} color={colors.inkFaded} strokeWidth={1.8} />
          </Pressable>
        </View>

        {/* ── Image ───────────────────────────────────────────────────── */}
        <Pressable onPress={handleImagePress} style={styles.imageWrapper}>
          <Image
            source={{ uri: post.image }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Ink border overlay */}
          <View style={styles.imageBorder} pointerEvents="none" />

          {/* Badge stamp */}
          {post.badge ? (
            <View style={styles.badgeWrapper} pointerEvents="none">
              <Stamp
                color="red"
                shape="rect"
                size={44}
                rotate={6}
                fontSize={8}
                filled
              >
                {post.badge}
              </Stamp>
            </View>
          ) : null}

          {/* Heart burst */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.heartBurst,
              {
                transform: [{ scale: heartScale }],
                opacity: heartOpacity,
              },
            ]}
          >
            <Heart
              size={72}
              color={colors.stampRed}
              fill={colors.stampRed}
              strokeWidth={1.5}
            />
          </Animated.View>
        </Pressable>

        {/* ── Actions ─────────────────────────────────────────────────── */}
        <View style={styles.actionsRow}>
          <Pressable onPress={onToggleLike} hitSlop={6} style={styles.actionBtn}>
            <Heart
              size={22}
              color={liked ? colors.stampRed : colors.ink}
              fill={liked ? colors.stampRed : 'transparent'}
              strokeWidth={1.8}
            />
          </Pressable>

          <Pressable onPress={onOpenComments} hitSlop={6} style={styles.actionBtn}>
            <MessageCircle
              size={22}
              color={colors.ink}
              strokeWidth={1.8}
            />
          </Pressable>

          <Pressable onPress={onShare} hitSlop={6} style={styles.actionBtn}>
            <Send
              size={22}
              color={colors.ink}
              strokeWidth={1.8}
            />
          </Pressable>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          <Pressable onPress={onToggleSave} hitSlop={6} style={styles.actionBtn}>
            <Bookmark
              size={22}
              color={saved ? colors.gold : colors.ink}
              fill={saved ? colors.gold : 'transparent'}
              strokeWidth={1.8}
            />
          </Pressable>
        </View>

        {/* ── Counts + Caption ────────────────────────────────────────── */}
        <View style={styles.captionArea}>
          <Text style={styles.likeCount}>
            {t('feed.coeurs', { n: formatCount(likeCount) })}
          </Text>

          <Text style={styles.captionLine} numberOfLines={3}>
            <Text style={styles.captionAuthor}>
              {post.author.firstName} {post.author.lastName}
            </Text>
            {'  '}
            <Text style={styles.captionText}>{post.caption}</Text>
          </Text>
        </View>

        {/* ── Comments preview ────────────────────────────────────────── */}
        {commentCount > 0 ? (
          <View style={styles.commentsArea}>
            <Pressable onPress={onOpenComments}>
              <Text style={styles.seeComments}>
                {t('feed.voirCommentaires', { n: commentCount })}
              </Text>
            </Pressable>

            {firstComment ? (
              <Text style={styles.commentLine} numberOfLines={2}>
                <Text style={styles.commentAuthor}>
                  {firstComment.author.firstName}{' '}
                </Text>
                <Text style={styles.commentText}>{firstComment.text}</Text>
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────

const CARD_RADIUS = 4;

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  // Hard-shadow wrapper
  shadowWrapper: {
    marginHorizontal: 16,
    marginVertical: 12,
    // Slight rotation for pinned-paper feel
    transform: [{ rotate: '-0.5deg' }],
  },
  shadowBlock: {
    position: 'absolute',
    borderRadius: CARD_RADIUS,
    // Fill to match card size
    top: hardShadow.ink.offsetY,
    left: hardShadow.ink.offsetX,
    right: -hardShadow.ink.offsetX,
    bottom: -hardShadow.ink.offsetY,
  },

  // Main card surface
  card: {
    backgroundColor: colors.cardWhite,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
  },

  // Tape accent
  tapeAccent: {
    position: 'absolute',
    top: -6,
    left: 20,
    zIndex: 10,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 10,
  },
  avatarHitArea: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.inkLine,
    overflow: 'hidden',
  },
  avatar: {
    // Avatar component already handles borderRadius internally
  },
  headerText: {
    flex: 1,
    gap: 1,
  },
  authorName: {
    fontFamily: fonts.serifBold,
    fontSize: 15,
    color: colors.ink,
    lineHeight: 18,
  },
  meta: {
    fontFamily: fonts.hand,
    fontSize: 13,
    color: colors.inkFaded,
    lineHeight: 16,
  },
  moreBtn: {
    padding: 4,
  },

  // Image
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: colors.inkLine,
  },
  badgeWrapper: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  heartBurst: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2,
  },
  actionBtn: {
    padding: 5,
  },

  // Counts + caption
  captionArea: {
    paddingHorizontal: 14,
    paddingBottom: 6,
    gap: 4,
  },
  likeCount: {
    fontFamily: fonts.type,
    fontSize: 13,
    color: colors.ink,
    letterSpacing: 0.3,
  },
  captionLine: {
    lineHeight: 20,
  },
  captionAuthor: {
    fontFamily: fonts.serifBold,
    fontSize: 14,
    color: colors.ink,
  },
  captionText: {
    fontFamily: fonts.hand,
    fontSize: 15,
    color: colors.ink2,
  },

  // Comments preview
  commentsArea: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 3,
  },
  seeComments: {
    fontFamily: fonts.hand,
    fontSize: 13,
    color: colors.inkFaded,
    lineHeight: 18,
  },
  commentLine: {
    lineHeight: 19,
  },
  commentAuthor: {
    fontFamily: fonts.serifBold,
    fontSize: 13,
    color: colors.ink,
  },
  commentText: {
    fontFamily: fonts.hand,
    fontSize: 14,
    color: colors.ink2,
  },
});
