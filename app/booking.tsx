import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShieldCheck, Lock, ChevronDown, CheckCircle, Ticket as TicketIcon } from 'lucide-react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { PaperBackground } from '@/components/PaperBackground';
import { NavBar, HomeIndicator } from '@/components/iOSChrome';
import { Polaroid } from '@/components/Polaroid';
import { Ticket } from '@/components/Ticket';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { Flag } from '@/components/Flag';
import { CountryPickerModal } from '@/components/CountryPickerModal';
import { useThemeColors } from '@/components/ThemeContext';
import { fonts, type ThemeColors } from '@/theme/tokens';
import { countries, type Country } from '@/data/countries';
import { t } from '@/i18n';

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  back: { fontFamily: fonts.hand, fontSize: 20, color: colors.ink },
  itemLabel: { fontFamily: fonts.type, fontSize: 9, color: colors.inkFaded, letterSpacing: 1.4 },
  itemTitle: { fontFamily: fonts.serifBold, fontSize: 15, lineHeight: 16, color: colors.ink },
  itemMeta: { fontFamily: fonts.hand, fontSize: 14, color: colors.inkFaded },
  itemPrice: { fontFamily: fonts.serifBlack, fontSize: 18, color: colors.ink },
  section: { fontFamily: fonts.hand, fontSize: 22, color: colors.ink, marginBottom: 8 },
  cardField: {
    backgroundColor: colors.cardWhite,
    borderWidth: 1.5,
    borderColor: colors.ink,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fieldInline: { flex: 1, fontFamily: fonts.mono, fontSize: 15, color: colors.ink },
  label: { fontFamily: fonts.hand, fontSize: 18, color: colors.inkFaded },
  countryField: {
    backgroundColor: colors.cardWhite,
    borderWidth: 1.5,
    borderColor: colors.ink,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 18,
  },
  countryText: { fontFamily: fonts.serif, fontSize: 15, color: colors.ink },
  breakdown: { backgroundColor: colors.cardWhite, borderWidth: 1.5, borderColor: colors.inkLine, padding: 12 },
  brkRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  brkLabel: { fontFamily: fonts.serif, fontSize: 13, color: colors.inkFaded },
  brkTotal: { paddingTop: 8, borderTopWidth: 1.5, borderColor: colors.inkLine, borderStyle: 'dashed', marginBottom: 0 },
  brkTotalText: { fontFamily: fonts.serifBlack, fontSize: 16, color: colors.ink },
  cta: { position: 'absolute', left: 22, right: 22 },
  secure: { textAlign: 'center', fontFamily: fonts.hand, fontSize: 14, color: colors.inkFaded, marginTop: 8 },
  successTitle: { fontFamily: fonts.serifBold, fontSize: 22, color: colors.stampGreen, textAlign: 'center' },
  successMeta: { fontFamily: fonts.hand, fontSize: 16, color: colors.inkFaded, textAlign: 'center' },
  successDivider: { width: '100%', height: 1.5, borderWidth: 1.5, borderColor: colors.inkLine, borderStyle: 'dashed', marginVertical: 4 },
  successAmount: { fontFamily: fonts.serifBlack, fontSize: 28, color: colors.ink },
  successRef: { fontFamily: fonts.mono, fontSize: 11, color: colors.inkFaded, letterSpacing: 1.2 },
});

