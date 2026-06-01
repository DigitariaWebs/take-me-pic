import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Play, Bookmark, Sparkles, Coffee, Check } from 'lucide-react-native';
import { PaperBackground } from '@/components/PaperBackground';
import { NavBar } from '@/components/iOSChrome';
import { Polaroid } from '@/components/Polaroid';
import { Squiggle } from '@/components/Squiggle';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useThemeColors } from '@/components/ThemeContext';
import { fonts, type ThemeColors } from '@/theme/tokens';
import { itinerarySteps } from '@/data/mock';
import { t } from '@/i18n';

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  back: { fontFamily: fonts.hand, fontSize: 20, color: colors.ink },
  intro: { fontFamily: fonts.hand, fontSize: 22, color: colors.goldDeep, transform: [{ rotate: '-2deg' }] },
  title: { fontFamily: fonts.serifBold, fontSize: 28, letterSpacing: -0.6, lineHeight: 30, color: colors.ink },
  sub: { fontFamily: fonts.serifItalic, fontStyle: 'italic', color: colors.inkFaded, fontSize: 13 },
  stepRow: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  dot: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  dotTime: { fontFamily: fonts.type, fontSize: 11, fontWeight: '700', color: colors.ink },
  stepCard: { flex: 1, backgroundColor: colors.cardWhite, borderWidth: 1.5, borderColor: colors.inkLine, padding: 10, flexDirection: 'row', gap: 10, alignItems: 'center' },
  coffeeWell: { width: 44, height: 44, backgroundColor: colors.sunset, borderWidth: 1.5, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  stepTitle: { fontFamily: fonts.serifBold, fontSize: 14, color: colors.ink },
  stepSub: { fontFamily: fonts.hand, fontSize: 15, color: colors.inkFaded, marginTop: 2 },
});

/** 23 · Itinéraire du jour. */
export default function Itinerary() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Track which steps are checked off
  const [doneSteps, setDoneSteps] = useState<Set<number>>(new Set());
  // Track active step index
  const [activeStep, setActiveStep] = useState<number | null>(itinerarySteps.findIndex((s) => s.active));
  // Saved/bookmarked state
  const [saved, setSaved] = useState(false);

  function toggleDone(index: number) {
    setDoneSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  function handleStart() {
    setActiveStep(0);
    Alert.alert(t('eco.itineraryLaunched'), t('eco.itineraryLaunchedBody'));
  }

  function handleSave() {
    setSaved((v) => !v);
  }

  return (
    <PaperBackground tone="paper">
      <View style={{ paddingTop: insets.top }}>
        <NavBar
          left={<Pressable onPress={() => router.back()}><Text style={styles.back}>← {t('common.back')}</Text></Pressable>}
          title="Lisbonne, jour 2"
          right={<Sparkles size={22} color={colors.goldDeep} />}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}>
        <View style={{ paddingHorizontal: 22 }}>
          <Text style={styles.intro}>{t('itinerary.forYou')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <Text style={styles.title}>{t('itinerary.title')}{'\n'}sur </Text>
            <Squiggle style={styles.title}>{t('itinerary.titleHighlight').replace('sur ', '')}</Squiggle>
            <Text style={styles.title}>.</Text>
          </View>
          <Text style={styles.sub}>{t('itinerary.sub')}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            <Button
              size="sm"
              variant="ink"
              icon={<Play size={14} color={colors.paperWarm} />}
              onPress={handleStart}
            >
              {t('itinerary.start')}
            </Button>
            <Button
              size="sm"
              variant={saved ? 'gold' : 'paper'}
              icon={<Bookmark size={14} color={saved ? colors.ink : colors.ink} fill={saved ? colors.ink : 'none'} />}
              onPress={handleSave}
            >
              {saved ? t('eco.saved') : t('itinerary.save')}
            </Button>
          </View>
        </View>

        <View style={{ paddingHorizontal: 22, paddingTop: 24, position: 'relative' }}>
          <Svg style={{ position: 'absolute', left: 40, top: 24 }} width={6} height={380}>
            <Path d="M 3 0 L 3 380" stroke={colors.stampRed} strokeWidth={2} strokeDasharray="3 6" strokeLinecap="round" opacity={0.65} />
          </Svg>
          {itinerarySteps.map((step, i) => {
            const isDone = doneSteps.has(i);
            const isActive = activeStep === i;
            const isTicket = step.kind === 'ticket';

            return (
              <Pressable
                key={step.title}
                onPress={() => {
                  if (isTicket) {
                    router.push('/booking');
                  } else {
                    toggleDone(i);
                  }
                }}
              >
                <View style={[styles.stepRow, isDone && { opacity: 0.45 }]}>
                  <View
                    style={[
                      styles.dot,
                      isActive
                        ? { backgroundColor: colors.goldLight, borderStyle: 'solid' }
                        : { backgroundColor: colors.cardWhite, borderStyle: 'dashed' },
                      isDone && { backgroundColor: colors.stampGreen, borderStyle: 'solid' },
                    ]}
                  >
                    {isDone ? (
                      <Check size={18} color={colors.polaroid} />
                    ) : (
                      <Text style={styles.dotTime}>{step.time}</Text>
                    )}
                  </View>
                  <View style={[styles.stepCard, { transform: [{ rotate: `${i % 2 === 0 ? -0.5 : 0.4}deg` }] }]}>
                    {step.kind === 'coffee' ? (
                      <View style={styles.coffeeWell}>
                        <Coffee size={20} color={colors.polaroid} />
                      </View>
                    ) : (
                      <Polaroid width={44} height={38} noCaption rotate={i % 2 === 0 ? -3 : 2} source={step.thumb ? { uri: step.thumb } : undefined} />
                    )}
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.stepTitle}>{step.title}</Text>
                        {step.kind === 'ticket' && (step as { price?: string }).price && (
                          <Chip color="gold" size="sm">{(step as { price?: string }).price}</Chip>
                        )}
                      </View>
                      <Text style={styles.stepSub}>
                        {isTicket ? t('eco.bookNow') : step.sub}
                      </Text>
                    </View>
                    {isDone && (
                      <Check size={18} color={colors.stampGreen} style={{ marginLeft: 4 }} />
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </PaperBackground>
  );
}
