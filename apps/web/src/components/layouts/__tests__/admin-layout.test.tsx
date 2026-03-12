import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AdminLayout from "~/components/layouts/admin-layout";
import { renderWithProviders } from "~/test-utils";

describe("AdminLayout", () => {
  it("renders admin navigation links and provided content", async () => {
    await renderWithProviders(
      <AdminLayout>
        <h1>Admin page content</h1>
      </AdminLayout>,
    );

    expect(
      screen.getByRole("navigation", { name: "Admin navigation" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Stats" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Users" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Coupons" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Courses" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reviews" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Announcements" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Chat Reports" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Audit Logs" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Admin page content")).toBeInTheDocument();
  });

  it("renders the new Enrollments nav link", async () => {
    await renderWithProviders(
      <AdminLayout>
        <p>Content</p>
      </AdminLayout>,
    );

    expect(
      screen.getByRole("link", { name: "Enrollments" }),
    ).toBeInTheDocument();
  });

  it("renders the new Early Signups nav link", async () => {
    await renderWithProviders(
      <AdminLayout>
        <p>Content</p>
      </AdminLayout>,
    );

    expect(
      screen.getByRole("link", { name: "Early Signups" }),
    ).toBeInTheDocument();
  });

  it("renders the new Progress nav link", async () => {
    await renderWithProviders(
      <AdminLayout>
        <p>Content</p>
      </AdminLayout>,
    );

    expect(screen.getByRole("link", { name: "Progress" })).toBeInTheDocument();
  });

  it("exposes the main content landmark and skip target id", async () => {
    await renderWithProviders(
      <AdminLayout>
        <p>Body</p>
      </AdminLayout>,
    );

    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "maincontent");
    expect(main).toHaveTextContent("Body");
  });
});
