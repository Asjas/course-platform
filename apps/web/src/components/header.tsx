import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { MenuIcon, UserIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Button as MenuButton, MenuTrigger } from "react-aria-components";
import { toast } from "sonner";
import { NotificationsBell } from "~/components/notifications-bell";
import { ThemeToggle } from "~/components/theme-toggle";
import { Menu, MenuItem, MenuPopover } from "~/components/ui/menu";
import { NavLink } from "~/components/ui/nav-link";
import { authClient } from "~/lib/auth.client";
import type { AuthState } from "~/lib/auth.context";

export default function Header({ auth }: { auth: AuthState }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = auth.session?.user;
  const isImpersonating = !!auth.session?.session.impersonatedBy;

  return (
    <header className="fixed top-0 z-40 flex min-h-20 w-full flex-wrap items-center border-b border-gray-200 bg-white/80 backdrop-blur transition-colors duration-300 hover:bg-white/90 dark:border-gray-50/2 dark:bg-gray-900/40 dark:hover:bg-gray-900/60">
      <nav
        className="mx-auto flex flex-1 items-center justify-between px-4 md:px-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex flex-1 items-center">
          <div className="lg-gap-x-12 hidden lg:flex">
            <ul className="space-x-2 text-gray-700 lg:flex dark:text-gray-200">
              <li className="relative inline-flex">
                <NavLink
                  preload="intent"
                  activeProps={{
                    className:
                      "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white",
                  }}
                  to="/"
                >
                  Home
                </NavLink>
              </li>

              <li className="relative inline-flex border-l border-gray-300 pl-2 dark:border-gray-600">
                <NavLink
                  preload="intent"
                  activeProps={{
                    className:
                      "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white",
                  }}
                  to="/support"
                >
                  Support
                </NavLink>
              </li>

              {auth.isAuthenticated ? (
                <li className="relative inline-flex border-l border-gray-300 pl-2 dark:border-gray-600">
                  <NavLink
                    preload="intent"
                    activeProps={{
                      className:
                        "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white",
                    }}
                    to="/dashboard"
                  >
                    Dashboard
                  </NavLink>
                </li>
              ) : null}

              {auth.isAuthenticated ? (
                <li className="relative inline-flex">
                  <NavLink
                    preload="intent"
                    activeProps={{
                      className:
                        "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white",
                    }}
                    to="/chat"
                  >
                    Chat
                  </NavLink>
                </li>
              ) : null}

              {auth.isAuthenticated && auth.hasRole("admin") ? (
                <li className="relative inline-flex border-l border-gray-300 pl-2 dark:border-gray-600">
                  <NavLink
                    preload="intent"
                    activeProps={{
                      className:
                        "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white",
                    }}
                    to="/admin"
                  >
                    Admin
                  </NavLink>
                </li>
              ) : null}
            </ul>
          </div>

          <div className="flex text-gray-700 lg:hidden dark:text-gray-200">
            <button
              className="-m-2.5 inline-flex cursor-pointer items-center justify-center rounded-md p-2.5"
              type="button"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <MenuIcon
                color="currentColor"
                aria-hidden="true"
                size={30}
              />
            </button>
          </div>
        </div>

        <div>
          <Link
            className="text-lg font-bold text-gray-900 dark:text-gray-50"
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Codewizard Training"
          >
            <img
              className="block h-9 w-28.25 rounded-sm"
              src="/codewizard.svg"
              alt="Codewizard Training"
            />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <ThemeToggle />

          {auth.isAuthenticated && user ? (
            <>
              <NotificationsBell userId={user.id} />
              <MenuTrigger>
                <MenuButton aria-label="Menu">
                  {user.image ? (
                    <img
                      className="ml-2 size-10 cursor-pointer rounded-full bg-gray-50 object-cover dark:bg-gray-800"
                      src={user.image}
                      alt={`${user.name}'s profile`}
                    />
                  ) : (
                    <UserIcon
                      className="hover:text-green-700"
                      size={28}
                      aria-hidden="true"
                    />
                  )}
                </MenuButton>

                <MenuPopover>
                  <Menu>
                    <MenuItem onAction={() => navigate({ to: "/account" })}>
                      Account
                    </MenuItem>

                    <MenuItem onAction={() => navigate({ to: "/profile" })}>
                      Profile
                    </MenuItem>

                    <MenuItem onAction={() => navigate({ to: "/purchases" })}>
                      Purchases
                    </MenuItem>

                    {isImpersonating ? (
                      <MenuItem
                        onAction={async () => {
                          const { error } =
                            await authClient.admin.stopImpersonating();

                          if (error) {
                            toast.error(
                              `Failed to stop impersonating user: ${user.username || user.name}`,
                            );
                            console.error(error);

                            return;
                          }

                          toast.success(
                            `Stopped impersonating user: ${user.username || user.name}`,
                          );

                          navigate({
                            to: "/admin/users",
                            reloadDocument: true,
                          });
                        }}
                      >
                        Stop Impersonating
                      </MenuItem>
                    ) : null}

                    <MenuItem
                      onAction={async () => {
                        const { error } = await authClient.signOut();

                        if (error) {
                          toast.error(error.message || "Failed to logout");

                          return;
                        }

                        navigate({ to: "/" });
                      }}
                    >
                      Logout
                    </MenuItem>
                  </Menu>
                </MenuPopover>
              </MenuTrigger>
            </>
          ) : (
            <ul className="flex space-x-2">
              <li className="relative inline-flex">
                <NavLink
                  className="bg-green-700 text-white hover:bg-green-800"
                  preload="intent"
                  to="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </NavLink>
              </li>

              <li className="relative inline-flex">
                <NavLink
                  className="bg-green-700 text-white hover:bg-green-800"
                  preload="intent"
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </NavLink>
              </li>
            </ul>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      <Dialog
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <DialogBackdrop className="fixed inset-0 z-30 bg-black/30" />
        <DialogPanel className="fixed inset-0 z-40 min-h-20 w-full overflow-y-auto bg-gray-50 px-4 py-5 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex flex-1 text-green-600 dark:text-green-400">
              <button
                className="-m-2.5 cursor-pointer rounded-md p-2.5"
                type="button"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XIcon
                  color="currentColor"
                  aria-hidden="true"
                  size={30}
                />
              </button>
            </div>

            <div>
              <Link
                className="text-lg font-bold text-gray-900 dark:text-gray-50"
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Codewizard Training"
              >
                <img
                  className="block h-9 w-28.25 rounded-sm"
                  src="/codewizard.svg"
                  alt="Codewizard Training"
                />
              </Link>
            </div>

            <div className="flex flex-1 items-center justify-end gap-2">
              <ThemeToggle />

              {auth.isAuthenticated ? (
                <div className="flex items-center justify-end gap-2">
                  {user && <NotificationsBell userId={user.id} />}
                  {auth.isAuthenticated && user ? (
                    <MenuTrigger>
                      <MenuButton aria-label="Menu">
                        {user.image ? (
                          <img
                            className="ml-2 size-10 cursor-pointer rounded-full bg-gray-50 object-cover dark:bg-gray-800"
                            src={user.image}
                            alt={`${user.name}'s profile`}
                          />
                        ) : (
                          <UserIcon
                            className="hover:text-green-700"
                            size={28}
                            aria-hidden="true"
                          />
                        )}
                      </MenuButton>

                      <MenuPopover>
                        <Menu>
                          <MenuItem
                            onAction={() => navigate({ to: "/account" })}
                          >
                            Account
                          </MenuItem>

                          <MenuItem
                            onAction={() => navigate({ to: "/profile" })}
                          >
                            Profile
                          </MenuItem>

                          <MenuItem
                            onAction={() => navigate({ to: "/purchases" })}
                          >
                            Purchases
                          </MenuItem>

                          {isImpersonating ? (
                            <MenuItem
                              onAction={async () => {
                                const { error } =
                                  await authClient.admin.stopImpersonating();

                                if (error) {
                                  toast.error(
                                    `Failed to stop impersonating user: ${user.username || user.name}`,
                                  );
                                  console.error(error);

                                  return;
                                }

                                toast.success(
                                  `Stopped impersonating user: ${user.username || user.name}`,
                                );

                                navigate({
                                  to: "/admin/users",
                                  reloadDocument: true,
                                });
                              }}
                            >
                              Stop Impersonating
                            </MenuItem>
                          ) : null}

                          <MenuItem
                            onAction={async () => {
                              const { error } = await authClient.signOut();

                              if (error) {
                                toast.error(
                                  error.message || "Failed to logout",
                                );

                                return;
                              }

                              navigate({ to: "/" });
                            }}
                          >
                            Logout
                          </MenuItem>
                        </Menu>
                      </MenuPopover>
                    </MenuTrigger>
                  ) : (
                    <NavLink
                      className="bg-green-700 text-white hover:bg-green-800"
                      preload="intent"
                      to="/signin"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </NavLink>
                  )}
                </div>
              ) : (
                <NavLink
                  className="bg-green-700 text-white hover:bg-green-800"
                  preload="intent"
                  to="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </NavLink>
              )}
            </div>
          </div>

          <div className="mt-10">
            <ul className="flex w-full flex-col space-y-1">
              <li>
                <NavLink
                  className="flex w-full text-gray-700 dark:text-gray-200"
                  preload="intent"
                  activeProps={{
                    className:
                      "bg-gray-200 flex w-full text-gray-900 dark:bg-gray-700 dark:text-white",
                  }}
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </NavLink>
              </li>

              <li>
                <NavLink
                  className="flex w-full text-gray-700 dark:text-gray-200"
                  preload="intent"
                  activeProps={{
                    className:
                      "bg-gray-200 flex w-full text-gray-900 dark:bg-gray-700 dark:text-white",
                  }}
                  to="/support"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Support
                </NavLink>
              </li>

              {auth.isAuthenticated ? (
                <li>
                  <NavLink
                    className="flex w-full text-gray-700 dark:text-gray-200"
                    preload="intent"
                    activeProps={{
                      className:
                        "bg-gray-200 flex w-full text-gray-900 dark:bg-gray-700 dark:text-white",
                    }}
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </NavLink>
                </li>
              ) : null}

              {auth.isAuthenticated ? (
                <li>
                  <NavLink
                    className="flex w-full text-gray-700 dark:text-gray-200"
                    preload="intent"
                    activeProps={{
                      className:
                        "bg-gray-200 flex w-full text-gray-900 dark:bg-gray-700 dark:text-white",
                    }}
                    to="/chat"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Chat
                  </NavLink>
                </li>
              ) : null}

              {auth.isAuthenticated && auth.hasRole("admin") ? (
                <li>
                  <NavLink
                    className="flex w-full text-gray-700 dark:text-gray-200"
                    preload="intent"
                    activeProps={{
                      className:
                        "bg-gray-200 flex w-full text-gray-900 dark:bg-gray-700 dark:text-white",
                    }}
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </NavLink>
                </li>
              ) : null}
            </ul>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
