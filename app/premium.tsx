import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavBar, HomeIndicator } from '@/components/iOSChrome';
import { Button } from '@/components/Button';
import { useThemeColors } from '@/components/ThemeContext';
import { fonts, type ThemeColors } from '@/theme/tokens';
import { t } from '@/i18n';

type PlanKey = 'monthly' | 'annual';

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  back: { fontFamily: fonts.hand, fontSize: 22 },
  pill: { fontFamily: fonts.hand, fontSize: 18, color: 'rgba(243,232,206,0.6)' },
  restore: { fontFamily: fonts.hand, fontSize: 18, color: colors.goldLight },
  pass: { fontFamily: fonts.hand, fontSize: 22, color: colors.goldLight, transform: [{ rotate: '-2deg' }] },
  title: { fontFamily: fonts.serifBold, fontSize: 32, letterSpacing: -0.6, lineHeight: 34, color: '#f3e8ce' },
  titleHi: { fontFamily: fonts.serifItalic, fontStyle: 'italic', color: colors.goldLight },
  subtitle: { fontFamily: fonts.serifItalic, fontStyle: 'italic', color: 'rgba(243,232,206,0.6)', fontSize: 13, marginTop: 6, textAlign: 'center' },
  boardingPass: {
    marginHorizontal: 18,
    marginTop: 22,
    padding: 18,
    borderWidth: 2,
    borderColor: colors.ink,
    overflow: 'hidden',
    shadowColor: colors.gold,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 24,
    elevation: 8,
  },
  bpHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1.5, borderStyle: 'dashed', borderColor: colors.ink, paddingBottom: 12 },
  bpType: { fontFamily: fonts.type, fontSize: 9, color: colors.ink, opacity: 0.7, letterSpacing: 1.6 },
  bpBrand: { fontFamily: fonts.serifBlack, fontSize: 22, color: colors.ink, lineHeight: 24 },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  check: { width: 18, height: 18, backgroundColor: colors.inkSurface, alignItems: 'center', justifyContent: 'center' },
  checkMark: { color: colors.goldLight, fontFamily: fonts.type, fontSize: 10 },
  perk: { fontFamily: fonts.serif, fontSize: 13.5, color: colors.ink, flex: 1 },
  plans: { paddingHorizontal: 22, paddingTop: 22, flexDirection: 'row', gap: 10 },
  plan: { flex: 1, borderWidth: 1.5, padding: 14 },
  planSelected: { borderColor: colors.goldLight, backgroundColor: 'rgba(217,181,102,0.2)' },
  discount: {
    position: 'absolute',
    top: -10,
    right: -6,
    backgroundColor: colors.stampRed,
    color: colors.polaroid,
    fontFamily: fonts.type,
    fontSize: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
    transform: [{ rotate: '8deg' }],
    fontWeight: '700',
  },
  planLabel: { fontFamily: fonts.type, fontSize: 10, color: 'rgba(243,232,206,0.6)', letterSpacing: 1.2 },
  planPrice: { fontFamily: fonts.serifBlack, fontSize: 22, color: '#f3e8ce', marginTop: 4 },
  planSub: { fontFamily: fonts.hand, fontSize: 14, color: 'rgba(243,232,206,0.5)' },
  cta: { position: 'absolute', left: 22, right: 22 },
  fine: { textAlign: 'center', fontFamily: fonts.hand, fontSize: 16, color: 'rgba(243,232,206,0.5)', marginTop: 8 },
});

