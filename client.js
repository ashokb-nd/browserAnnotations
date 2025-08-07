import { MetadataToAnnotationConverter } from './annotations/metadata-to-annotation-converter.js';
import { VideoAnnotator } from './annotations/video-annotator.js';

// // Function to draw annotations from VideoAnnotator onto a canvas
// function drawAnnotationsOnCanvas(annotator, ctx, canvas, currentTimeMs) {
//     // Get video rectangle for coordinate transformation
//     const videoRect = {
//         width: canvas.width,
//         height: canvas.height
//     };
    
//     // Iterate through all renderers (now an array, not a Map)
//     for (const renderer of annotator.renderers) {
//         try {
//             // Save canvas state
//             ctx.save();
            
//             // Create a temporary renderer context that uses our canvas
//             const originalCanvas = renderer.canvas;
//             const originalCtx = renderer.ctx;
            
//             // Temporarily assign our canvas and context
//             renderer.canvas = canvas;
//             renderer.ctx = ctx;
            
//             // Call the renderer's render method with the new signature
//             renderer.render(currentTimeMs, videoRect);
            
//             // Restore original canvas and context
//             renderer.canvas = originalCanvas;
//             renderer.ctx = originalCtx;
            
//             // Restore canvas state
//             ctx.restore();
//         } catch (error) {
//             console.error(`Error rendering with renderer:`, error);
//         }
//     }
// }

// Function to set up video frame canvas (separate from annotations)
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

        // ====== function to draw video frames onto the video canvas ======
        function drawVideoFrame(now, metadata) {
            // Clear the video canvas
            videoCtx.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
            
            // Draw the current video frame to the video canvas
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

// Function to set up annotation canvas (no video frame drawing)
function setupVideoCanvas(videoId, canvasId) {
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

function setupVideoAnnotatorsWithManifest(annotation_manifest){
    const inwardVideoElement = document.getElementById("inward-video");
    const outwardVideoElement = document.getElementById("outward-video");

    const inwardCanvas = document.getElementById("inward-canvas");
    const outwardCanvas = document.getElementById("outward-canvas");

    // Create new annotators with the actual annotation manifest
    const inward_annotator = new VideoAnnotator(inwardVideoElement,
        annotation_manifest,
        inwardCanvas,
        ["debug-cross", "inertial-bar", "header-banner"] // categories for renderers
    );

    const outward_annotator = new VideoAnnotator(outwardVideoElement,
        annotation_manifest,
        outwardCanvas,
        ["debug-cross", "inertial-bar", "header-banner"] // categories for renderers
    );

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
                    const annotation_manifest = MetadataToAnnotationConverter.convertToManifest(metadata,['dsf','cross','inertial-bar','header-banner']); // categories for extractor
                    console.log('Annotations:', annotation_manifest);
                    
                    // Reinitialize video annotators with the actual annotation manifest
                    setupVideoAnnotatorsWithManifest(annotation_manifest);
                    
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


// Set up canvas drawing for both videos (annotations only)
setupVideoCanvas("inward-video", "inward-canvas");
setupVideoCanvas("outward-video", "outward-canvas");

// Set up video frame drawing for both videos (video frames only)
setupVideoFrameCanvas("inward-video", "inward-video-canvas");
setupVideoFrameCanvas("outward-video", "outward-video-canvas");
