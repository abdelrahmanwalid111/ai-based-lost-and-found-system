import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
        {/* Authentication Screens */}
        {/* <Stack.Screen name="Index" />  */}
        <Stack.Screen name="Login" />
        <Stack.Screen name="Signup" />
        <Stack.Screen name="Forget_Password" />
        <Stack.Screen name="OTP" />
        <Stack.Screen name="new_password" />
        <Stack.Screen name="password_updated" />

        {/* Main App Screens (Tabs) */}
        <Stack.Screen name="tabs" />

        {/* Settings Screens */}
        <Stack.Screen name="manage" />
        <Stack.Screen name="about" />
        <Stack.Screen name="policies" />
        <Stack.Screen name="terms" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="report_found" />

        {/* Not Found Screen */}
        <Stack.Screen name="+not-found" />
      </Stack>
      
      {/* Dynamic Status Bar based on Theme */}
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
