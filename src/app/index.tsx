import { Redirect } from 'expo-router';

/**
 * Default landing — route to the splash carousel. In a real build this
 * would check auth/onboarding state and skip ahead.
 */
export default function Index() {
  return <Redirect href="/(onboarding)" />;
}
