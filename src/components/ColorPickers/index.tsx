import React, {
  memo,
  useMemo,
  useState,
  useRef,
  useDeferredValue,
  useCallback,
  useEffect,
} from "react";
import _ from "lodash";
import {
  ArrowCounterClockwise,
  type Icon,
  type IconProps,
} from "@phosphor-icons/react";
import Color, { type ColorTypes } from "colorjs.io";

import { Button } from "../Button";
import { toHex, useCssCustomProperties } from "@/src/utils";
import {
  useColorStateDispatch,
  initialRootStyle,
  useColorStates,
  getParsedTextColors,
  getInitialStates,
  useCalculatingState,
} from "@/src/ColorContext";

import styles from "./ColorPickers.module.css";

/**
 * Component for rendering a collection of color pickers to manipulate CSS custom properties.
 * Users can select colors for defined categories and update corresponding CSS variables.
 * The component also includes a reset feature to restore the original styles.
 *
 * @param props - Component properties.
 * @returns The ColorPickers component.
 */
export const ColorPickers = (...props) => {
  const colorStates = useColorStates();
  const deferredStates = useDeferredValue(colorStates);

  const { setIsChangingColor } = useCalculatingState();
  const dispatch = useColorStateDispatch();

  const initialColors = getInitialStates();
  const textColors = getParsedTextColors();

  const { computeColorProperty } = useCssCustomProperties();

  const handleColorChange = useCallback(
    (deferredColor: any, category: string) => {
      dispatch({
        type: "SET_COLOR",
        category,
        payload: {
          value: deferredColor,
          variants: setVariants(deferredStates[category].variants, textColors),
        },
      });
    },
    [textColors, dispatch]
  );

  const handleRelativeChange = useCallback(
    (currentCategory: any) => {
      const relativeColors = Object.entries(deferredStates).filter(([key]) => {
        return deferredStates[key].isRelativeTo === currentCategory;
      });

      const payload = Object.fromEntries(
        relativeColors.map(([category, state]: [string, any]) => {
          return [
            category,
            {
              value: computeColorProperty(`--color-${category}`, "hex"),
              variants: setVariants(state.variants, textColors),
            },
          ];
        })
      );

      dispatch({
        type: "SET_ALL_COLORS",
        payload,
      });
    },
    [textColors, dispatch, deferredStates]
  );

  const debouncedChangeComplete = useMemo(
    () =>
      _.debounce((deferredColor, category) => {
        handleColorChange(deferredColor, category);
        handleRelativeChange(category);

        return setIsChangingColor(null);
      }, 50),
    [handleColorChange, handleRelativeChange, setIsChangingColor]
  );

  return (
    <div className={styles.main}>
      <header className={styles.header}>
        <h2 className={styles.middle}>Calculated color palette</h2>
        <ResetButton
          icon={ArrowCounterClockwise}
          initialColors={initialColors}
          className={`${styles.end} ${styles.reset}`}
        />
        <p>Change the colors using the above color pickers</p>
      </header>
      <div {...props} className={`${styles.pickers} ${props.className ?? ""}`}>
        {initialColors &&
          Object.keys(initialColors).map((colorCategory) => {
            return (
              <ColorPicker
                key={colorCategory}
                category={colorCategory}
                colorValue={colorStates[colorCategory].value}
                textColors={textColors}
                colorStates={deferredStates}
                handleChangeComplete={debouncedChangeComplete}
              />
            );
          })}
      </div>
    </div>
  );
};

interface ColorPickerProps {
  category: string;
  colorValue: string;
  textColors: { base: ColorTypes };
  colorStates: { [key: string]: { value: string } };
  handleChangeComplete: (deferredColor: string, category: string) => void;
  className?: string;
}

/**
 * A functional component that renders a color picker input with a label and an associated color preview block.
 *
 * @param category - The category of the color picker, used to determine which color to change.
 * @param colorValue - The initial color value to be used by the color picker.
 * @param textColors - An object containing the text colors to be used within the color picker.
 * @param colorStates - An object containing the color states to be used within the color picker.
 * @param handleChangeComplete - A function to be called when the deferred color value changes.
 * @param props - Any additional properties to be applied to the div element.
 *
 * @returns An uncontrolled native input component representing a color picker input with a label and an associated color preview block.
 */
