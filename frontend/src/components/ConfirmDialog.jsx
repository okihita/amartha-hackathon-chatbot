import { AlertTriangle } from 'lucide-preact';

export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) {
  return (
    <div class="modal-overlay" onClick={onCancel}>
      <div class="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div class="confirm-icon">
          <AlertTriangle size={48} />
        </div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div class="confirm-actions">
          <button class="btn btn-secondary" onClick={onCancel}>{cancelText}</button>
          <button class={`btn btn-${type}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
