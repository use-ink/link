export const Loader = ({ message }: { message: string }) => {
  return (
    <div className="overflow-hidden">
      <div className="container">
        <div className="text-info">
          <div className="loader-image"><img src="./assets/pink-logo-300.png" alt="pink-robot" /></div>
          <div className="tag-line">
            <div className="loader-image"><img src="./assets/pinkrobot200.gif" alt="pink-robot" /></div>
            <br/>
            <div className="text-xl font-bold animate-pulse loader-animation">{message}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
