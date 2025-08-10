# Appium Electron App

Simple Electron application with embedded Appium server for device automation.

## Setup

Install dependencies:
```bash
npm install
```

## Development

Run the app:
```bash
npm start
```

## Build Standalone App

Build for your platform:
```bash
# Windows portable exe
npm run dist-win

# macOS dmg
npm run dist-mac

# Linux AppImage
npm run dist-linux
```

The packaged app will be in the `dist` folder and includes all dependencies.

## Features

- Start/Stop Appium server
- Configure server port
- Create test sessions for Android/iOS devices
- No external dependencies required when packaged

## Notes

- Default port: 4723
- Supports Android (UiAutomator2) and iOS (XCUITest)
- Bundled with Appium 2.x
