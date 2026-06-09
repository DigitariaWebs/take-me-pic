import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import type { FeedTab } from '@/features/feed/types';
import { t } from '@/shared/lib/i18n';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FeedTabsProps {
  value: FeedTab;
  onChange: (t: FeedTab) => void;
}

// ---------------------------------------------------------------------------
// Tab definitions — no emoji, labels resolved via i18n, matched to FeedTab union
// ---------------------------------------------------------------------------

const TAB_IDS: { id: FeedTab; labelKey: string }[] = [
  { id: 'pour-toi', labelKey: 'feed.tabPourToi' },
  { id: 'suivis',   labelKey: 'feed.tabSuivis'  },
  { id: 'pres',     labelKey: 'feed.tabPresIci' },
];

// ---------------------------------------------------------------------------
// Gold squiggle underline — drawn inline so we own the width precisely
// ---------------------------------------------------------------------------

function GoldSquiggle({ width }: { width: number }) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  // A simple SVG wave: two bumps across the available width
  return (
    <Svg
      width={width}
      height={7}
      viewBox={`0 0 ${width} 7`}
      preserveAspectRatio="none"
      style={styles.squiggleSvg}
    >
      <Path
        d={`M 0 3.5 Q ${width * 0.125} 0.5 ${width * 0.25} 3.5 T ${width * 0.5} 3.5 T ${width * 0.75} 3.5 T ${width} 3.5`}
        fill="none"
        stroke={colors.gold}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Single tab pill
// ---------------------------------------------------------------------------

function TabItem({
  tab,
  active,
  onPress,
}: {
  tab: (typeof TAB_IDS)[number];
  active: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // We need the rendered width of the label to size the squiggle.
  // Use a fixed width for each tab so the squiggle spans the text.
  const [labelWidth, setLabelWidth] = React.useState(0);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={styles.tabPressable}
    >
      <View style={styles.tabInner}>
        <Text
          onLayout={(e) => setLabelWidth(e.nativeEvent.layout.width)}
          style={[
            styles.label,
            active ? styles.labelActive : styles.labelInactive,
          ]}
        >
          {t(tab.labelKey)}
        </Text>

        {/* Gold squiggle underline visible only for the active tab */}
        {active && labelWidth > 0 && (
          <GoldSquiggle width={labelWidth} />
        )}

        {/* Reserve the squiggle height on inactive tabs so layout doesn't shift */}
        {!active && <View style={styles.squigglePlaceholder} />}
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// FeedTabs
// ---------------------------------------------------------------------------

export function FeedTabs({ value, onChange }: FeedTabsProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      {TAB_IDS.map((tab) => (
        <TabItem
          key={tab.id}
          tab={tab}
          active={value === tab.id}
          onPress={() => onChange(tab.id)}
        />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles factory
// ---------------------------------------------------------------------------

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
    gap: 24,
    backgroundColor: colors.paper,
  },

  tabPressable: {
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },

  tabInner: {
    alignItems: 'center',
  },

  label: {
    fontFamily: fonts.hand,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.2,
  },

  labelActive: {
    color: colors.ink,
  },

  labelInactive: {
    color: colors.inkFaded,
  },

  squiggleSvg: {
    marginTop: 1,
  },

  squigglePlaceholder: {
    height: 7,
    marginTop: 1,
  },
});