/** 24 · Billet & paiement. */
export default function Booking() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Controlled card inputs
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('06 / 27');
  const [cvc, setCvc] = useState('');

  // Country picker
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find((c) => c.code === 'FR') ?? countries[0]
  );

  // Payment success state
  const [paid, setPaid] = useState(false);

  if (paid) {
    return (
      <PaperBackground tone="paper">
        <View style={{ paddingTop: insets.top }}>
          <NavBar
            left={<Pressable onPress={() => router.back()}><Text style={styles.back}>← {t('common.back')}</Text></Pressable>}
            title={t('booking.title')}
            right={<ShieldCheck size={22} color={colors.stampGreen} />}
          />
        </View>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 }}>
          <Ticket
            background={colors.cardWhite}
            notchColor={colors.paper}
            style={{
              borderWidth: 1.5,
              borderColor: colors.stampGreen,
              padding: 20,
              shadowColor: colors.stampGreen,
              shadowOpacity: 0.6,
              shadowOffset: { width: 4, height: 4 },
              shadowRadius: 0,
              elevation: 4,
              width: '100%',
            }}
          >
            <View style={{ alignItems: 'center', gap: 10 }}>
              <CheckCircle size={48} color={colors.stampGreen} />
              <Text style={styles.successTitle}>{t('eco.paymentConfirmed')}</Text>
              <Text style={styles.successMeta}>Tram 28, visite guidée</Text>
              <Text style={styles.successMeta}>Lisbonne · jeu. 17 juin · 15h</Text>
              <View style={styles.successDivider} />
              <Text style={styles.successAmount}>36,00 €</Text>
              <Text style={styles.successRef}>réf. TMP-28-LIS-{Math.floor(Math.random() * 90000) + 10000}</Text>
            </View>
          </Ticket>

          <View style={{ marginTop: 24, width: '100%' }}>
            <Button
              full
              variant="ink"
              icon={<TicketIcon size={16} color={colors.paperWarm} />}
              onPress={() => router.back()}
            >
              {t('eco.seeTicket')}
            </Button>
          </View>
        </View>

        <HomeIndicator />
      </PaperBackground>
    );
  }

  return (
    <PaperBackground tone="paper">
      <View style={{ paddingTop: insets.top }}>
        <NavBar
          left={<Pressable onPress={() => router.back()}><Text style={styles.back}>← retour</Text></Pressable>}
          title={t('booking.title')}
          right={<ShieldCheck size={22} color={colors.stampGreen} />}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}>
        <View style={{ paddingHorizontal: 22 }}>
          <Ticket
            background={colors.cardWhite}
            notchColor={colors.paper}
            style={{
              borderWidth: 1.5,
              borderColor: colors.ink,
              padding: 14,
              shadowColor: colors.ink,
              shadowOpacity: 1,
              shadowOffset: { width: 4, height: 4 },
              shadowRadius: 0,
              elevation: 4,
              marginBottom: 18,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <Polaroid width={60} height={54} noCaption rotate={-3} source={{ uri: 'https://picsum.photos/seed/lis3/200/200' }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemLabel}>{t('booking.experience')}</Text>
                <Text style={styles.itemTitle}>Tram 28, visite guidée</Text>
                <Text style={styles.itemMeta}>Lisbonne · jeu. 17 juin · 15h</Text>
              </View>
              <Text style={styles.itemPrice}>36 €</Text>
            </View>
          </Ticket>

          <Text style={styles.section}>{t('eco.paymentSection')}</Text>

          {/* Card number */}
          <View style={[styles.cardField, { borderColor: colors.goldDeep, shadowColor: colors.goldDeep, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3 }]}>
            <Svg width={36} height={24} viewBox="0 0 32 20">
              <Rect width={32} height={20} rx={3} fill="#1A1F71" />
              <SvgText x={16} y={14} fontSize={9} fill="#fff" textAnchor="middle" fontWeight="900" fontStyle="italic">VISA</SvgText>
            </Svg>
            <Field
              variant="underline"
              label=""
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="number-pad"
              maxLength={19}
              style={styles.fieldInline}
            />
          </View>

          {/* Expiry + CVC */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10, marginBottom: 18 }}>
            <View style={[styles.cardField, { flex: 1 }]}>
              <Field
                variant="underline"
                label=""
                value={expiry}
                onChangeText={setExpiry}
                placeholder="MM / AA"
                style={styles.fieldInline}
              />
            </View>
            <View style={[styles.cardField, { width: 110 }]}>
              <Field
                variant="underline"
                label=""
                value={cvc}
                onChangeText={setCvc}
                placeholder="CVC ···"
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                style={styles.fieldInline}
              />
            </View>
          </View>

          {/* Country picker */}
          <Text style={styles.label}>{t('booking.country')}</Text>
          <Pressable style={styles.countryField} onPress={() => setCountryPickerVisible(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Flag size={20}>{selectedCountry.flag}</Flag>
              <Text style={styles.countryText}>{selectedCountry.name}</Text>
            </View>
            <ChevronDown size={16} color={colors.ink} />
          </Pressable>

          <CountryPickerModal
            visible={countryPickerVisible}
            selected={selectedCountry}
            onClose={() => setCountryPickerVisible(false)}
            onSelect={(c) => setSelectedCountry(c)}
          />

          <View style={styles.breakdown}>
            <View style={styles.brkRow}>
              <Text style={styles.brkLabel}>{t('booking.subtotal')}</Text>
              <Text style={styles.brkLabel}>34,00 €</Text>
            </View>
            <View style={styles.brkRow}>
              <Text style={styles.brkLabel}>{t('booking.service')}</Text>
              <Text style={styles.brkLabel}>2,00 €</Text>
            </View>
            <View style={[styles.brkRow, styles.brkTotal]}>
              <Text style={styles.brkTotalText}>{t('booking.total')}</Text>
              <Text style={styles.brkTotalText}>36,00 €</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.cta, { bottom: insets.bottom + 24 }]}>
        <Button full variant="gold" icon={<Lock size={16} color={colors.ink} />} onPress={() => setPaid(true)}>
          {t('booking.pay', { amount: '36,00 €' })}
        </Button>
        <Text style={styles.secure}>{t('booking.secured')}</Text>
      </View>
      <HomeIndicator />
    </PaperBackground>
  );
}
