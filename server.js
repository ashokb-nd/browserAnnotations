const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (videos)
app.use('/videos', express.static(__dirname));

// Serve static files (JS, CSS, etc.)
app.use(express.static(__dirname));

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Video streaming endpoint
app.get('/video/:filename', (req, res) => {
  const filename = req.params.filename;
  const videoPath = path.join(__dirname, filename);
  
  // Check if file exists
  if (!fs.existsSync(videoPath)) {
    return res.status(404).send('Video not found');
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    // Handle range requests for video streaming
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    // Send entire file
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

app.listen(PORT, () => {
  console.log(`Video server running on http://localhost:${PORT}`);
  console.log('Available videos:');
  console.log('- inward.mp4');
  console.log('- outward.mp4');
});
