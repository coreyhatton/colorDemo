import Color from "colorjs.io";
import useCssCustomProperties from "./useCssCustomProps";

/**
 * Takes a Color object and returns a hex string for the color in the sRGB color space.
 * If the hex string is longer than 7 characters (i.e. it includes alpha), it is truncated
 * to 7 characters.
 *
 * @param colorObj - The Color object to convert to a hex string
 * @returns A hex string for the color in the sRGB color space
 */
export const toHex = (colorObj: Color) => {
  const srgb = colorObj.to("srgb");
  const hex = srgb.toString({ format: "hex", collapse: false });
  return hex.length > 7 ? hex.slice(0, 7) : hex;
};

/**
 * Returns a string that can be used as a CSS color property value
 * that is relative to the given color space.
 *
 * The returned string is in the format of a CSS relative color
 * syntax, e.g. `oklch(from var(--color-primary) l c h)`.
 *
 * @param value - The color value to convert, e.g. "var(--color-primary)"
 * @param inColorSpace - The color space to convert to, e.g. "srgb" or "oklab"
 * @returns A string in the format of a CSS relative color syntax
 */
export const useRelativeDomColor = (value: string, inColorSpace: string) => {
  const spaces = [
    {
      name: ["oklch", "lch"],
      channels: ["l", "c", "h"],
      relative: value.includes("lch") ? value : `oklch(from ${value} l c h)`,
    },
    {
      name: ["oklab", "lab"],
      channels: ["l", "a", "b"],
      relative: value.includes("lab") ? value : `oklab(from ${value} l a b)`,
    },
    {
      name: ["hex", "rgb", "srgb"],
      channels: ["r", "g", "b"],
      relative: value.includes("rgb") ? value : `rgb(from ${value} r g b)`,
    },
    {
      name: ["hsl"],
      channels: ["h", "s", "l"],
      relative:
        value.includes("hsv") || value.includes("hsl")
          ? value
          : `hsl(from ${value} h s l)`,
    },
  ];

  const spaceObj = spaces.find((space) => space.name.includes(inColorSpace));
  if (spaceObj) {
    return spaceObj.relative;
  } else {
    console.warn("Unknown color space: ", inColorSpace);
    return value;
  }
};

export const initializeColors = (
  categories = ["primary", "secondary", "tertiary", "accent"],
  cssColorProperties = {
    primary: "--color-primary",
    secondary: "--color-secondary",
    tertiary: "--color-tertiary",
    accent: "--color-accent",
  }
) => {
  const { getAllProperties, computeColorProperty } = useCssCustomProperties();

  const customPropertyValues = getAllProperties();

  const parsedColors = categories.map((category) => {
    const obj = {};
    try {
      const colorValue = customPropertyValues[cssColorProperties[category]];
      obj[category] = new Color(colorValue);
    } catch {
      const colorValue = computeColorProperty(cssColorProperties[category]);
      obj[category] = new Color(colorValue);
    }

    return {
      [category]: obj[category],
    };
  });

  const initialColors = Object.assign({}, ...parsedColors);

  return {
    primary: {
      ...initialColors.primary,
      isRelative: true,
      hasChanged: false,
      value: toHex(initialColors.primary),
    },
    secondary: {
      ...initialColors.secondary,
      isRelative: true,
      hasChanged: false,
      value: toHex(initialColors.secondary),
    },
    tertiary: {
      ...initialColors.tertiary,
      isRelative: true,
      hasChanged: false,
      value: toHex(initialColors.tertiary),
    },
    accent: {
      ...initialColors.accent,
      isRelative: true,
      hasChanged: false,
      value: toHex(initialColors.accent),
    },
  };
};
