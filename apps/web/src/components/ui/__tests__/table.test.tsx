import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Table,
  TableBody,
  TableBodyCell,
  TableBodyRow,
  TableCaption,
  TableHeader,
  TableHeaderCell,
  TableHeaderRow,
} from "~/components/ui/table";
import { renderWithProviders } from "~/test-utils";

describe("Table", () => {
  it("renders caption, headers, rows, and body cells with semantic roles", async () => {
    await renderWithProviders(
      <Table aria-label="User table">
        <TableCaption>User records</TableCaption>
        <TableHeader>
          <TableHeaderRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Role</TableHeaderCell>
          </TableHeaderRow>
        </TableHeader>
        <TableBody>
          <TableBodyRow>
            <TableBodyCell>Ari</TableBodyCell>
            <TableBodyCell>Admin</TableBodyCell>
          </TableBodyRow>
        </TableBody>
      </Table>,
    );

    const table = screen.getByRole("table", { name: "User table" });
    expect(table).toBeInTheDocument();
    expect(within(table).getByText("User records")).toBeInTheDocument();
    expect(
      within(table).getByRole("columnheader", { name: "Name" }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("columnheader", { name: "Role" }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("cell", { name: "Ari" }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("cell", { name: "Admin" }),
    ).toBeInTheDocument();
  });

  it("supports row header scope when requested", async () => {
    await renderWithProviders(
      <Table aria-label="Scoped table">
        <TableHeader>
          <TableHeaderRow>
            <TableHeaderCell scope="row">Row label</TableHeaderCell>
          </TableHeaderRow>
        </TableHeader>
      </Table>,
    );

    expect(
      screen.getByRole("rowheader", { name: "Row label" }),
    ).toBeInTheDocument();
  });
});
