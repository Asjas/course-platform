import type {
  FieldValidateOrFn,
  UnwrapFieldValidateOrFn,
  UnwrapOneLevelOfArray,
  Updater,
} from "@tanstack/react-form";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { ZodEmail, ZodObject } from "zod";
import type { $strip } from "zod/v4/core";
import { cn } from "~/lib/utils";

interface IFormInput {
  id: string;
  type: string;
  placeholder?: string;
  autoComplete: string;
  required?: boolean;
  errorType: string;
  state: {
    value: string;
    meta: {
      errors: UnwrapOneLevelOfArray<
        UnwrapFieldValidateOrFn<
          "email",
          FieldValidateOrFn<{ email: string }, "email", string> | undefined,
          ZodObject<{ email: ZodEmail }, $strip>
        >
      >[];
    };
  };
  handleChange: (updater: Updater<string>) => void;
  handleBlur?: () => void;
}

interface ICheckboxInput {
  id: string;
  value: boolean;
  handleChange: (updater: Updater<boolean>) => void;
}

function Input({
  id,
  type,
  placeholder,
  autoComplete,
  required,
  errorType,
  state,
  handleChange,
  handleBlur,
}: IFormInput) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <div className="relative">
        <input
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            state.meta.errors.length > 0 &&
              "ring-destructive/20 dark:ring-destructive/40 border-destructive",
          )}
          id={id}
          type={showPassword ? "text" : type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={state.value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          aria-invalid={state.meta.errors.length > 0 ? "true" : "false"}
          aria-describedby={
            state.meta.errors.length > 0 ? errorType : undefined
          }
          required={required}
        />

        {/* Show Password Button */}
        {type === "password" ? (
          <button
            className="text-muted-foreground focus-visible:ring-ring hover:text-foreground absolute top-1/2 right-0 -translate-y-1/2 rounded-md p-1 transition-colors hover:bg-gray-400 focus-visible:ring-2 focus-visible:outline-none"
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        ) : null}
      </div>

      {/* Input Errors */}
      {state.meta.errors.length > 0 && (
        <div
          className="text-sm text-red-600"
          id={errorType}
        >
          {state.meta.errors.map((error) => error?.message).join(", ")}
        </div>
      )}
    </>
  );
}

function CheckboxInput({ id, value, handleChange }: ICheckboxInput) {
  return (
    <input
      className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300"
      id={id}
      type="checkbox"
      checked={value}
      onChange={(e) => handleChange(e.target.checked)}
    />
  );
}

export { Input, CheckboxInput };
