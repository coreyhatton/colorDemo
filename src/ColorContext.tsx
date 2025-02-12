import {
  createContext,
  use,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { initializeColors } from "./utils";

interface ColorContextType {
  current: any;
  __initial: any;
  __parsedTextColors: any;
  calculatingState: any;
  infoState: any;
  rootRef: any;
}

const ColorContext = createContext<ColorContextType | null>(null);
const ColorDispatchContext = createContext<React.Dispatch<any>>(() => {});

/**
 * Provider component for the ColorState context.
 *
 * This component wraps the color state logic and provides it to all components
 * that are children of this component.
 *
 * @param children - The children components to wrap with the context.
 * @returns The ColorStateProvider component.
 */
export const ColorStateProvider = ({ children }) => {
  const [states, dispatch] = useReducer(
    stateReducer,
    { cssColorProperties },
    initializeColors
  );

  const [isChangingColor, setIsChangingColor] = useState<string | null>(null);

  const [isShown, setIsShown] = useState(true);

  const calculatingState = {
    isChangingColor,
    setIsChangingColor,
  };

  const infoState = {
    isShown,
    setIsShown,
  };

  const rootRef = useRef(document.documentElement);

  const colorStates = useMemo(() => {
    return {
      ...states,
    };
  }, [states]);

  return (
    <ColorContext.Provider
      value={{ ...colorStates, calculatingState, infoState, rootRef }}
    >
      <ColorDispatchContext.Provider value={dispatch}>
        {children}
      </ColorDispatchContext.Provider>
    </ColorContext.Provider>
  );
};

/**
 * Reducer for the color state. Handles the following actions:
 *
 * - `SET_COLOR` and `UPDATE_COLOR`:
 *   Updates the color state for a single color category.
 *   The payload should contain the color category and the new color value.
 *   The color value should be an object with at least a `value` property.
 * - `SET_ALL_COLORS`:
 *   Updates the color state for all color categories.
 *   The payload should contain an object with color categories as properties,
 *   and color values as values.
 * - `RESET`:
 *   Resets the color state to its initial state.
 *
 * Returns a new state object with the updated color state.
 *
 * @param {object} state - The current state.
 * @param {object} action - The action to handle.
 * @returns {object} The new state object.
 */
const stateReducer = (state: any, action: any) => {
  const currentState = state.current;

  switch (action.type) {
    case "SET_COLOR":
    case "UPDATE_COLOR":
      return {
        ...state,
        current: {
          ...currentState,
          [action.category]: {
            ...currentState[action.category],
            ...action.payload,
          },
        },
      };
    case "SET_ALL_COLORS":
      const propertyPayload = Object.keys(action.payload).map((key) => {
        return {
          [key]: {
            ...currentState[key],
            ...action.payload[key],
          },
        };
      });

      const newState = Object.assign({}, ...propertyPayload);
      return { ...state, current: { ...currentState, ...newState } };
    case "RESET":
      return { ...state, current: state.__initial };
    default:
      return { ...state };
  }
};

export const cssColorProperties = {
  primary: "--color-primary",
  secondary: "--color-secondary",
  tertiary: "--color-tertiary",
  accent: "--color-accent",
};

export const initialRootStyle = window.getComputedStyle(
  document.documentElement
);

export const useColorStates = () => {
  return use(ColorContext)?.current ?? {};
};

export const useCalculatingState = () => {
  return use(ColorContext)?.calculatingState ?? {};
};

export const useInfoState = () => {
  return use(ColorContext)?.infoState ?? {};
};

export const useRootRef = () => {
  return use(ColorContext)?.rootRef ?? {};
};

export const useColorStateDispatch = () => {
  return use(ColorDispatchContext);
};

export const getInitialStates = () => {
  const context = use(ColorContext);

  return context?.__initial ?? {};
};

export const getParsedTextColors = () => {
  const context = use(ColorContext);

  return context?.__parsedTextColors ?? {};
};
