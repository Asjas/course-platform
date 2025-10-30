import type { AnyFieldApi } from "@tanstack/react-form";

export default function FieldInfo({ field }: { field: AnyFieldApi }) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const meta = field.state.meta;

  return (
    <>
      {isInvalid ? (
        <em className="ml-6 text-sm/6 text-red-600">
          {meta.errors.map((error) => error.message).join(", ")}
        </em>
      ) : null}
      {meta.isValidating ? "Validating..." : null}
    </>
  );
}
