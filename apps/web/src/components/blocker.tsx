import { Block } from "@tanstack/react-router";

export default function BlockerComponent({
  formIsDirty,
}: {
  formIsDirty: boolean;
}) {
  return (
    <Block
      shouldBlockFn={() => formIsDirty}
      withResolver
    >
      {({ status, proceed, reset }) => (
        <>
          {status === "blocked" && (
            <div
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/50 text-center backdrop-blur dark:bg-gray-900/70"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="blocker-title"
              aria-describedby="blocker-description"
            >
              <p id="blocker-description">
                <span
                  className="font-semibold text-red-600 dark:text-red-400"
                  id="blocker-title"
                >
                  You have unsaved changes in the form.
                </span>{" "}
                <br />
                <span className="text-gray-900 dark:text-gray-100">
                  Are you sure you want to leave?
                </span>
              </p>
              <div className="mt-8 flex gap-4">
                <button
                  className="cursor-pointer rounded-md bg-red-600 px-4 py-1.5 text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 active:bg-red-800"
                  type="button"
                  onClick={proceed}
                >
                  Yes, leave
                </button>
                <button
                  className="cursor-pointer rounded-md bg-green-600 px-4 py-1.5 text-white hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 active:bg-green-800"
                  type="button"
                  onClick={reset}
                >
                  No, stay
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Block>
  );
}
