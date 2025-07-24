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

// Set up canvas drawing for both videos
setupVideoCanvas("inward-video", "inward-canvas");
setupVideoCanvas("outward-video", "outward-canvas");
