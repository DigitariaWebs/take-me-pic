import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, Plus, MoreHorizontal, ShieldCheck, X, ChevronRight } from 'lucide-react-native';
import { PaperBackground } from '@/components/PaperBackground';
import { NavBar } from '@/components/iOSChrome';
import { Polaroid } from '@/components/Polaroid';
import { Stamp } from '@/components/Stamp';
import { Chip } from '@/components/Chip';
import { HandMap } from '@/components/HandMap';
import { JournalSwitch } from '@/components/JournalSwitch';
import { Button } from '@/components/Button';
import { Flag } from '@/components/Flag';
import { fonts, type ThemeColors } from '@/theme/tokens';
import { useThemeColors } from '@/components/ThemeContext';
import { familyMembers } from '@/data/mock';
import { t } from '@/i18n';

type FamilyMember = {
  name: string;
  tag: string;
  avatar: string;
  online?: boolean;
  where: string;
  safe?: boolean;
  age?: number;
  flag?: string;
};

/** 25 · Album de famille. */
export default function Family() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [modeFamille, setModeFamille] = useState(true);
  const [inviteVisible, setInviteVisible] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  const [members, setMembers] = useState<FamilyMember[]>(familyMembers as FamilyMember[]);

  const dimmed = !modeFamille;

  function handleAddPress() {
    setInviteName('');
    setInviteSent(false);
    setInviteVisible(true);
  }

  function handleSendInvite() {
    if (!inviteName.trim()) return;
    Alert.alert(t('eco.inviteAlertTitle'), t('eco.inviteAlertBody', { name: inviteName.trim() }), [
      {
        text: 'OK',
        onPress: () => {
          setInviteSent(true);
          setInviteVisible(false);
        },
      },
    ]);
  }

  function handleMemberChevron(name: string) {
    router.push(`/chat/${name.toLowerCase()}`);
  }

  return (
    <PaperBackground tone="paper">
      <View style={{ paddingTop: insets.top }}>
        <NavBar
          left={<Pressable onPress={() => router.back()}><Text style={styles.back}>← {t('common.back')}</Text></Pressable>}
          title={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Heart size={18} color={colors.sunset} fill={colors.sunset} />
              <Text style={styles.headerTitle}>{t('family.title')}</Text>
            </View>
          }
          right={
            <Pressable onPress={handleAddPress} hitSlop={8}>
              <Plus size={22} color={colors.ink} />
            </Pressable>
          }
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* ── Title card ── */}
        <View style={[styles.titleCard, { marginHorizontal: 22 }]}>
          <LinearGradient
            colors={['#f4c997', colors.sunset] as unknown as readonly [string, string]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={{ position: 'absolute', top: 14, right: 14 }}>
            <Stamp color="ink" size={62} fontSize={8} rotate={-8}>{`MODE ★\nFAMILLE\n★ ON`}</Stamp>
          </View>
          <Text style={styles.familySalut}>Les Bernard,</Text>
          <Text style={styles.familyBody}>{t('eco.travellingTo')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Flag size={22}>{'🇵🇹'}</Flag>
            <Text style={styles.familyBody}>Lisbonne</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
            {members.map((m, i) => (
              <View key={m.name} style={{ marginLeft: i === 0 ? 0 : -8, transform: [{ rotate: `${[-4, 3, -2, 4][i % 4]}deg` }] }}>
                <Polaroid width={34} height={28} noCaption source={{ uri: m.avatar }} />
              </View>
            ))}
            <Text style={styles.familyCount}>{t('eco.travellers', { n: members.length })}</Text>
          </View>

          {/* Mode famille master switch */}
          <View style={styles.modeFamilleRow}>
            <Text style={styles.modeFamilleLabel}>{t('eco.modeFamille')}</Text>
            <JournalSwitch value={modeFamille} onValueChange={setModeFamille} />
          </View>
        </View>

        {/* ── Mini-map ── */}
        <View style={[styles.mini, { marginHorizontal: 22, opacity: dimmed ? 0.35 : 1 }]}>
          <HandMap />
          {members.map((m, i) => (
            <Image
              key={m.name}
              source={{ uri: m.avatar }}
              style={[styles.familyDot, dotPositions[i % dotPositions.length]]}
            />
          ))}
          <View style={styles.miniTag}>
            <Text style={styles.miniTagText}>{t('family.everyoneNearby')}</Text>
          </View>
        </View>

        {/* ── Member rows ── */}
        <View style={{ paddingHorizontal: 22, gap: 8, opacity: dimmed ? 0.35 : 1 }}>
          {members.map((m) => (
            <Pressable
              key={m.name}
              style={styles.memberRow}
              onPress={() => !dimmed && handleMemberChevron(m.name)}
            >
              <Polaroid width={38} height={32} noCaption source={{ uri: m.avatar }} rotate={-2} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.memberName}>{m.name}</Text>
                  <Chip color={m.age ? 'blue' : 'red'} size="sm">{m.tag}</Chip>
                  {m.flag ? <Flag size={16}>{m.flag}</Flag> : null}
                </View>
                <Text style={[styles.memberWhere, m.safe && { color: colors.stampGreen }]}>
                  {m.where}
                  {m.safe
                    ? ` · ${m.age && m.age < 10 ? t('family.safeM') : t('family.safe')}`
                    : ''}
                </Text>
              </View>
              {m.safe ? (
                <JournalSwitch value={true} onValueChange={() => {}} />
              ) : (
                <ChevronRight size={18} color={colors.inkFaded} />
              )}
            </Pressable>
          ))}

          {/* + ajouter button */}
          <Pressable style={styles.addRow} onPress={handleAddPress}>
            <Plus size={16} color={colors.inkFaded} />
            <Text style={styles.addLabel}>{t('eco.addMember')}</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* ── Invite modal ── */}
      <Modal
        visible={inviteVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setInviteVisible(false)}
      >
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('eco.inviteTitle')}</Text>
            <Pressable onPress={() => setInviteVisible(false)} hitSlop={10}>
              <X size={22} color={colors.ink} />
            </Pressable>
          </View>

          <Text style={styles.modalLabel}>{t('eco.inviteLabel')}</Text>
          <TextInput
            style={styles.modalInput}
            value={inviteName}
            onChangeText={setInviteName}
            placeholder={t('eco.invitePlaceholder')}
            placeholderTextColor={colors.inkFaded}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSendInvite}
          />

          <View style={{ marginTop: 24 }}>
            <Button
              variant="gold"
              full
              onPress={handleSendInvite}
              disabled={!inviteName.trim()}
            >
              {t('eco.sendInvite')}
            </Button>
          </View>

          {inviteSent ? (
            <Text style={styles.sentConfirm}>{t('eco.inviteSent')}</Text>
          ) : null}
        </View>
      </Modal>
    </PaperBackground>
  );
}

