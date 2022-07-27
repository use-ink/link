import { UIEvent } from "../types";
import { Link } from "react-router-dom";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/solid";
import { useEffect, useState } from "react";

interface Props {
  slug: string;
  events: UIEvent[];
  errorMessage: string;
}

export const SubmitResult = ({ slug, events, errorMessage }: Props) => {
  const [submitOutcome, setSubmitOutcome] = useState("");
  useEffect(() => {
    events.forEach((e) => {
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
          "The transaction was not successful. Try again with another slug."
        );
      }
    });
  }, [events]);

  return (
    <>
      <div className="submit-outcome">
        <div className="mb-3">{submitOutcome}</div>
        {slug && (
          <Link to={`/${slug}`}>{`${window.location.host}/${slug}`}</Link>
        )}
      </div>

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
      <div>
        <button onClick={() => window.location.reload()}>
          Shorten another
        </button>
      </div>
    </>
  );
};
