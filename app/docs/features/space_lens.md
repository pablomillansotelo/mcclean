# Space Lens

Space Lens provides a visual representation of your disk usage, helping you identify large folders at a glance.

## Features

- **Treemap Visualization**: Displays folders as colored blocks sized proportionally to their content.
- **Top-Level Scan**: Quickly scans the top-level directories in your User folder (`~/Documents`, `~/Downloads`, etc.).
- **Size Indicators**: Shows exact size and percentage of total scanned space.

## How to Use

1. Click **Space Lens** in the sidebar.
2. Click **Scan Home Folder**.
3. Hover over blocks to see more details.

## Technical Details

- Uses `ls -d ~/*/` to find top-level folders.
- Calculates size recursively (excluding protected system paths).
