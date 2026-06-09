import { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { JournalTabBar } from '@/shared/ui/JournalTabBar';
import { type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';

const makeStyles = (colors: ThemeColors) => ({
  sceneStyle: { backgroundColor: colors.paper },
});

export default function TabsLayout() {
  const colors = useThemeColors();
  const themed = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Tabs
      tabBar={(props) => <JournalTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: themed.sceneStyle,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="carnet" />
      <Tabs.Screen name="messages" />
      <Tabs.Screen name="moi" />
    </Tabs>
  );
}
