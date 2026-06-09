import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, X, Check } from 'lucide-react-native';
import { PaperBackground } from '@/shared/ui/PaperBackground';
import { NavBar, HomeIndicator } from '@/shared/ui/iOSChrome';
import { Polaroid } from '@/shared/ui/Polaroid';
import { Tape } from '@/shared/ui/Tape';
import { Squiggle } from '@/shared/ui/Squiggle';
import { Chip } from '@/shared/ui/Chip';
import { Button } from '@/shared/ui/Button';
import { Flag } from '@/shared/ui/Flag';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { t } from '@/shared/lib/i18n';

type Language = { flag: string; label: string };

const ALL_LANGUAGES: Language[] = [
  { flag: '🇫🇷', label: 'français' },
  { flag: '🇬🇧', label: 'anglais' },
  { flag: '🇪🇸', label: 'espagnol' },
  { flag: '🇵🇹', label: 'portugais' },
  { flag: '🇩🇪', label: 'allemand' },
  { flag: '🇮🇹', label: 'italien' },
  { flag: '🇯🇵', label: 'japonais' },
  { flag: '🇸🇦', label: 'arabe' },
  { flag: '🇲🇦', label: 'arabe (Maroc)' },
  { flag: '🇳🇱', label: 'néerlandais' },
  { flag: '🇺🇸', label: 'anglais américain' },
];

const INITIAL_LANGUAGES: Language[] = [
  { flag: '🇫🇷', label: 'français' },
  { flag: '🇬🇧', label: 'anglais' },
  { flag: '🇪🇸', label: 'espagnol' },
];

