
export const Loader = ({ message }: { message: string }) => {
  return (
    <div className="overflow-hidden">
      <div className="container">
        <div className="text-info">
          <h1>Pink Robot</h1>
          <div className="tag-line">
            <div><img src="./assets/pinkrobot200.gif" /></div>
            <div className="animate-pulse loader-animation">{message}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
