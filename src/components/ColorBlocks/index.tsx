import { memo, useDeferredValue } from "react";
import styles from "./ColorBlocks.module.css";
import { useCalculatingState, useColorStates } from "@/src/ColorContext";

export interface ColorBlocksProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Renders a collection of color blocks with their corresponding colors,
 * variants, and text colors.
 *
 * @param props - An object containing the following properties:
 *   @param props.className - Additional class names for styling the component.
 *
 * @returns A React element representing a color block with a specified background and text color.
 */
export const ColorBlocks = (props: ColorBlocksProps) => {
  // color blocks for each category

  const colorStates = useColorStates();
  const deferredColorStates = useDeferredValue(colorStates);
  const { isChangingColor } = useCalculatingState();

  return (
    <section {...props} className={`${styles.main} ${props.className}`}>
      {colorStates &&
        Object.entries(colorStates).map(([category, state]: [string, any]) => {
          return (
            <div key={category} className={styles.variants}>
              {state.variants.map(({ cssVar }) => {
                return (
                  <ColorBlock
                    key={`${category}-${cssVar.slice(6, -1)}`}
                    cssVar={cssVar}
                    currentTextColor={
                      deferredColorStates[category].variants.find(
                        (variant) => variant.cssVar === cssVar
                      ).contrastingTextColor
                    }
                    isCalculating={
                      [state.isRelativeTo, category].includes(isChangingColor)
                        ? true
                        : false
                    }
                  >
                    <ColorInfo
                      colorState={deferredColorStates[category].variants.find(
                        (variant) => variant.cssVar === cssVar
                      )}
                      isCalculating={
                        [state.isRelativeTo, category].includes(isChangingColor)
                          ? true
                          : false
                      }
                    />
                  </ColorBlock>
                );
              })}
            </div>
          );
        })}
    </section>
  );
};

interface ColorBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  cssVar: string;
  className?: string;
  currentTextColor: string;
  isCalculating: boolean;
}

/**
 * A functional component that renders a styled color block.
 *
 * @param props - An object containing the following properties:
 *   @param props.cssVar - A CSS variable representing the background color.
 *   @param props.className - Additional class names for styling.
 *   @param props.currentTextColor - The text color to be used within the block.
 *   @param props.isCalculating - A boolean indicating whether the color is being recalculated.
 *   @param props.children - Any child elements to be rendered inside the block.
 *   @param props.otherProps - Any additional properties to be applied to the div element.
 *
 * @returns A JSX element representing a color block with a specified background and text color.
 */
const ColorBlock = (props: ColorBlockProps) => {
  const { cssVar, className, currentTextColor, isCalculating, ...otherProps } =
    props;

  return (
    <div
      {...otherProps}
      id={`${cssVar.slice(6, -1)}`}
      className={`${styles.blocks} ${className}`}
    >
      <p
        className={`${styles.blockName}`}
        style={{
          backgroundColor: cssVar,
          color: isCalculating
            ? `color-mix(in oklab, ${currentTextColor}, transparent 30%)`
            : currentTextColor,
        }}
      >
        {cssVar}
      </p>
      {props.children}
    </div>
  );
};

interface ColorInfoProps extends React.HTMLAttributes<HTMLParagraphElement> {
  colorState: any;
  isCalculating: boolean;
}

/**
 * A functional component that renders a single paragraph element with the computed value
 * of a CSS custom property.
 *
 * @param props - An object containing the following properties:
 *   @param props.colorState - An object containing the computed value of a CSS custom property.
 *   @param props.isCalculating - A boolean indicating whether the corresponding color is currently being recalculated.
 *   @param props.className - Additional class names for styling the component.
 *   @param props.children - A React element or elements to be rendered within the paragraph element.
 *
 * @returns A JSX element representing a paragraph element with the computed value of a CSS custom property.
 */
const ColorInfo = (props: ColorInfoProps) => {
  const { colorState, isCalculating, ...otherProps } = props;

  const classNames = `${styles.blockInfo} ${
    isCalculating ? styles.loading : ""
  } ${props.className || ""}`;

  return (
    <p className={classNames} {...otherProps}>
      {colorState.computedValue}
    </p>
  );
};

export default ColorBlocks;
