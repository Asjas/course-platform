import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AuthLinks from "~/components/auth-links";

vi.mock("~/components/ui/nav-link", () => ({
  Link: ({
    children,
    to,
    className,
  }: {
    children: React.ReactNode;
    to: string;
    className?: string;
  }) => (
    <a
      className={className}
      href={to}
    >
      {children}
    </a>
  ),
}));

describe("AuthLinks", () => {
  it("renders all links by default", () => {
    render(<AuthLinks />);
    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign Up" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Reset Password" }),
    ).toBeInTheDocument();
  });

  it("hides sign in link when showSignIn is false", () => {
    render(<AuthLinks showSignIn={false} />);
    expect(
      screen.queryByRole("link", { name: "Sign in" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign Up" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Reset Password" }),
    ).toBeInTheDocument();
  });

  it("hides sign up link when showSignUp is false", () => {
    render(<AuthLinks showSignUp={false} />);
    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Sign Up" }),
    ).not.toBeInTheDocument();
  });

  it("hides forgot password when showForgotPassword is false", () => {
    render(<AuthLinks showForgotPassword={false} />);
    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Reset Password" }),
    ).not.toBeInTheDocument();
  });

  it("renders no links when all are false", () => {
    render(
      <AuthLinks
        showSignIn={false}
        showSignUp={false}
        showForgotPassword={false}
      />,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders sign in link pointing to /signin", () => {
    render(<AuthLinks />);
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/signin",
    );
  });

  it("renders sign up link pointing to /signup", () => {
    render(<AuthLinks />);
    expect(screen.getByRole("link", { name: "Sign Up" })).toHaveAttribute(
      "href",
      "/signup",
    );
  });

  it("renders reset password link pointing to /reset-password", () => {
    render(<AuthLinks />);
    expect(
      screen.getByRole("link", { name: "Reset Password" }),
    ).toHaveAttribute("href", "/reset-password");
  });

  it("applies custom className", () => {
    const { container } = render(<AuthLinks className="custom-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });
});
