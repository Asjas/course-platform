import { createFileRoute } from "@tanstack/react-router";
import ProfileForm from "~/components/forms/profile-form";

export const Route = createFileRoute("/_authenticated/profile")({
  component: AuthenticatedProfilePage,
});

function AuthenticatedProfilePage() {
  return (
    <div className="mx-auto mt-20 mb-20 max-w-7xl px-4 md:px-6 lg:px-8">
      <div className="mb-4 flex flex-col">
        <h1 className="text-2xl/9 font-semibold text-gray-900 dark:text-white">
          Profile
        </h1>
        <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
          This information will be displayed publicly so be careful what you
          share.
        </p>
      </div>
      <ProfileForm />
    </div>
  );
}
