"use client";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
  isDestructive?: boolean;
}

export function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", onClose, onConfirm, isDestructive }: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{message}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color={isDestructive ? "error" : "primary"} variant="contained" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
