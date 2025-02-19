# CSS Suggestor - VS Code Extension

CSS Suggestor is a VS Code extension that provides intelligent autocomplete suggestions for CSS classes based on the CSS package used in your project. By default, it scans `@groww-tech/mint-css`, but you can update it to any package of your choice.

## Features
- **Auto-suggest CSS classes** in `class` and `className` attributes.
- **Fetches CSS classes dynamically** from installed NPM packages.
- **Supports multiple languages**, including HTML, JavaScript, TypeScript, React (JSX/TSX).
- **Displays CSS properties** of suggested classes in the autocomplete popup.
- **Change the CSS package dynamically** using a command.

## Usage
### Autocomplete Suggestions
The extension suggests CSS classes inside:
```html
<div class="contentPrimary"></div>
```
### Change CSS Package
You can change the default package (`@groww-tech/mint-css`) by running the command:
1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P` on Mac).
2. Search for `CSS Suggestor: Set Package`.
3. Enter the NPM package name containing your CSS classes.

## How It Works
1. The extension scans `node_modules` to find the CSS file inside the given package.
2. It extracts CSS class definitions and stores them in memory.
3. It provides autocomplete suggestions with class names and their respective styles.

## Supported File Types
- `.html`
- `.js`, `.jsx`
- `.ts`, `.tsx`

## Future Enhancements
- Support for Tailwind-like class prefix matching.
- Option to reload CSS classes manually.
- Color previews for background/text-color classes.

## License
This project is licensed under the MIT License.