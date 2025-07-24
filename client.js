import { MetadataToAnnotationConverter } from './annotations/metadata-to-annotation-converter.js';
import { VideoAnnotator } from './annotations/video-annotator.js';

// Function to draw annotations from VideoAnnotator onto a canvas
function drawAnnotationsOnCanvas(annotator, ctx, canvas, currentTimeMs) {
    // Get video rectangle for coordinate transformation
    const videoRect = {
        width: canvas.width,
        height: canvas.height
    };
    
    // Iterate through all renderers and their annotations
    for (const [category, renderer] of annotator.renderers) {
        // Get annotations for this renderer that are visible at current time
        const annotations = renderer._annotations.filter(annotation => {
            if (!annotation.timeRange) return false;
            return currentTimeMs >= annotation.timeRange.startMs && 
                   currentTimeMs <= annotation.timeRange.endMs;
        });
        
        // Render each visible annotation using the renderer's logic
        for (const annotation of annotations) {
            try {
                // Save canvas state
                ctx.save();
                
                // Create a temporary renderer context that uses our canvas
                const originalCanvas = renderer._canvas;
                const originalCtx = renderer._ctx;
                
                // Temporarily assign our canvas and context
                renderer._canvas = canvas;
                renderer._ctx = ctx;
                
                // Call the renderer's render method
                renderer.render(annotation, currentTimeMs, videoRect);
                
                // Restore original canvas and context
                renderer._canvas = originalCanvas;
                renderer._ctx = originalCtx;
                
                // Restore canvas state
                ctx.restore();
            } catch (error) {
                console.error(`Error rendering annotation ${annotation.id} on canvas:`, error);
            }
        }
    }
}

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
            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw the current video frame 
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Draw annotations if annotator exists and is visible
            if (video.annotator && video.annotator.isVisible) {
                drawAnnotationsOnCanvas(video.annotator, ctx, canvas, video.currentTime * 1000);
            }
            
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


function draw_annotations(annotation_manifest) {
    // Get the video elements, not canvas elements
    const inwardVideoElement = document.getElementById("inward-video");
    const outwardVideoElement = document.getElementById("outward-video");

    const inward_annotator = inwardVideoElement.annotator;
    const outward_annotator = outwardVideoElement.annotator;

    console.log(annotation_manifest);
    inward_annotator.loadManifest(annotation_manifest);
    // Don't show the annotator's own canvases - we'll render on our main canvases instead
    inward_annotator.isVisible = true; // Set visibility flag but don't show canvases
    
    outward_annotator.loadManifest(annotation_manifest);
    // Don't show the annotator's own canvases - we'll render on our main canvases instead  
    outward_annotator.isVisible = true; // Set visibility flag but don't show canvases

    console.log('Annotations loaded and ready to render on main canvases');
}


function setupVideoAnnotators(){
    const inwardVideoElement = document.getElementById("inward-video");
    const outwardVideoElement = document.getElementById("outward-video");

    const inward_annotator = new VideoAnnotator(inwardVideoElement);
    const outward_annotator = new VideoAnnotator(outwardVideoElement);

    // Attach annotators to the video elements so they can be accessed later
    inwardVideoElement.annotator = inward_annotator;
    outwardVideoElement.annotator = outward_annotator;

    console.log('Video annotators initialized');
}


// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize video annotators
    setupVideoAnnotators();
    
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
                    const annotation_manifest = MetadataToAnnotationConverter.convertToManifest(metadata,['dsf','cross']);
                    console.log('Annotations:', annotation_manifest);
                    // Here you can add code to display the annotations in the UI
                    draw_annotations(annotation_manifest);


                })
                .catch(error => {
                    console.error('Error fetching or converting metadata:', error);
                });
        }
        else {
            alert('Please enter a dataset ID to show annotations');
        }
    });
    
    // Load default videos on page load
    loadVideos('1');
});


// Set up canvas drawing for both videos
setupVideoCanvas("inward-video", "inward-canvas");
setupVideoCanvas("outward-video", "outward-canvas");
