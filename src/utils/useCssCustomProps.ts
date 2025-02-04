import Color from "colorjs.io";
import { toHex, useRelativeDomColor } from "./colorUtils";

/**
 * Interface representing a CSS Custom Properties object.
 */
export interface CssCustomPropertiesObject {
  /**
   * The root HTML element from which the CSS custom properties are derived.
   */
  root: HTMLElement;

  /**
   * The computed styles of the root HTML element.
   */
  rootStyle: CSSStyleDeclaration;

  /**
   * Sets a CSS custom property to a specified value.
   *
   * @param property - The name of the custom property to set.
   * @param value - The value to assign to the custom property.
   */
  setProperties: (property: string, value: string) => void;

  /**
   * Retrieves the value of a specified CSS custom property or properties.
   *
   * @param property - The name(s) of the custom property/properties to retrieve.
   * @returns The value(s) of the specified custom property/properties.
   */
  getProperties: (property: string | string[]) => string;

  /**
   * Retrieves all CSS custom properties as an object.
   *
   * @returns An object containing all CSS custom properties and their values.
   */
  getAllProperties: () => { [key: string]: string };

  /**
   * Computes a color property in a specified color space.
   *
   * @param property - The color property to compute.
   * @param inColorSpace - The color space to use for computation.
   * @param asColorObject - Whether to return the computed color as a Color object.
   * @returns The computed color property value.
   */
  computeColorProperty: (
    property: string,
    inColorSpace?: string,
    asColorObject?: boolean
  ) => string | Color;

  /**
   * Resets the CSS custom properties to their initial styles.
   *
   * @param initialStyle - The initial style declaration or string to reset to.
   */
  resetToInitial: (initialStyle: CSSStyleDeclaration | String) => void;
}

/**
 * A function that returns the current CSS custom properties
 * of the given HTMLElement or ref (or the document root by default).
 *
 * The properties are read from the computed styles of the root element.
 *
 * @param rootRef - the HTMLElement to read the custom properties from.
 */