const dotPositions: { top?: number; left?: number; right?: number; bottom?: number; width: number; height: number }[] = [
  { top: 30, left: 40, width: 38, height: 38 },
  { top: 70, left: 140, width: 34, height: 34 },
  { top: 40, right: 60, width: 34, height: 34 },
  { bottom: 20, right: 40, width: 34, height: 34 },
];

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  back: { fontFamily: fonts.hand, fontSize: 20, color: colors.ink },
  headerTitle: { fontFamily: fonts.serifBold, fontSize: 18, color: colors.ink },
  titleCard: {
    marginTop: 8,
    padding: 18,
    borderWidth: 1.5,
    borderColor: colors.ink,
    overflow: 'hidden',
    shadowColor: colors.ink,
    shadowOpacity: 1,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 0,
    elevation: 4,
  },
  familySalut: { fontFamily: fonts.hand, fontSize: 22, color: colors.ink, transform: [{ rotate: '-2deg' }] },
  familyBody: { fontFamily: fonts.serifBlack, fontSize: 22, color: colors.ink, letterSpacing: -0.4, marginTop: 4, lineHeight: 26 },
  familyCount: { fontFamily: fonts.hand, fontSize: 16, marginLeft: 10, color: colors.ink },
  modeFamilleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.inkLine,
  },
  modeFamilleLabel: { fontFamily: fonts.hand, fontSize: 18, color: colors.ink },
  mini: {
    marginTop: 14,
    height: 140,
    borderWidth: 1.5,
    borderColor: colors.ink,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
  },
  familyDot: { position: 'absolute', borderRadius: 99, borderWidth: 2.5, borderColor: colors.sunset },
  miniTag: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    backgroundColor: colors.cardWhite,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  miniTagText: { fontFamily: fonts.hand, fontSize: 15, color: colors.ink },
  memberRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: colors.cardWhite,
    borderWidth: 1.5,
    borderColor: colors.inkLine,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  memberName: { fontFamily: fonts.serifBold, fontSize: 14, color: colors.ink },
  memberWhere: { fontFamily: fonts.hand, fontSize: 14, color: colors.inkFaded },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: colors.inkLine,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  addLabel: { fontFamily: fonts.hand, fontSize: 16, color: colors.inkFaded },
  // Modal
  modalSheet: {
    flex: 1,
    backgroundColor: colors.paper,
    padding: 24,
    paddingTop: 16,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.inkLine,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: { fontFamily: fonts.serifBold, fontSize: 20, color: colors.ink },
  modalLabel: { fontFamily: fonts.hand, fontSize: 16, color: colors.inkFaded, marginBottom: 8 },
  modalInput: {
    borderBottomWidth: 2,
    borderBottomColor: colors.ink,
    fontFamily: fonts.hand,
    fontSize: 22,
    color: colors.ink,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  sentConfirm: {
    fontFamily: fonts.hand,
    fontSize: 17,
    color: colors.stampGreen,
    textAlign: 'center',
    marginTop: 16,
  },
});
