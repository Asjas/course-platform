import { createFileRoute } from "@tanstack/react-router";
import ProfileForm from "~/components/profile-form.tsx";

export const Route = createFileRoute("/_authenticated/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto mt-20 max-w-7xl px-4 md:px-6 lg:px-8">
      <div className="mb-4 flex flex-col">
        <h1 className="text-2xl/9 font-semibold text-white">Profile</h1>
        <p className="mt-1 text-sm/6 text-gray-400">
          This information will be displayed publicly so be careful what you
          share.
        </p>
      </div>
      <ProfileForm />
    </div>
  );
}
