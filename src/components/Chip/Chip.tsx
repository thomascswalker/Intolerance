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
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: color || "#333",
      }}
    >
      <Text style={{ color: "#FFF", fontWeight: "bold" }}>{children}</Text>
    </View>
  );
}

export default Chip;
