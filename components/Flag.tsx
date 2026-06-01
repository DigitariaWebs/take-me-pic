import { Text, TextStyle, StyleProp, View } from 'react-native';
import { Image } from 'expo-image';

/**
 * Renders a country flag.
 *
 * Emoji flags are unreliable: the iOS Simulator ships no flag glyphs (they show
 * as "?" tofu boxes) and our brand fonts block emoji fallback. So instead of the
 * emoji we convert the regional-indicator emoji → ISO 3166 code → a real flag
 * image (flagcdn). Existing call sites keep passing the emoji as before:
 *   <Flag size={18}>{"🇫🇷"}</Flag>
 */
function emojiToCode(flag: string): string | null {
  const points = [...flag].map((ch) => ch.codePointAt(0) ?? 0);
  if (points.length < 2) return null;
  const A = 0x1f1e6;
  const a = points[0] - A;
  const b = points[1] - A;
  if (a < 0 || a > 25 || b < 0 || b > 25) return null;
  return String.fromCharCode(65 + a, 65 + b).toLowerCase();
}

export function Flag({
  children,
  size = 18,
  style,
}: {
  children: string;
  size?: number;
  style?: StyleProp<TextStyle>;
}) {
  const code = typeof children === 'string' ? emojiToCode(children) : null;

  // Fallback: if it isn't a flag (e.g. a non-flag emoji), render it as system text.
  if (!code) {
    return <Text style={[{ fontSize: size }, style]}>{children}</Text>;
  }

  const w = Math.round(size * 1.34); // flagcdn w40 images are 4:3
  return (
    <View
      style={{
        width: w,
        height: size,
        borderRadius: 2,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: 'rgba(42,31,26,0.25)',
      }}
    >
      <Image
        source={{ uri: `https://flagcdn.com/w40/${code}.png` }}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        transition={120}
      />
    </View>
  );
}
