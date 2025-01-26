import { createContext, useState, useMemo } from "react";
import { toHex, useCssCustomProperties } from "./utils";
import Color from "colorjs.io";

interface ColorContext {
  initialColors: any;
  parsedTextColors: any;
  rootRef: any;
  colorStates: any;
  setColorStates: (colors: any) => void;
  handleReset: () => void;
  handleChangeComplete: (
    colorCategory: string,
    colorValue: string & CSSStyleRule
  ) => void;
}

const ColorPickerContext = createContext<ColorContext | null>(null);

const ColorPickerProvider = ({
  initialColors,
  parsedTextColors,
  rootRef,
  children,
}) => {
  const [colorStates, setColorStates] = useState<any>(initialColors);

  const {
    setProperties: setCustomProperties,
    computeColorProperty: computeCustomProperties,
    resetToInitial: resetStyles,
  } = useCssCustomProperties(rootRef.current || document.documentElement);

  const initialRootStyle = useMemo(() => rootRef.current.style.cssText, []);

  const handleReset = () => {
    setColorStates(initialColors);
    resetStyles(initialRootStyle);
  };

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
        category !== colorCategory &&
        (newColorStates[category].value === currentColorState.value ||
          newColorStates[category].hasChanged ||
          !newColorStates[category].isRelative)
      ) {
        continue;
      } else {
        const newVariants = newColorStates[category].variants.map((variant) => {
          const computedProperty = new Color(
            computeCustomProperties(variant.cssVar)
          );

          return {
            ...variant,
            computedValue: computedProperty
              .to("oklch")
              .toString({ precision: 2 }),
            contrastingTextColor:
              computedProperty.contrastLstar(parsedTextColors.base) > 50
                ? "var(--text-base)"
                : "var(--text-contrast)",
          };
        });

        const bgColorValue = computeCustomProperties(`--color-${category}`);

        newColorStates[category] = {
          ...newColorStates[category],
          value: toHex(new Color(bgColorValue!)),
          variants: newVariants,
        };
      }
    }

    setColorStates(newColorStates);
  };

  return (
    <ColorPickerContext.Provider
      value={{
        colorStates,
        parsedTextColors,
        setColorStates,
        handleReset,
        handleChangeComplete,
        rootRef,
        initialColors,
      }}
    >
      {children}
    </ColorPickerContext.Provider>
  );
};

export { type ColorContext, ColorPickerContext, ColorPickerProvider };
