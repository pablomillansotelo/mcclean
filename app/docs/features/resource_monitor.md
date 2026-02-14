# Resource Monitor

The Resource Monitor provides a real-time overview of your system's health directly in the sidebar.

## Features

- **CPU Load**: Displays real-time CPU usage percentage.
- **Memory Usage**: Shows used vs. total RAM.

## How to Use

- The widget is always visible in the bottom-left of the sidebar.
- Updates automatically every 2 seconds.

## Technical Details

- Uses Node.js `os` module:
  - `os.loadavg()` for CPU load.
  - `os.freemem()` and `os.totalmem()` for RAM usage.
