import vars from "@/app/vars";
import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
  table: {
    margin: 10,
    borderWidth: 1,
    borderColor: vars.colors.border.primary,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    height: "100%",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: vars.colors.border.primary,
  },
  cell: {
    flex: 1, // Distributes space evenly
    padding: 10,
    textAlign: "center",
    borderColor: vars.colors.border.primary,
    borderRadius: 12,
  },
  header: {
    flex: 1, // Distributes space evenly
    padding: 10,
    textAlign: "center",
    fontWeight: "bold",
    backgroundColor: vars.colors.surface.secondary,
    color: vars.colors.text.secondary,
  },
});

interface CellProps {
  children: ReactNode;
}

const Cell = ({ children }: CellProps) => {
  return <View style={styles.cell}>{children}</View>;
};

interface RowProps {
  children: ReactNode;
}

const Row = ({ children }: RowProps) => {
  return <View style={styles.row}>{children}</View>;
};

const Header = ({ children }: RowProps) => {
  return <Text style={styles.header}>{children}</Text>;
};

const Head = ({ children }: RowProps) => {
  return <View>{children}</View>;
};

const Body = ({ children }: RowProps) => {
  return <View>{children}</View>;
};

interface TableProps {
  children: ReactNode;
}

const Table = ({ children }: TableProps) => {
  return <View style={styles.table}>{children}</View>;
};

const _Table = Object.assign(Table, {
  Row,
  Cell,
  Header,
  Head,
  Body,
});

export default _Table;