const ColorPicker = ({
  category,
  colorValue,
  textColors,
  colorStates,
  handleChangeComplete,
  ...props
}: ColorPickerProps & React.HTMLAttributes<HTMLDivElement>) => {
  const cssVar = `var(--color-${category})`;
  const { setIsChangingColor } = useCalculatingState();

  const inputRef = useRef<HTMLInputElement>(null);

  const [currentColor, setCurrentColor] = useState(colorValue);
  const deferredColor = useDeferredValue(currentColor);
  const debouncedSetColor = _.debounce(setCurrentColor, 0);

  const { setProperties } = useCssCustomProperties();

  const onChange = (e: { target: { value: any } }) => {
    const newColor = e.target.value;
    setIsChangingColor(category);
    if (inputRef.current) {
      inputRef.current.value = newColor;
    }
    setProperties(cssVar, newColor);
  };

  // sync input color state with input changes
  useEffect(() => {
    if (inputRef.current && currentColor !== inputRef.current.value) {
      debouncedSetColor(inputRef.current.value);
    }
  }, [inputRef.current && inputRef.current.value]);

  // sync relative colour inputs with primary input changes
  useEffect(() => {
    if (
      inputRef.current &&
      colorStates[category].value !== inputRef.current.value
    ) {
      inputRef.current.value = colorStates[category].value;
    }

    if (colorStates[category].value !== currentColor) {
      debouncedSetColor(colorStates[category].value);
    }
  }, [colorStates[category].value]);

  // contained in effect so it only triggers when our deferred value changes
  useEffect(() => {
    handleChangeComplete(deferredColor, category);
    return () => {
      // @ts-ignore
      handleChangeComplete.cancel();
    };
  }, [deferredColor, category]);

  return (
    <>
      <label htmlFor={`${category}-input`}>{category}</label>
      <input
        id={`${category}-input`}
        type="color"
        defaultValue={colorValue}
        onChange={onChange}
        ref={inputRef}
        className={styles.colorInput}
      />
    </>
  );
};
/**
 * Updates a list of color variants with computed properties and
 * contrasting text colors based on the input text colors.
 *
 * Assumes that var(--text-base) and var(--text-contrast) are opposite contrasting colors for text.
 *
 * @param variants - An array of variant objects, each containing a CSS variable,
 * contrasting text color, computed value, and other properties.
 * @param textColors - An object containing the base text color used for contrast calculations.
 *
 * @returns A new array of variant objects with updated computed values, hex values,
 * and contrasting text colors.
 */

const setVariants = (variants: any[], textColors: { base: ColorTypes }) => {
  const { computeColorProperty } = useCssCustomProperties();

  const newVariants = variants.map(
    (variant: {
      [x: string]: any;
      cssVar: any;
      contrastingTextColor: any;
      computedValue: any;
    }) => {
      const { cssVar, contrastingTextColor, computedValue, ...rest } = variant;
      const computedProperty = computeColorProperty(
        cssVar,
        "oklch",
        true
      ) as Color;

      const newTextColor =
        computedProperty instanceof Color && textColors
          ? computedProperty.contrastLstar(textColors.base) > 50
            ? "var(--text-base)"
            : "var(--text-contrast)"
          : contrastingTextColor;

      const newValue =
        computedProperty instanceof Color
          ? computedProperty.toString({ precision: 2 })
          : computedValue;

      return {
        ...rest,
        cssVar,
        computedValue: newValue,
        hexValue: toHex(computedProperty),
        contrastingTextColor: newTextColor,
      };
    }
  );

  return newVariants;
};

const ResetButton = memo(({ icon, initialColors, ...props }: any) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const dispatch = useColorStateDispatch();
  const { resetToInitial } = useCssCustomProperties();

  const iconProps = useMemo(
    () => ({ className: `${isAnimating ? styles.animate : ""}` }),
    [isAnimating]
  );

  const handleMouseOver = () => {
    setIsAnimating(true);
  };

  const handleAnimationEnd = () => {
    setIsAnimating(false);
  };

  const renderIcon = (
    Icon: Icon,
    iconProps: React.HTMLProps<SVGSVGElement> & IconProps
  ) => {
    return <Icon {...iconProps} />;
  };

  const handlePress = () => {
    dispatch({
      type: "RESET",
    });
    resetToInitial(initialRootStyle);
  };

  return (
    <Button
      {...props}
      onPress={handlePress}
      variant="reset"
      onMouseEnter={handleMouseOver}
      onAnimationEnd={handleAnimationEnd}
      title="Reset colors to initial state"
    >
      {renderIcon(icon, iconProps)}
    </Button>
  );
});

export default ColorPickers;
