# Active Tab Split

Active Tab Split is a Chrome extension that enables users to view multiple websites side by side in a single browser window—similar to Windows Snap Layouts or Vivaldi's tab tiling. Users can select from various grid layouts (1, 2, 3, or 4 panels) and assign a different open tab or website to each panel. This tool is ideal for multitaskers, researchers, students, and anyone who needs to monitor or interact with several web resources simultaneously.

---

## Features

- **Snap Layout Picker**
  - Choose from predefined layouts (1, 2, 3, or 4 panels) with visual icons, inspired by Windows Snap Layouts.
- **Dynamic Split Panels**
  - Renders the selected number of panels in the chosen layout using responsive CSS grid.
  - Each panel displays a different website or Chrome tab.
- **Tab Assignment**
  - Assign any open Chrome tab to a panel using a dropdown selector.
- **Iframe Display**
  - Each panel uses an `<iframe>` to display the selected website.
  - Graceful error handling for sites that block iframe embedding (with user-friendly messages and an "Open in new tab" button).
- **Modern UI/UX**
  - Clean, modern interface with gradients, rounded corners, and responsive design.
  - Visual feedback for selected layout.
  - Persistent mini-app window for layout selection and tab assignment.

---

## User Experience

- **Personas:** Multitaskers, researchers, students, developers, and professionals who need to view multiple sites at once.
- **Key User Flows:**
  1. Open the splitview page (via the extension or directly).
  2. Click the floating action button (FAB) to open the layout picker (mini-app window).
  3. Select a layout and assign tabs to panels.
  4. The extension displays the selected websites side by side in the chosen layout.
  5. If a site cannot be embedded, a clear message and an "Open in new tab" button are shown.
- **UI/UX Considerations:**
  - Responsive design for various screen sizes.
  - Visual feedback for selected layout.
  - User-friendly error messages for blocked iframes.

---

## Technical Details

- **Tech Stack:**
  - Plain HTML, CSS, and JavaScript (no frameworks)
  - Chrome Extension Manifest V3
  - Uses Chrome extension APIs: `tabs`, `storage`
- **Key Files:**
  - `popup.html`, `popup.js`: Mini-app window for layout and tab selection
  - `splitview.html`, `splitview.js`: Main split view page displaying the selected sites
  - `splitview.css`: Styling for the split view
  - `manifest.json`: Chrome extension manifest

---

## Installation

1. **Clone or download this repository.**
2. **Go to `chrome://extensions` in your browser.**
3. **Enable "Developer mode" (top right).**
4. **Click "Load unpacked" and select the `active-tab-split` directory.**
5. **Open a new tab and navigate to `splitview.html` (or use the extension's UI if provided).**

---

## Usage

1. Open the splitview page (e.g., `chrome-extension://<EXTENSION_ID>/active-tab-split/splitview.html`).
2. Use the layout picker to choose your desired split (1, 2, 3, or 4 panels).
3. Assign open tabs to each panel.
4. View the selected sites side by side.
5. If a site cannot be embedded, use the "Open in new tab" button provided.

---

## Limitations

- **Iframe Restrictions:** Many sites (including Google, YouTube main page, Facebook, etc.) block embedding in iframes for security reasons. The extension will show a user-friendly message in these cases, but cannot bypass browser security.
- **No Drag-to-Resize:** Panels are fixed to the selected layout (future enhancement: draggable splitters).
- **No React/TypeScript:** The current version is implemented in plain HTML/CSS/JS for maximum compatibility and simplicity.

---

## Future Enhancements

- Resizable panels (drag-to-resize)
- Save/load custom layouts
- More complex grid options
- Drag-and-drop panel rearrangement
- Authentication for user-specific layouts
- Improved tab management and filtering

---

## Risks and Mitigations

- **Technical challenges:** Some websites may block iframe embedding (X-Frame-Options, CSP). The extension informs users and provides error messages.
- **MVP scoping:** Focuses on core features; advanced features are deferred to future enhancements.
- **Resource constraints:** Uses efficient vanilla JS and CSS for performance and responsiveness.

---

## Credits & Inspiration
- Inspired by Windows Snap Layouts, Vivaldi tab tiling, and multitasking workflows.
- Built as a learning and productivity tool for Chrome users. 