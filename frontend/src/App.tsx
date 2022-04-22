import './App.css';
import logo from './logo.svg'
import linkLogo from './link-logo.svg'

function App() {
  return (
    <div className="App">
      <div className="top-bar">
        <img src={logo} className="ink-logo" alt="logo"/>
      </div>
      <div className="content">
        <div className="form-panel">
        <img src={linkLogo} className="link-logo" alt="logo" />
          <form action="#">
            <label htmlFor="url">Your URL</label>
            <input type="text" id='url' name='url' placeholder='Your URL'/>
            <label htmlFor="alias">Your Alias</label>
            <input type="text" id='alias' name='alias' placeholder='Your Alias'/>
            <button>Shorten</button>
          </form>
        </div>
      </div>
      
    </div>
  );
}

export default App;
