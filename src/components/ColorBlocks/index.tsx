import { memo, useDeferredValue, useRef } from "react";
import {
  useCalculatingState,
  useColorStates,
  useInfoState,
} from "@/src/ColorContext";

import styles from "./ColorBlocks.module.css";
import { useToggleState } from "react-stately";
import { useFocusRing, useSwitch, VisuallyHidden } from "react-aria";
import { Icon } from "@iconify/react";

export interface ColorBlocksProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  isMainColor?: boolean;
  mainColorFormat?: string;
}

export interface ColorBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  cssVar: string;
  className?: string;
  currentTextColor: string;
  isMainColor: boolean;
  isCalculating: boolean;
}

export interface ColorInfoProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  colorState: any;
  isCalculating: boolean;
  isVisible: boolean;
}

/**
 * Renders a collection of color blocks with their corresponding colors,
 * variants, and text colors.
 *
 * @param props - An object containing the following properties:
 *   @param props.className - Additional class names for styling the component.
 *   @param props.mainColorFormat - Format for identifying our primary color block. Should match to CSS variable format e.g. "--color-"
 *   @param props.isMainColor - A boolean indicating whether the block is the main color.
 */
export const ColorBlocks = memo(
  ({
    isMainColor = false,
    className = "",
    mainColorFormat = "",
    ...props
  }: ColorBlocksProps) => {
    const colorStates = useColorStates();
    const deferredColorStates = useDeferredValue(colorStates);

    const { isChangingColor } = useCalculatingState();
    const { isShown, setIsShown } = useInfoState();

    return (
      <section {...props} className={`${styles.main} ${className}`}>
        <InfoSwitch
          isDisabled={isChangingColor}
          className={styles.infoSwitch}
          onChange={() => setIsShown(!isShown)}
        >
          Show color info?
        </InfoSwitch>
        {colorStates &&
          Object.entries(colorStates).map(
            ([category, state]: [string, any]) => {
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
                          [state.isRelativeTo, category].includes(
                            isChangingColor
                          )
                            ? true
                            : false
                        }
                        isMainColor={cssVar.includes(mainColorFormat)}
                      >
                        <ColorInfo
                          colorState={deferredColorStates[
                            category
                          ].variants.find(
                            (variant) => variant.cssVar === cssVar
                          )}
                          isVisible={isShown}
                          isCalculating={
                            [state.isRelativeTo, category].includes(
                              isChangingColor
                            )
                              ? true
                              : false
                          }
                        />
                      </ColorBlock>
                    );
                  })}
                </div>
              );
            }
          )}
      </section>
    );
  }
);

/**
 * A functional component that renders a styled color block.
 *
 * @param props - An object containing the following properties:
 *   @param props.cssVar - A CSS variable representing the background color.
 *   @param props.className - Additional class names for styling.
 *   @param props.currentTextColor - The text color to be used within the block.
 *   @param props.isMainColor - A boolean indicating whether the block is the main color.
 *   @param props.isCalculating - A boolean indicating whether the color is being recalculated.
 *   @param props.children - Any child elements to be rendered inside the block.
 *   @param props.wrapperProps - Any additional properties to be applied to the div element.
 */
const ColorBlock = memo((props: ColorBlockProps) => {
  const {
    cssVar,
    className,
    currentTextColor,
    isMainColor,
    isCalculating,
    ...wrapperProps
  } = props;

  const styleProperty = {
    ["--block-color"]: cssVar,
  } as React.CSSProperties;

  return (
    <>
      <div
        {...wrapperProps}
        id={`${cssVar.slice(6, -1)}`}
        className={`${styles.blocks} ${className || ""} ${
          isMainColor ? styles.mainBlock : ""
        }`}
        style={{ ...styleProperty, ...props.style }}
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
    </>
  );
});

/**
 * A functional component that renders a single paragraph element with the computed value
 * of a CSS custom property.
 *
 * @param props - An object containing the following properties:
 *   @param props.colorState - An object containing the computed value of a CSS custom property.
 *   @param props.isCalculating - A boolean indicating whether the corresponding color is currently being recalculated.
 *   @param props.className - Additional class names for styling the component.
 *   @param props.children - A React element or elements to be rendered within the paragraph element.
 */
const ColorInfo = (props: ColorInfoProps) => {
  const { colorState, isCalculating, isVisible, ...otherProps } = props;

  const classNames = `
  ${styles.blockInfo} 
  ${isCalculating ? styles.loading : ""} 
  ${isVisible ? styles.visible : styles.hidden}
  ${props.className || ""}
  `;

  return (
    <div className={classNames} {...otherProps}>
      {colorState.computedValue}
    </div>
  );
};

/**
 * A functional component that renders a switch element to toggle the visibility of the color information blocks.
 *
 * @param props - An object containing the following properties:
 *   @param props.children - A React element or elements to be rendered as the label content.
 *   @param props.isDisabled - A boolean indicating whether the switch is disabled.
 *   @param props.style - An object containing additional CSS styles to be applied to the label element.
 *   @param props.className - Additional class names for styling the component.
 */
const InfoSwitch = ({ ...props }) => {
  const { isShown } = useInfoState();

  const state = useToggleState({ ...props, isSelected: isShown });
  const ref = useRef(null);

  const { inputProps, labelProps } = useSwitch(props, state, ref);
  const { isFocusVisible, focusProps } = useFocusRing();

  return (
    <label
      {...labelProps}
      style={{
        opacity: props.isDisabled ? 0.4 : 1,
        ...props.style,
      }}
      className={`${styles.infoSwitch} ${props.className || ""}`}
      title="Toggle color info block visibility"
    >
      {props.children}
      <VisuallyHidden>
        <input {...inputProps} {...focusProps} ref={ref} />
      </VisuallyHidden>
      {isFocusVisible && <span className={styles.focusRing} />}
      {isShown ? (
        <Icon
          icon="ri:toggle-fill"
          height={"1.5em"}
          style={{ color: "var(--color-accent)" }}
          aria-hidden="true"
        />
      ) : (
        <Icon
          icon="ri:toggle-line"
          height={"1.5em"}
          style={{ color: "var(--color-accent)" }}
          aria-hidden="true"
        />
      )}
    </label>
  );
};

export default ColorBlocks;
