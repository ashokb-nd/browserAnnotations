import { Annotation } from "../annotation-manifest.js";

/**
 * @fileoverview Outward Bounding Boxes Extractor
 * 
 * Extracts outward-facing vehicle/object bounding box annotations from video metadata.
 * This extractor processes detection/tracking data from the outward-facing camera.
 * 
 * @param {Object} metadata - Video session metadata containing outward detection data
 * @param {Object} options - Optional configuration parameters
 * @returns {Array<Annotation>} Array of outward bounding box annotations
 */

/**
 * Extract outward object detection messages from metadata
 * @param {Object} summary - Metadata object (same as metadata parameter)
 * @returns {Map} Map of timestamp to detections array
 */
function getOutwardObjectDetectionMessages(summary) {
    const inference_data = summary['inference_data'] || {};
    const observations = inference_data['observations_data'] || {};
    const otl = observations['carBoxTrackerListCompressed'] || observations['carBoxTrackerList'] || [[]];

    const outward_detection_messages = new Map();

    otl.forEach(([ts, frame_detections], idx) => {
        const detections = [];

        if (frame_detections && Array.isArray(frame_detections)) {
            frame_detections.forEach(det => {
                // Filter by object classes: 1, 2, 100, 200, 300, 20000
                if ([1, 2, 100, 200, 300, 20000].includes(det.objectClass)) {
                    detections.push({
                        objectClass: det.objectClass,
                        xctr: det.xctr,
                        yctr: det.yctr,
                        width: det.width,
                        height: det.height
                    });
                }
            });
        }

        outward_detection_messages.set(ts, detections);
    });

    return outward_detection_messages;
}
export function outwardBoundingBoxesExtractor(metadata, options = {}) {
    const annotations = [];

    // Get outward object detection messages using the provided logic
    const outwardDetectionMessages = getOutwardObjectDetectionMessages(metadata);
    
    // Find the video start time (very first epoch timestamp)
    const timestamps = Array.from(outwardDetectionMessages.keys());
    const videoStartTime = timestamps.length > 0 ? Math.min(...timestamps) : null;
    
    // Convert detection messages to annotations
    outwardDetectionMessages.forEach((detections, timestamp) => {
        detections.forEach((detection, index) => {
            // Convert pixel coordinates to normalized coordinates (0-1)
            // Assuming 1920x1080 resolution for outward camera
            const normalizedX = (detection.xctr - detection.width/2) / 1920;
            const normalizedY = (detection.yctr - detection.height/2) / 1080;
            const normalizedWidth = detection.width / 1920;
            const normalizedHeight = detection.height / 1080;
            
            // Create annotation with detection data
            const annotation = new Annotation(
                'outward-bounding-boxes', // category
                timestamp, // startTimeMs - using timestamp from detection
                200, // durationMs - duration for visibility (adjust as needed)
                {
                    bbox: {
                        x: Math.max(0, Math.min(1, normalizedX)), // Clamp to 0-1 range
                        y: Math.max(0, Math.min(1, normalizedY)),
                        width: Math.max(0, Math.min(1, normalizedWidth)),
                        height: Math.max(0, Math.min(1, normalizedHeight))
                    },
                    objectClass: detection.objectClass,
                    objectId: `obj_${timestamp}_${index}`, // Unique ID based on timestamp and index
                    // Store timing information for PTS synchronization
                    videoStartTime: videoStartTime, // First epoch timestamp in the video
                    detectionTimestamp: timestamp, // This detection's epoch timestamp
                    // Store original pixel coordinates for reference
                    originalCoords: {
                        xctr: detection.xctr,
                        yctr: detection.yctr,
                        width: detection.width,
                        height: detection.height
                    }
                }
            );
            annotations.push(annotation);
        });
    });
    
    console.log(`Outward Bounding Boxes Extractor: Generated ${annotations.length} annotations`);
    console.log(`Video start time (first epoch): ${videoStartTime}`);
    return annotations;
}
