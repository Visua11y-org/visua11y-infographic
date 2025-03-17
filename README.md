# Visua11y Infographic Plugin

**Version**: 0.1.0
**Category**: Media
**License**: GPL-2.0-or-later
**Text Domain**: `visua11y-infographic`

## Overview

The **Visua11y Infographic** plugin is a WordPress block that empowers users to create accessible infographics by uploading or selecting an image file. Leveraging AI via a custom API, the plugin generates a comprehensive, accessible alternative for the infographic, which includes a detailed summary, a data table, and contextual information.

This plugin is designed to make infographics accessible to visually impaired users by providing a textual representation that describes the content of the image in a format that is easy to understand.

## Features

- **Upload and Analyze Infographics**: The user uploads or selects an infographic image. The plugin then uses a custom API, powered by AI, to analyze the content of the image.
- **Generate Accessible Alternative**: The API generates a detailed accessible alternative for the infographic. The result includes:
  - **Summary**: A textual description summarizing the image.
  - **Data Table**: A table containing all the values from the infographic.
  - **Context Description**: A contextual description of the image.
- **Edit and Customize**: The user can edit the generated content, deciding which elements (summary, data, context) to include or exclude.
- **Format Selection**: The plugin offers three formats for presenting the alternative:
  1. **Default**: As a group below the content.
  2. **Details Block**: As a collapsible details block below the content.
  3. **Columns**: As columns next to each other for side-by-side display.
- **Core Block Integration**: When inserting the accessible alternative as core blocks, the plugin:
  - Inserts the original image with an `aria-describedby` attribute.
  - Links the `aria-describedby` attribute to an anchor in the generated accessible alternative.
  - This setup allows visually impaired users to better understand the image by reading the detailed alternative content.

- **Extension of Core Image Block**: The plugin extends the core WordPress image block by adding an `aria-describedby` attribute to the image, linking it to the generated accessible alternative.

## Installation

1. **Upload Plugin Files**: Upload the `visua11y-infographic` folder to the `/wp-content/plugins/` directory on your WordPress site.
2. **Activate the Plugin**: Activate the plugin via the 'Plugins' menu in the WordPress admin dashboard.
3. **Use the Block**: After activation, you can access the "Visua11y Infographic" block in the WordPress editor to create accessible infographics.

## Usage

1. **Add the Block**: In the WordPress editor, click the "+" icon to add the "Visua11y Infographic" block.
2. **Upload an Image**: Select or upload an infographic image.
3. **Analysis and Generation**: The plugin will analyze the infographic using AI and generate a summary, data table, and context description.
4. **Edit the Output**: The user can edit the generated content:
   - Choose which elements to include: summary, data, context.
   - Select a format for the content presentation (Default, Details Block, or Columns).
5. **Insert as Core Blocks**: 
   - Insert the infographic content as core blocks.
   - The original image is inserted with an `aria-describedby` attribute pointing to the generated accessible alternative.
   - This alternative is rendered as a separate block with a unique anchor ID, linking it to the image.
6. **Enhance Accessibility**: The added `aria-describedby` attribute improves accessibility by ensuring that screen readers can link the image to its detailed accessible description, giving visually impaired users the context they need.

## Block Structure

The plugin uses the WordPress block editor to manage content for the infographic. The block is registered with the following metadata:

- **Block Name**: `visua11y/visua11y-infographic`
- **Version**: 0.1.0
- **Category**: Media
- **Icon**: `chart-pie`
- **Description**: A block that lets you create accessible infographics from simply uploading an image.

## Developer Notes

The plugin leverages several WordPress components and React libraries:

- **Block Registration**: The block is registered using `registerBlockType` from `@wordpress/blocks`.
- **Editor Scripts and Styles**: The editor's functionality is powered by the `index.js`, `edit.js`, and `save.js` files. The block's appearance is styled using the `editor.scss` and `style.scss` files.
- **Image Upload**: The `MediaUpload` component allows users to upload an image, which is then processed by the AI API.
- **Accessible Alternative Generation**: The API generates an accessible alternative (summary, data table, context), which can be edited and inserted as core blocks.

## Development Setup

To set up the development environment:

1. Clone or download this repository.
2. Navigate to the plugin folder:

   ```sh
   cd visua11y-infographic
   ```

3. Install dependencies:

   ```sh
   npm install
   ```

4. Build the plugin:

   ```sh
   npm run build
   ```

5. For development mode (watching changes):

   ```sh
   npm start
   ```

6. Activate the plugin in WordPress and start using the block.

## License

This plugin is licensed under GPL-2.0-or-later.
