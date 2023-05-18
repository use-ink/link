import { Snackbar, Alert } from "@mui/material";

interface AlertProps {
  message: string;
  open: boolean;
  onClose: () => void;
}

export const Error = ({ message, open, onClose }: AlertProps) => {
  return (
    <Snackbar open={open} autoHideDuration={8000} onClose={onClose} key='bottomcenter'>
      <Alert onClose={onClose} severity="error">
        {message}{" "}
      </Alert>
    </Snackbar>
  );
};
