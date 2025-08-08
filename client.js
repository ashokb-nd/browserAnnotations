// import { MetadataToAnnotationConverter } from './annotations/metadata-to-annotation-converter.js';
import { VideoAnnotator } from './annotations/video-annotator.js';
import { VideoRecorder } from './video-recorder.js';

// Function to draw annotations from VideoAnnotator onto a canvas
function drawAnnotationsOnCanvas(annotator, ctx, canvas, currentTimeMs) {
    // Clear the canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get video rectangle for coordinate transformation
    const videoRect = {
        width: canvas.width,
        height: canvas.height
    };
    
    // Iterate through all visualizers
    for (const visualizer of annotator.visualizers) {
        try {
            // Save canvas state
            ctx.save();
            
            // Call the visualizer's display method
            visualizer.display(ctx, currentTimeMs, videoRect);
            
            // Restore canvas state
            ctx.restore();
        } catch (error) {
            console.error(`Error rendering with visualizer:`, error);
        }
    }
}

// Function to set up video frame canvas (bottom layer - no clearing)
function setupVideoFrameCanvas(videoId, videoCanvasId) {
    const video = document.getElementById(videoId);
    const videoCanvas = document.getElementById(videoCanvasId);
    const videoCtx = videoCanvas.getContext("2d");

    video.addEventListener("loadedmetadata", () => {
        // Set canvas internal resolution to video resolution
        videoCanvas.width = video.videoWidth;
        videoCanvas.height = video.videoHeight;
        
        // Set canvas display size to match video display size
        videoCanvas.style.width = video.offsetWidth + 'px';
        videoCanvas.style.height = video.offsetHeight + 'px';

        // Function to draw video frames onto the video canvas
        function drawVideoFrame(now, metadata) {
            // Draw the current video frame to the video canvas (no clearing needed)
            videoCtx.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);
            
            video.requestVideoFrameCallback(drawVideoFrame); // Request the next frame
        }

        // Start drawing video frames when video plays
        video.addEventListener("play", () => {
            video.requestVideoFrameCallback(drawVideoFrame);
        });
        
        // Update canvas display size when window resizes
        window.addEventListener("resize", () => {
            videoCanvas.style.width = video.offsetWidth + 'px';
            videoCanvas.style.height = video.offsetHeight + 'px';
            // Update canvas resolution to match new size
            videoCanvas.width = video.videoWidth;
            videoCanvas.height = video.videoHeight;
        });
    });
}

