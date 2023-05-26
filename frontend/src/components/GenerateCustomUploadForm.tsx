import { DryRunResult } from "./DryRunResult";
import { Form, ErrorMessage, useFormikContext } from "formik";
import { PinkValues, ContractType } from "../types";
import { useEstimationContext } from "../contexts";
import React, { useState } from "react";
import { NewUserGuide } from "./NewUserGuide";
import { useBalance, useExtension } from "useink";
import { IconButton } from "@mui/material";
import { CameraIcon } from "@heroicons/react/solid";

export const GenerateCustomUploadForm = ({
  setIsBusy,
  handleError,
}: {
  setIsBusy: Function;
  handleError: Function;
}) => {
  const { isSubmitting, isValid, values } = useFormikContext<PinkValues>();
  const { estimation, isEstimating } = useEstimationContext();
  const { account, accounts } = useExtension();
  const [isUploaded, setIsUploaded] = useState(false);
  const balance = useBalance(account);
  const hasFunds =
    !balance?.freeBalance.isEmpty && !balance?.freeBalance.isZero();
  values.contractType = ContractType.CustomUpload34;

  const isOkToMint =
    !isEstimating &&
    estimation &&
    estimation.result &&
    "Ok" in estimation.result;

  const handleCustomImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsUploaded(false);
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      values.displayImage[values.contractType] =
        reader.result?.toString() || "";
      setIsUploaded(true);
    };
    reader.onerror = (error) => {
      console.error(error);
      handleError(error.toString());
    };
  };

  return (
    <Form>
      <img
        src={values.displayImage[values.contractType]}
        className="pink-example rounded-lg"
        alt="example"
      />
      <div className="group">
        <IconButton
          style={{ color: "rgba(209, 209, 219)" }}
          aria-label="upload picture"
          component="label"
          size="small"
        >
          <input
            name="fileUpload"
            hidden
            accept="image/*"
            type="file"
            onChange={handleCustomImageUpload}
          />
          <CameraIcon className="h-8 w-8" />
          <span style={{ marginLeft: '8px' }}>Select an image</span>
        </IconButton>
        <ErrorMessage
          name="fileUpload"
          component="div"
          className="error-message"
        />
      </div>
      {/* <div className="buttons-container"> */}
      <div className="group">
        <button
          type="submit"
          disabled={
            !isUploaded || isSubmitting || !isOkToMint || !accounts || !hasFunds
          }
          name="submit"
        >
          Mint
        </button>
      </div>
      {/* </div> */}
      <div className="group">
        <DryRunResult values={values} isValid={isUploaded} />
      </div>
      {isValid && estimation?.error && !isEstimating && (
        <div className="text-xs text-left mb-2 text-red-500">
          {estimation.error.message}
        </div>
      )}
      <div className="group">
        <NewUserGuide
          hasAccounts={!!accounts && accounts.length > 0}
          hasFunds={hasFunds}
          walletConnected={!!account}
        />
      </div>
    </Form>
  );
};
