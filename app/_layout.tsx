import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useState } from "react";
import { ThemeProvider } from "react-native-ios-kit";

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  useFonts({
    "SF-Pro": require("../assets/fonts/SF-Pro-Display-Regular.otf"),
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Stack>
          <Stack.Screen name="index" options={{ title: "Foods" }} />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
