import { AlertTriangleIcon, InfoIcon, TriangleAlertIcon } from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      closeButton={true}
      offset={{ top: "100px" }}
      richColors={true}
      position="top-right"
      mobileOffset={{ top: "20px" }}
      icons={{
        info: <InfoIcon />,
        warning: <AlertTriangleIcon />,
        error: <TriangleAlertIcon />,
      }}
      {...props}
    />
  );
};

export { Toaster };
