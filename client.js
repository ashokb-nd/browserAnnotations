// Function to set up canvas drawing for a video
function setupVideoCanvas(videoId, canvasId) {
    const video = document.getElementById(videoId);
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");

    video.addEventListener("loadedmetadata", () => {
        // Set canvas internal resolution to video resolution
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Set canvas display size to match video display size
        const videoRect = video.getBoundingClientRect();
        canvas.style.width = video.offsetWidth + 'px';
        canvas.style.height = video.offsetHeight + 'px';

        function drawFrame(now, metadata) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height); // Draw the current video frame 
            video.requestVideoFrameCallback(drawFrame); // Request the next frame
        }

        // Start drawing frames when video plays
        video.addEventListener("play", () => {
            video.requestVideoFrameCallback(drawFrame);
        });
        
        // Update canvas display size when window resizes
        window.addEventListener("resize", () => {
            canvas.style.width = video.offsetWidth + 'px';
            canvas.style.height = video.offsetHeight + 'px';
        });
    });
}

// Function to get metadata from server
async function getMetadata(id) {
    try {
        const response = await fetch(`/metadata/${id}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const metadata = await response.json();
        return metadata;
    } catch (error) {
        console.error('Error fetching metadata:', error);
        throw error;
    }
}

// Function to load videos for a specific ID
function loadVideos(id) {
    const inwardVideo = document.getElementById('inward-video');
    const outwardVideo = document.getElementById('outward-video');
    const inwardDownload = document.getElementById('inward-download');
    const outwardDownload = document.getElementById('outward-download');
    
    const inwardSrc = `/video/${id}/inward.mp4`;
    const outwardSrc = `/video/${id}/outward.mp4`;
    
    // Update video sources
    inwardVideo.src = inwardSrc;
    outwardVideo.src = outwardSrc;
    
    // Update download links
    inwardDownload.href = inwardSrc;
    outwardDownload.href = outwardSrc;
    
    // Load the videos
    inwardVideo.load();
    outwardVideo.load();
    
    console.log(`Videos loaded for dataset ID: ${id}`);
}

// Function to load and display metadata
async function loadAndDisplayMetadata(id) {
    try {
        const metadata = await getMetadata(id);
        console.log('Metadata loaded:', metadata);
        
        // You can add UI elements to display metadata here
        // For now, just log it to console
        alert(`Metadata loaded for dataset ${id}. Check console for details.`);
    } catch (error) {
        alert(`Failed to load metadata for dataset ${id}: ${error.message}`);
    }
}

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    const loadVideosBtn = document.getElementById('load-videos');
    const loadMetadataBtn = document.getElementById('load-metadata');
    const datasetIdInput = document.getElementById('dataset-id');
    
    loadVideosBtn.addEventListener('click', () => {
        const id = datasetIdInput.value.trim();
        if (id) {
            loadVideos(id);
        } else {
            alert('Please enter a dataset ID');
        }
    });
    
    loadMetadataBtn.addEventListener('click', () => {
        const id = datasetIdInput.value.trim();
        if (id) {
            loadAndDisplayMetadata(id);
        } else {
            alert('Please enter a dataset ID');
        }
    });
    
    // Load default videos on page load
    loadVideos('1');
});

// Set up canvas drawing for both videos
setupVideoCanvas("inward-video", "inward-canvas");
setupVideoCanvas("outward-video", "outward-canvas");
