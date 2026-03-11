import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  LayoutAnimation,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  Text,
  UIManager,
  View,
} from "react-native";
import Reanimated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
} from "react-native-reanimated";
import Chip from "../components/Chip";
import Table from "../components/Table";
import { Food, Nutrient } from "../services/usda/types";
import { fetchUsdaData } from "../services/usda/usda";
import vars from "../theme/vars";

const DEFAULT_VISIBLE_NUTRIENTS = ["Energy", "Sucrose", "Fructose", "Lactose"];
const PAGE_SIZE = 200;
const EXPANDER_COLUMN_WIDTH = 44;
const NUTRIENT_COLOR_MAP: Record<string, string> = {
  Energy: vars.colors.base.red,
  Sucrose: vars.colors.base.orange,
  Fructose: vars.colors.base.blue,
  Lactose: vars.colors.base.green,
};

const DESCRIPTION_CHIP_COLOR = vars.colors.base.gray;

const toHexChannel = (value: number) =>
  Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0");

const getDepthRowColor = (depth: number) => {
  const brightnessFactor = Math.max(0, 1 - depth * 0.1);
  const channelValue = Math.round(255 * brightnessFactor);
  const channel = toHexChannel(channelValue);
  return `#${channel}${channel}${channel}`;
};

interface DescriptionNode {
  id: string;
  label: string;
  normalizedLabel: string;
  depth: number;
  children: DescriptionNode[];
  foods: Food[];
}

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

const normalizeLabel = (label: string) => label.trim().toLowerCase();

const applyDepth = (node: DescriptionNode, depth: number) => {
  node.depth = depth;
  node.children.forEach((child) => applyDepth(child, depth + 1));
};

const ensureRootGroup = (root: DescriptionNode, rootLabel: string) => {
  const normalized = normalizeLabel(rootLabel);

  const exact = root.children.find(
    (child) => child.normalizedLabel === normalized,
  );

  if (exact) {
    return exact;
  }

  const prefixParent = root.children.find((child) =>
    normalized.startsWith(child.normalizedLabel),
  );

  if (prefixParent) {
    const childNode: DescriptionNode = {
      id: `${prefixParent.id}>${normalized}`,
      label: rootLabel,
      normalizedLabel: normalized,
      depth: prefixParent.depth + 1,
      children: [],
      foods: [],
    };
    prefixParent.children.push(childNode);
    return childNode;
  }

  const prefixChildIndex = root.children.findIndex((child) =>
    child.normalizedLabel.startsWith(normalized),
  );

  if (prefixChildIndex >= 0) {
    const existingChild = root.children[prefixChildIndex];
    const parentNode: DescriptionNode = {
      id: `${root.id}>${normalized}`,
      label: rootLabel,
      normalizedLabel: normalized,
      depth: 0,
      children: [existingChild],
      foods: [],
    };
    applyDepth(existingChild, 1);
    root.children[prefixChildIndex] = parentNode;
    return parentNode;
  }

  const node: DescriptionNode = {
    id: `${root.id}>${normalized}`,
    label: rootLabel,
    normalizedLabel: normalized,
    depth: 0,
    children: [],
    foods: [],
  };

  root.children.push(node);
  return node;
};

const createDescriptionTree = (foods: Food[]) => {
  const root: DescriptionNode = {
    id: "root",
    label: "root",
    normalizedLabel: "root",
    depth: -1,
    children: [],
    foods: [],
  };

  for (const food of foods) {
    const parts = food.description
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length === 0) {
      continue;
    }

    let current = ensureRootGroup(root, parts[0]);
    current.foods.push(food);

    for (let i = 1; i < parts.length; i += 1) {
      const part = parts[i];
      const normalized = normalizeLabel(part);
      let next = current.children.find(
        (child) => child.normalizedLabel === normalized,
      );

      if (!next) {
        next = {
          id: `${current.id}>${normalized}`,
          label: part,
          normalizedLabel: normalized,
          depth: current.depth + 1,
          children: [],
          foods: [],
        };
        current.children.push(next);
      }

      next.foods.push(food);
      current = next;
    }
  }

  return root;
};

const compactNode = (node: DescriptionNode): DescriptionNode => {
  while (node.children.length === 1) {
    const onlyChild = node.children[0];
    node.label = `${node.label}, ${onlyChild.label}`;
    node.normalizedLabel = `${node.normalizedLabel},${onlyChild.normalizedLabel}`;
    node.id = onlyChild.id;
    node.children = onlyChild.children;
    node.foods = onlyChild.foods;
  }

  node.children = node.children.map(compactNode);
  return node;
};

