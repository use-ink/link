import { DryRunResult } from "./DryRunResult";
import { Form, Field, ErrorMessage, useFormikContext } from "formik";
import { PinkValues, ContractType, AiStyles } from "../types";
import { useEstimationContext } from "../contexts";
import { ChangeEvent, useState } from "react";
import { NewUserGuide } from "./NewUserGuide";
import { useBalance, useExtension } from "useink";
import axios from "axios";
import { Buffer } from "buffer";
import { ModelSelector } from "./ModelSelector";
import { StyleSelector } from "./StyleSelector";

export const GenerateForm = ({ setIsBusy, handleError }: { setIsBusy: Function, handleError: Function }) => {
  const { isSubmitting, isValid, values, setFieldTouched, handleChange } =
    useFormikContext<PinkValues>();
  const { estimation, isEstimating } = useEstimationContext();
  const { account, accounts } = useExtension();
  const [waitingHuggingFace, setWaitingHuggingFace] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const balance = useBalance(account);
  const hasFunds =
    !balance?.freeBalance.isEmpty && !balance?.freeBalance.isZero();
  values.contractType = ContractType.PinkPsp34;

  const isOkToMint =
    !isEstimating &&
    estimation &&
    estimation.result &&
    "Ok" in estimation.result;

  const composePrompt = () => {
    const prompt = 
      "pink robot, " + 
      values.aiStyle +
      values.prompt
      ;
    return prompt
  }

  const fetchImage = async () => {
    console.log("Create image using model:", values.aiModel);
    console.log(
      "ENV",
      process.env.REACT_APP_HUGGING_FACE_API_KEY ? "ok" : "not found"
    );
    const prompt = composePrompt();
    console.log("prompt:", prompt);

    try {
      setIsBusy("Imagining your pink robot. This might take a while...");
      setWaitingHuggingFace(true);
      setIsGenerated(false);
      const response = await axios({
        url: values.aiModel,
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_HUGGING_FACE_API_KEY}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          inputs: prompt,
          options: { wait_for_model: true },
        }),
        responseType: "arraybuffer",
      });

      const contentType = response.headers["content-type"];
      console.log("------- response.data", response.data);
      // const base64ImageData = Buffer.from(response.data, 'binary').toString('base64');
      const base64data = Buffer.from(response.data).toString("base64");
      const aiImage = `data:${contentType};base64,` + base64data;
      values.displayImage[values.contractType] = aiImage;
      console.log("aiImage", aiImage ? "generated" : "empty");
      setIsGenerated(true);
      values.imageData[values.contractType] = response.data;
    } catch (error: any) {
      handleError(error.toString());
      console.error(error);
    } finally {
      setWaitingHuggingFace(false);
      setIsBusy("");
    }
  };

  return (
    <Form>
      <img
        src={values.displayImage[values.contractType]}
        className="pink-example rounded-lg"
        alt="example"
      />

      <div className="group">
        <Field
          type="text"
          name="prompt"
          disabled={isSubmitting}
          placeholder="Pink robot as a..."
          onChange={(e: ChangeEvent) => {
            setFieldTouched("prompt");
            handleChange(e);
          }}
        />
        <ErrorMessage name="prompt" component="div" className="error-message" />
      </div>
      <div className="group">
        <StyleSelector values={values} />
      </div>
      <div className="group">
        <ModelSelector values={values} />
      </div>
      <div className="buttons-container">
        <div className="group">
          <button
            type="button"
            onClick={fetchImage}
            disabled={
              waitingHuggingFace ||
              isSubmitting ||
              !isValid ||
              !accounts ||
              !hasFunds
            }
          >
            Imagine New
          </button>
        </div>
        <div className="group">
          <button
            type="submit"
            disabled={
              !isGenerated ||
              waitingHuggingFace ||
              isSubmitting ||
              !isOkToMint ||
              !isValid ||
              !accounts ||
              !hasFunds
            }
            name="submit"
          >
            Mint
          </button>
        </div>
      </div>

      <div className="group">
        {isGenerated && isValid && values.prompt && !isSubmitting && (
          <DryRunResult values={values} isValid={isValid} />
        )}
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
