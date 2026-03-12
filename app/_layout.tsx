import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useState } from "react";
import { Platform } from "react-native";

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  useFonts({
    "SF-Pro": require("../assets/fonts/SF-Pro-Display-Regular.otf"),
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ title: `Foods (${Platform.OS})` }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
