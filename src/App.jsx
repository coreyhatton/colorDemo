import { createPortal } from "react-dom";
import "./App.css";
import { useEffect, useState } from "react";

// NOTE: oklch format is required.
const checkContrast = (color1, color2) => {
  if (color1 === color2) {
    return 0;
  }

  const getLightnessValue = (color) => {
    switch (true) {
      case color.includes("rgb") && color.includes("(0, 0, 0)"):
      case color.includes("rgb") && color.includes("(0 0 0)"):
        return 0;
      case color.includes("rgb") && color.includes("(255, 255, 255)"):
      case color.includes("rgb") && color.includes("(255 255 255)"):
        return 1;
      default:
        if (!color.startsWith("oklch")) {
          throw new Error("Colors must be in oklch format");
        } else {
          const match = color.match(/(\d+|\d.\d+)\s/);
          const lNum = parseFloat(match[1]);
          return lNum;
        }
    }
  };

  const l1Num = getLightnessValue(color1);
  const l2Num = getLightnessValue(color2);

  const lDiff = Math.abs(l1Num - l2Num);

  return lDiff > 0.3 ? 0 : 1;
};

const ColorPickers = ({ propertyChange, setPropertyChange, convertColor }) => {
  useEffect(() => {
    const buttonEl = document.getElementById("resetButton");
    buttonEl.style.backgroundColor = "oklch(from var(--color-primary) l c h)";
    buttonEl.style.color = "oklch(from var(--textColor-contrast) l c h)";
  }, [propertyChange]);

  useEffect(() => {
    try {
      const buttonEl = document.getElementById("resetButton");
      const buttonStyles = {
        bg: window.getComputedStyle(document.getElementById("resetButton"))
          .backgroundColor,
        fg: window.getComputedStyle(document.getElementById("resetButton"))
          .color,
      };

      buttonEl.style.color = checkContrast(buttonStyles.bg, buttonStyles.fg)
        ? "var(--text-contrast)"
        : "var(--text-base)";
      console.log(buttonEl.style.color);
    } catch (error) {
      console.log(error);
    }
  }, [propertyChange]);

  const ResetButton = () => {
    return (
      <button id="resetButton" onClick={() => window.location.reload()}>
        Reset
      </button>
    );
  };

  return (
    <>
      <div className="colorPickers">
        <div
          id="primary-rgb"
          style={{ backgroundColor: "var(--color-primary)", display: "none" }}
        />
        <label>
          Primary color:
          <ColorPicker
            colorToPick="primary"
            propertyChange={propertyChange}
            setPropertyChange={setPropertyChange}
            convertColor={convertColor}
          />
        </label>
        <div
          id="secondary-rgb"
          style={{
            backgroundColor: "var(--color-secondary)",
            display: "none",
          }}
        />
        <label>
          Secondary color:
          <ColorPicker
            colorToPick="secondary"
            propertyChange={propertyChange}
            setPropertyChange={setPropertyChange}
            convertColor={convertColor}
          />
        </label>
        <div
          id="tertiary-rgb"
          style={{
            backgroundColor: "var(--color-tertiary)",
            display: "none",
          }}
        />
        <label>
          Tertiary color:
          <ColorPicker
            colorToPick="tertiary"
            propertyChange={propertyChange}
            setPropertyChange={setPropertyChange}
            convertColor={convertColor}
          />
        </label>
        <div
          id="accent-rgb"
          style={{ backgroundColor: "var(--color-accent)", display: "none" }}
        />
        <label>
          Accent color:
          <ColorPicker
            colorToPick="accent"
            propertyChange={propertyChange}
            setPropertyChange={setPropertyChange}
            convertColor={convertColor}
          />
        </label>
      </div>
      <ResetButton />
    </>
  );
};

const ColorPicker = ({
  colorToPick,
  propertyChange,
  setPropertyChange,
  convertColor,
}) => {
  const [currentColor, setCurrentColor] = useState("#ffffff");
  const [apiTimeout, setApiTimeout] = useState(0);

  const cssVar = `var(--color-${colorToPick})`;

  // Wrapped in useEffect to ensure this only gets triggered once the DOM is fully rendered
  useEffect(() => {
    setCurrentColor(convertColor(cssVar, `${colorToPick}-rgb`, "hex"));
  }, []);

  const setColor = (e) => {
    clearTimeout(apiTimeout);

    const color = e.target.value;
    setCurrentColor(color);

    setApiTimeout(
      setTimeout(() => {
        document.documentElement.style.setProperty(
          `--color-${colorToPick}`,
          color
        );
        setPropertyChange({
          ...propertyChange,
          [`--color-${colorToPick}`]: color,
        });
      }, 300)
    );
  };

  return <input type="color" value={currentColor} onChange={setColor} />;
};

