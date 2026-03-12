import { ReactNode } from "react";
import { Text, View } from "react-native";

interface ChipProps {
  color?: string;
  children: ReactNode;
}

function Chip({ color, children }: ChipProps) {
  return (
    <View
      style={{
        alignItems: "flex-start",
        justifyContent: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: color || "#333",
        maxWidth: "100%",
        alignSelf: "stretch",
      }}
    >
      <Text
        style={{
          color: "#FFF",
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
