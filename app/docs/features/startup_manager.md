# Startup Manager

The Startup Manager allows you to view and manage applications and services that launch automatically when you log in to your Mac.

## Features

- **List LaunchAgents**: Scans `~/Library/LaunchAgents` to identify user-specific background services.
- **Identify Login Items**: (Future) Will integrate with macOS Login Items settings.

## How to Use

1. Navigate to the **Startup** tab in the sidebar.
2. Review the list of launch agents.
3. Use this information to manually disable or remove unwanted services to improve boot time.

## Technical Details

- Uses `ls -la ~/Library/LaunchAgents` to enumerate files.
- Filters out system entries and hidden files.
