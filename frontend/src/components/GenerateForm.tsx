import { DryRunResult } from "./DryRunResult";
import { Form, Field, ErrorMessage, useFormikContext } from "formik";
import { PinkValues } from "../types";
import { useEstimationContext } from "../contexts";
import { ChangeEvent, SetStateAction, useState } from "react";
import { NewUserGuide } from "./NewUserGuide";
import { useBalance, useExtension } from "useink";
import axios from "axios";
import { Buffer } from "buffer";
import { ContractType } from "../const";

export const GenerateForm = ({ setIsBusy, handleError }: { setIsBusy: Function, handleError: Function }) => {
  const { isSubmitting, isValid, values, setFieldTouched, handleChange } =
    useFormikContext<PinkValues>();
  const { estimation, isEstimating } = useEstimationContext();
  const { account, accounts } = useExtension();
  const [waitingHuggingFace, setWaitinghuggingFace] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [currentModel, setCurrentModel] = useState(values.aimodel);
  const balance = useBalance(account);
  const hasFunds =
    !balance?.freeBalance.isEmpty && !balance?.freeBalance.isZero();
  values.contractType = ContractType.PinkPsp34;

  const isOkToMint =
    !isEstimating &&
    estimation &&
    estimation.result &&
    "Ok" in estimation.result;

  const fetchImage = async () => {
    console.log("Create image using model:", values.aimodel);
    console.log(
      "ENV",
      process.env.REACT_APP_HUGGING_FACE_API_KEY ? "ok" : "not found"
    );
    console.log("prompt:", "pink robot, " + values.prompt);

    try {
      setIsBusy("Imagining your pink robot. This might take a while...");
      setWaitinghuggingFace(true);
      setIsGenerated(false);
      const response = await axios({
        url: values.aimodel,
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_HUGGING_FACE_API_KEY}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          inputs: "pink robot, " + values.prompt,
          options: { wait_for_model: true },
        }),
        responseType: "arraybuffer",
      });

      const contentType = response.headers["content-type"];
      console.log("------- response.data", response.data);
      // const base64ImageData = Buffer.from(response.data, 'binary').toString('base64');
      const base64data = Buffer.from(response.data).toString("base64");
      const aiImage = `data:${contentType};base64,` + base64data;
      values.aiImage = aiImage;
      console.log("aiImage", aiImage ? "generated" : "empty");
      setIsGenerated(true);
      values.imageData = response.data;
    } catch (error: any) {
      handleError(error.toString());
      console.error(error);
    } finally {
      setWaitinghuggingFace(false);
      setIsBusy("");
    }
  };

  const modelChanged = (e: { target: { value: SetStateAction<string> } }) => {
    console.log("modelChanged", e.target.value);
    values.aimodel = e.target.value.toString();
    setCurrentModel(values.aimodel);
  };

  return (
    <Form>
      <img
        src={values.aiImage}
        className="pink-example rounded-lg"
        alt="example"
      />

      <div className="group">
        <Field
          type="text"
          name="prompt"
          disabled={isSubmitting}
          placeholder="Short description of your robot"
          onChange={(e: ChangeEvent) => {
            setFieldTouched("prompt");
            handleChange(e);
          }}
        />
        <ErrorMessage name="prompt" component="div" className="error-message" />
      </div>
      <div className="group">
        <label htmlFor="aimodel">A.I. Model</label>
        <select
          name="aimodel"
          value={currentModel}
          onChange={modelChanged}
          style={{ display: "block" }}
        >
          <option
            value="https://api-inference.huggingface.co/models/Joeythemonster/anything-midjourney-v-4-1"
            label="Joeythemonster anything-midjourney v4.1"
          ></option>
          <option
            value="https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4"
            label="CompVis stable-diffusion v1.4"
          ></option>
          <option
            value="https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2"
            label="stabilityai stable-diffusion v2.0"
          ></option>
        </select>
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
