import { useMemo, useState, useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QrCode, Settings, X, Pencil } from 'lucide-react-native';
import { PaperBackground } from '@/components/PaperBackground';
import { NavBar } from '@/components/iOSChrome';
import { Polaroid } from '@/components/Polaroid';
import { Tape } from '@/components/Tape';
import { Stamp } from '@/components/Stamp';
import { Chip } from '@/components/Chip';
import { Flag } from '@/components/Flag';
import { Button } from '@/components/Button';
import { QRPlaceholder } from '@/components/QRPlaceholder';
import { fonts, type ThemeColors } from '@/theme/tokens';
import { useThemeColors } from '@/components/ThemeContext';
import { me, galleryPhotos } from '@/data/mock';
import { t } from '@/i18n';
import { useRole } from '@/components/RoleContext';

type ProfileTab = 'historique' | 'photos' | 'badges';

const historyItems = [
  { title: 'Léo a pris notre photo', sub: 'place des Vosges · 12 min', thumb: 'https://picsum.photos/seed/h1/100', rotate: -2, color: 'gold' as const, gain: 15 },
  { title: "j'ai photographié Sami", sub: 'Marais · hier', thumb: 'https://picsum.photos/seed/h2/100', rotate: 1.5, color: 'green' as const, gain: 22 },
  { title: 'photo avec Inès & Marc', sub: 'Lisbonne · 6 mai', thumb: 'https://picsum.photos/seed/h3/100', rotate: -3, color: 'gold' as const, gain: 18 },
];

const badgeData = [
  { label: 'TOP 3%\n★ PARIS ★\njuin 26', color: 'gold' as const, rotate: -12 },
  { label: 'SUPER\nPHOTO\nGRAPHE', color: 'red' as const, rotate: 8 },
  { label: 'VOYAGEUR\n★★★\nCONFIRMÉ', color: 'blue' as const, rotate: -6 },
  { label: 'KARMA\n1 000+\nFRANCE', color: 'green' as const, rotate: 10 },
  { label: 'LISBONNE\n★ CLUB\n2026', color: 'ink' as const, rotate: -4 },
  { label: 'EARLY\nADOPTER\n✦', color: 'gold' as const, rotate: 7 },
];