export const useCssCustomProperties = (
  rootRef: HTMLElement | React.RefObject<HTMLElement> = document.documentElement
): CssCustomPropertiesObject => {
  const root =
    rootRef instanceof HTMLElement
      ? rootRef
      : rootRef?.current || document.documentElement;

  const rootStyle = window.getComputedStyle(root);

  /**
   * Function to set CSS custom properties on the root element.
   * Accepts either an array of property-value pairs or individual property-value arguments.
   */
  const setProperties = (...args) => {
    if (!root) {
      return null;
    }
    if (
      args.length === 1 &&
      typeof args[0] === "object" &&
      Array.isArray(args[0])
    ) {
      return args[0].forEach((arg) => setProperties(...arg));
    } else if (args.length === 2 || args.length === 3) {
      const [cssProperty, value, prefix = ""] = args;

      let _cssProp = "";

      if (cssProperty.startsWith("var(")) {
        _cssProp = cssProperty.slice(4, -1);
      } else if (cssProperty.startsWith("--")) {
        _cssProp = cssProperty;
      } else {
        _cssProp = `--${cssProperty}`;
      }
      const prefixedProperty = _cssProp.startsWith(`--${prefix}`)
        ? _cssProp
        : _cssProp.startsWith("--")
        ? `--${prefix}-${_cssProp.slice(2)}`
        : `--${prefix}-${_cssProp}`;

      root.style.setProperty(prefixedProperty, value);
    } else {
      throw new Error("Two or three args expected.");
    }
  };

  /**
   * Function to get CSS custom properties from the root element.
   * If a specific property is provided, its value is returned.
   * Otherwise, all custom properties are returned.
   */
  const getProperties = (cssProperty?: any) => {
    if (cssProperty === "all" || cssProperty === "*" || !cssProperty) {
      return getAllProperties();
    }

    if (
      typeof cssProperty === "object" &&
      Array.isArray(cssProperty) &&
      cssProperty.length > 0
    ) {
      return cssProperty.map((p: any) => getProperties(p));
    }

    let _cssProp = "";

    if (cssProperty.startsWith("var(")) {
      _cssProp = cssProperty.slice(4, -1);
    } else if (cssProperty.startsWith("--")) {
      _cssProp = cssProperty;
    } else {
      _cssProp = `--${cssProperty}`;
    }

    if (rootStyle[_cssProp]) {
      return rootStyle[_cssProp];
    }

    const computedProperty = rootStyle.getPropertyValue(cssProperty);

    return computedProperty;
  };

  /**
   * Function to retrieve all CSS custom properties from the root element.
   */
  const getAllProperties = () => {
    // use CSSOM api where available - supported by Chromium-based browsers
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Element/computedStyleMap
    if (!!root.computedStyleMap) {
      const style = root.computedStyleMap();

      // Iterator helpers not currently available in Safari
      // const styles = !style
      //   ? []
      //   : style
      //       .entries()
      //       .filter(([key]) => key.startsWith("--"))
      //     .map(([key, value]) => ({ [key]: value.toString() }));

      // const propertyObject = Object.assign({}, ...styles);
      // return propertyObject;

      const styles = {};
      if (!!style) {
        for (const [key, value] of style) {
          if (key.startsWith("--")) {
            styles[key] = value.toString();
          }
        }
      }
      return styles;
    } else {
      // firefox-specific workaround
      const styleObject = {};
      for (let index = 0; index < rootStyle.length; index++) {
        const property = rootStyle[index];

        if (property.startsWith("--")) {
          const value = rootStyle.getPropertyValue(property);
          styleObject[property] = value;
        }
      }

      return styleObject;
    }
  };

  /**
   * Function to compute a CSS color property in the desired color space.
   */
  const computeColorProperty = (
    cssProperty: string,
    inColorSpace: string = "rgb",
    asColorObject: boolean = false
  ) => {
    const property = "color";

    // Converts format to '--xxx' format if necessary
    let _cssProp = "";

    if (cssProperty.startsWith("var(")) {
      _cssProp = cssProperty.slice(4, -1);
    } else if (cssProperty.startsWith("--")) {
      _cssProp = cssProperty;
    } else {
      _cssProp = `--${cssProperty}`;
    }
    const initialValue = getProperties(_cssProp);
    const colorValue = useRelativeDomColor({
      value: initialValue,
      inColorSpace,
    });

    // adds a temporary element to the DOM to compute the color using browser apis
    const computingElement = document.createElement("div");
    document.body.appendChild(computingElement);
    computingElement.style.setProperty(property, colorValue);
    const computedProperty = window
      .getComputedStyle(computingElement)
      .getPropertyValue(property);

    const convertToSpace = (inColorSpace: string) => {
      try {
        const colorObj = new Color(computedProperty);
        return inColorSpace === "hex"
          ? toHex(colorObj)
          : colorObj.to(inColorSpace).toString();
      } catch {
        console.warn(
          `Unable to convert ${computedProperty} to ${inColorSpace}. Returning original value.`
        );
        return computedProperty;
      }
    };

    const convertedProperty =
      !inColorSpace || computedProperty.includes(inColorSpace)
        ? computedProperty // Skips conversion if not necessary
        : convertToSpace(inColorSpace);

    // removes the temporary element from the DOM
    document.body.removeChild(computingElement);

    return asColorObject ? new Color(convertedProperty) : convertedProperty;
  };

  /**
   * Function to reset the root element to its initial state.
   */
  const resetToInitial = (initialStyle: CSSStyleDeclaration | String) => {
    root.style.cssText = (initialStyle || "").toString();
  };

  /**
   * An object containing the state, root element, and functions to manipulate the root element's
   * CSS custom properties.
   */
  return {
    root,
    rootStyle,
    setProperties,
    getProperties,
    getAllProperties,
    computeColorProperty,
    resetToInitial,
  } as const;
};

export default useCssCustomProperties;
