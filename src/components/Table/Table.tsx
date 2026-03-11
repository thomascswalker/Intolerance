import { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
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
    borderTopWidth: 1,
    borderTopColor: vars.colors.border.primary,
  },
  headerText: {
    textAlign: "center",
    textTransform: "lowercase",
    fontWeight: "bold",
    color: vars.colors.surface.secondary,
  },
});

interface CellProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

const Cell = ({ children, style }: CellProps) => {
  return <View style={[styles.cell, style]}>{children}</View>;
};

interface RowProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

const Row = ({ children, style }: RowProps) => {
  return <View style={[styles.row, style]}>{children}</View>;
};

const Header = ({ children, style }: RowProps) => {
  return (
    <View style={[styles.header, style]}>
      <Text style={styles.headerText}>{children}</Text>
    </View>
  );
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