// ─── styles factory ───────────────────────────────────────────────────────────
const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    // Role segmented control
    roleSwitchRow: {
      flexDirection: 'row',
      marginHorizontal: 22,
      marginBottom: 12,
      borderWidth: 1.5,
      borderColor: colors.ink,
      overflow: 'hidden',
    },
    roleChip: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    roleChipActive: {
      backgroundColor: colors.inkSurface,
    },
    roleChipText: {
      fontFamily: fonts.type,
      fontSize: 10,
      letterSpacing: 0.8,
      color: colors.ink,
      textTransform: 'uppercase',
    },
    roleChipTextActive: {
      color: colors.onInk,
    },
    name: { fontFamily: fonts.serifBold, fontSize: 24, letterSpacing: -0.4, color: colors.ink },
    bioText: { fontFamily: fonts.hand, fontSize: 14, color: colors.inkFaded, marginTop: 4, lineHeight: 20 },
    metaLine: { fontFamily: fonts.hand, fontSize: 16, color: colors.inkFaded, marginTop: 2 },
    chipRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 8 },
    editBtn: {
      width: 24,
      height: 24,
      borderWidth: 1,
      borderColor: colors.inkLine,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.cardWhite,
    },
    karmaCard: {
      overflow: 'hidden',
      borderWidth: 1.5,
      borderColor: colors.ink,
      shadowColor: colors.ink,
      shadowOpacity: 1,
      shadowOffset: { width: 5, height: 5 },
      shadowRadius: 0,
      elevation: 4,
    },
    karmaSub: { fontFamily: fonts.type, fontSize: 10, color: colors.ink, opacity: 0.7, letterSpacing: 1.2 },
    karmaBig: { fontFamily: fonts.serifBlack, fontSize: 46, lineHeight: 48, color: colors.ink },
    karmaWeek: { fontFamily: fonts.hand, fontSize: 16, color: colors.ink, marginTop: 4 },
    karmaPhotoCount: { fontFamily: fonts.serifBold, fontSize: 22, color: colors.ink },
    historyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.cardWhite,
      borderWidth: 1.5,
      borderColor: colors.inkLine,
      padding: 10,
    },
    histTitle: { fontFamily: fonts.serifBold, fontSize: 14, color: colors.ink },
    histSub: { fontFamily: fonts.hand, fontSize: 15, color: colors.inkFaded },
    // Photos tab
    photoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 18,
      marginTop: 16,
      gap: 4,
      justifyContent: 'flex-start',
    },
    photoCell: {
      marginBottom: 8,
      marginRight: 4,
    },
    favHeart: {
      position: 'absolute',
      top: 4,
      right: 4,
    },
    // Badges tab
    badgeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 22,
      marginTop: 20,
      gap: 16,
      justifyContent: 'center',
    },
    badgeCell: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    // ── Modals ──────────────────────────────────────────────────────
    modalSheet: {
      flex: 1,
      backgroundColor: colors.paper,
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 40,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      flex: 1,
      fontFamily: fonts.serifBold,
      fontSize: 22,
      letterSpacing: -0.3,
      color: colors.ink,
    },
    modalClose: {
      width: 32,
      height: 32,
      borderWidth: 1.5,
      borderColor: colors.inkLine,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.cardWhite,
    },
    // Edit profile fields
    fieldLabel: {
      fontFamily: fonts.type,
      fontSize: 10,
      letterSpacing: 1.4,
      color: colors.ink,
      opacity: 0.6,
      marginBottom: 6,
      textTransform: 'uppercase',
    },
    fieldInput: {
      fontFamily: fonts.serifBold,
      fontSize: 18,
      color: colors.ink,
      borderBottomWidth: 1.5,
      borderBottomColor: colors.ink,
      paddingVertical: 8,
      paddingHorizontal: 2,
      backgroundColor: 'transparent',
    },
    fieldInputMulti: {
      height: 100,
      borderWidth: 1.5,
      borderColor: colors.inkLine,
      borderBottomWidth: 1.5,
      borderBottomColor: colors.inkLine,
      paddingHorizontal: 10,
      paddingTop: 10,
      fontFamily: fonts.hand,
      fontSize: 16,
      lineHeight: 24,
      backgroundColor: colors.cardWhite,
    },
    // ── Passport card ─────────────────────────────────────────────
    passportCard: {
      marginTop: 8,
      borderWidth: 2,
      borderColor: colors.stampBlue,
      overflow: 'hidden',
      shadowColor: colors.ink,
      shadowOpacity: 0.5,
      shadowOffset: { width: 4, height: 6 },
      shadowRadius: 0,
      elevation: 6,
    },
    passportStripe: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    passportCountry: {
      fontFamily: fonts.type,
      fontSize: 11,
      letterSpacing: 2.5,
      color: '#e8d9b0',
    },
    passportSub: {
      fontFamily: fonts.hand,
      fontSize: 14,
      color: '#c4a96a',
      marginTop: 2,
    },
    passportBody: {
      backgroundColor: colors.polaroid,
      padding: 16,
    },
    passportTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    passportName: {
      fontFamily: fonts.serifBold,
      fontSize: 18,
      color: colors.ink,
      letterSpacing: -0.2,
    },
    passportMeta: {
      fontFamily: fonts.hand,
      fontSize: 14,
      color: colors.inkFaded,
      marginTop: 2,
    },
    qrBlock: {
      alignItems: 'center',
      marginTop: 4,
    },
    qrFrame: {
      borderWidth: 2,
      borderColor: colors.ink,
      padding: 8,
      backgroundColor: colors.polaroid,
    },
    qrCaption: {
      fontFamily: fonts.hand,
      fontSize: 12,
      color: colors.inkFaded,
      marginTop: 6,
      letterSpacing: 0.5,
    },
    passportStampOverlay: {
      position: 'absolute',
      bottom: 8,
      right: 12,
    },
    passportFooter: {
      backgroundColor: colors.paper2,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderTopWidth: 1,
      borderTopColor: colors.inkLine,
      gap: 2,
    },
    passportMRZ: {
      fontFamily: fonts.type,
      fontSize: 9,
      letterSpacing: 1.5,
      color: colors.ink2,
    },
    passportNote: {
      fontFamily: fonts.hand,
      fontSize: 13,
      color: colors.inkFaded,
      textAlign: 'center',
      marginTop: 16,
      fontStyle: 'italic',
    },
  });

