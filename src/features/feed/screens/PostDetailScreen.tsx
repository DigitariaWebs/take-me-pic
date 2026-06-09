import { useMemo, useState, useRef } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react-native';
import { PaperBackground } from '@/shared/ui/PaperBackground';
import { NavBar } from '@/shared/ui/iOSChrome';
import { Polaroid } from '@/shared/ui/Polaroid';
import { Stamp } from '@/shared/ui/Stamp';
import { posts, me } from '@/shared/data/mock';
import type { Post } from '@/shared/data/mock';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { t } from '@/shared/lib/i18n';

type Comment = Post['comments'][number];

/** 15 · Photo en grand. */
export default function PostDetail() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = posts.find((p) => p.id === id) ?? posts[0];

  const [liked, setLiked] = useState(true);
  const [hearts, setHearts] = useState(post.hearts);
  const [saved, setSaved] = useState(true);

  const [comments, setComments] = useState<Comment[]>([...post.comments]);
  const [draft, setDraft] = useState('');

  const scrollRef = useRef<ScrollView>(null);

  function toggleLike() {
    setLiked((prev) => {
      setHearts((h) => (prev ? h - 1 : h + 1));
      return !prev;
    });
  }

  function publishComment() {
    const text = draft.trim();
    if (!text) return;
    const newComment: Comment = {
      author: me,
      text,
      relative: t('discover.justNow'),
      hearts: 0,
    };
    setComments((prev) => [...prev, newComment]);
    setDraft('');
    // Scroll to bottom after a brief tick
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }

  return (
    <PaperBackground tone="paper">
      <View style={{ paddingTop: insets.top }}>
        <NavBar
          left={<Pressable onPress={() => router.back()}><Text style={styles.back}>{t('discover.back')}</Text></Pressable>}
          title={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Polaroid width={28} height={22} noCaption source={{ uri: post.author.avatar }} rotate={-3} />
              <View>
                <Text style={styles.author}>{post.author.firstName} {post.author.lastName}</Text>
                <Text style={styles.authorSub}>{post.city} · {post.relative}</Text>
              </View>
            </View>
          }
          right={<MoreHorizontal size={22} color={colors.ink} />}
        />
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ paddingHorizontal: 16 }}>
          <View style={styles.heroBox}>
            <Image source={{ uri: post.image }} style={StyleSheet.absoluteFill} />
            <View style={{ position: 'absolute', top: 12, right: 12 }}>
              <Stamp shape="rect" color="red" rotate={-6} size={110} fontSize={9}>★ JEMAA EL-FNA</Stamp>
            </View>
            <Text style={styles.heroDate}>14·VI·26 — 19:18</Text>
          </View>
        </View>

        {/* Engagement row */}
        <View style={styles.engagement}>
          <Pressable onPress={toggleLike} hitSlop={8}>
            <Heart
              size={24}
              color={colors.stampRed}
              fill={liked ? colors.stampRed : 'none'}
            />
          </Pressable>
          <MessageCircle size={24} color={colors.ink} />
          <Send size={24} color={colors.ink} />
          <View style={{ flex: 1 }} />
          <Pressable onPress={() => setSaved((s) => !s)} hitSlop={8}>
            <Bookmark
              size={24}
              color={colors.goldDeep}
              fill={saved ? colors.goldDeep : 'none'}
            />
          </Pressable>
        </View>
        <Text style={styles.hearts}>{t('discover.hearts', { n: hearts.toLocaleString('fr-FR') })}</Text>
        <Text style={styles.caption}>{post.caption}</Text>

        {/* Comments */}
        <View style={{ paddingHorizontal: 16, gap: 10, marginTop: 14 }}>
          {comments.map((c, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
              <Polaroid
                width={34}
                height={28}
                noCaption
                rotate={i % 2 === 0 ? -2 : 2}
                source={{ uri: c.author.avatar }}
              />
              <View style={[styles.comment, { transform: [{ rotate: `${(i % 2 ? 0.6 : -0.5)}deg` }] }]}>
                <Text>
                  <Text style={styles.cAuthor}>{c.author.username.replace('@', '')}</Text>
                  <Text>  </Text>
                  <Text style={styles.cBody}>{c.text}</Text>
                </Text>
                <Text style={styles.cMeta}>
                  {c.relative} · {c.hearts ? t('discover.commentHearts', { n: c.hearts }) : t('discover.reply')}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Composer */}
      <View style={[styles.composer, { paddingBottom: insets.bottom + 14 }]}>
        <Polaroid width={32} height={26} noCaption source={{ uri: me.avatar }} rotate={-3} />
        <TextInput
          style={styles.composerInput}
          placeholder={t('discover.commentPlaceholder')}
          placeholderTextColor={colors.inkFaded}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={publishComment}
          returnKeyType="send"
          multiline={false}
        />
        <Pressable onPress={publishComment} hitSlop={8}>
          <Text style={[styles.publish, !draft.trim() && styles.publishDisabled]}>{t('discover.publish')}</Text>
        </Pressable>
      </View>
    </PaperBackground>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  back: { fontFamily: fonts.hand, fontSize: 20, color: colors.ink },
  author: { fontFamily: fonts.serifBold, fontSize: 13, color: colors.ink },
  authorSub: { fontFamily: fonts.hand, fontSize: 13, color: colors.inkFaded },
  heroBox: {
    height: 300,
    borderWidth: 1.5,
    borderColor: colors.ink,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: colors.ink,
    shadowOpacity: 1,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 0,
    elevation: 4,
  },
  heroDate: { position: 'absolute', bottom: 10, left: 12, fontFamily: fonts.type, fontSize: 10, color: colors.polaroid, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 8, paddingVertical: 3 },
  engagement: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingHorizontal: 22, paddingVertical: 12 },
  hearts: { paddingHorizontal: 22, fontFamily: fonts.type, fontSize: 12, color: colors.ink },
  caption: { paddingHorizontal: 22, paddingVertical: 6, fontFamily: fonts.hand, fontSize: 20, color: colors.ink, lineHeight: 24 },
  comment: { flex: 1, backgroundColor: colors.cardWhite, borderWidth: 1.5, borderColor: colors.inkLine, padding: 8 },
  cAuthor: { fontFamily: fonts.serifBold, fontSize: 13, color: colors.ink },
  cBody: { fontFamily: fonts.hand, fontSize: 17, color: colors.ink },
  cMeta: { fontFamily: fonts.hand, fontSize: 13, color: colors.inkFaded, marginTop: 2 },
  composer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1.5,
    borderColor: colors.inkLine,
    borderStyle: 'dashed',
    backgroundColor: colors.paper2,
  },
  composerInput: {
    flex: 1,
    backgroundColor: colors.cardWhite,
    borderWidth: 1.5,
    borderColor: colors.ink,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontFamily: fonts.hand,
    fontSize: 18,
    color: colors.ink,
  },
  publish: { fontFamily: fonts.hand, fontSize: 20, color: colors.goldDeep, fontWeight: '600' },
  publishDisabled: { opacity: 0.35 },
});
