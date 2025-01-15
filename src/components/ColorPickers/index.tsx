import { useEffect, useMemo, useState } from "react";
import _ from "lodash";
import Color from "colorjs.io";

import useCssCustomProperties from "../../utils/useCssCustomProps";
import { toHex } from "../../utils/colorUtils";

/**
 * Component for rendering a collection of color pickers to manipulate CSS custom properties.
 * Users can select colors for defined categories and update corresponding CSS variables.
 * The component also includes a reset feature to restore the original styles.
 *
 * @param props - Component properties.
 * @param props.rootRef - Optional reference to the root element for CSS property manipulation.
 * @param props.colors - Optional mapping of color categories to their initial values and states.
 *
 * @returns The ColorPickers component.
 */
export const ColorPickers = (props: { rootRef?: any; colors?: any }) => {
  const { colors } = props;

  const {
    setProperties: setCustomProperties,
    computeColorProperty: computeCustomProperties,
    resetToInitial: resetStyles,
  } = useCssCustomProperties(props.rootRef);

  const [colorStates, setColorStates] = useState(colors);

  const initialRootStyle = useMemo(
    () => props.rootRef.current.style.cssText,
    []
  );

  const handleChangeComplete = (
    colorCategory: string,
    colorValue: string & CSSStyleRule
  ) => {
    setCustomProperties(`--color-${colorCategory}`, colorValue);

    const prevColorStates = { ...colorStates };
    const currentColorState = prevColorStates[colorCategory];

    const newColorStates = {
      ...prevColorStates,
      [colorCategory]: {
        ...currentColorState,
        value: colorValue,
        hasChanged: true,
      },
    };

    for (const category in newColorStates) {
      if (
        category === colorCategory ||
        newColorStates[category].hasChanged ||
        !newColorStates[category].isRelative
      ) {
        continue;
      } else {
        const value = computeCustomProperties(`--color-${category}`);

        newColorStates[category] = {
          ...newColorStates[category],
          value: toHex(new Color(value!)),
        };
      }
    }

    setColorStates(newColorStates);
  };

  const handleReset = () => {
    setColorStates(colors);
    resetStyles(initialRootStyle);
  };

  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      {Object.keys(colors).map((color) => {
        return (
          <ColorPicker
            key={color}
            colorCategory={color}
            colorState={colorStates[color]}
            label={`${_.startCase(color)} color:`}
            handleChange={handleChangeComplete}
          />
        );
      })}

      <button onClick={handleReset}>Reset</button>
    </div>
  );
};

/**
 * Custom controlled component for picking colors.
 * Uses the native color picker in the browser.
 *
 * @prop {string} colorCategory - The category of the color to be picked.
 * @prop {string} colorState.value - The current value of the color.
 * @prop {function} handleChange - The callback to be called when the color
 * changes. It takes two arguments: the color category and the new color value.
 * @prop {string} [label=""] - The label to be displayed next to the color input.
 * @prop {string} [labelPosition="top"] - The position of the label. It can be
 * "top" or "left".
 * @prop {boolean} [onComplete=false] - If true, the handleChange callback will
 * be called only when the user finishes picking the color. If false, the
 * callback will be called each time the user changes the color.
 *
 * @returns {ReactElement} - The ColorPicker component.
 */
const ColorPicker = ({
  colorCategory,
  colorState,
  handleChange,
  label = "",
  labelPosition = "top",
  onComplete = false,
}) => {
  const [currentColor, setCurrentColor] = useState(colorState.value);

  const callbackDelay = 50; // in ms
  const useOptimizedChange = onComplete
    ? _.debounce(
        (colorCategory, currentColor) => {
          handleChange(colorCategory, currentColor);
        },
        callbackDelay,
        { leading: false, trailing: true }
      )
    : _.throttle(
        (colorCategory, currentColor) => {
          handleChange(colorCategory, currentColor);
        },
        callbackDelay,
        { leading: false, trailing: true }
      );

  const onChange = (e: { target: { value: any } }) => {
    const newColor = e.target.value;
    useOptimizedChange(colorCategory, newColor);
  };

  useEffect(() => {
    setCurrentColor(colorState.value);
  }, [colorState.value]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: labelPosition === "top" ? "column" : "row",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      {label && <label htmlFor="{`${colorCategory}-input`}">{label}</label>}
      <input
        id={`${colorCategory}-input`}
        type="color"
        value={currentColor}
        onChange={onChange}
      />
    </div>
  );
};

export default ColorPickers;
