import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Check } from 'lucide-react-native';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { Flag } from '@/shared/ui/Flag';
import { t, SUPPORTED, type LocaleTag } from '@/shared/lib/i18n';

const LANGUAGE_META: Record<LocaleTag, { flag: string; labelKey: string }> = {
  fr: { flag: '🇫🇷', labelKey: 'setx.langFr' },
  en: { flag: '🇬🇧', labelKey: 'setx.langEn' },
  ar: { flag: '🇸🇦', labelKey: 'setx.langAr' },
  es: { flag: '🇪🇸', labelKey: 'setx.langEs' },
};

/** Native slide-up sheet to pick the app language (replaces the cycle tap). */
export function LanguagePickerModal({
  visible,
  selected,
  onClose,
  onSelect,
}: {
  visible: boolean;
  selected: LocaleTag;
  onClose: () => void;
  onSelect: (l: LocaleTag) => void;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.sheet, { paddingTop: insets.top + 8 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('settings.items.language.title')}</Text>
          <Pressable onPress={onClose} hitSlop={10} style={styles.close}>
            <X size={20} color={colors.ink} />
          </Pressable>
        </View>

        {SUPPORTED.map((code) => {
          const meta = LANGUAGE_META[code];
          const isSelected = code === selected;
          return (
            <Pressable
              key={code}
              style={styles.row}
              onPress={() => {
                onSelect(code);
                onClose();
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Flag size={24}>{meta.flag}</Flag>
              <Text style={styles.label}>{t(meta.labelKey)}</Text>
              {isSelected ? <Check size={18} color={colors.stampGreen} /> : <View style={{ width: 18 }} />}
            </Pressable>
          );
        })}
      </View>
    </Modal>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  sheet: { flex: 1, backgroundColor: colors.paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 12,
  },
  title: { fontFamily: fonts.serifBold, fontSize: 20, color: colors.ink },
  close: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderBottomWidth: 1.5,
    borderColor: colors.inkLine,
    borderStyle: 'dashed',
  },
  label: { flex: 1, fontFamily: fonts.hand, fontSize: 18, color: colors.ink },
});
