import { useRef } from "react";

import "./App.css";
import { ColorBlocks, ColorPickers } from "./components";
import { initializeColors } from "./utils";

export const App = () => {
  const rootRef = useRef<HTMLElement>(document.documentElement);

  const categories = ["primary", "secondary", "tertiary", "accent"];

  const initialColors = initializeColors(categories);

  return (
    <>
      <header className="header">
        <h1>default.css Color Demo</h1>
        <p>
          Color system using relative color functions implemented entirely in
          css
        </p>
      </header>
      <main className="card">
        <ColorPickers colors={initialColors} rootRef={rootRef} />
        <ColorBlocks categories={categories} />
        <p>Change the colors using the above color pickers</p>
      </main>
      <footer className="footer">
        <p className="read-the-docs">Made for fun by Corey Hatton</p>
      </footer>
    </>
  );
};

export default App;
