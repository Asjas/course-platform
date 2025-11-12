import { Dialog, DialogPanel } from "@headlessui/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { MenuIcon, UserIcon, XIcon } from "lucide-react";
import { useState } from "react";
import {
  Menu,
  Button as MenuButton,
  MenuItem,
  MenuTrigger,
  Popover,
} from "react-aria-components";
import { toast } from "sonner";
import { NavLink } from "~/components/ui/nav-link";
import { authClient } from "~/lib/auth.client";
import type { AuthState } from "~/lib/auth.context";

export default function Header({ auth }: { auth: AuthState }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = auth.session?.user;

  return (
    <header className="fixed top-0 z-40 flex min-h-20 w-full flex-wrap items-center border-b border-gray-50/2 bg-gray-900/40 backdrop-blur transition-colors duration-300 hover:bg-gray-900/60">
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
                    className: "bg-gray-700 text-white dark:bg-gray-700",
                  }}
                  to="/"
                >
                  Home
                </NavLink>
              </li>
              <li className="relative inline-flex border-l border-gray-600 pl-2">
                <NavLink
                  preload="intent"
                  activeProps={{
                    className: "bg-gray-700 text-white dark:bg-gray-700",
                  }}
                  to="/support"
                >
                  Support
                </NavLink>
              </li>
              {auth.isAuthenticated ? (
                <li className="relative inline-flex border-l border-gray-600 pl-2">
                  <NavLink
                    preload="intent"
                    activeProps={{
                      className: "bg-gray-700 text-white dark:bg-gray-700",
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
                      className: "bg-gray-700 text-white dark:bg-gray-700",
                    }}
                    to="/chat"
                  >
                    Chat
                  </NavLink>
                </li>
              ) : null}
              {auth.isAuthenticated && auth.hasRole("admin") ? (
                <li className="relative inline-flex border-l border-gray-600 pl-2">
                  <NavLink
                    preload="intent"
                    activeProps={{
                      className: "bg-gray-700 text-white dark:bg-gray-700",
                    }}
                    to="/admin"
                  >
                    Admin
                  </NavLink>
                </li>
              ) : null}
            </ul>
          </div>
          <div className="flex lg:hidden">
            <button
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              type="button"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <MenuIcon
                aria-hidden="true"
                size={30}
                color="white"
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
              className="block h-9 w-[113px] rounded-sm"
              src="/codewizard.svg"
              alt="Codewizard Training"
            />
          </Link>
        </div>

        <div className="flex flex-1 justify-end">
          {auth.isAuthenticated && user ? (
            <MenuTrigger>
              <MenuButton aria-label="Menu">
                {user.image ? (
                  <img
                    className="size-10 rounded-full bg-gray-50 object-cover dark:bg-gray-800"
                    src={user.image}
                    alt="profile"
                  />
                ) : (
                  <UserIcon
                    className="hover:text-green-700"
                    size={28}
                  />
                )}
              </MenuButton>
              <Popover>
                <Menu className="rounded-md bg-gray-700 px-4 py-4">
                  <MenuItem
                    className="cursor-pointer rounded-sm px-2 py-1 hover:bg-gray-800"
                    onAction={() => navigate({ to: "/account" })}
                  >
                    Account
                  </MenuItem>
                  <MenuItem
                    className="cursor-pointer rounded-sm px-2 py-1 hover:bg-gray-800"
                    onAction={() => navigate({ to: "/profile" })}
                  >
                    Profile
                  </MenuItem>
                  <MenuItem
                    className="cursor-pointer rounded-sm px-2 py-1 hover:bg-gray-800"
                    onAction={() => navigate({ to: "/purchases" })}
                  >
                    Purchases
                  </MenuItem>
                  <MenuItem
                    className="cursor-pointer rounded-sm px-2 py-1 hover:bg-gray-800"
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
              </Popover>
            </MenuTrigger>
          ) : (
            <ul className="ml-4 flex space-x-2">
              <li className="relative inline-flex">
                <NavLink
                  className="bg-green-700"
                  preload="intent"
                  to="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </NavLink>
              </li>
              <li className="relative inline-flex">
                <NavLink
                  className="bg-green-700"
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

      <Dialog
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <DialogPanel className="fixed inset-y-0 top-0 z-40 min-h-20 w-full overflow-y-auto bg-gray-900 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-1">
              <button
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                type="button"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XIcon
                  aria-hidden="true"
                  size={30}
                  color="oklch(0.6321 0.18624607086546197 147.32407676948478)"
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
                  className="block h-9 w-[113px] rounded-sm"
                  src="/codewizard.svg"
                  alt="Codewizard Training"
                />
              </Link>
            </div>

            <div className="flex flex-1 justify-end">
              {auth.isAuthenticated ? (
                <div className="flex flex-1 justify-end">
                  {auth.isAuthenticated && user ? (
                    <MenuTrigger>
                      <MenuButton aria-label="Menu">
                        {user.image ? (
                          <img
                            className="size-10 rounded-full bg-gray-50 object-cover dark:bg-gray-800"
                            src={user.image}
                            alt="profile"
                          />
                        ) : (
                          <UserIcon
                            className="hover:text-green-700"
                            size={28}
                          />
                        )}
                      </MenuButton>
                      <Popover>
                        <Menu className="rounded-md bg-gray-700 px-4 py-4">
                          <MenuItem
                            className="cursor-pointer rounded-sm px-2 py-1 hover:bg-gray-800"
                            onAction={() => navigate({ to: "/account" })}
                          >
                            Account
                          </MenuItem>
                          <MenuItem
                            className="cursor-pointer rounded-sm px-2 py-1 hover:bg-gray-800"
                            onAction={() => navigate({ to: "/profile" })}
                          >
                            Profile
                          </MenuItem>
                          <MenuItem
                            className="cursor-pointer rounded-sm px-2 py-1 hover:bg-gray-800"
                            onAction={() => navigate({ to: "/purchases" })}
                          >
                            Purchases
                          </MenuItem>
                          <MenuItem
                            className="cursor-pointer rounded-sm px-2 py-1 hover:bg-gray-800"
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
                      </Popover>
                    </MenuTrigger>
                  ) : (
                    <NavLink
                      className="bg-green-700"
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
                  className="bg-green-700"
                  preload="intent"
                  to="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </NavLink>
              )}
            </div>
          </div>
          <div className="mt-20">
            <ul className="flex w-full flex-col space-y-2">
              <li>
                <NavLink
                  className="flex w-full"
                  preload="intent"
                  activeProps={{
                    className:
                      "bg-gray-700 flex w-full text-white dark:bg-gray-700",
                  }}
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  className="flex w-full"
                  preload="intent"
                  activeProps={{
                    className:
                      "bg-gray-700 flex w-full text-white dark:bg-gray-700",
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
                    className="flex w-full"
                    preload="intent"
                    activeProps={{
                      className: "bg-gray-700 text-white dark:bg-gray-700",
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
                    className="flex w-full"
                    preload="intent"
                    activeProps={{
                      className:
                        "bg-gray-700 flex flex-1 text-white dark:bg-gray-700",
                    }}
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Chat
                  </NavLink>
                </li>
              ) : null}
              {auth.isAuthenticated && auth.hasRole("admin") ? (
                <li>
                  <NavLink
                    className="flex w-full"
                    preload="intent"
                    activeProps={{
                      className:
                        "bg-gray-700 flex flex-1 text-white dark:bg-gray-700",
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