/** 21 · Première classe. */
export default function Premium() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('annual');

  const isAnnual = selectedPlan === 'annual';

  const ctaPrice = isAnnual ? '39,99€/an' : '4,99€/mois';
  const fineprint = isAnnual
    ? t('discover.fineprintAnnual')
    : t('discover.fineprintMonthly');

  function handleCta() {
    Alert.alert(
      t('discover.trialStartedTitle'),
      t('discover.trialStartedBody', { price: ctaPrice }),
      [{ text: t('discover.trialStartedOk') }],
    );
  }

  function handleRestore() {
    Alert.alert(
      t('discover.restoreTitle'),
      t('discover.restoreBody'),
      [{ text: t('discover.restoreOk') }],
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* bg1/bg2 are intentionally dark stages — sourced via hook but remain dark in both modes */}
      <LinearGradient colors={[colors.bg1, colors.bg2] as unknown as readonly [string, string]} style={StyleSheet.absoluteFill} />
      <View style={{ paddingTop: insets.top }}>
        <NavBar
          left={<Pressable onPress={() => router.back()}><Text style={[styles.back, { color: '#f3e8ce' }]}>{t('discover.close')}</Text></Pressable>}
          title={<Text style={styles.pill}>Premium</Text>}
          right={<Pressable onPress={handleRestore}><Text style={styles.restore}>{t('discover.restore')}</Text></Pressable>}
          light
        />
      </View>

      <View style={{ paddingHorizontal: 24, alignItems: 'center' }}>
        <Text style={styles.pass}>{t('premium.pass')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Text style={styles.title}>{t('premium.title')} </Text>
          <Text style={[styles.title, styles.titleHi]}>{t('premium.titleHighlight')}</Text>
          <Text style={styles.title}>.</Text>
        </View>
        <Text style={styles.subtitle}>{t('premium.subtitle')}</Text>
      </View>

      <View style={styles.boardingPass}>
        <LinearGradient
          colors={[colors.goldLight, colors.gold] as unknown as readonly [string, string]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.bpHead}>
          <View>
            <Text style={styles.bpType}>TAKE ME PIC ★ BOARDING PASS</Text>
            <Text style={styles.bpBrand}>TMP / Premium</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.bpType}>CLASSE</Text>
            <Text style={styles.bpBrand}>★ A1</Text>
          </View>
        </View>
        {(t('premium.perks') as unknown as string[]).map((p) => (
          <View key={p} style={styles.perkRow}>
            <View style={styles.check}><Text style={styles.checkMark}>✓</Text></View>
            <Text style={styles.perk}>{p}</Text>
          </View>
        ))}
      </View>

      <View style={styles.plans}>
        {/* Monthly plan */}
        <Pressable
          onPress={() => setSelectedPlan('monthly')}
          style={[
            styles.plan,
            selectedPlan === 'monthly'
              ? styles.planSelected
              : { backgroundColor: 'rgba(243,232,206,0.04)', borderColor: 'rgba(243,232,206,0.18)' },
          ]}
        >
          <Text style={styles.planLabel}>{t('premium.monthly')}</Text>
          <Text style={styles.planPrice}>{t('premium.monthlyPrice')}</Text>
          <Text style={[styles.planSub, selectedPlan === 'monthly' && { color: colors.goldLight }]}>{t('premium.monthlySub')}</Text>
        </Pressable>

        {/* Annual plan */}
        <Pressable
          onPress={() => setSelectedPlan('annual')}
          style={[
            styles.plan,
            selectedPlan === 'annual'
              ? styles.planSelected
              : { backgroundColor: 'rgba(243,232,206,0.04)', borderColor: 'rgba(243,232,206,0.18)' },
          ]}
        >
          <Text style={styles.discount}>{t('premium.discount')}</Text>
          <Text style={[styles.planLabel, selectedPlan === 'annual' && { color: colors.goldLight }]}>{t('premium.annual')}</Text>
          <Text style={styles.planPrice}>{t('premium.annualPrice')}</Text>
          <Text style={[styles.planSub, selectedPlan === 'annual' && { color: colors.goldLight }]}>{t('premium.annualSub')}</Text>
        </Pressable>
      </View>

      <View style={[styles.cta, { bottom: insets.bottom + 30 }]}>
        <Button full variant="gold" onPress={handleCta}>{t('premium.cta')}</Button>
        <Text style={styles.fine}>{fineprint}</Text>
      </View>
      <HomeIndicator light />
    </View>
  );
}
