import { createDrawerNavigator } from "@react-navigation/drawer";
import { useFonts } from "expo-font";
import React from "react";
import { ThemeProvider } from "react-native-ios-kit";
import TablePage from "./pages/TablePage";

const Drawer = createDrawerNavigator();

export default function App() {
  const [loaded, error] = useFonts({
    "SF-Pro": require("../assets/fonts/SF-Pro-Display-Regular.otf"),
  });
  return (
    <ThemeProvider>
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home" component={TablePage} />
      </Drawer.Navigator>
    </ThemeProvider>
  );
}
