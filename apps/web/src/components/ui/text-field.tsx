import { useFieldContext } from "~/lib/form.context";

export function TextField({ label }: { label: string }) {
  const field = useFieldContext<string>();

  return (
    <label>
      <span>{label}</span>
      <input
        type="text"
        value={field.state.value}
        onChange={(event) => field.handleChange(event.target.value)}
        onBlur={field.handleBlur}
      />
    </label>
  );
}
