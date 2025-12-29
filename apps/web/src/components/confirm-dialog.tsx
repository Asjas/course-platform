import {
  Button,
  Dialog,
  Heading,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import { cn } from "~/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: ConfirmDialogProps) {
  function handleConfirm() {
    onConfirm();
    onOpenChange(false);
  }

  function handleCancel() {
    onOpenChange(false);
  }

  return (
    <ModalOverlay
      className="fixed inset-0 z-50 flex min-h-full items-center justify-center overflow-y-auto bg-black/50 p-4 text-center"
      isOpen={open}
      onOpenChange={onOpenChange}
      isDismissable
    >
      <Modal className="w-full max-w-md overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl dark:bg-gray-800">
        <Dialog className="relative flex flex-col gap-4 p-6 outline-none">
          {({ close }) => (
            <>
              <Heading
                className="text-lg leading-6 font-semibold text-gray-900 dark:text-white"
                slot="title"
              >
                {title}
              </Heading>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {description}
              </p>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  className="h-10 cursor-pointer rounded-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-800"
                  onPress={() => {
                    handleCancel();
                    close();
                  }}
                >
                  {cancelText}
                </Button>
                <Button
                  className={cn(
                    "h-10 cursor-pointer rounded-md px-3 py-2 text-sm font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2",
                    variant === "destructive"
                      ? "bg-red-600 hover:bg-red-700 focus-visible:outline-red-600 active:bg-red-800 dark:bg-red-700 dark:hover:bg-red-800"
                      : "bg-green-600 hover:bg-green-700 focus-visible:outline-green-600 active:bg-green-800",
                  )}
                  onPress={() => {
                    handleConfirm();
                    close();
                  }}
                >
                  {confirmText}
                </Button>
              </div>
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
