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
app.get('/video/:id/:filename', (req, res) => {
  const id = req.params.id;
  const filename = req.params.filename;
  const videoPath = path.join(__dirname, 'assets', id, filename);
  
  
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

// Metadata endpoint
app.get('/metadata/:id', (req, res) => {
  const id = req.params.id;
  const metadataPath = path.join(__dirname, 'assets', id, 'metadata.json');
  
  // Check if metadata file exists
  if (!fs.existsSync(metadataPath)) {
    return res.status(404).json({ error: 'Metadata not found' });
  }
  
  try {
    const metadata = fs.readFileSync(metadataPath, 'utf8');
    res.json(JSON.parse(metadata));
  } catch (error) {
    console.error('Error reading metadata:', error);
    res.status(500).json({ error: 'Failed to read metadata' });
  }
});

app.listen(PORT, () => {
  console.log(`Video server running on http://localhost:${PORT}`);
  console.log('Available videos:');
  console.log('- /video/1/inward.mp4');
  console.log('- /video/1/outward.mp4');
  console.log('Available metadata:');
  console.log('- /metadata/1');
});
