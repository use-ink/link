import { PinkValues, UIEvent } from "../types";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/solid";
import { useEffect, useState } from "react";
import { useFormikContext } from "formik";

interface Props {
  events: UIEvent[];
  errorMessage: string;
  hideBusyMessage: Function;
}

export const SubmitResult = ({ events, errorMessage, hideBusyMessage }: Props) => {
  const [submitOutcome, setSubmitOutcome] = useState("");
  const { values } = useFormikContext<PinkValues>();

  useEffect(() => {
    hideBusyMessage()
    events.forEach((e) => {
      console.log("SubmitResult event:", e);
      if (e.name === "system:ExtrinsicFailed") {
        setSubmitOutcome(
          "The transaction was not successful. Try again with another Pink Robot."
        );
      }
      if (e.name === "system:ExtrinsicSuccess") {
        setSubmitOutcome(
          "Hurray! Your Pink Robot is now on the blockchain. Find it on marketplace."
        );
      }
    });
  }, [events]);

  return (
    <>
      <div className="submit-outcome">{submitOutcome}</div>
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button className="disclosure-button">
              <span>Events log</span>
              <ChevronUpIcon
                className={`${open ? "rotate-180 transform" : ""
                  } h-5 w-5 text-pink-500`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="disclosure-panel">
              {events.map((ev: UIEvent, index: number) => {
                return (
                  <div key={`${ev.name}-${index}`} className="ui-event">
                    <div className="ui-event-name">{ev.name}</div>
                    <div className="ui-event-message">{ev.message}</div>
                  </div>
                );
              })}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {errorMessage && (
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="disclosure-button">
                <span>Error log</span>
                <ChevronUpIcon
                  className={`${open ? "rotate-180 transform" : ""
                    } h-5 w-5 text-pink-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="disclosure-panel">
                {errorMessage}
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      )}
      <img src={values.aiImage} className="pink-example" alt="minted nft" />{" "}
      <div>
        <button onClick={() => window.location.reload()}>
          Try another
        </button>
      </div>
    </>
  );
};
