import "./App.css";
import { ColorBlocks, ColorPickers } from "./components";
import { ColorStateProvider } from "./ColorContext";

export const App = () => {
  return (
    <>
      <header className="header">
        <h1>default.css Color Demo</h1>
        <p>
          Color system using relative color functions implemented entirely in
          css
        </p>
      </header>
      <main className="app">
        <ColorStateProvider>
          <ColorPickers />
          <ColorBlocks />
        </ColorStateProvider>
        <p>Change the colors using the above color pickers</p>
      </main>
      <footer className="footer">
        <p className="read-the-docs">Made by Corey Hatton</p>
      </footer>
    </>
  );
};

export default App;
