import {
  memo,
  useMemo,
  useState,
  useRef,
  useDeferredValue,
  useCallback,
  useEffect,
} from "react";
import _ from "lodash";
import { ArrowCounterClockwise } from "@phosphor-icons/react";
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
import type { JSX } from "react/jsx-runtime";

/**
 * Component for rendering a collection of color pickers to manipulate CSS custom properties.
 * Users can select colors for defined categories and update corresponding CSS variables.
 * The component also includes a reset feature to restore the original styles.
 *
 * @param props - Component properties.
 * @returns The ColorPickers component.
 */
export const ColorPickers = memo(() => {
  const colorStates = useColorStates();
  const { setIsChangingColor } = useCalculatingState();

  const dispatch = useColorStateDispatch();

  const deferredStates = useDeferredValue(colorStates);

  const initialColors = getInitialStates();
  const textColors = getParsedTextColors();

  const { computeColorProperty } = useCssCustomProperties();

  const handleColorChange = useCallback(
    (deferredColor: any, category: string | number) => {
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
        relativeColors.map(([category, state]) => {
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

  const debouncedChangeComplete = _.debounce((deferredColor, category) => {
    handleColorChange(deferredColor, category);
    handleRelativeChange(category);

    return setIsChangingColor(null);
  }, 300);

  return (
    <div className={styles.main}>
      <header className={styles.header}>
        <h2 className={styles.middle}>Calculated color palette</h2>
        <ResetButton
          icon={ArrowCounterClockwise}
          initialColors={initialColors}
          className={`${styles.end} ${styles.reset}`}
        />
      </header>
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

      <></>
    </div>
  );
});

const ColorPicker = memo(
  ({
    category,
    colorValue,
    textColors,
    colorStates,
    handleChangeComplete,
    ...props
  }: any) => {
    const cssVar = `var(--color-${category})`;
    const { setIsChangingColor } = useCalculatingState();

    const inputRef = useRef<HTMLInputElement>(null);

    const [currentColor, setCurrentColor] = useState(colorValue);
    const deferredColor = useDeferredValue(currentColor);

    const { setProperties, computeColorProperty } = useCssCustomProperties();

    const onChange = (e: { target: { value: any } }) => {
      const newColor = e.target.value;
      setIsChangingColor(category);

      setCurrentColor(newColor);
      setProperties(cssVar, newColor);
    };

    useEffect(() => {
      if (colorStates[category].value !== currentColor) {
        setCurrentColor(colorStates[category].value);
      }
    }, [colorStates[category].value]);

    // useEffect(() => {
    //   const computedColor = computeColorProperty(cssVar, "hex");
    //   if (inputRef.current) {
    //     inputRef.current.value = computedColor as string;
    //   }
    // }, [document.documentElement.style.cssText]);

    const onChangeComplete = useCallback(
      (deferredColor: any, category: any) => {
        handleChangeComplete(deferredColor, category);
        return () => {
          handleChangeComplete.cancel();
        };
      },
      [handleChangeComplete, cssVar, deferredColor, category]
    );

    // contained in effect so it only triggers when our deferred value changes
    useEffect(() => {
      onChangeComplete(deferredColor, category);
    }, [deferredColor, category]);

    return (
      <div {...props} className={`${styles.pickers} ${props.className}`}>
        <label htmlFor={`${category}-input`}>{category}</label>
        <input
          id={`${category}-input`}
          type="color"
          value={currentColor}
          onChange={onChange}
          ref={inputRef}
        />
      </div>
    );
  }
);

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
    Icon: JSX.IntrinsicAttributes,
    iconProps: JSX.IntrinsicAttributes
  ) => {
    return <Icon {...Icon.props} {...iconProps} />;
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
