import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { TextField } from "~/components/ui/text-field.tsx";

export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField },
  formComponents: {},
});
