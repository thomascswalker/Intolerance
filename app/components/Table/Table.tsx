import { ReactNode } from "react";

interface CellProps {
  children: ReactNode;
}

const Cell = ({ children }: CellProps) => {
  return <td>{children}</td>;
};

interface RowProps {
  children: ReactNode;
}

const Row = ({ children }: RowProps) => {
  return <tr>{children}</tr>;
};

const Header = ({ children }: RowProps) => {
  return <th>{children}</th>;
};

const Head = ({ children }: RowProps) => {
  return <thead>{children}</thead>;
};

const Body = ({ children }: RowProps) => {
  return <tbody>{children}</tbody>;
};

interface TableProps {
  children: ReactNode;
}

const Table = ({ children }: TableProps) => {
  return <table>{children}</table>;
};

const _Table = Object.assign(Table, {
  Row,
  Cell,
  Header,
  Head,
  Body,
});

export default _Table;
