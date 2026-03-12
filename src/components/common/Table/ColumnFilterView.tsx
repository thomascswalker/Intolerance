import vars from "@/src/theme/vars";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

interface ColumnFilterViewProps {
  isOpen: boolean;
  onClose: (state: boolean) => void;
  onReset: (options: string[]) => void;
  options: string[];
  selectedOptions: string[];
  toggleOption: (option: string) => void;
  defaultOptions?: string[];
}

function ColumnFilterView({
  isOpen,
  onClose,
  onReset,
  options,
  selectedOptions,
  toggleOption,
  defaultOptions,
}: ColumnFilterViewProps) {
  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="fade"
      onRequestClose={() => onClose(false)}
    >
      <Pressable
        onPress={() => onClose(false)}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.2)",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Pressable
          onPress={() => null}
          style={{
            backgroundColor: vars.colors.surface.primary,
            borderRadius: 14,
            maxHeight: "70%",
            overflow: "hidden",
          }}
        >
          <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
            <Text style={{ fontSize: 17, fontWeight: "600" }}>
              Visible Nutrients
            </Text>
          </View>

          <ScrollView>
            {options.map((option) => {
              const isSelected = selectedOptions.includes(option);
              return (
                <Pressable
                  key={option}
                  onPress={() => toggleOption(option)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderTopWidth: 1,
                    borderTopColor: vars.colors.border.primary,
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{option}</Text>
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={vars.colors.surface.secondary}
                    style={{ opacity: isSelected ? 1 : 0 }}
                  />
                </Pressable>
              );
            })}
          </ScrollView>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 12,
              borderTopWidth: 1,
              borderTopColor: vars.colors.border.primary,
            }}
          >
            <Pressable
              onPress={() => onReset(defaultOptions || [])}
              style={{ padding: 8 }}
            >
              <Text style={{ color: vars.colors.surface.secondary }}>
                Reset
              </Text>
            </Pressable>
            <Pressable onPress={() => onClose(false)} style={{ padding: 8 }}>
              <Text
                style={{
                  color: vars.colors.surface.secondary,
                  fontWeight: "600",
                }}
              >
                Done
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default ColumnFilterView;