// Function to set up annotation canvas (top layer - transparent background)
function setupAnnotationCanvas(videoId, canvasId) {
    const video = document.getElementById(videoId);
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");

    video.addEventListener("loadedmetadata", () => {
        // Set canvas internal resolution to video resolution
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Set canvas display size to match video display size
        canvas.style.width = video.offsetWidth + 'px';
        canvas.style.height = video.offsetHeight + 'px';

        function drawAnnotations() {
            // Draw annotations if annotator exists and is visible
            if (video.annotator && video.annotator.isVisible) {
                drawAnnotationsOnCanvas(video.annotator, ctx, canvas, video.currentTime * 1000);
            }
            
            // Continue animation loop
            requestAnimationFrame(drawAnnotations);
        }

        // Start annotation rendering loop
        video.addEventListener("play", () => {
            drawAnnotations();
        });

        // Update canvas display size when window resizes
        window.addEventListener("resize", () => {
            canvas.style.width = video.offsetWidth + 'px';
            canvas.style.height = video.offsetHeight + 'px';
            // Update canvas resolution to match new size
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
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
    
    const inwardSrc = `/video/${id}/inward.mp4`;
    const outwardSrc = `/video/${id}/outward.mp4`;
    
    // Update video sources
    inwardVideo.src = inwardSrc;
    outwardVideo.src = outwardSrc;
    
    // Load the videos
    inwardVideo.load();
    outwardVideo.load();
    
    console.log(`Videos loaded for dataset ID: ${id}`);
}


// function draw_annotations(annotation_manifest) {
//     // Get the video elements, not canvas elements
//     const inwardVideoElement = document.getElementById("inward-video");
//     const outwardVideoElement = document.getElementById("outward-video");

//     const inward_annotator = inwardVideoElement.annotator;
//     const outward_annotator = outwardVideoElement.annotator;

//     console.log('Setting visibility for annotators with manifest:', annotation_manifest);
    
//     // Set visibility flag to enable rendering
//     inward_annotator.isVisible = true;
//     outward_annotator.isVisible = true;

//     console.log('Annotations ready to render');
// }



// function setupVideoAnnotators(){
//     const inwardVideoElement = document.getElementById("inward-video");
//     const outwardVideoElement = document.getElementById("outward-video");

//     // Create empty annotation manifest for initial setup
//     const annotation_manifest = {
//         items: {
//             "debug-cross": []
//         }
//     };

//     const inwardCanvas = document.getElementById("inward-canvas");
//     const outwardCanvas = document.getElementById("outward-canvas");

//     const inward_annotator = new VideoAnnotator(inwardVideoElement,
//         annotation_manifest,
//         inwardCanvas,
//         ["debug-cross"]
//     );

//     const outward_annotator = new VideoAnnotator(outwardVideoElement,
//         annotation_manifest,
//         outwardCanvas,
//         ["debug-cross"]
//     );

//     // Attach annotators to the video elements so they can be accessed later
//     inwardVideoElement.annotator = inward_annotator;
//     outwardVideoElement.annotator = outward_annotator;

//     console.log('Video annotators initialized with empty manifest');
// }

function setupVideoAnnotatorsWithMetadata(metadata){
    const inwardVideoElement = document.getElementById("inward-video");
    const outwardVideoElement = document.getElementById("outward-video");

    const inwardCanvas = document.getElementById("inward-canvas");
    const outwardCanvas = document.getElementById("outward-canvas");

    // Create new annotators with metadata directly
    const inward_annotator = new VideoAnnotator(inwardVideoElement,
        metadata,
        inwardCanvas,
        ["debug-cross", "dsf", "header-banner"] // Start with debug cross and DSF visualizers
    );

    const outward_annotator = new VideoAnnotator(outwardVideoElement,
        metadata,
        outwardCanvas,
        ["debug-cross", "dsf", "header-banner"] // Start with debug cross and DSF visualizers
    );

    // Attach annotators to the video elements so they can be accessed later
    inwardVideoElement.annotator = inward_annotator;
    outwardVideoElement.annotator = outward_annotator;

    // Set visibility flag to enable rendering
    inward_annotator.isVisible = true;
    outward_annotator.isVisible = true;

    console.log('Video annotators initialized with manifest and set to visible');
}


// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize video annotators
    // setupVideoAnnotators();
    
    const loadVideosBtn = document.getElementById('load-videos');
    const showAnnotationsBtn = document.getElementById('show-annotations');
    const datasetIdInput = document.getElementById('dataset-id');
    
    loadVideosBtn.addEventListener('click', () => {
        const id = datasetIdInput.value.trim();
        if (id) {
            loadVideos(id);
        } else {
            alert('Please enter a dataset ID');
        }
    });
    
        showAnnotationsBtn.addEventListener('click', () => {
        // add code to show annotations
        const id = datasetIdInput.value.trim();
        if (id) {
            getMetadata(id)
                .then(metadata => {
                    console.log('Metadata:', metadata);
                    
                    // Initialize video annotators with metadata directly
                    setupVideoAnnotatorsWithMetadata(metadata);
                    
                    // Enable rendering
                    // draw_annotations(annotation_manifest);
                })
                .catch(error => {
                    console.error('Error fetching or converting metadata:', error);
                });
        }
        else {
            alert('Please enter a dataset ID to show annotations');
        }
    });    // Load default videos on page load
    loadVideos('1');
});


// Set up video frame canvases (bottom layer)
setupVideoFrameCanvas("inward-video", "inward-video-canvas");
setupVideoFrameCanvas("outward-video", "outward-video-canvas");

// Set up annotation canvases (top layer)
setupAnnotationCanvas("inward-video", "inward-canvas");
setupAnnotationCanvas("outward-video", "outward-canvas");

/**
 * Set up video recording functionality
 */
function setupVideoRecording() {
    // Check if recording is supported
    if (!VideoRecorder.isSupported()) {
        console.warn('Video recording not supported in this browser');
        // Disable download buttons
        document.getElementById('inward-download-annotated').disabled = true;
        document.getElementById('outward-download-annotated').disabled = true;
        document.getElementById('inward-download-annotated').textContent = 'Recording Not Supported';
        document.getElementById('outward-download-annotated').textContent = 'Recording Not Supported';
        return;
    }

    console.log('Supported recording formats:', VideoRecorder.getSupportedMimeTypes());

    // Set up inward video recording
    setupVideoRecordingForCanvas('inward');
    
    // Set up outward video recording  
    setupVideoRecordingForCanvas('outward');
}

/**
 * Create a composite canvas that combines video frames and annotations for recording
 */
function createCompositeCanvas(videoPrefix) {
    const videoCanvas = document.getElementById(`${videoPrefix}-video-canvas`);
    const annotationCanvas = document.getElementById(`${videoPrefix}-canvas`);
    
    // Create offscreen canvas for composition
    const compositeCanvas = document.createElement('canvas');
    const compositeCtx = compositeCanvas.getContext('2d');
    
    // Set same dimensions as source canvases
    compositeCanvas.width = videoCanvas.width;
    compositeCanvas.height = videoCanvas.height;
    
    // Function to update composite canvas
    function updateComposite() {
        // Clear composite canvas
        compositeCtx.clearRect(0, 0, compositeCanvas.width, compositeCanvas.height);
        
        // Draw video frame (bottom layer)
        compositeCtx.drawImage(videoCanvas, 0, 0);
        
        // Draw annotations (top layer)
        compositeCtx.drawImage(annotationCanvas, 0, 0);
        
        // Continue updating during playback
        requestAnimationFrame(updateComposite);
    }
    
    // Start composition loop
    updateComposite();
    
    return compositeCanvas;
}

/**
 * Set up recording for a specific video/canvas pair
 */
function setupVideoRecordingForCanvas(videoPrefix) {
    const videoElement = document.getElementById(`${videoPrefix}-video`);
    const downloadButton = document.getElementById(`${videoPrefix}-download-annotated`);
    const statusElement = document.getElementById(`${videoPrefix}-recording-status`);
    
    let recorder = null;
    let compositeCanvas = null;

    downloadButton.addEventListener('click', async () => {
        try {
            // Disable button during recording
            downloadButton.disabled = true;
            downloadButton.textContent = 'Preparing...';
            statusElement.style.display = 'block';
            statusElement.textContent = 'Preparing recording...';

            // Create composite canvas for recording
            compositeCanvas = createCompositeCanvas(videoPrefix);

            // Create recorder with composite canvas
            recorder = new VideoRecorder(videoElement, compositeCanvas, {
                videoBitsPerSecond: 8000000, // 8 Mbps for high quality
                frameRate: 30,
                onRecordingStart: () => {
                    console.log(`Started recording ${videoPrefix} video`);
                    statusElement.textContent = 'Recording in progress...';
                    downloadButton.textContent = 'Recording...';
                },
                onRecordingStop: (blob) => {
                    console.log(`Stopped recording ${videoPrefix} video`, blob);
                    statusElement.style.display = 'none';
                    downloadButton.disabled = false;
                    downloadButton.textContent = 'Download Annotated Video';
                },
                onRecordingProgress: (chunkSize, chunkCount) => {
                    const totalSize = (recorder.getStatus().totalSize / 1024 / 1024).toFixed(1);
                    statusElement.textContent = `Recording... ${totalSize}MB (${chunkCount} chunks)`;
                },
                onRecordingError: (error) => {
                    console.error(`Recording error for ${videoPrefix}:`, error);
                    statusElement.style.display = 'none';
                    statusElement.textContent = `Error: ${error.message}`;
                    statusElement.style.backgroundColor = '#dc3545';
                    statusElement.style.display = 'block';
                    downloadButton.disabled = false;
                    downloadButton.textContent = 'Download Annotated Video';
                    
                    // Hide error after 5 seconds
                    setTimeout(() => {
                        statusElement.style.display = 'none';
                    }, 5000);
                }
            });

            // Check if video is ready
            if (!videoElement.duration || isNaN(videoElement.duration)) {
                throw new Error('Video not ready. Please wait for video to load completely.');
            }

            // Record the full video with annotations
            await recorder.recordFullVideo();
            
        } catch (error) {
            console.error(`Error setting up recording for ${videoPrefix}:`, error);
            
            statusElement.textContent = `Error: ${error.message}`;
            statusElement.style.backgroundColor = '#dc3545';
            statusElement.style.display = 'block';
            
            downloadButton.disabled = false;
            downloadButton.textContent = 'Download Annotated Video';
            
            // Hide error after 5 seconds
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 5000);
        }
    });

    // Add cancel recording capability (ESC key)
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && recorder && recorder.isRecording) {
            recorder.cancelRecording();
            statusElement.style.display = 'none';
            downloadButton.disabled = false;
            downloadButton.textContent = 'Download Annotated Video';
            console.log(`Cancelled ${videoPrefix} recording`);
        }
    });
}

// Initialize video recording functionality
setupVideoRecording();
