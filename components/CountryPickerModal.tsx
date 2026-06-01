import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, X, Check } from 'lucide-react-native';
import { fonts, type ThemeColors } from '@/theme/tokens';
import { useThemeColors } from '@/components/ThemeContext';
import { Flag } from '@/components/Flag';
import { countries, type Country } from '@/data/countries';
import { t } from '@/i18n';

/** Native slide-up modal to pick a country dialing code. */
export function CountryPickerModal({
  visible,
  selected,
  onClose,
  onSelect,
}: {
  visible: boolean;
  selected: Country;
  onClose: () => void;
  onSelect: (c: Country) => void;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const filtered = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.dial.includes(q) ||
      c.code.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.sheet, { paddingTop: insets.top + 8 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('setx.countryPickerTitle')}</Text>
          <Pressable onPress={onClose} hitSlop={10} style={styles.close}>
            <X size={20} color={colors.ink} />
          </Pressable>
        </View>

        <View style={styles.searchBox}>
          <Search size={16} color={colors.inkFaded} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder={t('setx.countryPickerSearch')}
            placeholderTextColor={colors.inkFaded}
            style={styles.searchInput}
            autoCorrect={false}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(c) => c.code}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const active = item.code === selected.code;
            return (
              <Pressable
                style={[styles.row, active && styles.rowActive]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Flag size={24}>{item.flag}</Flag>
                <Text style={styles.rowName}>{item.name}</Text>
                <Text style={styles.rowDial}>{item.dial}</Text>
                {active ? <Check size={18} color={colors.stampGreen} /> : <View style={{ width: 18 }} />}
              </Pressable>
            );
          }}
        />
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
  searchBox: {
    marginHorizontal: 22,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.cardWhite,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontFamily: fonts.serif, fontSize: 16, color: colors.ink },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderBottomWidth: 1.5,
    borderColor: colors.inkLine,
    borderStyle: 'dashed',
  },
  rowActive: { backgroundColor: colors.paperWarm },
  rowName: { flex: 1, fontFamily: fonts.serif, fontSize: 16, color: colors.ink },
  rowDial: { fontFamily: fonts.mono, fontSize: 15, color: colors.inkFaded },
});
