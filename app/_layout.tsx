import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { ThemeProvider } from "react-native-ios-kit";

export default function RootLayout() {
  useFonts({
    "SF-Pro": require("../assets/fonts/SF-Pro-Display-Regular.otf"),
  });

  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Foods" }} />
      </Stack>
    </ThemeProvider>
  );
}
