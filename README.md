# Video Server

A simple Node.js web server to serve and stream video files.

## Files Served
- `inward.mp4`
- `outward.mp4`

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

3. Open your browser and go to:
   ```
   http://localhost:3000
   ```

## Features

- **Web Interface**: Clean HTML page with embedded video players
- **Video Streaming**: Supports range requests for efficient video streaming
- **Download Links**: Direct download links for both videos
- **Responsive Design**: Works on desktop and mobile devices

## Direct Video URLs

- Inward Video: `http://localhost:3000/video/inward.mp4`
- Outward Video: `http://localhost:3000/video/outward.mp4`

## Technical Details

- Built with Express.js
- Supports HTTP range requests for video streaming
- Serves videos with proper MIME types
- Handles both partial and full file requests
