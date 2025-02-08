import { ColorBlocks, ColorPickers } from "./components";
import { ColorStateProvider } from "./ColorContext";

import "./App.css";
import styles from "./App.module.css";
import { ArrowFatRight } from "@phosphor-icons/react";
import { Icon } from "@iconify/react";

const Social = ({ variant, fillColor = "var(--text-base)", ...props }) => {
  return (
    <div className={styles.socials}>
      <p>Made by Corey Hatton</p>
      <div className={styles.socialIcons}>
        <a
          href="https://www.linkedin.com/in/corey-hatton/"
          target="_blank"
          title="LinkedIn"
        >
          <Icon
            icon="ri:linkedin-box-fill"
            color={fillColor}
            height="1.2rem"
            {...props}
          />
        </a>
        <a
          href="https://github.com/coreyhatton/"
          target="_blank"
          title="Github"
        >
          <Icon
            icon="ri:github-fill"
            color={fillColor}
            height="1.2rem"
            {...props}
          />
        </a>
        <a href="mailto:hello@coreyhatton.au" target="_blank" title="Email">
          <Icon
            icon="ri:mail-fill"
            color={fillColor}
            height="1.2rem"
            {...props}
          />
        </a>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <>
      <header className={styles.header}>
        <h1>default.css Color Demo</h1>
        <p>
          Color system using relative color functions implemented entirely in
          css
        </p>
      </header>
      <main className="app">
        <section>
          <ColorStateProvider>
            <ColorPickers />
            <ColorBlocks />
          </ColorStateProvider>
        </section>
        <hr />
        <section className={styles.info}>
          <h2>Project Background</h2>
          <p>
            default.css is a classless CSS framework that allows you to quickly
            theme your project. It provides a custom color system that gives you
            full control over the colors used in your design.
          </p>
          <h2>How it works</h2>
          <p>
            The color system is based on the concept of CSS relative color
            functions as described in{" "}
            <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors">
              "Using relative colors"
            </a>{" "}
            on MDN, and heavily inspired by{" "}
            <a href="https://developer.chrome.com/blog/css-relative-color-syntax">
              "CSS relative color syntax"
            </a>{" "}
            by Adam Argyle on the Chrome blog. .
          </p>
          <p>
            The color system uses relative color functions to create a
            complimentary color palette out of your primary color. The main
            color tokens are designed to be flexible and customizable. Each main
            token creates a set of lighter and darker shades based on a
            polynomial scale.
          </p>
          <h2>Usage</h2>
          <p>
            To use the custom color system in your project, you need to include
            the default.css framework in your HTML file. Currently this can be
            done by manually downloading and applying the stylesheet to your
            project code.
          </p>
          <h2>Customizing Colors</h2>
          <p>
            To customize the colors used in the default.css framework, you can
            modify the values of the color tokens in the{" "}
            <a href="https://github.com/coreyhatton/colorDemo/blob/main/src/styles/default.css/2.tokens/2.1.colors.css">
              ~/styles/default.css/2.tokens/2.1.colors.css
            </a>{" "}
            file. You can use any valid CSS color value, such as color names,
            hex codes, RGB values, etc. and the browser will handle the rest.
          </p>
          <p> ADD FILE CONTENTS HERE USING FILE API</p>
          <h2>Limitations and Notes</h2>
          <ul>
            <li className={styles.note}>
              <p>
                As the color variants are calculated based on the base color in
                the oklch color space (where the overall lightness and chroma
                values will vary), the lighter and darker shades may not be
                universally applicable to all applications of the system.
              </p>
              <Icon
                icon="ph:arrow-fat-right-fill"
                color="var(--color-secondary)"
                fill="var(--color-secondary)"
                height="2rem"
              />
              <p>
                Ensure contrast is sufficient when using different variants of
                the color tokens in your particular application.
              </p>
            </li>
          </ul>
        </section>
      </main>
      <footer className={styles.footer}>
        <Social variant="circle" fillColor="var(--text-base)" />
      </footer>
    </>
  );
};

export default App;
