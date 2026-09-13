<p align="center">
  <img src="assets/inverze-logo1.svg" alt="Inverze" width="360" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-v1.9.0-2188ff?style=flat-square" alt="Version v1.9.0" />
  <img src="https://img.shields.io/badge/license-MIT-2da44e?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/sponsor-Buy%20Me%20a%20Coffee-e8792f?style=flat-square&logo=buymeacoffee&logoColor=white" alt="Buy Me a Coffee" />
</p>

<p align="center">A minimal glass new-tab experience for Chrome.</p>

<p align="center">
  <img src="assets/glass-dock-preview.svg" alt="Inverze new-tab preview" width="960" />
</p>

# Inverze

Inverze is a lightweight, local-first and customizable Chrome new-tab extension by shilong.

## Features

- Frosted-glass background with image upload and a 0–32px blur control
- Classic Google wordmark with Google / Bing search switching
- An adaptive dock that supports up to 12 websites
- Official website favicons converted into high-contrast monochrome icons
- Add, edit, delete and drag to reorder shortcuts
- Shortcut data and backgrounds stored locally in Chrome

## Installation

1. Download or clone this repository.
2. Open Chrome and visit `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the project root.
6. Open a new tab.

## Usage

Use the top-right settings button to:

- Upload or restore the background
- Adjust the frosted-glass blur strength
- Add, edit and delete shortcuts
- Drag shortcuts to reorder them

Use the search-engine control on the left side of the search field to switch between Google and Bing. Uploaded images are compressed and stored locally in the browser; they are not uploaded to this project or a third-party server.

## Project structure

- `manifest.json` — Chrome Manifest V3 configuration
- `newtab.html` — new-tab structure and settings panel
- `styles.css` — glass background, search field and dock styles
- `app.js` — search, storage, background and shortcut logic
- `assets/` — logo, badges and homepage preview

## Privacy

This repository contains no accounts, email addresses, passwords, tokens or personal URLs. Shortcuts, backgrounds and settings are stored in the current browser's `chrome.storage.local`. Search submissions navigate to Google or Bing according to the selected engine.

## License

MIT © 2026 shilong
