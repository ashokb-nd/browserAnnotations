import { BaseVisualizer } from "./base-visualizer.js";

/**
 * Outward Bounding Boxes Visualizer - Displays vehicle/object detection bounding boxes
 * 
 * Expected data structure extracted from metadata:
 * - inference_data.observations_data.carBoxTrackerListCompressed or carBoxTrackerList
 * 
 * TIME HANDLING NOTE:
 * - The _draw(ctx, epochTime, videoRect) method receives videoTime in milliseconds as 'epochTime' parameter
 * - The detection data contains actual epoch timestamps (e.g., 1751942810996)
 * - We need to convert video time to epoch time using: currentEpochTime = videoStartTime + videoTimeMs
 */
export class OutwardBoundingBoxesVisualizer extends BaseVisualizer {
  constructor(metadata) {
    super("outward-bounding-boxes", metadata);
  }

  // Extract outward bounding boxes data from metadata
  extractData(metadata) {
    const inference_data = metadata?.inference_data;
    if (!inference_data) return null;

    const observations = inference_data.observations_data;
    if (!observations) return null;

    // Get detection data from either compressed or uncompressed format
    const otl = observations.carBoxTrackerListCompressed || observations.carBoxTrackerList;
    if (!otl || !Array.isArray(otl)) return null;

    const detectionsByTimestamp = new Map();

    // Process each timestamp and its detections
    otl.forEach(([timestamp, frame_detections]) => {
      const detections = [];

      if (frame_detections && Array.isArray(frame_detections)) {
        frame_detections.forEach(det => {
          // Filter by object classes: 1, 2, 100, 200, 300, 20000
          if ([1, 2, 100, 200, 300, 20000].includes(det.objectClass)) {
            // Convert pixel coordinates to normalized coordinates (0-1)
            // Assuming 1920x1080 resolution for outward camera
            const normalizedX = Math.max(0, Math.min(1, (det.xctr - det.width/2) / 1920));
            const normalizedY = Math.max(0, Math.min(1, (det.yctr - det.height/2) / 1080));
            const normalizedWidth = Math.max(0, Math.min(1, det.width / 1920));
            const normalizedHeight = Math.max(0, Math.min(1, det.height / 1080));

            detections.push({
              objectClass: det.objectClass,
              bbox: {
                x: normalizedX,
                y: normalizedY,
                width: normalizedWidth,
                height: normalizedHeight
              },
              originalCoords: {
                xctr: det.xctr,
                yctr: det.yctr,
                width: det.width,
                height: det.height
              }
            });
          }
        });
      }

      if (detections.length > 0) {
        detectionsByTimestamp.set(timestamp, detections);
      }
    });

    if (detectionsByTimestamp.size === 0) return null;

    // Get video start time from metadata PTS info
    // Try different possible PTS start time fields for outward video
    const videoStartTime = metadata.ptsStartTime || 
                          metadata.outwardPtsStartTime || 
                          metadata.ptsStartTimeLd || 
                          Math.min(...Array.from(detectionsByTimestamp.keys())); // Fallback to earliest detection

    console.log('OutwardBoundingBoxesVisualizer extractData:', {
      totalDetections: detectionsByTimestamp.size,
      videoStartTime: videoStartTime,
      firstTimestamp: Math.min(...Array.from(detectionsByTimestamp.keys())),
      lastTimestamp: Math.max(...Array.from(detectionsByTimestamp.keys()))
    });

    return {
      detectionsByTimestamp,
      videoStartTime,
      timestamps: Array.from(detectionsByTimestamp.keys())
    };
  }

  // Apply outward bounding boxes specific styles
  applyStyles(ctx) {
    ctx.globalAlpha = 1.0;
    ctx.lineWidth = 2;
    ctx.font = "12px 'SF Pro Display', -apple-system, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
  }

  // Draw the outward bounding boxes
  _draw(ctx, epochTime, videoRect) {
    // DEBUG: Always draw a static test bounding box
    this._drawDebugBoundingBox(ctx, videoRect);
    
    if (!this.data) {
      console.log('OutwardBoundingBoxesVisualizer: No data available');
      return;
    }

    const { detectionsByTimestamp, videoStartTime } = this.data;
    
    // Convert video time (ms) to epoch timestamp
    // epochTime parameter is actually video time in milliseconds, not epoch time
    // We need to map video time to epoch timestamp using the video start time
    const currentEpochTime = videoStartTime + epochTime;
    
    // Find the most recent detection timestamp that's before or at the current epoch time
    // Only show detections within 300ms of current time
    const candidateTimestamps = Array.from(detectionsByTimestamp.keys()).filter(timestamp => {
      const timeDiff = currentEpochTime - timestamp;
      return timeDiff >= 0 && timeDiff <= 300; // Within 300ms and not in the future
    });

    if (candidateTimestamps.length === 0) {
      console.log('OutwardBoundingBoxesVisualizer: No candidate timestamps found');
      return;
    }

    // Get the most recent timestamp
    const mostRecentTimestamp = Math.max(...candidateTimestamps);
    const activeDetections = detectionsByTimestamp.get(mostRecentTimestamp);

    if (!activeDetections) {
      console.log('OutwardBoundingBoxesVisualizer: No active detections found');
      return;
    }

    // Debug logging
    console.log('OutwardBoundingBoxesVisualizer:', {
      videoTimeMs: epochTime,
      currentEpochTime: currentEpochTime,
      videoStartTime: videoStartTime,
      mostRecentTimestamp: mostRecentTimestamp,
      timeDiff: currentEpochTime - mostRecentTimestamp,
      activeDetections: activeDetections.length
    });

    // Draw each active detection
    activeDetections.forEach((detection, index) => {
      this._drawBoundingBox(ctx, detection, videoRect, index);
    });
  }

