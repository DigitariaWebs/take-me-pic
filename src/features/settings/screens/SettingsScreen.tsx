import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, MapPin, Eye, Shield, UserX, Flag, Globe, Bell, Crown, LogOut } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PaperBackground } from '@/shared/ui/PaperBackground';
import { NavBar } from '@/shared/ui/iOSChrome';
import { Stamp } from '@/shared/ui/Stamp';
import { Button } from '@/shared/ui/Button';
import { JournalSwitch } from '@/shared/ui/JournalSwitch';
import { useThemeColors, useTheme } from '@/shared/providers/ThemeProvider';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { t, useLocale, type LocaleTag } from '@/shared/lib/i18n';

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  back: { fontFamily: fonts.hand, fontSize: 20, color: colors.ink },
  passport: {
    marginTop: 8,
    backgroundColor: colors.inkSurface,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: colors.inkSurface,
    shadowColor: colors.stampBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 0,
    elevation: 4,
  },
  passportType: { fontFamily: fonts.type, fontSize: 9, color: colors.goldLight, letterSpacing: 1.2 },
  passportTitle: { fontFamily: fonts.serifBold, fontSize: 16, color: colors.onInk, marginTop: 2 },
  passportMeta: { fontFamily: fonts.hand, fontSize: 14, color: 'rgba(232,217,184,0.65)' },
  groupLabel: { fontFamily: fonts.hand, fontSize: 18, transform: [{ rotate: '-1deg' }], marginBottom: 8 },
  groupBox: { backgroundColor: colors.cardWhite, borderWidth: 1.5, borderColor: colors.inkLine },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, paddingHorizontal: 14 },
  rowDivider: { borderBottomWidth: 1.5, borderColor: colors.inkLine, borderStyle: 'dashed' },
  icon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontFamily: fonts.serif, fontSize: 14, color: colors.ink },
  rowSub: { fontFamily: fonts.hand, fontSize: 14, color: colors.inkFaded },
  trailing: { fontFamily: fonts.hand, fontSize: 16, color: colors.inkFaded },

  // Premium card
  premiumCard: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.goldDeep,
    shadowColor: colors.goldDeep,
    shadowOpacity: 1,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 0,
    elevation: 4,
  },
  premiumShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  premiumIconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(217,181,102,0.4)',
  },
  premiumTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 15,
    color: colors.polaroid,
    letterSpacing: 0.2,
  },
  premiumSub: {
    fontFamily: fonts.type,
    fontSize: 10,
    color: colors.goldLight,
    marginTop: 3,
    letterSpacing: 0.5,
  },

  // Theme segmented control
  themeSwitchRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: colors.ink,
    overflow: 'hidden',
    flex: 1,
  },
  themeChip: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  themeChipActive: {
    backgroundColor: colors.inkSurface,
  },
  themeChipText: {
    fontFamily: fonts.type,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.ink,
    textTransform: 'uppercase',
  },
  themeChipTextActive: {
    color: colors.onInk,
  },

  // Sign out
  signOutSection: {
    marginTop: 28,
    alignItems: 'center',
    gap: 12,
  },
  appVersion: {
    fontFamily: fonts.type,
    fontSize: 11,
    color: colors.inkFaded,
    letterSpacing: 0.6,
    opacity: 0.65,
  },
});

