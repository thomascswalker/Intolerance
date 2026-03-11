import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useFonts } from "expo-font";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import Table from "./components/Table/Table";
import { Food, Nutrient } from "./data/usda/types";
import { fetchUsdaData } from "./data/usda/usda";

const VISIBLE_NUTRIENTS = ["Energy", "Sucrose", "Fructose", "Lactose"];

const columns = [
  {
    accessorKey: "fdcId",
    header: "ID",
    cell: ({ getValue }: { getValue: () => number }) => {
      return <Text>{getValue()}</Text>;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ getValue }: { getValue: () => string }) => {
      return <Text>{getValue()}</Text>;
    },
  },
  {
    accessorKey: "foodNutrients",
    header: "Nutrients",
    cell: ({ getValue }: { getValue: () => Nutrient[] }) => {
      const nutrients = getValue();
      return (
        <View>
          {nutrients
            .filter(
              (nutrient) =>
                VISIBLE_NUTRIENTS.includes(nutrient.name) &&
                nutrient.amount > 0,
            )
            .sort((n1, n2) => n1.name.localeCompare(n2.name))
            .map((nutrient, index) => (
              <Text key={index}>
                {nutrient.name}: {nutrient.amount} {nutrient.unitName}
              </Text>
            ))}
        </View>
      );
    },
  },
];

const Drawer = createDrawerNavigator();

function TablePage() {
  const [loaded, error] = useFonts({
    "SF-Pro": require("../assets/fonts/SF-Pro-Display-Regular.otf"),
  });
  const [data, setData] = useState<Food[]>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchUsdaData("Foundation", 200, 1);
      setData(result);
    };
    fetchData();
  }, []);

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
          {table.getHeaderGroups().map((hg) => (
            <Table.Row key={hg.id}>
              {hg.headers.map((header) => (
                <Table.Header key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </Table.Header>
              ))}
            </Table.Row>
          ))}
        </Table.Head>
        <ScrollView>
          <Table.Body>
            {table.getRowModel().rows.map((row) => (
              <Table.Row key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </ScrollView>
      </Table>
    </View>
  );
}

export default function App() {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen name="Home" component={TablePage} />
    </Drawer.Navigator>
  );
}