const compactDescriptionTree = (root: DescriptionNode) => {
  root.children = root.children.map(compactNode);
  root.children.forEach((child) => applyDepth(child, 0));
  return root;
};

const sortTreeNodes = (nodes: DescriptionNode[]) => {
  nodes.sort((a, b) => a.label.localeCompare(b.label));
  nodes.forEach((node) => sortTreeNodes(node.children));
  return nodes;
};

const visibleNutrients = (nutrients: Nutrient[], selectedNutrients: string[]) =>
  nutrients
    .filter(
      (nutrient) =>
        selectedNutrients.includes(nutrient.name) && nutrient.amount > 0,
    )
    .sort((n1, n2) => n1.name.localeCompare(n2.name));

const hasVisibleNutrient = (food: Food, selectedNutrients: string[]) =>
  food.foodNutrients.some(
    (nutrient) =>
      selectedNutrients.includes(nutrient.name) && nutrient.amount > 0,
  );

export default function TableScreen() {
  const [expandedRows, setExpandedRows] = useState<ExpandedState>({});
  const [selectedNutrients, setSelectedNutrients] = useState<string[]>(
    DEFAULT_VISIBLE_NUTRIENTS,
  );
  const [isNutrientFilterOpen, setIsNutrientFilterOpen] = useState(false);

  React.useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const {
    data: queryData,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ["usda-foods", "Foundation"],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchUsdaData("Foundation", PAGE_SIZE, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) {
        return undefined;
      }
      return allPages.length + 1;
    },
    staleTime: 1000 * 60,
  });

  const data = useMemo(() => {
    const allFoods = queryData?.pages.flatMap((page) => page) ?? [];
    const deduped = new Map<number, Food>();

    allFoods.forEach((food) => {
      if (!deduped.has(food.fdcId)) {
        deduped.set(food.fdcId, food);
      }
    });

    return Array.from(deduped.values());
  }, [queryData]);

  const toggleExpandedRow = useCallback((rowId: string) => {
    if (Platform.OS !== "web") {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }

    setExpandedRows((current) => {
      if (current === true) {
        return {};
      }

      const next = { ...current };
      if (next[rowId]) {
        delete next[rowId];
      } else {
        next[rowId] = true;
      }
      return next;
    });
  }, []);

  const nutrientOptions = useMemo(() => {
    const uniqueNutrients = new Set<string>();

    data.forEach((food) => {
      food.foodNutrients.forEach((nutrient) => {
        if (nutrient.amount > 0) {
          uniqueNutrients.add(nutrient.name);
        }
      });
    });

    return Array.from(uniqueNutrients).sort((a, b) => a.localeCompare(b));
  }, [data]);

  const filteredFoods = useMemo(
    () => data.filter((food) => hasVisibleNutrient(food, selectedNutrients)),
    [data, selectedNutrients],
  );

  const handleTableScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent;
      const threshold = 200;
      const isNearBottom =
        contentOffset.y + layoutMeasurement.height >=
        contentSize.height - threshold;

      if (isNearBottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  const toggleNutrientSelection = useCallback((nutrientName: string) => {
    setSelectedNutrients((current) => {
      if (current.includes(nutrientName)) {
        return current.filter((name) => name !== nutrientName);
      }
      return [...current, nutrientName].sort((a, b) => a.localeCompare(b));
    });
  }, []);

  const treeData = useMemo(() => {
    const tree = compactDescriptionTree(createDescriptionTree(filteredFoods));
    return sortTreeNodes(tree.children);
  }, [filteredFoods]);

  const columns = useMemo<ColumnDef<DescriptionNode>[]>(
    () => [
      {
        id: "expander",
        header: "",
        cell: ({ row }) => {
          const canExpand = row.getCanExpand();
          const isExpanded = row.getIsExpanded();

          return (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <ExpandChevron
                canExpand={canExpand}
                isExpanded={isExpanded}
                onPress={() => toggleExpandedRow(row.id)}
              />
            </View>
          );
        },
      },
      // {
      //   id: "fdcId",
      //   header: "ID",
      //   cell: ({ row }) => (
      //     <Text style={{ textAlign: "center" }}>
      //       {row.original.children.length === 0 &&
      //       row.original.foods.length === 1
      //         ? row.original.foods[0].fdcId
      //         : ""}
      //     </Text>
      //   ),
      // },
      {
        id: "description",
        header: "Description",
        cell: ({ row }) => {
          const canExpand = row.getCanExpand();
          const entryCount = row.original.foods.length;
          const label = canExpand
            ? `${row.original.label} (${entryCount})`
            : row.original.label;

          return (
            <View>
              <Chip color={DESCRIPTION_CHIP_COLOR}>{label}</Chip>
            </View>
          );
        },
      },
      {
        id: "nutrients",
        header: () => (
          <Pressable
            onPress={() => setIsNutrientFilterOpen(true)}
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Text
              style={{
                color: vars.colors.surface.secondary,
                fontWeight: "bold",
              }}
            >
              Nutrients
            </Text>
            <Text style={{ color: vars.colors.surface.secondary }}>
              ({selectedNutrients.length})
            </Text>
          </Pressable>
        ),
        cell: ({ row }) => (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {row.original.children.length === 0 &&
              row.original.foods.length === 1 &&
              visibleNutrients(
                row.original.foods[0].foodNutrients,
                selectedNutrients,
              ).map((nutrient, index) => (
                <Chip key={index} color={NUTRIENT_COLOR_MAP[nutrient.name]}>
                  {nutrient.name}: {nutrient.amount}
                  {nutrient.unitName}
                </Chip>
              ))}
          </View>
        ),
      },
    ],
    [selectedNutrients, toggleExpandedRow],
  );

  const table = useReactTable({
    data: treeData,
    columns,
    state: {
      expanded: expandedRows,
    },
    onExpandedChange: setExpandedRows,
    getSubRows: (row) => row.children,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Table>
        <Table.Head>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.Header
                  key={header.id}
                  style={
                    header.column.id === "expander"
                      ? {
                          flex: 0,
                          width: EXPANDER_COLUMN_WIDTH,
                        }
                      : undefined
                  }
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </Table.Header>
              ))}
            </Table.Row>
          ))}
        </Table.Head>
        <ScrollView scrollEventThrottle={100} onScroll={handleTableScroll}>
          <Table.Body>
            {table.getRowModel().rows.map((row) => (
              <Reanimated.View
                key={row.id}
                entering={FadeInDown.duration(180)}
                exiting={FadeOutUp.duration(140)}
                layout={LinearTransition.duration(180)}
              >
                <Table.Row
                  style={{
                    backgroundColor: getDepthRowColor(row.depth),
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <Table.Cell
                      key={cell.id}
                      style={
                        cell.column.id === "expander"
                          ? {
                              flex: 0,
                              width: EXPANDER_COLUMN_WIDTH,
                            }
                          : undefined
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </Table.Cell>
                  ))}
                </Table.Row>
              </Reanimated.View>
            ))}
          </Table.Body>
          <View style={{ paddingVertical: 16, alignItems: "center", gap: 8 }}>
            {isPending ? (
              <>
                <ActivityIndicator color={vars.colors.surface.secondary} />
                <Text style={{ color: vars.colors.surface.secondary }}>
                  Loading foods...
                </Text>
              </>
            ) : null}

            {!isPending && isFetchingNextPage ? (
              <>
                <ActivityIndicator color={vars.colors.surface.secondary} />
                <Text style={{ color: vars.colors.surface.secondary }}>
                  Loading more...
                </Text>
              </>
            ) : null}

            {!isPending && !isFetchingNextPage && !hasNextPage ? (
              <Text style={{ color: vars.colors.base.gray }}>End of list</Text>
            ) : null}

            {error ? (
              <Text style={{ color: vars.colors.base.red }}>
                Failed to load foods. Please try again.
              </Text>
            ) : null}
          </View>
        </ScrollView>
      </Table>

      <Modal
        transparent
        visible={isNutrientFilterOpen}
        animationType="fade"
        onRequestClose={() => setIsNutrientFilterOpen(false)}
      >
        <Pressable
          onPress={() => setIsNutrientFilterOpen(false)}
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
              backgroundColor: "#FFFFFF",
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
              {nutrientOptions.map((nutrientName) => {
                const isSelected = selectedNutrients.includes(nutrientName);
                return (
                  <Pressable
                    key={nutrientName}
                    onPress={() => toggleNutrientSelection(nutrientName)}
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
                    <Text style={{ fontSize: 16 }}>{nutrientName}</Text>
                    <Text
                      style={{
                        fontSize: 18,
                        color: vars.colors.surface.secondary,
                        opacity: isSelected ? 1 : 0,
                      }}
                    >
                      ✓
                    </Text>
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
                onPress={() => setSelectedNutrients(DEFAULT_VISIBLE_NUTRIENTS)}
                style={{ padding: 8 }}
              >
                <Text style={{ color: vars.colors.surface.secondary }}>
                  Reset
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setIsNutrientFilterOpen(false)}
                style={{ padding: 8 }}
              >
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
    </View>
  );
}
