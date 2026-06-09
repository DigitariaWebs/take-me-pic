import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Map, LayoutGrid, MessageCircle, User } from 'lucide-react-native';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';

// Minimal subset of @react-navigation's BottomTabBarProps. We only consume
// `state` and `navigation`; typing them inline avoids depending on
// @react-navigation/bottom-tabs directly (Expo Router re-exports the runtime).
type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault: true }) => { defaultPrevented: boolean };
    navigate: (route: never) => void;
  };
};

const TAB_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  index: Map,
  carnet: LayoutGrid,
  messages: MessageCircle,
  moi: User,
};

const TAB_LABELS: Record<string, string> = {
  index: 'carte',
  carnet: 'carnet',
  messages: 'messages',
  moi: 'moi',
};

export function JournalTabBar({ state, navigation }: TabBarProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      <View style={styles.dashed} />
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const Icon = TAB_ICONS[route.name] ?? Map;
        const label = TAB_LABELS[route.name] ?? route.name;
        return (
          <Pressable
            key={route.key}
            style={styles.tab}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name as never);
            }}
          >
            <Icon
              size={24}
              color={focused ? colors.ink : colors.inkFaded}
              strokeWidth={focused ? 2 : 1.6}
            />
            <Text style={[styles.label, focused && { color: colors.ink, fontWeight: '700' }]}>{label}</Text>
            {focused ? <Text style={styles.dot}>✦</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  bar: {
    backgroundColor: colors.paper2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: 10,
    paddingHorizontal: 4,
    borderTopWidth: 1.5,
    borderColor: colors.inkLine,
    minHeight: 86,
  },
  dashed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: colors.paper2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    position: 'relative',
  },
  label: {
    fontFamily: fonts.hand,
    fontSize: 14,
    color: colors.inkFaded,
  },
  dot: {
    position: 'absolute',
    bottom: -8,
    fontSize: 10,
    color: colors.gold,
  },
});