  // Draw a single bounding box
  _drawBoundingBox(ctx, detection, videoRect, index) {
    const { bbox, objectClass, originalCoords } = detection;
    
    // Convert normalized coordinates to pixel coordinates
    const x = bbox.x * videoRect.width;
    const y = bbox.y * videoRect.height;
    const width = bbox.width * videoRect.width;
    const height = bbox.height * videoRect.height;

    // Get color based on object class
    const colors = this._getObjectClassColors();
    const strokeColor = colors[objectClass] || "#00FF00";

    // Set rendering style
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;

    // Draw bounding box border
    ctx.strokeRect(x, y, width, height);

    // Draw label
    this._drawLabel(ctx, x, y, width, height, objectClass, index);
  }

  // Draw object label
  _drawLabel(ctx, x, y, width, height, objectClass, index) {
    const labelText = `Class: ${objectClass}`;
    
    // Set font and measure text
    ctx.font = "12px 'SF Pro Display', -apple-system, system-ui, sans-serif";
    const textMetrics = ctx.measureText(labelText);
    const textWidth = textMetrics.width;
    const textHeight = 12;
    
    // Calculate label position (above the bounding box)
    const labelX = x;
    const labelY = y - 4; // 4px above the box
    
    // Ensure label stays within bounds
    const finalLabelY = Math.max(textHeight + 4, labelY);
    
    // Draw label background
    const bgPadding = 2;
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(
      labelX - bgPadding,
      finalLabelY - textHeight - bgPadding,
      textWidth + (bgPadding * 2),
      textHeight + (bgPadding * 2)
    );
    
    // Draw label text
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(labelText, labelX, finalLabelY - textHeight);
    
    // Add text stroke for better visibility
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.strokeText(labelText, labelX, finalLabelY - textHeight);
  }

  // Get color mapping for different object classes
  _getObjectClassColors() {
    return {
      1: "#FF0000",    // Red for class 1
      2: "#00FF00",    // Green for class 2 (vehicles)
      100: "#0000FF",  // Blue for class 100
      200: "#FFFF00",  // Yellow for class 200
      300: "#FF00FF",  // Magenta for class 300
      20000: "#00FFFF" // Cyan for class 20000
    };
  }

  // DEBUG: Draw a static test bounding box to verify drawing functionality
  _drawDebugBoundingBox(ctx, videoRect) {
    // Draw a static bounding box in the center of the screen
    const centerX = videoRect.width * 0.4;  // 40% from left
    const centerY = videoRect.height * 0.3; // 30% from top
    const boxWidth = videoRect.width * 0.2;  // 20% of screen width
    const boxHeight = videoRect.height * 0.15; // 15% of screen height

    // Set debug style - bright magenta
    ctx.strokeStyle = "#FF00FF";
    ctx.lineWidth = 3;

    // Draw bounding box border
    ctx.strokeRect(centerX, centerY, boxWidth, boxHeight);

    // Draw debug label
    const labelText = "DEBUG: Test Box";
    ctx.font = "16px Arial";
    const textMetrics = ctx.measureText(labelText);
    const textWidth = textMetrics.width;
    const textHeight = 16;
    
    // Label position (above the box)
    const labelX = centerX;
    const labelY = centerY - 8;
    
    // Draw label background
    const bgPadding = 4;
    ctx.fillStyle = "rgba(255, 0, 255, 0.8)"; // Semi-transparent magenta
    ctx.fillRect(
      labelX - bgPadding,
      labelY - textHeight - bgPadding,
      textWidth + (bgPadding * 2),
      textHeight + (bgPadding * 2)
    );
    
    // Draw label text
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(labelText, labelX, labelY - textHeight);
    
    console.log('OutwardBoundingBoxesVisualizer: Drawing debug bounding box at', {
      x: centerX,
      y: centerY,
      width: boxWidth,
      height: boxHeight,
      videoRect: videoRect
    });
  }
}
