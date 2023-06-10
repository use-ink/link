import { ContractType, PinkValues, UIEvent } from "../types";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { useFormikContext } from "formik";
import { CUSTOM_MARKETPLACE, CUSTOM_MINT_TEXT, PINK_MARKETPLACE, PINK_MINT_TEXT } from "../const";
import { Tweet } from "./Tweet";

interface Props {
  events: UIEvent[];
  errorMessage: string;
  hideBusyMessage: Function;
}

export const SubmitResult = ({
  events,
  errorMessage,
  hideBusyMessage,
}: Props) => {
  const [submitOutcome, setSubmitOutcome] = useState<string>("");
  const [marketplaceLink, setMarketplaceLink] = useState<string>("");
  const { values } = useFormikContext<PinkValues>();

  useEffect(() => {
    hideBusyMessage();
    events.forEach((e) => {
      if (e.name === "system:ExtrinsicFailed") {
        setSubmitOutcome(
          "The transaction was not successful. Try again with another Pink Robot."
        );
      }
      if (e.name === "system:ExtrinsicSuccess") {
        if (values.contractType === ContractType.PinkPsp34) {
          setSubmitOutcome(PINK_MINT_TEXT);
          setMarketplaceLink(PINK_MARKETPLACE);
        }
        else {
          setSubmitOutcome(CUSTOM_MINT_TEXT);
          setMarketplaceLink(CUSTOM_MARKETPLACE);
        }
      }
    });
  }, [events, hideBusyMessage, values.contractType]);

  return (
    <>
      <div className="submit-outcome">
        {submitOutcome}
        <a href={marketplaceLink}>Paras</a>
      </div>
      {errorMessage && (
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
      )}
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
      <img
        src={
          values.displayImage[values.contractType]
        }
        className="pink-example"
        alt="minted nft"
      />{" "}
      <div className="buttons-container">
        <div className="group">
          <button onClick={() => window.location.reload()}>Try another</button>
        </div>
        <div className="group ">
          <Tweet />
        </div>
      </div>
    </>
  );
};
