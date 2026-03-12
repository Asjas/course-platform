import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SyncStatusIndicator } from "~/components/SyncStatusIndicator";
import type { CollectionSyncStatus } from "~/components/SyncStatusIndicator";

function makeStatus(
  overrides: Partial<CollectionSyncStatus> = {},
): CollectionSyncStatus {
  return {
    name: "test",
    displayName: "Test Collection",
    isConnected: false,
    isSyncing: false,
    lastSyncedAt: null,
    pendingUpdates: 0,
    error: null,
    ...overrides,
  };
}

describe("SyncStatusIndicator", () => {
  it("trigger button shows 'sync status: disconnected' for disconnected collections", () => {
    render(<SyncStatusIndicator collections={[makeStatus()]} />);
    expect(
      screen.getByRole("button", { name: /sync status.*disconnected/i }),
    ).toBeInTheDocument();
  });

  it("trigger button shows 'sync status: connected' for connected collections", () => {
    render(
      <SyncStatusIndicator collections={[makeStatus({ isConnected: true })]} />,
    );
    expect(
      screen.getByRole("button", { name: /sync status.*connected/i }),
    ).toBeInTheDocument();
  });

  it("shows error badge '!' when any collection has an error", () => {
    render(
      <SyncStatusIndicator
        collections={[makeStatus({ error: new Error("fail") })]}
      />,
    );
    expect(screen.getByText("!")).toBeInTheDocument();
  });

  it("does not show error badge when no collection has an error", () => {
    render(<SyncStatusIndicator collections={[makeStatus()]} />);
    expect(screen.queryByText("!")).not.toBeInTheDocument();
  });

  it("shows pending updates badge with count when pendingUpdates > 0", () => {
    render(
      <SyncStatusIndicator collections={[makeStatus({ pendingUpdates: 3 })]} />,
    );
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("clicking trigger opens popover showing 'Sync Status' heading and collection name", async () => {
    const user = userEvent.setup();
    render(
      <SyncStatusIndicator
        collections={[
          makeStatus({ displayName: "My Collection", isConnected: true }),
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /sync status/i }));

    expect(
      await screen.findByRole("heading", { name: "Sync Status" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("My Collection")).toBeInTheDocument();
  });

  it("shows '1/2 connected' badge in popover header", async () => {
    const user = userEvent.setup();
    const collections = [
      makeStatus({ name: "a", displayName: "Alpha", isConnected: true }),
      makeStatus({ name: "b", displayName: "Beta", isConnected: false }),
    ];
    render(<SyncStatusIndicator collections={collections} />);

    await user.click(screen.getByRole("button", { name: /sync status/i }));

    expect(await screen.findByText("1/2 connected")).toBeInTheDocument();
  });

  it("connected collections show 'Connected' status text in popover", async () => {
    const user = userEvent.setup();
    render(
      <SyncStatusIndicator
        collections={[
          makeStatus({
            name: "c",
            displayName: "ConnectedColl",
            isConnected: true,
          }),
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /sync status/i }));

    expect(await screen.findByText("Connected")).toBeInTheDocument();
  });

  it("clicking 'Offline' tab shows disconnected collections", async () => {
    const user = userEvent.setup();
    const collections = [
      makeStatus({ name: "x", displayName: "OnlineColl", isConnected: true }),
      makeStatus({ name: "y", displayName: "OfflineColl", isConnected: false }),
    ];
    render(<SyncStatusIndicator collections={collections} />);

    await user.click(screen.getByRole("button", { name: /sync status/i }));

    // Click the Offline tab
    const offlineTab = await screen.findByRole("tab", { name: /offline/i });
    await user.click(offlineTab);

    expect(await screen.findByText("OfflineColl")).toBeInTheDocument();
  });

  it("shows 'syncing' status when a collection is syncing", () => {
    render(
      <SyncStatusIndicator collections={[makeStatus({ isSyncing: true })]} />,
    );
    expect(
      screen.getByRole("button", { name: /sync status.*syncing/i }),
    ).toBeInTheDocument();
  });

  it("shows 'error' status when a collection has an error", () => {
    render(
      <SyncStatusIndicator
        collections={[makeStatus({ error: new Error("oops") })]}
      />,
    );
    expect(
      screen.getByRole("button", { name: /sync status.*error/i }),
    ).toBeInTheDocument();
  });
});
