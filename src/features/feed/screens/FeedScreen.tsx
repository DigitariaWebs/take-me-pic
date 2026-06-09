/**
 * app/(tabs)/carnet.tsx
 * Le carnet partagé — the community feed.
 * Carnet de voyage aesthetic; no emoji; FlatList-based with
 * infinite scroll, pull-to-refresh, tab filtering, comment overlay,
 * and compose sheet.
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlusCircle, Search } from 'lucide-react-native';

import { NavBar } from '@/shared/ui/iOSChrome';
import { PaperBackground } from '@/shared/ui/PaperBackground';
import { PostCard } from '@/features/feed/components/PostCard';
import { StoriesRow } from '@/features/feed/components/StoriesRow';
import { FeedTabs } from '@/features/feed/components/FeedTabs';
import { CommentSheet } from '@/features/feed/components/CommentSheet';
import { ComposePostSheet } from '@/features/feed/components/ComposePostSheet';

import type { Comment, FeedTab, Post, PostState } from '@/features/feed/types';
import { posts as rawPosts, nearby, allUsers, me } from '@/shared/data/mock';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { t } from '@/shared/lib/i18n';

// ─── module-level counter for unique ids (no Math.random / Date.now) ──────────
let _idCounter = 0;
function nextId(prefix: string): string {
  _idCounter += 1;
  return `${prefix}-${_idCounter}`;
}

// ─── stable "followed" set for 'suivis' filter ────────────────────────────────
const FOLLOWED_IDS = new Set(['leo', 'ines', 'sami', 'me']);

// ─── cities shown in 'pres' tab ───────────────────────────────────────────────
const NEAR_CITIES = new Set(['Paris', 'Lisbonne']);

// ─── picsum helper (deterministic seed) ──────────────────────────────────────
const picsum = (seed: string) => `https://picsum.photos/seed/${seed}/600/600`;

// ─── initial per-post state ───────────────────────────────────────────────────
function buildPostState(p: Post): PostState {
  return { liked: false, saved: false, likeCount: p.hearts };
}

function buildPostStates(ps: Post[]): Record<string, PostState> {
  const rec: Record<string, PostState> = {};
  for (const p of ps) rec[p.id] = buildPostState(p);
  return rec;
}

function buildCommentMap(ps: Post[]): Record<string, Comment[]> {
  const rec: Record<string, Comment[]> = {};
  for (const p of ps) {
    rec[p.id] = p.comments.map((c) => ({
      author: c.author,
      text: c.text,
      relative: c.relative,
      hearts: c.hearts,
    }));
  }
  return rec;
}

// ─── generate "extra" posts for infinite scroll (recycles base posts) ─────────
function recyclePost(p: Post, suffix: string): Post {
  const newId = `${p.id}-r${suffix}`;
  return { ...p, id: newId, relative: 'il y a quelques instants' };
}

// ─── default PostState for posts without one (safety) ─────────────────────────
function defaultState(p: Post): PostState {
  return { liked: false, saved: false, likeCount: p.hearts };
}

// ─── helpers for tab filtering ────────────────────────────────────────────────
function filterForTab(allPosts: Post[], tab: FeedTab): Post[] {
  if (tab === 'pour-toi') return allPosts;
  if (tab === 'suivis') return allPosts.filter((p) => FOLLOWED_IDS.has(p.author.id));
  if (tab === 'pres') return allPosts.filter((p) => NEAR_CITIES.has(p.city));
  return allPosts;
}

// ─── stories users: nearby + allUsers deduplicated ───────────────────────────
const storyUsers = [
  ...allUsers.slice(1), // exclude me (index 0)
  ...nearby.filter((u) => !allUsers.find((a) => a.id === u.id)).slice(0, 6),
];

// ─── styles factory ───────────────────────────────────────────────────────────
const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    brand: {
      fontFamily: fonts.serifBold,
      fontSize: 26,
      color: colors.ink,
      letterSpacing: -0.5,
    },
    navRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    navBtn: {
      // hitSlop area around PlusCircle
    },
    banner: {
      marginHorizontal: 16,
      marginBottom: 4,
      backgroundColor: colors.paperWarm,
      borderWidth: 1.5,
      borderColor: colors.ink,
      borderStyle: 'dashed',
      paddingVertical: 6,
      paddingHorizontal: 14,
      alignItems: 'center',
    },
    bannerText: {
      fontFamily: fonts.hand,
      fontSize: 16,
      color: colors.ink,
    },
    empty: {
      fontFamily: fonts.hand,
      fontSize: 18,
      color: colors.inkFaded,
      textAlign: 'center',
      marginTop: 40,
      paddingHorizontal: 24,
    },
  });

// ─── component ────────────────────────────────────────────────────────────────

export default function CarnetTab() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ── feed list ──────────────────────────────────────────────────────────────
  const [feedPosts, setFeedPosts] = useState<Post[]>(() => [...rawPosts]);

  // ── per-post UI state ─────────────────────────────────────────────────────
  const [postStates, setPostStates] = useState<Record<string, PostState>>(
    () => buildPostStates(rawPosts)
  );

  // ── per-post comment overlay ──────────────────────────────────────────────
  const [commentMap, setCommentMap] = useState<Record<string, Comment[]>>(
    () => buildCommentMap(rawPosts)
  );

  // ── tab ───────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<FeedTab>('pour-toi');

  // ── pull-to-refresh ───────────────────────────────────────────────────────
  const [refreshing, setRefreshing] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── comment sheet ─────────────────────────────────────────────────────────
  const [commentPostId, setCommentPostId] = useState<string | null>(null);

  // ── compose sheet ─────────────────────────────────────────────────────────
  const [composeVisible, setComposeVisible] = useState(false);

  // ── infinite scroll guard ─────────────────────────────────────────────────
  const loadingMore = useRef(false);

  // ─── helpers ──────────────────────────────────────────────────────────────

  const getState = useCallback(
    (id: string): PostState => postStates[id] ?? defaultState({ hearts: 0 } as Post),
    [postStates]
  );

  const getComments = useCallback(
    (id: string): Comment[] => commentMap[id] ?? [],
    [commentMap]
  );

  // Ensure any post from infinite scroll has an entry in state maps
  const ensureState = useCallback(
    (post: Post) => {
      setPostStates((prev) => {
        if (prev[post.id]) return prev;
        return { ...prev, [post.id]: buildPostState(post) };
      });
      setCommentMap((prev) => {
        if (prev[post.id]) return prev;
        return {
          ...prev,
          [post.id]: post.comments.map((c) => ({
            author: c.author,
            text: c.text,
            relative: c.relative,
            hearts: c.hearts,
          })),
        };
      });
    },
    []
  );

  // ─── interaction handlers ─────────────────────────────────────────────────

  function toggleLike(id: string) {
    setPostStates((prev) => {
      const cur = prev[id] ?? defaultState({ hearts: 0 } as Post);
      return {
        ...prev,
        [id]: {
          ...cur,
          liked: !cur.liked,
          likeCount: cur.liked ? cur.likeCount - 1 : cur.likeCount + 1,
        },
      };
    });
  }

  function toggleSave(id: string) {
    setPostStates((prev) => {
      const cur = prev[id] ?? defaultState({ hearts: 0 } as Post);
      return { ...prev, [id]: { ...cur, saved: !cur.saved } };
    });
  }

  function handleShare() {
    Alert.alert(t('feed.partageAlertTitle'), t('feed.partageAlertMessage'));
  }

  // ─── comment sheet ────────────────────────────────────────────────────────

  function openComments(postId: string) {
    setCommentPostId(postId);
  }

  function closeComments() {
    setCommentPostId(null);
  }

  function handleAddComment(postId: string, text: string) {
    const newComment: Comment = {
      author: me,
      text,
      relative: "à l'instant",
      hearts: 0,
    };
    setCommentMap((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] ?? []), newComment],
    }));
  }

  // ─── compose sheet ────────────────────────────────────────────────────────

  function handlePublish(caption: string, city: string) {
    const id = nextId('mine');
    const newPost: Post = {
      id,
      author: me,
      city: city || me.city,
      relative: "à l'instant",
      image: picsum(`mine${id}`),
      caption,
      hearts: 0,
      comments: [],
    };
    setFeedPosts((prev) => [newPost, ...prev]);
    setPostStates((prev) => ({
      [id]: buildPostState(newPost),
      ...prev,
    }));
    setCommentMap((prev) => ({ [id]: [], ...prev }));
    setComposeVisible(false);
  }

  // ─── pull-to-refresh ──────────────────────────────────────────────────────

  function onRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      // Lightly reshuffle: rotate the base posts so a "new" one appears at top
      setFeedPosts((prev) => {
        // Move the last rawPost-length item to front as a fresh "arrival"
        const base = prev.filter((p) => p.id.startsWith('p'));
        if (base.length < 2) return prev;
        const rest = prev.filter((p) => !p.id.startsWith('p') || p.id !== base[base.length - 1].id);
        const promoted = { ...base[base.length - 1], relative: "à l'instant" };
        return [promoted, ...rest];
      });
      setShowBanner(true);
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
      bannerTimerRef.current = setTimeout(() => setShowBanner(false), 2400);
    }, 1100);
  }

  // ─── infinite scroll ──────────────────────────────────────────────────────

  function onEndReached() {
    if (loadingMore.current) return;
    loadingMore.current = true;

    const suffix = nextId('page');
    const extraPosts = rawPosts.map((p) => recyclePost(p, suffix));

    setFeedPosts((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const fresh = extraPosts.filter((p) => !existingIds.has(p.id));
      if (fresh.length === 0) {
        loadingMore.current = false;
        return prev;
      }
      // Ensure state maps get entries for new posts
      fresh.forEach((p) => ensureState(p));
      loadingMore.current = false;
      return [...prev, ...fresh];
    });
  }

  // ─── derived visible posts ────────────────────────────────────────────────

  const visiblePosts = filterForTab(feedPosts, activeTab);

  // ─── the comment post object for the sheet ────────────────────────────────

  const commentPost = commentPostId
    ? (feedPosts.find((p) => p.id === commentPostId) ?? null)
    : null;

  // ─── render item ─────────────────────────────────────────────────────────

  const renderPost = useCallback(
    ({ item }: { item: Post }) => {
      const ps = postStates[item.id] ?? buildPostState(item);
      const comments = commentMap[item.id] ?? [];
      return (
        <PostCard
          post={item}
          liked={ps.liked}
          saved={ps.saved}
          likeCount={ps.likeCount}
          commentCount={comments.length}
          onToggleLike={() => toggleLike(item.id)}
          onToggleSave={() => toggleSave(item.id)}
          onOpen={() => router.push(`/post/${item.id}`)}
          onOpenComments={() => openComments(item.id)}
          onOpenAuthor={() => router.push(`/user/${item.author.id}`)}
          onShare={handleShare}
        />
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [postStates, commentMap]
  );

  const keyExtractor = useCallback((item: Post) => item.id, []);

  // ─── list header ─────────────────────────────────────────────────────────

  const ListHeader = (
    <View>
      <FeedTabs value={activeTab} onChange={setActiveTab} />
      <StoriesRow
        users={storyUsers}
        onAddStory={() => setComposeVisible(true)}
        onOpenStory={(u) => router.push(`/user/${u.id}`)}
      />
      {showBanner && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{t('feed.carnetAJour')}</Text>
        </View>
      )}
    </View>
  );

  // ─── empty state ─────────────────────────────────────────────────────────

  const ListEmpty = (
    <Text style={styles.empty}>{t('feed.aucunPost')}</Text>
  );

  // ─── render ───────────────────────────────────────────────────────────────

  return (
    <PaperBackground tone="paper">
      <View style={{ paddingTop: insets.top }}>
        <NavBar
          title={<Text style={styles.brand}>{t('feed.leCarnet')}</Text>}
          right={
            <View style={styles.navRight}>
              <Search size={22} color={colors.ink} strokeWidth={1.8} />
              <View style={styles.navBtn}>
                <PlusCircle
                  size={22}
                  color={colors.ink}
                  strokeWidth={1.8}
                  onPress={() => setComposeVisible(true)}
                />
              </View>
            </View>
          }
        />
      </View>

      <FlatList
        data={visiblePosts}
        keyExtractor={keyExtractor}
        renderItem={renderPost}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.ink}
            colors={[colors.ink]}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        removeClippedSubviews
      />

      {/* Comment sheet */}
      <CommentSheet
        visible={commentPostId !== null}
        post={commentPost}
        comments={commentPostId ? getComments(commentPostId) : []}
        onClose={closeComments}
        onAddComment={(text) => {
          if (commentPostId) handleAddComment(commentPostId, text);
        }}
      />

      {/* Compose sheet */}
      <ComposePostSheet
        visible={composeVisible}
        onClose={() => setComposeVisible(false)}
        onPublish={handlePublish}
      />
    </PaperBackground>
  );
}
