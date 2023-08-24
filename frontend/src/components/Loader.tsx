import { ReactComponent as Squid } from '../squid.svg';

export const Loader = ({ message }: { message: string }) => {
  return (
    <div className="overflow-hidden">
      <section className="sticky">
        <div className="squids">
          <Squid className="squid" />
          <Squid className="squid" />
          <Squid className="squid" />
          <Squid className="squid" />
          <Squid className="squid" />
          <Squid className="squid" />
          <Squid className="squid" />
        </div>
        <Squid className="big-squid" />
      </section>
      <div className="container">
        <div className="text-info">
          <h1>Shortened with link!</h1>
          <div className="tag-line">
            <span>
              The unstoppable link shortener built with the{' '}
              <a href="https://github.com/paritytech/ink" target="_blank" rel="noopener noreferrer">
                ink! smart contract language
              </a>
            </span>
            .
          </div>
          <h3 className="mt-6 text-lg font-semibold animate-pulse">{message}</h3>
        </div>
      </div>
    </div>
  );
};
