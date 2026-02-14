# Smart Assistant

The Smart Assistant is your proactive helper, ensuring you never forget to keep your Mac clean.

## Features

- **Trash Monitoring**: Alerts you if your Trash bin exceeds 1GB in size.
- **Scan Reminder**: Reminds you to scan your system if it has been more than 7 days since the last cleanup.

## How to Work

- The Assistant appears automatically on the **Dashboard** when an alert is triggered.
- It provides context-aware suggestions (e.g., "Empty Scan", "Start Deep Scan").

## Technical Details

- Checks `~/.Trash` size using `du -sh` logic.
- Stores the last scan timestamp in `config.json` (handled by `electron-store`).
