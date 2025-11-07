import { useFieldContext } from "~/lib/form.context";

export function NumberField({ label }: { label: string }) {
  const field = useFieldContext<number>();

  return (
    <label>
      <span>{label}</span>
      <input
        type="number"
        value={field.state.value}
        onChange={(event) => field.handleChange(event.target.valueAsNumber)}
        onBlur={field.handleBlur}
      />
    </label>
  );
}
