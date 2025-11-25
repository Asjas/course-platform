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
            <div className="bg-opacity-50 fixed inset-0 z-50 flex flex-col items-center justify-center text-center backdrop-blur">
              <p>
                <span className="text-red-600">
                  You have unsaved changes in the form.
                </span>{" "}
                <br /> Are you sure you want to leave?
              </p>
              <div className="mt-8 flex gap-4">
                <button
                  className="rounded-md bg-red-600 px-4 py-1.5 text-white hover:bg-white hover:text-red-600 active:bg-red-700"
                  type="button"
                  onClick={proceed}
                >
                  Yes
                </button>
                <button
                  className="rounded-md bg-green-600 px-4 py-1.5 text-white hover:bg-white hover:text-green-600 active:bg-green-700"
                  type="button"
                  onClick={reset}
                >
                  No
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Block>
  );
}
