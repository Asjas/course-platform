import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Card,
  CardAction,
  CardContentList,
  CardContentListItem,
  CardFooter,
  CardHeader,
  CardPrice,
} from "~/components/ui/card";
import { renderWithProviders } from "~/test-utils";

describe("Card", () => {
  it("renders composed card content and action link", async () => {
    await renderWithProviders(
      <Card>
        <CardHeader>Pro Plan</CardHeader>
        <CardPrice>$49</CardPrice>
        <CardContentList>
          <CardContentListItem>Unlimited courses</CardContentListItem>
          <CardContentListItem>Priority support</CardContentListItem>
        </CardContentList>
        <CardAction to="/signup">Get started</CardAction>
        <CardFooter>Cancel anytime</CardFooter>
      </Card>,
    );

    expect(
      screen.getByRole("heading", { name: "Pro Plan" }),
    ).toBeInTheDocument();
    expect(screen.getByText("$49")).toBeInTheDocument();
    expect(screen.getByText("Unlimited courses")).toBeInTheDocument();
    expect(screen.getByText("Priority support")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get started" })).toHaveAttribute(
      "href",
      "/signup",
    );
    expect(screen.getByText("Cancel anytime")).toBeInTheDocument();
  });
});
