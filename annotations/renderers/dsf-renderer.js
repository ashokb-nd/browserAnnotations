import { BaseRenderer } from "./base-renderer.js";

/**
 * @fileoverview DSF Renderer - Renders lane calibration lines from DSF data
 * 
 * ANNOTATION DATA STRUCTURE:
 * =========================
 * 
 * Expected annotation format:
 * {
 *   id: "dsf-1",                      // Unique identifier
 *   category: "dsf",                  // Must be "dsf"
 *   timeRange: {                      // Time visibility range
 *     startMs: 0,                     //   Start time in milliseconds
 *     endMs: 999999999                //   End time in milliseconds (full video)
 *   },
 *   data: {                          // DSF-specific data
 *     vanishing_triangle: [           //   Array of two lane lines
 *       [[x1, y1], [x2, y2]],        //     Left lane line points (normalized 0-1)
 *       [[x3, y3], [x4, y4]]         //     Right lane line points (normalized 0-1)
 *     ]
 *   },
 *   style: {                         // Optional styling overrides
 *     strokeColor: "#00FF00",         //   Line color (default: green)
 *     lineWidth: 2,                   //   Line thickness (default: 2)
 *     opacity: 1.0,                   //   Transparency (default: 1.0)
 *     showEndpoints: true             //   Show endpoint markers (default: true)
 *   }
 * }
 * 
 * RENDERING BEHAVIOR:
 * ==================
 * - Converts normalized coordinates (0-1) to canvas pixel coordinates
 * - Draws two lane calibration lines using the four provided points
 * - Optionally displays red endpoint markers for debugging
 * - Lane lines represent the vanishing triangle calculation from DSF data
 * 
 * @example
 * // Lane calibration with endpoints
 * {
 *   id: "lane-calibration",
 *   category: "dsf",
 *   timeRange: { startMs: 0, endMs: 999999999 },
 *   data: {
 *     vanishing_triangle: [
 *       [[0.2, 1.0], [0.3, 0.95]], // Left lane
 *       [[0.8, 1.0], [0.7, 0.95]]  // Right lane
 *     ]
 *   }
 * }
 */

// ========================================
// DSF RENDERER - Lane calibration lines
// ========================================
class DSFRenderer extends BaseRenderer {
  static category = "dsf";

  constructor(annotations) {
    super(annotations);
    this.options = this.getDefaultOptions();
  }

  getDefaultOptions() {
    return {
      defaultStrokeColor: "#00FF00", // Green
      defaultLineWidth: 2,
      defaultOpacity: 1.0,
      defaultShowEndpoints: false, // Don't show endpoints by default
      endpointColor: "#FF0000", // Red for endpoints
      endpointRadius: 3
    };
  }

  render(ctx, currentTimeMs, videoRect) {
    // Find active DSF annotations for current time
    const activeAnnotations = this.annotations.filter(annotation => {
      return currentTimeMs >= annotation.startTimeMs && 
             currentTimeMs <= (annotation.startTimeMs + annotation.durationMs);
    });

    // Render each active annotation
    activeAnnotations.forEach(annotation => {
      this.renderAnnotation(ctx, annotation, currentTimeMs, videoRect);
    });
  }

  renderAnnotation(ctx, annotation, currentTimeMs, videoRect) {
    const { data, style = {} } = annotation;
    
    // Check for required data
    if (!data || !data.vanishing_triangle) {
      return;
    }

    const vanishingTriangle = data.vanishing_triangle;
    if (!Array.isArray(vanishingTriangle) || vanishingTriangle.length < 2) {
      return;
    }

    const strokeColor = style.strokeColor || this.options.defaultStrokeColor;
    const lineWidth = style.lineWidth || this.options.defaultLineWidth;
    const showEndpoints = style.showEndpoints !== undefined ? style.showEndpoints : this.options.defaultShowEndpoints;

    // Save context
    ctx.save();

    // Set line styles
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.globalAlpha = style.opacity || this.options.defaultOpacity;

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
            this.drawEndpoint(ctx, startX, startY);
            this.drawEndpoint(ctx, endX, endY);
          }
        }
      }
    });

    // Restore context
    ctx.restore();
  }

  /**
   * Draw endpoint marker
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  drawEndpoint(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = this.options.endpointColor;
    ctx.globalAlpha = 1.0; // Full opacity for endpoints
    ctx.beginPath();
    ctx.arc(x, y, this.options.endpointRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
}

export { DSFRenderer };