function App() {
  const convertColor = (cssVar, element, space) => {
    if (space === "hex") {
      document.getElementById(
        element
      ).style.backgroundColor = `rgb(from ${cssVar} r g b)`;

      const rgb = window
        .getComputedStyle(document.getElementById(element))
        .getPropertyValue("background-color");

      let hex = "";

      const match = rgb.match(
        /(?:^s?rgba?\D*|^color\(\D*)(\d+|\d\.\d+)(?:,|\s)\s*(\d+|\d\.\d+)(?:,|\s)\s*(\d+|\d\.\d+)(?:(?:,|\s)\s*(\d+|\d\.\d+))?\)$/
      );

      if (match) {
        const _r = parseFloat(match[1]);
        const _g = parseFloat(match[2]);
        const _b = parseFloat(match[3]);
        // const _a = parseFloat(match[4]);

        const r = _r <= 1 ? parseInt(_r * 255) : parseInt(_r);
        const g = _g <= 1 ? parseInt(_g * 255) : parseInt(_g);
        const b = _b <= 1 ? parseInt(_b * 255) : parseInt(_b);
        // const a = _a <= 1 ? parseInt(_a * 100) : parseInt(_a);

        hex = `#${((1 << 24) + (r << 16) + (g << 8) + b)
          .toString(16)
          .slice(1)}`;
      } else {
        return console.log(`Invalid RGB string: ${rgb}`);
      }

      return hex;
    }

    if (space === "oklch") {
      document.getElementById(
        element
      ).style.backgroundColor = `oklch(from ${cssVar} l c h)`;

      const oklch = window
        .getComputedStyle(document.getElementById(element))
        .getPropertyValue("background-color");

      return oklch;
    }
  };

  /**
   * This component renders a set of color pickers for the primary, secondary,
   * tertiary, and accent colors. It also renders a grid of all the calculated
   * colors based on the chosen colors.
   *
   * @returns {React.ReactElement} A React component that renders the color pickers
   * and the calculated color palette.
   */
  function colors() {
    const colorTokens = {
      controls: [
        "--color-primary",
        "--color-secondary",
        "--color-tertiary",
        "--color-accent",
      ],
      primary: [
        "var(--color-primary)",
        "var(--primary-l1)",
        "var(--primary-l2)",
        "var(--primary-l3)",
        "var(--primary-d1)",
        "var(--primary-d2)",
        "var(--primary-d3)",
      ],
      secondary: [
        "var(--color-secondary)",
        "var(--secondary-l1)",
        "var(--secondary-l2)",
        "var(--secondary-l3)",
        "var(--secondary-d1)",
        "var(--secondary-d2)",
        "var(--secondary-d3)",
      ],
      tertiary: [
        "var(--color-tertiary)",
        "var(--tertiary-l1)",
        "var(--tertiary-l2)",
        "var(--tertiary-l3)",
        "var(--tertiary-d1)",
        "var(--tertiary-d2)",
        "var(--tertiary-d3)",
      ],
      accent: [
        "var(--color-accent)",
        "var(--accent-l1)",
        "var(--accent-l2)",
        "var(--accent-l3)",
        "var(--accent-d1)",
        "var(--accent-d2)",
        "var(--accent-d3)",
      ],
    };

    const gridStyle = {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
    };

    const setTextColorsFromCssVars = (
      color = "primary",
      element = "primary-0"
    ) => {
      const currentBgColor = convertColor(color, element, "oklch");

      const match = currentBgColor.match(/(?:oklch\D*)(\d\.\d+|\d+).*\)$/);

      if (match) {
        const l = parseFloat(match[1]);
        if (l < 0.6) {
          return "var(--text-contrast)";
        }
      }

      return "var(--text-base)";
    };

    const [propertyChange, setPropertyChange] = useState({});

    const ColorBlock = ({ color, index, cssVar }) => {
      const [textColor, setTextColor] = useState("var(--text-base)");

      useEffect(() => {
        setTextColor(setTextColorsFromCssVars(cssVar, `${color}-${index}`));
      }, [color]);

      return (
        <div
          id={`${color}-${index}`}
          key={index}
          style={{ ...setItemStyle(cssVar), color: textColor }}
        >
          <span>{cssVar}</span>
        </div>
      );
    };

    const setItemStyle = (cssVar = null) => ({
      flex: "1 1 max-content",
      minBlockSize: "2lh",
      backgroundColor: cssVar,
      display: "inline-block",
      alignContent: "center",
      margin: "5px",
      padding: "5px",
    });

    return (
      <>
        <div className="color-pickers">
          <ColorPickers
            propertyChange={propertyChange}
            setPropertyChange={setPropertyChange}
            convertColor={convertColor}
          />
        </div>

        <h2 style={{ marginBlockEnd: "0px" }}>Calculated color palette</h2>
        <div style={gridStyle}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flexWrap: "wrap",
              flex: "1 1 calc(25% - 10px)",
            }}
          >
            {colorTokens.primary.map((cssVar, index) => (
              <ColorBlock
                color={"primary"}
                index={index}
                cssVar={cssVar}
                key={index}
              />
            ))}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flexWrap: "wrap",
              flex: "1 1 calc(25% - 10px)",
            }}
          >
            {colorTokens.secondary.map((cssVar, index) => (
              <ColorBlock
                color={"secondary"}
                index={index}
                cssVar={cssVar}
                key={index}
              />
            ))}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flexWrap: "wrap",
              flex: "1 1 calc(25% - 10px)",
            }}
          >
            {colorTokens.tertiary.map((cssVar, index) => (
              <ColorBlock
                color={"tertiary"}
                index={index}
                cssVar={cssVar}
                key={index}
              />
            ))}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flexWrap: "wrap",
              flex: "1 1 calc(25% - 10px)",
            }}
          >
            {colorTokens.accent.map((cssVar, index) => (
              <ColorBlock
                color={"accent"}
                index={index}
                cssVar={cssVar}
                key={index}
              />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <h1>default.css Color Demo</h1>
      <p>
        Color system using relative color functions implemented entirely in css
      </p>
      <hr />
      <div className="card">
        {colors()}
        <p>Change the colors using the above color pickers</p>
      </div>
      <hr />
      <p className="read-the-docs">Made for fun by Corey Hatton</p>
    </>
  );
}

export default App;
