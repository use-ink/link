import { Values, UIEvent, TransferredBalanceEvent } from '../types';
import { FormikHelpers } from 'formik';
import { pickDecoded } from 'useink/utils';
import { decodeError } from 'useink/core';
import { useLinkContract } from './useLinkContract';

export const useSubmitHandler = () => {
  const { shorten, shortenDryRun, link } = useLinkContract();

  return async (values: Values, { setSubmitting, setStatus }: FormikHelpers<Values>) => {
    const isDryRunSuccess = 'Shortened' === pickDecoded(shortenDryRun?.result);
    if (!isDryRunSuccess) return;

    const shortenArgs = [{ DeduplicateOrNew: values.alias }, values.url];
    const options = undefined;

    shorten?.signAndSend(shortenArgs, options, (result, _api, error) => {
      if (error) {
        console.error(JSON.stringify(error));
        setSubmitting(false);
      }

      if (!result?.status.isInBlock) return;

      const events: UIEvent[] = [];
      let slug = '';

      // Collect Contract emitted events
      result?.contractEvents?.forEach(({ event, args }) => {
        slug = args[0].toHuman()?.toString() || '';
        events.push({
          name: event.identifier,
          message: `${event.docs.join()}`,
        });
      });

      // Collect pallet emitted events
      result?.events.forEach(({ event }) => {
        if ('ContractEmitted' !== event.method) {
          let message = '';

          if ('balances' === event.section) {
            const data = event.data.toHuman() as any as Pick<TransferredBalanceEvent, 'amount'>;
            message = `Amount: ${data.amount}`;
          }

          events.push({
            name: `${event.section}:${event.method}`,
            message,
          });
        }
      });

      const dispatchError = shorten.result?.dispatchError;

      if (dispatchError && link?.contract) {
        const errorMessage = decodeError(dispatchError, link, undefined, 'Something went wrong');
        setStatus({ finalized: true, events, errorMessage });
      }

      if (slug) setStatus({ finalized: true, events, errorMessage: '', slug });

      setSubmitting(false);
    });
  };
};
