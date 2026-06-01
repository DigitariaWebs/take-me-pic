import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import fr from './fr';
import en from './en';
import ar from './ar';
import es from './es';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Per-screen translation domains (each owns a unique top-level namespace and is
// merged on top of the base files). This lets the i18n work be split safely.
import obD from './screens/onboarding';
import carteD from './screens/carte';
import feedD from './screens/feed';
import chatD from './screens/chat';
import flowD from './screens/flow';
import discoverD from './screens/discover';
import ecoD from './screens/eco';
import settingsD from './screens/settingsx';

export type LocaleTag = 'fr' | 'en' | 'ar' | 'es';
export const SUPPORTED: LocaleTag[] = ['fr', 'en', 'ar', 'es'];
export const RTL_LOCALES: LocaleTag[] = ['ar'];

const BASE: Record<LocaleTag, object> = { fr, en, ar, es };
const DOMAINS = [obD, carteD, feedD, chatD, flowD, discoverD, ecoD, settingsD];

function buildLocale(lang: LocaleTag): Record<string, unknown> {
  return DOMAINS.reduce<Record<string, unknown>>(
    (acc, d) => ({ ...acc, ...((d as Record<string, Record<string, unknown>>)[lang] ?? {}) }),
    { ...(BASE[lang] as Record<string, unknown>) }
  );
}

export const i18n = new I18n({
  fr: buildLocale('fr'),
  en: buildLocale('en'),
  ar: buildLocale('ar'),
  es: buildLocale('es'),
});
i18n.defaultLocale = 'fr';
i18n.enableFallback = true;
// Default to FR; the language switcher (FR/EN/AR/ES) can change it.
i18n.locale = 'fr';

const STORAGE_KEY = '@tmp/locale';

export async function loadStoredLocale(): Promise<LocaleTag> {
  // Persisted preference takes priority. Guard against the storage native
  // module being unavailable (e.g. a version mismatch) so startup never crashes.
  let stored: LocaleTag | null = null;
  try {
    stored = (await AsyncStorage.getItem(STORAGE_KEY)) as LocaleTag | null;
  } catch {
    stored = null;
  }
  if (stored && SUPPORTED.includes(stored)) {
    i18n.locale = stored;
    return stored;
  }
  const device = getLocales()[0]?.languageCode as LocaleTag | undefined;
  const next = device && SUPPORTED.includes(device) ? device : 'fr';
  i18n.locale = next;
  return next;
}

export async function setLocale(tag: LocaleTag) {
  i18n.locale = tag;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, tag);
  } catch {
    // storage unavailable — keep the in-memory locale for this session
  }
}

/**
 * Hook used by the language switcher screens. Returns the current locale
 * and a setter that persists.
 */
export function useLocale(): [LocaleTag, (tag: LocaleTag) => Promise<void>] {
  const [tag, setTag] = useState<LocaleTag>((i18n.locale as LocaleTag) ?? 'fr');
  useEffect(() => {
    void loadStoredLocale().then((stored) => setTag(stored));
  }, []);
  const setter = async (next: LocaleTag) => {
    await setLocale(next);
    setTag(next);
  };
  return [tag, setter];
}

/** Translation shortcut. */
export const t = (key: string, opts?: object) => i18n.t(key, opts);
