import { BaseVisualizer } from "./base-visualizer.js";

/**
 * DSF Visualizer - Renders lane calibration lines from DSF data
 * 
 * Expected data structure in metadata:
 * {
 *   dsf: {
 *     vanishing_triangle: [
 *       [[x1, y1], [x2, y2]], // Left lane line points (normalized 0-1)
 *       [[x3, y3], [x4, y4]]  // Right lane line points (normalized 0-1)
 *     ]
 *   }
 * }
 */
export class DSFVisualizer extends BaseVisualizer {
  constructor(metadata) {
    super("dsf", metadata);
  }

  // Extract DSF data from metadata using same logic as dsf-extractor
  extractData(metadata) {
    // Extract lane calibration parameters (same logic as dsf-extractor)
    const MIN_TRACK_LENGTH = 3;
    const CANONICAL_OUTWARD_IMAGE_WIDTH = 1920;
    const CANONICAL_OUTWARD_IMAGE_HEIGHT = 1080;
    
    const inferenceData = metadata?.inference_data || {};
    const observationsData = inferenceData?.observations_data || {};
    const laneCalParams = observationsData?.laneCalibrationParams;

    if (!laneCalParams) return null;

    let [vanishingPointEstimate, _, xInt, imageHeight] = laneCalParams;

    // Convert to 1920x1080 resolution scale
    const scale = CANONICAL_OUTWARD_IMAGE_HEIGHT / imageHeight;

    vanishingPointEstimate = vanishingPointEstimate.map(x => x * scale);
    xInt = xInt.map(x => x * scale);
    imageHeight = CANONICAL_OUTWARD_IMAGE_HEIGHT;

    // Create short lane calibration segments: bottom corners to 5% up from bottom
    const calibrationHeight = imageHeight * 0.05; // 5% of image height
    const topY = imageHeight - calibrationHeight; // Y coordinate for top of calibration segment
    
    // Left lane line direction vector from bottom to vanishing point
    const leftDirX = vanishingPointEstimate[0] - xInt[0];
    const leftDirY = vanishingPointEstimate[1] - imageHeight;
    const leftLength = Math.sqrt(leftDirX * leftDirX + leftDirY * leftDirY);
    
    // Right lane line direction vector from bottom to vanishing point  
    const rightDirX = vanishingPointEstimate[0] - xInt[1];
    const rightDirY = vanishingPointEstimate[1] - imageHeight;
    const rightLength = Math.sqrt(rightDirX * rightDirX + rightDirY * rightDirY);
    
    // Calculate end points at 5% height for each lane
    const leftEndX = xInt[0] + (leftDirX / leftLength) * calibrationHeight;
    const leftEndY = topY;
    
    const rightEndX = xInt[1] + (rightDirX / rightLength) * calibrationHeight;  
    const rightEndY = topY;

    // Return normalized coordinates (0-1 range) for the short calibration segments
    const vanishingTriangle = [
      // Left calibration segment: bottom-left to 5% up
      [[xInt[0] / CANONICAL_OUTWARD_IMAGE_WIDTH, 1.0],
       [leftEndX / CANONICAL_OUTWARD_IMAGE_WIDTH, leftEndY / imageHeight]],
      // Right calibration segment: bottom-right to 5% up
      [[xInt[1] / CANONICAL_OUTWARD_IMAGE_WIDTH, 1.0],
       [rightEndX / CANONICAL_OUTWARD_IMAGE_WIDTH, rightEndY / imageHeight]]
    ];

    return vanishingTriangle;
  }

  // Apply DSF-specific styles
  applyStyles(ctx) {
    ctx.strokeStyle = "#C0C0C0"; // Light grey
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "#808080"; // Darker grey for endpoints
  }

  // Draw the DSF lane calibration lines
  _draw(ctx, epochTime, videoRect) {
    if (!this.data || !Array.isArray(this.data) || this.data.length < 2) {
      return;
    }

    const vanishingTriangle = this.data;
    const showEndpoints = false; // Don't show endpoints by default
    const endpointRadius = 3;

    // Draw each lane line
    vanishingTriangle.forEach((linePoints, index) => {
      if (Array.isArray(linePoints) && linePoints.length === 2) {
        const [startPoint, endPoint] = linePoints;
        
        if (Array.isArray(startPoint) && Array.isArray(endPoint) &&
            startPoint.length === 2 && endPoint.length === 2) {
          
          // Convert normalized coordinates to canvas coordinates
          const startX = startPoint[0] * videoRect.width;
          const startY = startPoint[1] * videoRect.height;
          const endX = endPoint[0] * videoRect.width;
          const endY = endPoint[1] * videoRect.height;

          // Draw the lane line
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Draw endpoint markers if enabled
          if (showEndpoints) {
            this._drawEndpoint(ctx, startX, startY, endpointRadius);
            this._drawEndpoint(ctx, endX, endY, endpointRadius);
          }
        }
      }
    });
  }

  // Helper method to draw endpoint markers
  _drawEndpoint(ctx, x, y, radius) {
    ctx.save();
    ctx.globalAlpha = 1.0; // Full opacity for endpoints
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
}