/** 26 · Cahier de réglages. */
export default function Settings() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { mode, setMode } = useTheme();

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [gps, setGps] = useState(true);
  const [visible, setVisible] = useState(true);
  const [locale, setLocale] = useLocale();
  const languageValues: Record<LocaleTag, string> = {
    fr: t('setx.langFr'),
    en: t('setx.langEn'),
    ar: t('setx.langAr'),
    es: t('setx.langEs'),
  };

  function handleBlockedPress() {
    Alert.alert(
      'Utilisateurs bloqués',
      'Voulez-vous gérer votre liste de blocages ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Gérer',
          style: 'destructive',
          onPress: () => {
            // navigation placeholder
          },
        },
      ],
    );
  }

  function handleReportPress() {
    Alert.alert(
      'Signaler un contenu',
      'Voulez-vous signaler un contenu inapproprié ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Signaler',
          style: 'destructive',
          onPress: () => {
            // report action placeholder
          },
        },
      ],
    );
  }

  function handleVerificationPress() {
    Alert.alert(
      'Vérification',
      'Votre compte est vérifié (email · tél · pièce d\'identité).',
      [{ text: 'OK' }],
    );
  }

  function handleSignOut() {
    Alert.alert(
      t('setx.signOutAlertTitle'),
      undefined,
      [
        { text: t('setx.signOutAlertCancel'), style: 'cancel' },
        {
          text: t('setx.signOutAlertConfirm'),
          style: 'destructive',
          onPress: () => router.replace('/(onboarding)'),
        },
      ],
    );
  }

  return (
    <PaperBackground tone="paper">
      <View style={{ paddingTop: insets.top }}>
        <NavBar
          left={<Pressable onPress={() => router.back()}><Text style={styles.back}>← {t('settings.backToProfile')}</Text></Pressable>}
          title={t('settings.title')}
          right={<View style={{ width: 30 }} />}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: insets.bottom + 30 }}>
        {/* ── Passport / verification banner ── */}
        <Pressable style={styles.passport} onPress={handleVerificationPress}>
          <Stamp shape="circle" color="green" size={54} fontSize={8.5}>{`✓\nVÉRIFIÉ\n3/3`}</Stamp>
          <View style={{ flex: 1 }}>
            <Text style={styles.passportType}>{t('settings.passport')}</Text>
            <Text style={styles.passportTitle}>{t('settings.verified')}</Text>
            <Text style={styles.passportMeta}>email · tél · pièce d'identité</Text>
          </View>
          <ChevronRight size={16} color={colors.goldLight} />
        </Pressable>

        {/* ── Première classe banner ── */}
        <Pressable style={styles.premiumCard} onPress={() => router.push('/premium')}>
          <LinearGradient
            colors={['#c9933a', '#8a6420', '#b8893a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.premiumShine} pointerEvents="none" />
          <View style={styles.premiumIconWrap}>
            <Crown size={22} color={colors.goldLight} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.premiumTitle}>{t('setx.premiumTitle')}</Text>
            <Text style={styles.premiumSub}>{t('setx.premiumSub')}</Text>
          </View>
          <ChevronRight size={18} color={colors.goldLight} />
        </Pressable>

        {/* ── Appearance group ── */}
        <Group label={t('setx.appearance')} color={colors.goldDeep}>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{t('setx.appearance')}</Text>
              <Text style={styles.rowSub}>{t('setx.appearanceHint')}</Text>
            </View>
            <View style={styles.themeSwitchRow}>
              <Pressable
                style={[styles.themeChip, mode === 'light' && styles.themeChipActive]}
                onPress={() => setMode('light')}
              >
                <Text style={[styles.themeChipText, mode === 'light' && styles.themeChipTextActive]}>
                  {t('setx.themeLight')}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.themeChip, mode === 'dark' && styles.themeChipActive]}
                onPress={() => setMode('dark')}
              >
                <Text style={[styles.themeChipText, mode === 'dark' && styles.themeChipTextActive]}>
                  {t('setx.themeDark')}
                </Text>
              </Pressable>
            </View>
          </View>
        </Group>

        {/* ── Privacy group ── */}
        <Group label={t('settings.privacy')} color={colors.goldDeep}>
          <Row
            icon={<MapPin size={16} color={colors.polaroid} />}
            iconBg={colors.stampGreen}
            label={t('settings.items.gps.title')}
            sub={t('settings.items.gps.sub')}
          >
            <JournalSwitch value={gps} onValueChange={setGps} />
          </Row>
          <Row
            icon={<Eye size={16} color={colors.polaroid} />}
            iconBg={colors.stampBlue}
            label={t('settings.items.visible.title')}
          >
            <JournalSwitch value={visible} onValueChange={setVisible} />
          </Row>
          <Row
            icon={<Shield size={16} color={colors.polaroid} />}
            iconBg={colors.goldDeep}
            label={t('settings.items.gdpr.title')}
            chevron
            last
          />
        </Group>

        {/* ── Security group ── */}
        <Group label={t('settings.security')} color={colors.stampRed}>
          <Row
            icon={<UserX size={16} color={colors.polaroid} />}
            iconBg={colors.stampRed}
            label={t('settings.items.blocked.title')}
            trailingText="3"
            chevron
            onPress={handleBlockedPress}
          />
          <Row
            icon={<Flag size={16} color={colors.goldLight} />}
            iconBg={colors.inkSurface}
            label={t('settings.items.report.title')}
            chevron
            last
            onPress={handleReportPress}
          />
        </Group>

        {/* ── Preferences group ── */}
        <Group label={t('settings.preferences')} color={colors.stampBlue}>
          <Row
            icon={<Globe size={16} color={colors.polaroid} />}
            iconBg={colors.sunset}
            label={t('settings.items.language.title')}
            trailingText={languageValues[locale]}
            onPress={() => {
              const order: LocaleTag[] = ['fr', 'en', 'ar', 'es'];
              const next = order[(order.indexOf(locale) + 1) % order.length];
              void setLocale(next);
            }}
            chevron
          />
          <Row
            icon={<Bell size={16} color={colors.polaroid} />}
            iconBg={colors.stampBlue}
            label={t('settings.items.notifications.title')}
            chevron
            last
          />
        </Group>

        {/* ── Sign out ── */}
        <View style={styles.signOutSection}>
          <Button
            variant="ghost"
            full
            icon={<LogOut size={16} color={colors.stampRed} />}
            textStyle={{ color: colors.stampRed }}
            onPress={handleSignOut}
          >
            {t('setx.signOut')}
          </Button>
          <Text style={styles.appVersion}>{t('setx.appVersion')}</Text>
        </View>
      </ScrollView>
    </PaperBackground>
  );
}

