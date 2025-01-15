import clsx from "clsx";

import styles from "./ColorBlocks.module.css";

/**
 * A component that renders blocks of color categories and their calculated variations.
 *
 * @returns A React component that renders blocks of color categories.
 */
export const ColorBlocks = (props) => {
  const { categories } = props;

  const colorTokens = categories.map((category) => ({
    category,
    propertyName: `--color-${category}`,
    cssTokens: [
      `var(--color-${category})`,
      `var(--${category}-l1)`,
      `var(--${category}-l2)`,
      `var(--${category}-l3)`,
      `var(--${category}-d1)`,
      `var(--${category}-d2)`,
      `var(--${category}-d3)`,
    ],
  }));

  return (
    <div className={styles.main}>
      <h2>Calculated color palette</h2>
      <ColorVariations colorObjects={colorTokens} />
    </div>
  );
};

/**
 * A component that renders a color block with a given id, style, and class names.
 * The component is intended to be used within the ColorBlocks component.
 *
 * @param {{ id: string, style: CSSProperties, className?: string}} props - The component props.
 * @returns A React component that renders a color block.
 */
const ColorBlock = (props) => {
  const { id, style, className = "" } = props;

  return (
    <div id={id} className={clsx(styles.blocks, className)} style={style}>
      {props.children && props.children}
    </div>
  );
};

/**
 * A component that renders a collection of color blocks for a given set of color objects.
 * The component is intended to be used within the ColorBlocks component.
 *
 * @param {{ category: string, cssTokens: string[] }[]} colorObjects - An array of objects with category and cssTokens properties.
 * Each object represents a color category, and its cssTokens property is an array of CSS variables
 * that will be used to style the color blocks.
 *
 * @returns A React component that renders a collection of color blocks.
 */
const ColorVariations = ({ colorObjects }) => {
  return (
    <>
      {colorObjects.map(({ category, cssTokens }) => {
        return (
          <div key={category} className={styles.columns}>
            {cssTokens.map((cssVar) => (
              <ColorBlock
                key={`${category}-${cssVar.slice(6, -1)}`}
                id={`${cssVar.slice(6, -1)}`}
                style={{ backgroundColor: cssVar }}
              >
                <span
                  style={{
                    color: "white",
                    fontSize: "small",
                  }}
                >
                  {cssVar}
                </span>
              </ColorBlock>
            ))}
          </div>
        );
      })}
    </>
  );
};

export default ColorBlocks;
