# Smart Search Web Component

A flexible, accessible, and themeable search component built as a Lit web component. It provides features like debouncing, filtering on nested keys, async data loading, and dynamic positioning to prevent being cut off by the viewport.

## Development

To set up the development environment, navigate to the `smart-search-component` directory and install the dependencies:

```bash
npm install
```

To run the local development server with the demo page:

```bash
npm run dev
```

## Building for Production

To create a production-ready build of the component, run the following command:

```bash
npm run build
```

This will generate a `dist` folder containing the necessary files, including `smart-search.es.js` (for use with modern bundlers) and `smart-search.umd.js` (for direct use in a browser).

## Usage

### With a Build System (e.g., Vite, Webpack)

To use the component with a build system, you can copy the `dist` folder into your project and import the ES module version of the component.

Then, import and use the component in your JavaScript/TypeScript files:

```javascript
// Adjust the path to where you copied the file
import './path/to/dist/smart-search.es.js';

// Now you can use <smart-search> in your HTML or templates.
```

### Without a Build System (CDN / Static HTML)

You can use the component directly in an HTML file by including the `smart-search.umd.js` file from the `dist` folder.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Smart Search Example</title>
    <!-- 1. Include the component script -->
    <script src="./dist/smart-search.umd.js"></script>
  </head>
  <body>
    <!-- 2. Use the component -->
    <smart-search id="my-search"></smart-search>

    <script>
      // 3. Interact with the component
      const searchEl = document.getElementById('my-search');
      searchEl.data = [
        { id: '1', label: 'Apple' },
        { id: '2', label: 'Banana' },
        { id: '3', label: 'Orange' },
      ];

      searchEl.addEventListener('result-selected', (e) => {
        console.log('You selected:', e.detail);
      });
    </script>
  </body>
</html>
```

## API Documentation

### Properties

| Property          | Attribute           | Type      | Default             | Description                                                                                             |
| ----------------- | ------------------- | --------- | ------------------- | ------------------------------------------------------------------------------------------------------- |
| `data`            | -                   | `Array`   | `[]`                | The array of objects to be searched.                                                                    |
| `placeholder`     | `placeholder`       | `String`  | `'Search...'`       | The placeholder text for the search input.                                                              |
| `value`           | `value`             | `String`  | `''`                | The current value of the search input.                                                                  |
| `disabled`        | `disabled`          | `Boolean` | `false`             | If true, the component is disabled and cannot be interacted with.                                       |
| `loading`         | `loading`           | `Boolean` | `false`             | If true, a loading spinner is shown.                                                                    |
| `theme`           | `theme`             | `String`  | `'light'`           | The visual theme of the component. Can be `'light'` or `'dark'`.                                        |
| `filterableKeys`  | -                   | `String[]`| `['label']`         | An array of keys to search within the data objects. Supports dot-notation for nested keys (e.g., `'user.name'`). |
| `displayKey`      | `displayKey`        | `String`  | `'label'`           | The key to use from the data object to display in the results list. Supports dot-notation.              |
| `maxResults`      | `max-results`       | `Number`  | `0`                 | The maximum number of results to show. `0` means no limit.                                              |
| `debounceTimeout` | `debounce-timeout`  | `Number`  | `0`                 | The time in milliseconds to wait after the user stops typing before performing a search. `0` is instant. |
| `noResultsText`   | `no-results-text`   | `String`  | `'No results found'`| The text to display when a search yields no results.                                                    |

### Events

| Event Name          | Description                                                               | `event.detail`                               |
| ------------------- | ------------------------------------------------------------------------- | -------------------------------------------- |
| `result-selected`   | Fired when a user clicks or presses Enter on an item in the results list. | The full data object for the selected item.  |
| `search-input`      | Fired after the debounce timeout when the input value changes.            | The current string value of the input.       |

### Slots

| Slot Name       | Description                               |
| --------------- | ----------------------------------------- |
| `search-icon`   | Allows you to provide a custom search icon. |
| `clear-icon`    | Allows you to provide a custom clear icon.  |

Example of providing a custom SVG for the `search-icon` slot:
```html
<smart-search>
  <svg
    slot="search-icon"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
</smart-search>
```

## Testing

To run the full suite of unit and accessibility tests, use the following command:

```bash
npm test
```