function Group({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 18 }}>
      <Text style={{ fontFamily: fonts.hand, fontSize: 18, transform: [{ rotate: '-1deg' }], marginBottom: 8, color }}>{label}</Text>
      <GroupBox>{children}</GroupBox>
    </View>
  );
}

function GroupBox({ children }: { children: React.ReactNode }) {
  const colors = useThemeColors();
  return (
    <View style={{ backgroundColor: colors.cardWhite, borderWidth: 1.5, borderColor: colors.inkLine }}>
      {children}
    </View>
  );
}

function Row({
  icon,
  iconBg,
  label,
  sub,
  chevron,
  last,
  trailingText,
  onPress,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  sub?: string;
  chevron?: boolean;
  last?: boolean;
  trailingText?: string;
  onPress?: () => void;
  children?: React.ReactNode;
}) {
  const colors = useThemeColors();
  const Wrap: any = onPress ? Pressable : View;
  return (
    <Wrap
      onPress={onPress}
      style={[
        { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, paddingHorizontal: 14 },
        !last && { borderBottomWidth: 1.5, borderColor: colors.inkLine, borderStyle: 'dashed' },
      ]}
    >
      <View style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: iconBg }}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.serif, fontSize: 14, color: colors.ink }}>{label}</Text>
        {sub ? <Text style={{ fontFamily: fonts.hand, fontSize: 14, color: colors.inkFaded }}>{sub}</Text> : null}
      </View>
      {trailingText ? <Text style={{ fontFamily: fonts.hand, fontSize: 16, color: colors.inkFaded }}>{trailingText}</Text> : null}
      {children}
      {chevron ? <ChevronRight size={16} color={colors.inkFaded} /> : null}
    </Wrap>
  );
}