/** 13 · Mon carnet. */
export default function MoiTab() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { role, setRole } = useRole();
  const [activeTab, setActiveTab] = useState<ProfileTab>('historique');

  // ── Editable profile state ───────────────────────────────────────
  const [displayName, setDisplayName] = useState(`${me.firstName} ${me.lastName.charAt(0)}.`);
  const [displayBio, setDisplayBio] = useState(me.bio);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [draftName, setDraftName] = useState(displayName);
  const [draftBio, setDraftBio] = useState(displayBio);

  function openEditModal() {
    setDraftName(displayName);
    setDraftBio(displayBio);
    setEditModalVisible(true);
  }

  function saveEdits() {
    if (draftName.trim()) setDisplayName(draftName.trim());
    setDisplayBio(draftBio);
    setEditModalVisible(false);
  }

  // ── QR passport modal ────────────────────────────────────────────
  const [qrModalVisible, setQrModalVisible] = useState(false);

  // ── Karma count-up animation ─────────────────────────────────────
  const karmaAnim = useRef(new Animated.Value(0)).current;
  const [karmaDisplay, setKarmaDisplay] = useState(0);

  useEffect(() => {
    Animated.timing(karmaAnim, {
      toValue: me.karma,
      duration: 1400,
      useNativeDriver: false,
    }).start();

    const listener = karmaAnim.addListener(({ value }) => {
      setKarmaDisplay(Math.round(value));
    });

    return () => karmaAnim.removeListener(listener);
  }, []);

  const tabs: ProfileTab[] = ['historique', 'photos', 'badges'];

  return (
    <PaperBackground tone="paper">
      <View style={{ paddingTop: insets.top }}>
        <NavBar
          left={
            <Pressable onPress={() => setQrModalVisible(true)}>
              <QrCode size={22} color={colors.ink} />
            </Pressable>
          }
          title={t('myProfile.title')}
          right={
            <Pressable onPress={() => router.push('/settings')}>
              <Settings size={22} color={colors.ink} />
            </Pressable>
          }
        />
      </View>

      {/* ── Role segmented control ──────────────────────────────────── */}
      <View style={styles.roleSwitchRow}>
        <Pressable
          style={[styles.roleChip, role === 'seeker' && styles.roleChipActive]}
          onPress={() => setRole('seeker')}
        >
          <Text style={[styles.roleChipText, role === 'seeker' && styles.roleChipTextActive]}>
            {t('setx.roleSeekerLabel')}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.roleChip, role === 'helper' && styles.roleChipActive]}
          onPress={() => setRole('helper')}
        >
          <Text style={[styles.roleChipText, role === 'helper' && styles.roleChipTextActive]}>
            {t('setx.roleHelperLabel')}
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
        <View style={{ paddingHorizontal: 22, flexDirection: 'row', gap: 16, alignItems: 'flex-start', position: 'relative' }}>
          <View style={{ transform: [{ rotate: '-5deg' }] }}>
            <Polaroid width={110} height={110} captionSize={14} caption="moi, juin 2026" source={{ uri: me.avatar }}>
              <Tape color="red" rotate={-3} width={56} style={{ position: 'absolute', top: -10, left: 30 }} />
            </Polaroid>
          </View>
          <View style={{ flex: 1, paddingTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.name}>{displayName}</Text>
              <Pressable onPress={openEditModal} style={styles.editBtn}>
                <Pencil size={14} color={colors.ink} />
              </Pressable>
            </View>
            <Text style={styles.metaLine}>{me.city} · depuis {me.memberSince}</Text>
            {displayBio ? (
              <Text style={styles.bioText}>{displayBio}</Text>
            ) : null}
            <View style={styles.chipRow}>
              {me.languages.map((l) => (
                <Chip key={l} leading={<Flag size={15}>{l}</Flag>} size="sm">
                  {' '}
                </Chip>
              ))}
            </View>
          </View>
          <View style={{ position: 'absolute', top: 30, right: 18 }}>
            <Stamp color="gold" size={78} fontSize={8} rotate={-12}>{`TOP 3%\n★ PARIS ★\njuin 26`}</Stamp>
          </View>
        </View>

        <View style={[styles.karmaCard, { marginHorizontal: 22, marginTop: 18 }]}>
          <LinearGradient
            colors={[colors.goldLight, colors.goldDeep] as unknown as readonly [string, string]}
            style={StyleSheet.absoluteFill}
          />
          <View style={{ padding: 18, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.karmaSub}>{t('myProfile.karma')}</Text>
              <Text style={styles.karmaBig}>{karmaDisplay}</Text>
              <Text style={styles.karmaWeek}>{t('myProfile.weekly', { n: 15 })}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.karmaPhotoCount}>{me.photosCount} / {me.rating}★</Text>
              <Text style={styles.karmaSub}>
                {role === 'helper' ? t('setx.statsGiven') : t('setx.statsReceived')}
              </Text>
            </View>
          </View>
        </View>

        {/* Tab switcher */}
        <View style={[styles.chipRow, { paddingHorizontal: 22, marginTop: 18 }]}>
          {tabs.map((tab) => (
            <Chip
              key={tab}
              variant={activeTab === tab ? 'filled' : 'outline'}
              onPress={() => setActiveTab(tab)}
            >
              {tab}
            </Chip>
          ))}
        </View>

        {/* Tab: historique */}
        {activeTab === 'historique' && (
          <View style={{ paddingHorizontal: 22, marginTop: 12, gap: 10 }}>
            {historyItems.map((item) => (
              <View key={item.title} style={styles.historyItem}>
                <Polaroid
                  width={42}
                  height={36}
                  noCaption
                  rotate={item.rotate}
                  source={{ uri: item.thumb }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.histTitle}>{item.title}</Text>
                  <Text style={styles.histSub}>{item.sub}</Text>
                </View>
                <Chip color={item.color}>+{item.gain}</Chip>
              </View>
            ))}
          </View>
        )}

        {/* Tab: photos — 3-col polaroid grid */}
        {activeTab === 'photos' && (
          <View style={styles.photoGrid}>
            {galleryPhotos.map((photo, i) => (
              <View
                key={photo.uri}
                style={[
                  styles.photoCell,
                  { transform: [{ rotate: `${(i % 3 === 0 ? -2 : i % 3 === 1 ? 1 : -1)}deg` }] },
                ]}
              >
                <Polaroid
                  width={100}
                  height={100}
                  noCaption
                  source={{ uri: photo.uri }}
                />
                {photo.favorite && (
                  <View style={styles.favHeart}>
                    <Text style={{ fontSize: 12 }}>❤️</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Tab: badges — grid of stamp badges */}
        {activeTab === 'badges' && (
          <View style={styles.badgeGrid}>
            {badgeData.map((badge, i) => (
              <View key={i} style={styles.badgeCell}>
                <Stamp
                  color={badge.color}
                  size={80}
                  fontSize={8}
                  rotate={badge.rotate}
                >
                  {badge.label}
                </Stamp>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Edit profile Modal ──────────────────────────────────────── */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalSheet}>
          {/* Modal header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('setx.editProfileTitle')}</Text>
            <Pressable onPress={() => setEditModalVisible(false)} style={styles.modalClose}>
              <X size={20} color={colors.ink} />
            </Pressable>
          </View>

          {/* Decorative tape strip */}
          <View style={{ alignItems: 'center', marginBottom: 8 }}>
            <Tape color="cream" width={80} height={14} rotate={-1} />
          </View>

          {/* Name field */}
          <Text style={styles.fieldLabel}>{t('setx.editNameLabel')}</Text>
          <TextInput
            style={styles.fieldInput}
            value={draftName}
            onChangeText={setDraftName}
            placeholder={t('setx.editNamePlaceholder')}
            placeholderTextColor={colors.inkFaded}
            autoCorrect={false}
          />

          {/* Bio field */}
          <Text style={[styles.fieldLabel, { marginTop: 18 }]}>{t('setx.editBioLabel')}</Text>
          <TextInput
            style={[styles.fieldInput, styles.fieldInputMulti]}
            value={draftBio}
            onChangeText={setDraftBio}
            placeholder={t('setx.editBioPlaceholder')}
            placeholderTextColor={colors.inkFaded}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Save button */}
          <View style={{ marginTop: 28 }}>
            <Button variant="ink" full onPress={saveEdits}>
              {t('setx.editSave')}
            </Button>
          </View>
        </View>
      </Modal>

      {/* ── QR Passport Modal ───────────────────────────────────────── */}
      <Modal
        visible={qrModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalSheet}>
          {/* Modal header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('setx.passportTitle')}</Text>
            <Pressable onPress={() => setQrModalVisible(false)} style={styles.modalClose}>
              <X size={20} color={colors.ink} />
            </Pressable>
          </View>

          {/* Passport card */}
          <View style={styles.passportCard}>
            {/* Paper texture header stripe */}
            <LinearGradient
              colors={['#2c3a5a', '#1a2540'] as unknown as readonly [string, string]}
              style={styles.passportStripe}
            >
              <Text style={styles.passportCountry}>PASSEPORT · TAKE ME PIC</Text>
              <Text style={styles.passportSub}>CARNET DE VOYAGEUR</Text>
            </LinearGradient>

            <View style={styles.passportBody}>
              {/* Avatar + name block */}
              <View style={styles.passportTop}>
                <View style={{ transform: [{ rotate: '-4deg' }] }}>
                  <Polaroid
                    width={72}
                    height={72}
                    noCaption
                    source={{ uri: me.avatar }}
                  />
                </View>
                <View style={{ flex: 1, paddingLeft: 14 }}>
                  <Text style={styles.passportName}>{displayName}</Text>
                  <Text style={styles.passportMeta}>{me.city}</Text>
                  <Text style={styles.passportMeta}>Membre depuis {me.memberSince}</Text>
                  <View style={{ flexDirection: 'row', gap: 4, marginTop: 6 }}>
                    {me.languages.map((l) => (
                      <Flag key={l} size={16}>{l}</Flag>
                    ))}
                  </View>
                </View>
              </View>

              {/* QR placeholder */}
              <View style={styles.qrBlock}>
                <View style={styles.qrFrame}>
                  <QRPlaceholder size={180} seed={me.id + me.username} />
                </View>
                <Text style={styles.qrCaption}>{t('setx.passportScanCaption')}</Text>
              </View>

              {/* Gold stamp overlay */}
              <View style={styles.passportStampOverlay}>
                <Stamp color="gold" size={72} fontSize={7} rotate={12}>
                  {`KARMA\n${me.karma}\n✦`}
                </Stamp>
              </View>
            </View>

            {/* Machine-readable footer */}
            <View style={styles.passportFooter}>
              <Text style={styles.passportMRZ}>{`${me.username.toUpperCase().replace('@', '').replace('.', '<')}<<<<<<<<<<<`}</Text>
              <Text style={styles.passportMRZ}>{`${String(me.karma).padStart(7, '0')}FR${String(me.age).padStart(2, '0')}<<<<<<0`}</Text>
            </View>
          </View>

          <Text style={styles.passportNote}>{t('setx.passportBetaNote')}</Text>
        </View>
      </Modal>
    </PaperBackground>
  );
}
