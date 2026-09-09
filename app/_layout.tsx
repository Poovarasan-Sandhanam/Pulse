import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { colors } from '../src/theme/tokens';
import { useMarketStore } from '../src/store/useMarketStore';

const queryClient = new QueryClient();

// CoinGecko's free tier allows only a handful of calls per minute, so real
// prices are re-anchored on this interval while the tick animates between them.
const LIVE_PRICE_REFRESH_MS = 60_000;
const TICK_MS = 1000;

export default function RootLayout() {
  const tickMarket = useMarketStore((s) => s.tickMarket);
  const fetchRealMarketPrices = useMarketStore((s) => s.fetchRealMarketPrices);

  useEffect(() => {
    const interval = setInterval(tickMarket, TICK_MS);
    return () => clearInterval(interval);
  }, [tickMarket]);

  useEffect(() => {
    fetchRealMarketPrices();
    const interval = setInterval(fetchRealMarketPrices, LIVE_PRICE_REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchRealMarketPrices]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" backgroundColor={colors.background} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
