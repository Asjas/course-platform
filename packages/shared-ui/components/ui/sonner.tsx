import { Toaster as Sonner, type ToasterProps, toast } from "sonner";

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      position="top-right"
      closeButton={true}
      richColors={true}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster, toast };
