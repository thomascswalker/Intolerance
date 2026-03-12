import vars from "@/src/theme/vars";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Animated, Pressable, View } from "react-native";

interface ExpandChevronProps {
  canExpand: boolean;
  isExpanded: boolean;
  onPress: () => void;
}

const ExpandChevron = ({
  canExpand,
  isExpanded,
  onPress,
}: ExpandChevronProps) => {
  const rotation = React.useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(rotation, {
      toValue: isExpanded ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, rotation]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  if (!canExpand) {
    return <View style={{ minWidth: 24 }} />;
  }

  return (
    <Pressable
      onPressIn={onPress}
      unstable_pressDelay={0}
      style={{ minWidth: 24, alignItems: "center" }}
    >
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={vars.colors.surface.secondary}
        />
      </Animated.View>
    </Pressable>
  );
};

export default ExpandChevron;
