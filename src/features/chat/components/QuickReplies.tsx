import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { MapPin, Clock, Camera, Hand, Navigation } from 'lucide-react-native';
import { Chip } from '@/shared/ui/Chip';
import { type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { t } from '@/shared/lib/i18n';

type QuickReplyItem = {
  key: string;
  gold: boolean;
};

// Only static config here — icon colours are resolved inside the component
const ITEMS: QuickReplyItem[] = [
  { key: 'chatUi.qrHereNow', gold: true },
  { key: 'chatUi.qrComing',  gold: true },
  { key: 'chatUi.qrReady',   gold: false },
  { key: 'chatUi.qrThanks',  gold: false },
  { key: 'chatUi.qrLocate',  gold: false },
];

const ICON_SIZE = 14;

function buildIcon(key: string, colors: ThemeColors): React.ReactNode {
  const gold = colors.goldDeep;
  const ink  = colors.ink;
  switch (key) {
    case 'chatUi.qrHereNow': return <MapPin    size={ICON_SIZE} color={gold} strokeWidth={2} />;
    case 'chatUi.qrComing':  return <Clock     size={ICON_SIZE} color={gold} strokeWidth={2} />;
    case 'chatUi.qrReady':   return <Camera    size={ICON_SIZE} color={ink}  strokeWidth={2} />;
    case 'chatUi.qrThanks':  return <Hand      size={ICON_SIZE} color={ink}  strokeWidth={2} />;
    case 'chatUi.qrLocate':  return <Navigation size={ICON_SIZE} color={ink} strokeWidth={2} />;
    default:                  return null;
  }
}

export function QuickReplies({ onSend }: { onSend: (text: string) => void }) {
  const colors = useThemeColors();

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {ITEMS.map((item) => {
          const label = t(item.key);
          return (
            <Chip
              key={item.key}
              color={item.gold ? 'gold' : 'ink'}
              variant="outline"
              size="sm"
              leading={buildIcon(item.key, colors)}
              onPress={() => onSend(label)}
              style={styles.chip}
            >
              {label}
            </Chip>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  chip: {
    flexShrink: 0,
  },
});
