import styles from "./ColorBlocks.module.css";
import { memo, use, useMemo } from "react";
import { ColorPickerContext } from "../../colorContext";

interface ColorBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  category: string;
  cssVar: string;
  contrastingTextColor: string;
  computedValue: string;
}

const ColorBlock = (props: ColorBlockProps) => {
  const {
    category,
    cssVar,
    computedValue,
    contrastingTextColor,
    ...otherProps
  } = props;

  const colorStyles = useMemo(() => {
    return {
      backgroundColor: cssVar,
      color: contrastingTextColor,
    };
  }, [contrastingTextColor, cssVar]);

  // TODO: add option to change display of color space
  // TODO: add option to show contrast value

  return (
    <>
      <div
        {...otherProps}
        key={`${category}-${cssVar.slice(6, -1)}`}
        id={`${cssVar.slice(6, -1)}`}
        className={`${styles.blocks} ${props.className}`}
      >
        <p className={styles.blockName} style={colorStyles}>
          {cssVar}
        </p>
        <p className={styles.blockInfo}>{computedValue}</p>
        {props.children}
      </div>
    </>
  );
};

interface ColorVariantsProps {
  colorStates: {
    [category: string]: {
      variants: {
        cssVar: string;
        computedValue: string;
        contrastingTextColor: string;
      }[];
    };
  };
}

/**
 * A component that renders a collection of color blocks for a given set of color objects.
 * The component is intended to be used within the ColorBlocks component.
 *
 * @param  colorObjects - An array of objects with category and cssTokens properties.
 * Each object represents a color category, and its cssTokens property is an array of CSS variables
 * that will be used to style the color blocks.
 *
 * @returns A React component that renders a collection of color blocks.
 */
const ColorVariants = ({ colorStates }: ColorVariantsProps) => {
  return (
    <>
      {Object.entries(colorStates).map(([category, stateObj]) => {
        return (
          <div key={category} className={styles.variants}>
            {stateObj.variants.map(
              ({ cssVar, contrastingTextColor, computedValue }) => {
                return (
                  <ColorBlock
                    key={`${category}-${cssVar.slice(6, -1)}`}
                    category={category}
                    cssVar={cssVar}
                    contrastingTextColor={contrastingTextColor}
                    computedValue={computedValue}
                  />
                );
              }
            )}
          </div>
        );
      })}
    </>
  );
};

/**
 * A component that renders blocks of color categories and their calculated variations.
 *
 * @returns A React component that renders blocks of color categories.
 */
export const ColorBlocks = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { colorStates } = use(ColorPickerContext) ?? {};

  return (
    <section {...props} className={`${styles.main} ${props.className}`}>
      <ColorVariants colorStates={colorStates} />
    </section>
  );
};

export default ColorBlocks;
