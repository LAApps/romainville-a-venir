import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import { useFonts as usePoppins, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold } from '@expo-google-fonts/poppins';
import {
  useFonts as useMontserrat,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
} from '@expo-google-fonts/montserrat';
import { AdminProvider } from '../lib/auth/AdminContext';
import { colors } from '../lib/theme';

SystemUI.setBackgroundColorAsync(colors.offWhite);

export default function RootLayout() {
  const [poppinsLoaded] = usePoppins({
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });
  const [montserratLoaded] = useMontserrat({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
  });

  const fontsReady = poppinsLoaded && montserratLoaded;

  if (!fontsReady) {
    return <View style={{ flex: 1, backgroundColor: colors.navy }} />;
  }

  return (
    <AdminProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.offWhite } }} />
    </AdminProvider>
  );
}
