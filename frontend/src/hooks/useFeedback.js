import { useState } from 'preact/hooks';

export function useFeedback() {
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const showConfirm = (config) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        ...config,
        onConfirm: () => {
          setConfirmDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(null);
          resolve(false);
        }
      });
    });
  };

  return {
    toast,
    confirmDialog,
    showToast,
    showConfirm,
    clearToast: () => setToast(null)
  };
}
