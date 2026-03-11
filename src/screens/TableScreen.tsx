import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import Chip from "../components/Chip";
import Table from "../components/Table";
import { Food, Nutrient } from "../services/usda/types";
import { fetchUsdaData } from "../services/usda/usda";
import vars from "../theme/vars";

const VISIBLE_NUTRIENTS = ["Energy", "Sucrose", "Fructose", "Lactose"];
const NUTRIENT_COLOR_MAP: Record<string, string> = {
  Energy: vars.colors.base.red,
  Sucrose: vars.colors.base.orange,
  Fructose: vars.colors.base.blue,
  Lactose: vars.colors.base.green,
};

const columns = [
  {
    accessorKey: "fdcId",
    header: "ID",
    cell: ({ getValue }: { getValue: () => number }) => {
      return <Text style={{ textAlign: "center" }}>{getValue()}</Text>;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ getValue }: { getValue: () => string }) => {
      const rawValue = getValue();
      const elements = rawValue.split(",").map((part) => part.trim());
      return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {elements.map((element, index) => {
            const color = vars.colors.base.red;
            return (
              <Chip key={index} color={color}>
                {element}
              </Chip>
            );
          })}
        </View>
      );
    },
  },
  {
    accessorKey: "foodNutrients",
    header: "Nutrients",
    cell: ({ getValue }: { getValue: () => Nutrient[] }) => {
      const nutrients = getValue();
      return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {nutrients
            .filter(
              (nutrient) =>
                VISIBLE_NUTRIENTS.includes(nutrient.name) &&
                nutrient.amount > 0,
            )
            .sort((n1, n2) => n1.name.localeCompare(n2.name))
            .map((nutrient, index) => (
              <Chip key={index} color={NUTRIENT_COLOR_MAP[nutrient.name]}>
                {nutrient.name}: {nutrient.amount}
                {nutrient.unitName}
              </Chip>
            ))}
        </View>
      );
    },
  },
];

export default function TableScreen() {
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
