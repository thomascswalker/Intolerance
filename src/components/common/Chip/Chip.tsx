import vars from "@/src/theme/vars";
import { ReactNode } from "react";
import { Text, View } from "react-native";
interface Props {
  color?: string;
  children: ReactNode;
}

function Chip({ color, children }: Props) {
  return (
    <View
      style={{
        alignItems: "flex-start",
        justifyContent: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: color || vars.colors.surface.neutral,
        maxWidth: "100%",
        alignSelf: "stretch",
      }}
    >
      <Text
        style={{
          color: vars.colors.text.secondary,
          fontWeight: "bold",
          flexShrink: 1,
          flexWrap: "wrap",
        }}
      >
        {children}
      </Text>
    </View>
  );
}

export default Chip;
