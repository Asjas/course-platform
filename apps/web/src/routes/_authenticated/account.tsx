import { createFileRoute } from "@tanstack/react-router";
import ChangeEmailForm from "~/components/forms/change-email-form";
import ChangePasswordForm from "~/components/forms/change-password-form";
import DeleteAccountForm from "~/components/forms/delete-account-form";

export const Route = createFileRoute("/_authenticated/account")({
  component: AuthenticatedAccountPage,
});

function AuthenticatedAccountPage() {
  return (
    <div className="mx-auto mt-20 w-full max-w-7xl px-4 md:px-6 lg:px-8">
      <h1 className="text-2xl/9 font-semibold text-white">
        Account Management
      </h1>
      <p className="mt-1 text-sm/6 text-gray-400">
        Manage your account email and password.
      </p>
      <div className="flex flex-col justify-between gap-2 md:flex-row md:gap-8">
        <ChangePasswordForm />
        <ChangeEmailForm />
      </div>
      <hr />
      <div className="mt-10">
        <DeleteAccountForm />
      </div>
    </div>
  );
}
