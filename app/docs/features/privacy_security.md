# Privacy & Security

The Privacy & Security module helps you manage sensitive data stored by web browsers and provides quick access to system security settings.

## Features

- **Browser Cleaning**: Scans and cleans cache files for:
  - Google Chrome (`~/Library/Caches/Google/Chrome`)
  - Firefox (`~/Library/Caches/Firefox`)
  - Safari (`~/Library/Caches/com.apple.Safari`)
- **App Permissions Audit**: Quick link to macOS System Settings > Privacy & Security to review app permissions for Camera, Microphone, and Location.

## How to Use

1. Navigate to the **Privacy** tab in the sidebar.
2. Review the detected cache size for each browser.
3. Click **Clean** to securely delete the cache files.
4. Click the **App Permissions** card to open macOS System Settings.

## Technical Details

- Uses `trash` (via `shell.trashItem`) to securely remove cache folders.
- Does not delete cookies or history to avoid logging you out of websites (safe cleaning).
