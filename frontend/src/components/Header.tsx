import logo from "../logo.svg";

export const Header = () => {
  return (
    <div className="flex justify-between w-full px-8 py-4">
      <div className="flex items-center w-32">
        <img src={logo} className="ink-logo" alt="logo" />
      </div>

      <div className="flex items-center justify-end w-32">
        <button>Connect</button>
      </div>
    </div>
  );
};
