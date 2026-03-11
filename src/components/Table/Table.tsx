import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import vars from "../../theme/vars";

const styles = StyleSheet.create({
  table: {
    margin: 10,
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: vars.colors.border.primary,
  },
  cell: {
    flex: 1,
    padding: 10,
    textAlign: "center",
  },
  header: {
    flex: 1,
    padding: 10,
    textAlign: "center",
    textTransform: "lowercase",
    fontWeight: "bold",
    color: vars.colors.surface.secondary,
    borderTopWidth: 1,
    borderTopColor: vars.colors.border.primary,
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
