import {
  mergeProps,
  useButton,
  useFocusRing,
  type AriaButtonOptions,
} from "react-aria";
import React, { useRef } from "react";
import clsx from "clsx";
import styles from "./Button.module.css";

type CombinedButtonProps = AriaButtonOptions<"button"> &
  Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    keyof AriaButtonOptions<"button">
  >;

/**
 * The interface for the Button component's props.
 */
export interface ButtonProps extends CombinedButtonProps {
  /**
   * The variant of the button.
   * @default "primary"
   */
  variant?: "primary" | "secondary" | "icon" | "reset";

  /**
   * The class name for the button.
   */
  className?: string;

  /**
   * The style object for the button.
   * @default {}
   */
  style?: React.CSSProperties;

  /**
   * The background string for the button.
   * @default ""
   */
  background?: string;

  /**
   * Whether the button should be rounded.
   * @default false
   */
  isRounded?: boolean;

  /**
   * Whether the button is disabled.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * The children of the button.
   */
  children?: React.ReactNode;
}

/**
 * A simple button component using `react-aria`'s
 * `useButton` hook for accessibility.
 *
 * @param {ButtonProps} props - The props for the button.
 * @returns The button element.
 */
export const Button = ({
  variant = "primary",
  style = {},
  background = "",
  isRounded = false,
  isDisabled = false,
  ...props
}: ButtonProps) => {
  const ref = useRef<HTMLButtonElement | null>(null);
  const { buttonProps, isPressed } = useButton(props, ref);
  const { isFocusVisible, focusProps } = useFocusRing();

  const mergedProps = mergeProps(props, buttonProps, focusProps);

  const styleProps = { background, ...style };

  const setClassNamesByVariant = () => {
    let classNames = "";

    switch (variant) {
      case "primary":
        classNames = styles.primary;
        break;
      case "secondary":
        classNames = styles.secondary;
        break;
      case "icon":
        classNames = styles.icon;
        break;
      case "reset":
        classNames = styles.icon;
        break;
      default:
        classNames = styles.primary;
    }

    return classNames;
  };

  const buttonClassName = clsx(
    props.className,
    styles.main,
    isPressed && styles.isPressed,
    isRounded && styles.isRounded,
    isDisabled && styles.isDisabled,
    isFocusVisible && styles.focusRing,
    setClassNamesByVariant()
  );

  return (
    <button
      // React-aria's useButton hook doesn't extend our style, children or
      // className props so we need to add them manually
      {...mergedProps}
      style={styleProps}
      className={buttonClassName}
      ref={ref}
    >
      {props.children}
    </button>
  );
};
