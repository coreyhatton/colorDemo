# [[WIP]] default.css: A Custom CSS Framework for Theming

default.css is a classless CSS framework that allows you to quickly theme your project. It provides a custom color system that gives you full control over the colors used in your design.

## Color Tokens

[![View color tokens src](https://img.shields.io/badge/-View%20color%20tokens%20src-teal)](src/styles/default.css/2.tokens/2.1.colors.css)

The color system uses [insert link] css relative color syntax to create a complimentary color palette out of your primary color.  
The color tokens are designed to be flexible and customizable. You can adjust their values in the [src/styles/default.css/2.tokens/2.1.colors.css] file to create the desired color scheme for your project.

## Usage

To use the custom color system in your project, you need to include the default.css framework in your HTML file. You can do this by adding the following line to the `<head>` section of your HTML:

_-- framework coming soon! --_

Once you've included the framework, you can use the color tokens in your CSS stylesheets to apply the desired colors to your elements.

For example, to set the background color of a button to the primary color, you can use the following CSS:

```css
.button {
  background-color: var(--color-primary);
}
```

Customizing Colors
To customize the colors used in the default.css framework, you can modify the values of the color tokens in the src/styles/default.css/2.tokens/2.1.colors.css file. You can use any valid CSS color value, such as color names, hex codes, RGB values, etc.

For example, to change the primary color to a different shade of blue, you can modify the --color-primary token value in the src/styles/default.css/2.tokens/2.1.colors.css file:

```css
--color-primary: #007bff;
```

Example Use Case
You can see the default.css framework in action by visiting the [colorDemo](https://coreyhatton.github.io/colorDemo/) demo page, which showcases the custom color system and provides a interactive color picker.
