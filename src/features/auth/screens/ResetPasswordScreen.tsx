import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, EyeOff, Check } from 'lucide-react-native';
import { PaperBackground } from '@/shared/ui/PaperBackground';
import { NavBar, HomeIndicator } from '@/shared/ui/iOSChrome';
import { Squiggle } from '@/shared/ui/Squiggle';
import { Field } from '@/shared/ui/Field';
import { Button } from '@/shared/ui/Button';
import { Stamp } from '@/shared/ui/Stamp';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { t } from '@/shared/lib/i18n';
import { useUpdatePassword } from '../hooks/useUpdatePassword';

/** Reset password — saisie du nouveau mot de passe → succès → connexion. */
export default function Reset() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const updatePassword = useUpdatePassword();

  const onReset = async () => {
    if (password.length < 4) {
      setError(t('ob.resetErrorShort'));
      return;
    }
    if (password !== confirm) {
      setError(t('ob.resetErrorMismatch'));
      return;
    }
    setError('');
    try {
      await updatePassword.mutateAsync(password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('ob.authErrorGeneric'));
    }
  };

  const clearError = () => {
    if (error) setError('');
  };

  return (
    <PaperBackground tone="paper">
      <View style={{ paddingTop: insets.top }}>
        <NavBar
          left={
            <Pressable onPress={() => router.back()}>
              <Text style={styles.back}>← {t('common.back')}</Text>
            </Pressable>
          }
          title={<View style={{ width: 50 }} />}
          right={<View style={{ width: 50 }} />}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 110 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!done ? (
          <>
            {/* Form state */}
            <View style={styles.titleRow}>
              <Text style={styles.title}>{t('ob.resetTitlePre')} </Text>
              <Squiggle style={styles.title}>{t('ob.resetTitleSquiggle')}</Squiggle>
              <Text style={styles.title}>.</Text>
            </View>

            <Text style={styles.subtitle}>
              {t('ob.resetSubtitle')}
            </Text>

            {/* Password field with show/hide toggle */}
            <View style={styles.fieldWrap}>
              <Field
                label={t('ob.resetNewPass')}
                value={password}
                onChangeText={(v) => { setPassword(v); clearError(); }}
                secureTextEntry={!showPass}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
              />
              <Pressable
                style={styles.eyeBtn}
                onPress={() => setShowPass((v) => !v)}
                hitSlop={8}
              >
                {showPass
                  ? <EyeOff size={20} color={colors.inkFaded} />
                  : <Eye size={20} color={colors.inkFaded} />
                }
              </Pressable>
            </View>

            {/* Confirm field with show/hide toggle */}
            <View style={styles.fieldWrap}>
              <Field
                label={t('ob.resetConfirmPass')}
                value={confirm}
                onChangeText={(v) => { setConfirm(v); clearError(); }}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
              />
              <Pressable
                style={styles.eyeBtn}
                onPress={() => setShowConfirm((v) => !v)}
                hitSlop={8}
              >
                {showConfirm
                  ? <EyeOff size={20} color={colors.inkFaded} />
                  : <Eye size={20} color={colors.inkFaded} />
                }
              </Pressable>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        ) : (
          <>
            {/* Success state */}
            <View style={styles.stampWrap}>
              <Stamp color="green" size={128} fontSize={12} rotate={-8}>
                {t('ob.resetStamp')}
              </Stamp>
            </View>

            <View style={styles.successRow}>
              <View style={styles.checkCircle}>
                <Check size={22} color={colors.stampGreen} strokeWidth={2.5} />
              </View>
              <Text style={styles.successText}>{t('ob.resetSuccessText')}</Text>
            </View>

            <Text style={styles.successHelper}>
              {t('ob.resetSuccessHelper')}
            </Text>
          </>
        )}
      </ScrollView>

      {/* CTA zone */}
      <View style={[styles.cta, { bottom: insets.bottom + 26 }]}>
        {!done ? (
          <Button full variant="ink" onPress={onReset} disabled={updatePassword.isPending}>
            {t('ob.resetCta')}
          </Button>
        ) : (
          <Button
            full
            variant="gold"
            onPress={() => router.replace('/(onboarding)/login' as never)}
          >
            {t('ob.resetLoginCta')}
          </Button>
        )}
      </View>

      <HomeIndicator />
    </PaperBackground>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  scroll: {
    paddingHorizontal: 26,
    paddingTop: 10,
  },
  back: { fontFamily: fonts.hand, fontSize: 20, color: colors.ink },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    marginBottom: 6,
    marginTop: 4,
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 28,
    color: colors.ink,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    color: colors.inkFaded,
    fontSize: 14,
    marginTop: 6,
    marginBottom: 22,
    lineHeight: 20,
  },
  fieldWrap: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    bottom: 22,
  },
  error: {
    fontFamily: fonts.hand,
    fontSize: 16,
    color: colors.stampRed,
    marginTop: 4,
    marginBottom: 8,
  },
  stampWrap: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 28,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  checkCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.stampGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    fontFamily: fonts.serifBold,
    fontSize: 22,
    color: colors.stampGreen,
    letterSpacing: -0.4,
  },
  successHelper: {
    fontFamily: fonts.hand,
    fontSize: 18,
    color: colors.inkFaded,
    lineHeight: 24,
  },
  cta: {
    position: 'absolute',
    left: 22,
    right: 22,
  },
});
