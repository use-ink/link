import { DryRunResult } from "./DryRunResult";
import { Form, Field, ErrorMessage, useFormikContext } from "formik";
import { PinkValues } from "../types";
import { useEstimationContext } from "../contexts";
import { ChangeEvent, useState } from "react";
import { NewUserGuide } from "./NewUserGuide";
import { useBalance, useExtension } from "useink";
import robot_bestia from "../robot-bestia.jpeg";
import axios from 'axios';
import { Buffer } from 'buffer';
import { modelUrl } from "../const";

export const GenerateForm = () => {
  const { isSubmitting, isValid, values, setFieldTouched, handleChange } =
    useFormikContext<PinkValues>();
  const { estimation, isEstimating } = useEstimationContext();
  const { account, accounts } = useExtension();
  const [ robotImage, setRobotImage ] = useState(robot_bestia);
  const [ waitingHuggingFace, setWaitinghuggingFace ] = useState(false);
  const [ isGenerated, setIsGenerated ] = useState(false);
  const balance = useBalance(account);
  const hasFunds =
    !balance?.freeBalance.isEmpty && !balance?.freeBalance.isZero();

  const isOkToMint =
    !isEstimating 
    // &&
    // estimation &&
    // estimation.result &&
    // "Ok" in estimation.result 
    // &&
    // estimation.result.Ok === "Shortened";

  const fetchImage = async () => {
    console.log("modelUrl", modelUrl);
    console.log("ENV", process.env.REACT_APP_HUGGING_FACE_API_KEY? "ok": "not found");
    console.log("prompt:", "pink robot, " + values.prompt);
    try {
      setWaitinghuggingFace(true);
        const response = await axios({
            url: modelUrl,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.REACT_APP_HUGGING_FACE_API_KEY}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({
                inputs: "pink robot, " + values.prompt, options: { wait_for_model: true },
            }),
            responseType: 'arraybuffer',
        });

        const contentType = response.headers['content-type'];
        console.log("------- response.data", response.data);
        // const base64ImageData = Buffer.from(response.data, 'binary').toString('base64');
        const base64data = Buffer.from(response.data).toString('base64');
        const aiImage = `data:${contentType};base64,` + base64data;
        setRobotImage(aiImage);
        console.log("aiImage", aiImage? "generated":"empty");
        setIsGenerated(true)

    } catch (error) {
        console.error(error);

    }
    setWaitinghuggingFace(false);
};

  return (
    <Form>
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
        <ErrorMessage name="url" component="div" className="error-message" />
      </div>

      <img src={robotImage} className="pink-example" alt="example" />{" "}
      <div className="group">
        <button
          type = "button"
          onClick = {fetchImage}
          disabled={
            waitingHuggingFace || isSubmitting || !isValid || !accounts || !hasFunds
          }
        >
          Genetate New
        </button>
      </div>

      <div className="group">
        {isGenerated && isValid && values.prompt && (
          <DryRunResult values={values} isValid={isValid} />
        )}
      </div>

      <div className="group">
        <button
          type="submit"
          disabled={
            !isGenerated || waitingHuggingFace || isSubmitting || !isOkToMint || !isValid || !accounts || !hasFunds
          }
          name="submit"
          >Mint
        </button>
      </div>

      {isValid && estimation?.error && !isEstimating && (
        <div className="text-xs text-left mb-2 text-red-500">
          {estimation.error.message}
        </div>
      )}

      <div className="group">
        {waitingHuggingFace && (
          <>
          <div className="mb-1">
          <p className="mb-1">Generating on AI server... Can take a minute</p>
          </div>
        </>
        )}
      </div>

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
