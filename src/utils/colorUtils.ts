import Color from "colorjs.io";
import useCssCustomProperties from "./useCssCustomProps";

interface ColorStateCategory {
  color: Color;
  isRelative: boolean;
  hasChanged: boolean;
  value: string;
}

interface ColorState {
  primary: ColorStateCategory;
  secondary: ColorStateCategory;
  tertiary: ColorStateCategory;
  accent: ColorStateCategory;
}

interface UseRelativeDomColorOptions {
  value: string;
  inColorSpace: string;
}

/**
 * Takes a Color object and returns a hex string for the color in the sRGB color space.
 * If the hex string is longer than 7 characters (i.e. it includes alpha), it is truncated
 * to 7 characters.
 *
 * @param colorObj - The Color object to convert to a hex string
 * @returns A hex string for the color in the sRGB color space
 */
const toHex = (colorObj: Color) => {
  const srgb = colorObj.to("srgb");
  const hex = srgb.toString({ format: "hex", collapse: false });
  return hex.length > 7 ? hex.slice(0, 7) : hex;
};

/**
 * Returns a string that can be used as a CSS color property value
 * that is relative to the given color space.
 *
 * Returns a string in CSS relative color syntax,
 * e.g. `oklch(from var(--color-primary) l c h)`.
 *
 * @param value - The color value to convert, e.g. "var(--color-primary)"
 * @param inColorSpace - The color space to convert to, e.g. "srgb" or "oklab"
 * @returns A string that can be used as a CSS color property value
 */
const useRelativeDomColor = ({
  value,
  inColorSpace,
}: UseRelativeDomColorOptions) => {
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

const getContrastingText = (
  colorCurrent: string | Color,
  bgColorObj: Color,
  colorVariables: {
    current: string;
    alt: string;
  }
) => {
  let colorObjCurrent =
    typeof colorCurrent === "string" ? new Color(colorCurrent) : colorCurrent;

  let recommendedColor = colorVariables.current;

  const contrast = colorObjCurrent.contrast(bgColorObj, "Lstar");

  if (contrast < 30) {
    recommendedColor = colorVariables.alt;
  }

  // console.log("contrast: " + contrast);

  return { lStarValue: contrast, recommendedColor };
};

interface InitializeColorsOptions {
  categories?: string[];
  cssColorProperties?: { [key: string]: string };
  textColorProperties?: { [key: string]: string };
}

const initializeColors = ({
  categories = ["primary", "secondary", "tertiary", "accent"],
  cssColorProperties = {
    primary: "--color-primary",
    secondary: "--color-secondary",
    tertiary: "--color-tertiary",
    accent: "--color-accent",
  },
  textColorProperties = {
    base: "--text-base",
    contrast: "--text-contrast",
  },
}: InitializeColorsOptions) => {
  const { getAllProperties, computeColorProperty } = useCssCustomProperties();

  const customPropertyValues = getAllProperties();

  const parseTextColors = () => {
    const obj = { base: {} as any, contrast: {} as any };

    Object.entries(textColorProperties).map(([key, value]) => {
      try {
        const colorValue = customPropertyValues[value];
        obj[key] = new Color(colorValue);
      } catch {
        console.warn(
          `Unable to get ${value} from custom properties. Using computed value.`
        );
        const colorValue = computeColorProperty(value);
        obj[key] = new Color(colorValue);
      }
    });

    return obj;
  };

  const parsedTextColors = parseTextColors();

  // TODO: Change away from try catch
  const parsedColors = categories.map((category) => {
    const obj = {};
    try {
      const colorValue = customPropertyValues[cssColorProperties[category]];
      obj[category] = new Color(colorValue);
    } catch {
      const colorValue = computeColorProperty(cssColorProperties[category]);
      obj[category] = new Color(colorValue);
    }

    const variantTokens = [
      `var(--${category}-l4)`,
      `var(--${category}-l3)`,
      `var(--${category}-l2)`,
      `var(--${category}-l1)`,
      `var(--color-${category})`,
      `var(--${category}-d1)`,
      `var(--${category}-d2)`,
      `var(--${category}-d3)`,
      `var(--${category}-d4)`,
    ];

    const variants = variantTokens.map((token) => {
      const computedProperty = new Color(computeColorProperty(token));
      const contrastingTextColor =
        computedProperty.contrastLstar(parsedTextColors.base) > 50
          ? "var(--text-base)"
          : "var(--text-contrast)";

      return {
        cssVar: token,
        computedValue: computedProperty.to("oklch").toString({ precision: 2 }),
        contrastingTextColor: contrastingTextColor,
      };
    });

    return {
      [category]: {
        ...obj[category],
        isRelative: true,
        hasChanged: false,
        value: toHex(obj[category]),
        variants,
      },
    };
  });

  const initialColors = Object.assign({}, ...parsedColors);

  return { initialColors, parsedTextColors };
};

export { toHex, useRelativeDomColor, initializeColors, getContrastingText };
export type { ColorState, ColorStateCategory };
