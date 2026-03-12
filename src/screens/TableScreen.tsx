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
  LayoutAnimation,
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
import Chip from "../components/common/Chip";
import ExpandChevron from "../components/common/ExpandChevron";
import Table from "../components/common/Table";
import ColumnFilterView from "../components/common/Table/ColumnFilterView";
import { Food } from "../services/usda/types";
import { fetchUsdaData } from "../services/usda/usda";
import { hasVisibleNutrient, visibleNutrients } from "../services/usda/utils";
import vars from "../theme/vars";
import { getDepthRowColor } from "../utils/color";
import {
  DEFAULT_VISIBLE_NUTRIENTS,
  EXPANDER_COLUMN_WIDTH,
  NUTRIENT_COLOR_MAP,
  PAGE_SIZE,
} from "./constants";

interface DescriptionNode {
  id: string;
  label: string;
  normalizedLabel: string;
  depth: number;
  children: DescriptionNode[];
  foods: Food[];
}

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
              <Text>{label}</Text>
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
      <ColumnFilterView
        isOpen={isNutrientFilterOpen}
        onClose={setIsNutrientFilterOpen}
        onReset={setSelectedNutrients}
        options={nutrientOptions}
        selectedOptions={selectedNutrients}
        toggleOption={toggleNutrientSelection}
        defaultOptions={DEFAULT_VISIBLE_NUTRIENTS}
      />
    </View>
  );
}
