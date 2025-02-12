import { Icon } from "@iconify/react";

import { ColorBlocks, ColorPickers } from "./components";
import { ColorStateProvider } from "./ColorContext";
import styles from "./App.module.css";
import colorCurves from "./assets/colorCurves.png";

const content = [
  {
    title: "Project Background",
    content: (
      <>
        <p>
          default.css is a semantic CSS framework that allows you to quickly
          theme your personal project with a classless CSS framework designed
          with personalisation in mind. It provides a custom color system
          contained completely in css that creates a complimentary color palette
          out of a single primary color.
        </p>
        <p>
          This color system is designed to be flexible and customizable. You can
          use any valid CSS color value, such as color names, hex codes, RGB
          values, etc. and the browser will handle the rest.
        </p>
        <code className={styles.todos}>
          {"// "}@todo: Add explanation of default.css. <br />
          {"// "}@todo: Add example of how to use the color system.
          <br />
          {"// "}@todo: Explain mechanics of web app and how it differs from
          sheet (i.e. auto text contrast etc.)
        </code>
      </>
    ),
  },
  {
    title: "How it works",
    content: (
      <>
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
          complimentary color palette out of your primary color. The main color
          tokens are designed to be flexible and customizable. Each main token
          creates a set of lighter and darker shades based on a custom
          lightening or darkening curve, ensuring a consistent set of shades.
        </p>
        <p>
          The creation of these shades can be further customised by changing the
          exponent property, <code>--exp</code>, in the main 2.1.colors.css
          file. This value governs the scale that the lightness and chroma
          values increase and decrease when darkening and lightening the color,
          where step 0 = no change and step 4 (<code>--xx-l1</code> or{" "}
          <code>--xx-d1</code>) = max or min lightness/chroma value. An exponent
          of 1 will give a linear scale of lightness changes. Higher exponents
          (above 1) create initial steps that start darker or lighter than the
          initial color value, while lower exponents (between 0 and 1) create a
          gradual transition between the initial and final color values.
        </p>
        <figure>
          <a href="https://docs.google.com/spreadsheets/d/1il4B_REEfI4hOUPJj9WifLjFszr-Jv7ixOB8vBZDee0/edit?usp=sharing">
            <img
              src={colorCurves}
              loading="lazy"
              title="Color Curves"
              alt="Visualisation of the lightness and chroma color curves"
              style={{ border: "1px solid var(--color-gray)" }}
            />
          </a>
          <figcaption>
            <p>
              A visualisation of the lightness and chroma curves that these
              formulas create, calculated using Google Sheets.
            </p>
          </figcaption>
        </figure>
        <p>
          For a detailed visualisation of the curves that these formulas create,
          check out the{" "}
          <a href="https://docs.google.com/spreadsheets/d/1il4B_REEfI4hOUPJj9WifLjFszr-Jv7ixOB8vBZDee0/edit?usp=sharing">
            {" "}
            Google Sheets document{" "}
          </a>{" "}
          linked here and in the README.
        </p>
        <code className={styles.todos}>
          {"// "}@todo: Add further explanations.
        </code>
      </>
    ),
  },
  {
    title: "Usage",
    content: (
      <>
        <p>
          To use the custom color system in your project, you need to include
          the default.css framework in your HTML file. Currently this can be
          manually downloaded from{" "}
          <a href="https://github.com/coreyhatton/colorDemo/blob/main/src/styles/default.css/2.tokens/2.1.colors.css">
            ~/styles/default.css/2.tokens/2.1.colors.css
          </a>{" "}
          and applied to your project manually.
        </p>
        <p>Node package likely coming soon™ to a cinema near you.</p>
        <code className={styles.todos}>
          {"// "}@todo: separate color system into its own package.
        </code>
      </>
    ),
  },
  {
    title: "Customizing Colors",
    content: (
      <>
        <p>
          To customize the colors used in the default.css framework, you can
          modify the values of the color tokens in the{" "}
          <a href="https://github.com/coreyhatton/colorDemo/blob/main/src/styles/default.css/2.tokens/2.1.colors.css">
            ~/styles/default.css/2.tokens/2.1.colors.css
          </a>{" "}
          file. You can use any valid CSS color value, such as color names, hex
          codes, RGB values, etc. and the browser will handle the rest.
        </p>
        <code className={styles.todos}>
          {"// "}@todo: add a list of variables users can play around with.
          <br />
          {"// "}@todo: document how the stylesheet pulls the user-inputted
          properties vs. relative properties.
        </code>
      </>
    ),
  },
  {
    title: "Limitations and Notes",
    content: (
      <>
        <ul>
          <li className={styles.faq}>
            <p>
              As the color variants are calculated based on the base color in
              the oklch color space (where the overall lightness and chroma
              values will vary), the lighter and darker shades may not be
              universally applicable to all applications of the system.
            </p>
            <Icon
              icon="ph:arrow-fat-right-fill"
              color="var(--colorBlock-icon)"
              fill="var(--colorBlock-icon)"
              height="2rem"
            />
            <p>
              Ensure contrast is sufficient when using different variants of the
              color tokens in your particular application.
            </p>
          </li>
        </ul>
        <code className={styles.todos}>
          {"// "}@todo: Add further limitations and notes
        </code>
      </>
    ),
  },
];

const Social = ({ fillColor = "var(--text-base)", ...props }) => {
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
  const colorBlockColors = [
    "--color-primary",
    "--color-secondary",
    "--color-tertiary",
    "--color-accent",
  ];

  return (
    <>
      <header className={styles.header}>
        <h1>default.css Color Demo</h1>
        <p>
          Color system using relative color functions implemented entirely in
          css
        </p>
      </header>
      <main className={styles.main}>
        <section className={styles.app}>
          <ColorStateProvider>
            <ColorPickers />
            <ColorBlocks mainColorFormat="--color-" />
          </ColorStateProvider>
          <a
            href="https://github.com/coreyhatton/colorDemo"
            target="_blank"
            style={{
              display: "flex",
              gap: "var(--gutter-sm)",
              placeItems: "center",
              textAlign: "start",
              placeSelf: "center",
              padding: "var(--spacing-sm) var(--spacing-md)",
              border: "1px solid var(--color-contrast)",
              borderRadius: "var(--spacing-md)",
              color: "var(--color-contrast)",
              textDecoration: "none",
              lineHeight: "1",
              backgroundColor:
                "color-mix(in oklab, var(--color-gray), transparent 90%)",
            }}
          >
            <Icon icon="ri:github-fill" height="2rem" />
            <p>
              Check out this page's source repository{" "}
              <Icon
                icon="ri:external-link-fill"
                height="1em"
                style={{
                  display: "inline",
                  verticalAlign: "text-bottom",
                }}
              />
            </p>
          </a>
        </section>
        <hr />
        <section className={styles.info}>
          {content.map(({ title, content }, index) => {
            let colorBlockColors__index =
              index === 0 ? 0 : index % colorBlockColors.length;
            const colorBlockColor = colorBlockColors[colorBlockColors__index++];
            return (
              <div
                key={title}
                className={styles.infoBlock}
                style={
                  {
                    ["--colorBlock-color"]: `var(${colorBlockColor})`,
                    ["--colorBlock-icon"]: `var(${colorBlockColor})`,
                  } as React.CSSProperties
                }
              >
                <h2>{title}</h2>
                {content}
              </div>
            );
          })}
        </section>
      </main>
      <footer className={styles.footer}>
        <Social fillColor="var(--primary-d1)" />
      </footer>
    </>
  );
};

export default App;