export default function Profile() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [bio, setBio] = useState(
    'photographe amateure,\nentre Paris & Lisbonne,\nfan des lumières du matin'
  );
  const [languages, setLanguages] = useState<Language[]>(INITIAL_LANGUAGES);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const removeLanguage = (label: string) => {
    setLanguages((prev) => prev.filter((l) => l.label !== label));
  };

  const addLanguage = (lang: Language) => {
    setLanguages((prev) => {
      if (prev.some((l) => l.label === lang.label)) return prev;
      return [...prev, lang];
    });
    setLangModalVisible(false);
  };

  const availableToAdd = ALL_LANGUAGES.filter(
    (l) => !languages.some((existing) => existing.label === l.label)
  );

  return (
    <PaperBackground tone="paper">
      <View style={{ paddingTop: insets.top }}>
        <NavBar
          left={
            <Pressable onPress={() => router.back()}>
              <Text style={styles.back}>← {t('common.back')}</Text>
            </Pressable>
          }
          title={<Text style={styles.page}>{t('signup.page', { n: 3 })}</Text>}
          right={
            <Pressable onPress={() => router.replace('/(tabs)')}>
              <Text style={styles.skip}>{t('common.skip')}</Text>
            </Pressable>
          }
        />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 26, paddingBottom: insets.bottom + 116 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.hello}>{t('profileSetup.pleased')}</Text>
        <View style={{ marginTop: 6, marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <Text style={styles.title}>{t('profileSetup.title')} </Text>
            <Squiggle style={styles.title}>{t('profileSetup.titleHighlight')}</Squiggle>
          </View>
          <Text style={[styles.title, { marginTop: 6 }]}>{t('profileSetup.titleSuffix')}</Text>
        </View>

        <View style={styles.polaroidRow}>
          <View style={{ transform: [{ rotate: '-3deg' }] }}>
            <Polaroid
              width={168}
              height={168}
              caption={t('profileSetup.me')}
              source={{ uri: 'https://i.pravatar.cc/300?img=47' }}
            >
              <Tape color="red" rotate={-3} width={66} style={{ position: 'absolute', top: -10, left: 51 }} />
            </Polaroid>
          </View>
          <Pressable
            style={styles.cameraBtn}
            onPress={() => Alert.alert(t('ob.photoSimTitle'), t('ob.photoSimMsg'))}
          >
            <Camera size={18} color={colors.goldLight} />
          </Pressable>
        </View>

        <Text style={styles.fieldL}>{t('profileSetup.bioLabel')}</Text>
        <View style={styles.bioBox}>
          <TextInput
            style={styles.bioText}
            multiline
            scrollEnabled={false}
            value={bio}
            onChangeText={setBio}
            placeholderTextColor={colors.inkFaded}
            placeholder={t('ob.bioPlaceholder')}
          />
        </View>

        <Text style={[styles.fieldL, { marginTop: 14 }]}>{t('profileSetup.languagesLabel')}</Text>
        <View style={styles.chipRow}>
          {languages.map((lang) => (
            <Chip
              key={lang.label}
              variant="filled"
              leading={<Flag size={16}>{lang.flag}</Flag>}
              onPress={() => removeLanguage(lang.label)}
            >
              {lang.label} ×
            </Chip>
          ))}
          <Chip variant="dashed" onPress={() => setLangModalVisible(true)}>
            {t('ob.addLanguageCta')}
          </Chip>
        </View>
      </ScrollView>

      <View style={[styles.cta, { bottom: insets.bottom + 26 }]}>
        <Button full variant="gold" onPress={() => router.replace('/(tabs)')}>
          {t('profileSetup.cta')}
        </Button>
      </View>
      <HomeIndicator />

      {/* Language picker modal */}
      <Modal
        visible={langModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <View style={[styles.modalSheet, { paddingTop: insets.top + 8 }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('ob.addLanguageTitle')}</Text>
            <Pressable
              onPress={() => setLangModalVisible(false)}
              hitSlop={10}
              style={styles.modalClose}
            >
              <X size={20} color={colors.ink} />
            </Pressable>
          </View>
          {availableToAdd.length === 0 ? (
            <View style={{ padding: 22 }}>
              <Text style={styles.modalEmpty}>{t('ob.allLanguagesAdded')}</Text>
            </View>
          ) : (
            <FlatList
              data={availableToAdd}
              keyExtractor={(item) => item.label}
              contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
              renderItem={({ item }) => (
                <Pressable style={styles.modalRow} onPress={() => addLanguage(item)}>
                  <Flag size={24}>{item.flag}</Flag>
                  <Text style={styles.modalRowLabel}>{item.label}</Text>
                  <Check size={18} color={colors.inkFaded} />
                </Pressable>
              )}
            />
          )}
        </View>
      </Modal>
    </PaperBackground>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  back: { fontFamily: fonts.hand, fontSize: 20, color: colors.ink },
  page: { fontFamily: fonts.type, fontSize: 11, color: colors.inkFaded },
  skip: { fontFamily: fonts.hand, fontSize: 18, color: colors.goldDeep },
  hello: {
    fontFamily: fonts.hand,
    fontSize: 26,
    color: colors.goldDeep,
    transform: [{ rotate: '-2deg' }],
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 26,
    color: colors.ink,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  polaroidRow: { alignItems: 'center', marginBottom: 10, position: 'relative' },
  cameraBtn: {
    position: 'absolute',
    bottom: 28,
    right: 78,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.inkSurface,
    borderWidth: 2,
    borderColor: colors.polaroid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldL: { fontFamily: fonts.hand, fontSize: 18, color: colors.ink2, paddingLeft: 8, marginBottom: 6 },
  bioBox: {
    backgroundColor: colors.cardWhite,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 64,
  },
  bioText: { fontFamily: fonts.hand, fontSize: 20, color: colors.ink, lineHeight: 24 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  cta: { position: 'absolute', left: 22, right: 22 },
  // Modal styles
  modalSheet: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 12,
  },
  modalTitle: { fontFamily: fonts.serifBold, fontSize: 20, color: colors.ink },
  modalClose: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderBottomWidth: 1.5,
    borderColor: colors.inkLine,
    borderStyle: 'dashed',
  },
  modalRowLabel: { flex: 1, fontFamily: fonts.hand, fontSize: 18, color: colors.ink },
  modalEmpty: { fontFamily: fonts.hand, fontSize: 18, color: colors.inkFaded, textAlign: 'center' },
});
