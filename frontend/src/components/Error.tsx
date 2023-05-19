import styled from "@emotion/styled";
import { Snackbar, Alert } from "@mui/material";

interface AlertProps {
  message: string;
  open: boolean;
  onClose: () => void;
}

const ErrorContainer = styled.div`
  button {
    background-color: transparent;
    padding: 2px;
    color: rgb(95, 33, 32);
    margin-top: 2px;

    svg {
      width: 20px;
    }
  }
`;

export const Error = ({ message, open, onClose }: AlertProps) => {
  return (
    <ErrorContainer>
      <Snackbar
        open={open}
        autoHideDuration={8000}
        onClose={onClose}
        key="bottomcenter"
      >
        <Alert onClose={onClose} severity="error">
          {message}{" "}
        </Alert>
      </Snackbar>
    </ErrorContainer>
  );
};
