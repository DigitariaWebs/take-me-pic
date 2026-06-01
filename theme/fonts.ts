import {
  useFonts as useFraunces,
  Fraunces_400Regular,
  Fraunces_400Regular_Italic,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
  Fraunces_800ExtraBold,
} from '@expo-google-fonts/fraunces';
import {
  Caveat_400Regular,
  Caveat_500Medium,
  Caveat_700Bold,
} from '@expo-google-fonts/caveat';
import { SpecialElite_400Regular } from '@expo-google-fonts/special-elite';
import {
  DMMono_400Regular,
  DMMono_500Medium,
} from '@expo-google-fonts/dm-mono';

/**
 * Load every font we need in one hook so the root layout can hide the
 * splash screen as soon as everything is ready.
 */
export function useAppFonts(): boolean {
  const [loaded] = useFraunces({
    Fraunces_400Regular,
    Fraunces_400Regular_Italic,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Fraunces_800ExtraBold,
    Caveat_400Regular,
    Caveat_500Medium,
    Caveat_700Bold,
    SpecialElite_400Regular,
    DMMono_400Regular,
    DMMono_500Medium,
  });
  return loaded;
}
