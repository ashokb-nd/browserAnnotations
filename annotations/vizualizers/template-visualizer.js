import { BaseVisualizer } from "../vizualizers/base-visualizer.js";

/**
 * Template Visualizer
 * 
 * Copy this file and rename the class to create a new visualizer.
 * 
 * Steps to customize:
 * 1. Rename the class (e.g., MyVisualizer)
 * 2. Update extractData() to get your specific data from metadata
 * 3. Customize applyStyles() for your visual appearance
 * 4. Implement _draw() with your visualization logic
 * 5. Export your class and import it in video-annotator.js
 */
export class TemplateVisualizer extends BaseVisualizer {
  constructor(metadata) {
    super(metadata);
  }

  /**
   * Extract the data you need from metadata
   * @param {Object} metadata - The full metadata object
   * @returns {any} - The extracted data, or null if not available
   */
  extractData(metadata) {
    // TODO: Extract your specific data from metadata
    // Examples:
    // return metadata.inference_data?.observations_data?.mySpecificData;
    // return metadata.myCustomField;
    
    // For now, return empty object (will show as valid but draw nothing)
    return {};
  }

  /**
   * Apply custom styles to the canvas context
   * @param {CanvasRenderingContext2D} ctx - The canvas context
   */
  applyStyles(ctx) {
    // TODO: Customize your visualization appearance
    ctx.strokeStyle = "#ffffff";  // White stroke
    ctx.fillStyle = "#ff0000";    // Red fill
    ctx.lineWidth = 2;
    ctx.font = "14px Arial";
    ctx.globalAlpha = 0.8;
  }

  /**
   * Draw your visualization
   * @param {CanvasRenderingContext2D} ctx - The canvas context
   * @param {number} epochTime - Current epoch time (not video timestamp)
   * @param {Object} videoRect - Video dimensions {width, height}
   */
  _draw(ctx, epochTime, videoRect) {
    if (!this.data) return;

    const { width, height } = videoRect;

    // TODO: Implement your drawing logic here
    
    // Example: Draw a simple rectangle in the center
    const rectWidth = 100;
    const rectHeight = 50;
    const x = (width - rectWidth) / 2;
    const y = (height - rectHeight) / 2;

    ctx.fillRect(x, y, rectWidth, rectHeight);
    ctx.strokeRect(x, y, rectWidth, rectHeight);

    // Example: Draw text
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Template", x + 10, y + 30);
  }
}
