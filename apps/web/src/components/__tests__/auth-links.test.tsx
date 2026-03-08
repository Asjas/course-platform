import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AuthLinks from "~/components/auth-links";
import { renderWithProviders } from "~/test-utils";

describe("AuthLinks", () => {
  it("renders all links by default", async () => {
    await renderWithProviders(<AuthLinks />);
    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign Up" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Reset Password" }),
    ).toBeInTheDocument();
  });

  it("hides sign in link when showSignIn is false", async () => {
    await renderWithProviders(<AuthLinks showSignIn={false} />);
    expect(
      screen.queryByRole("link", { name: "Sign in" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign Up" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Reset Password" }),
    ).toBeInTheDocument();
  });

  it("hides sign up link when showSignUp is false", async () => {
    await renderWithProviders(<AuthLinks showSignUp={false} />);
    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Sign Up" }),
    ).not.toBeInTheDocument();
  });

  it("hides forgot password when showForgotPassword is false", async () => {
    await renderWithProviders(<AuthLinks showForgotPassword={false} />);
    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Reset Password" }),
    ).not.toBeInTheDocument();
  });

  it("renders no links when all are false", async () => {
    await renderWithProviders(
      <AuthLinks
        showSignIn={false}
        showSignUp={false}
        showForgotPassword={false}
      />,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders sign in link pointing to /signin", async () => {
    await renderWithProviders(<AuthLinks />);
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/signin",
    );
  });

  it("renders sign up link pointing to /signup", async () => {
    await renderWithProviders(<AuthLinks />);
    expect(screen.getByRole("link", { name: "Sign Up" })).toHaveAttribute(
      "href",
      "/signup",
    );
  });

  it("renders reset password link pointing to /reset-password", async () => {
    await renderWithProviders(<AuthLinks />);
    expect(
      screen.getByRole("link", { name: "Reset Password" }),
    ).toHaveAttribute("href", "/reset-password");
  });

  it("applies custom className", async () => {
    const { container } = await renderWithProviders(
      <AuthLinks className="custom-class" />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });
});
