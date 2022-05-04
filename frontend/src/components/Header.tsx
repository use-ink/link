import logo from "../logo.svg";

const Header = () => {
    return (
        <div className="top-bar">
            <img src={logo} className="ink-logo" alt="logo" />
        </div>
    )
}

export default Header;