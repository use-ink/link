import { PinkValues, UIEvent } from "../types";
import { Link } from "react-router-dom";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/solid";
import { useEffect, useState } from "react";

interface Props {
  values: PinkValues;
  events: UIEvent[];
  errorMessage: string;
}

export const SubmitResult = ({ values, events, errorMessage }: Props) => {
  const [submitOutcome, setSubmitOutcome] = useState("");
  useEffect(() => {
    events.forEach((e) => {
      console.log("SubmitResult event:", e);
      if (e.name === "Shortened") {
        setSubmitOutcome("Your link was shortened to the following url:");
      }
      if (e.name === "Deduplicated") {
        setSubmitOutcome(
          "We already have a mapping for your URL. The existing slug will be used."
        );
      }
      if (e.name === "system:ExtrinsicFailed") {
        setSubmitOutcome(
          "The transaction was not successful. Try again with another Pink robot."
        );
      }
      if (e.name === "system:ExtrinsicSuccess") {
        setSubmitOutcome(
          "Hurray! Your Pink robot is now on the blockchain. Find it on marketplace."
        );
      }
    });
  }, [events]);

  return (
    <>
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button className="disclosure-button">
              <span>Events log</span>
              <ChevronUpIcon
                className={`${
                  open ? "rotate-180 transform" : ""
                } h-5 w-5 text-purple-500`}
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
                  className={`${
                    open ? "rotate-180 transform" : ""
                  } h-5 w-5 text-purple-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="disclosure-panel">
                {errorMessage}
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      )}
      {/* <img src={values.aiImage} className="pink-example" alt="minted nft" />{" "} */}
      <div>
        <button onClick={() => window.location.reload()}>
          Try another
        </button>
      </div>
    </>
  );
};
