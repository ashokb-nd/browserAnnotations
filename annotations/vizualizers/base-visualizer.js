/**
 * Base Visualizer
 * 
 * Required methods to implement: 
 * extractData()  
 * _draw(), 
 * applyStyles() - optional
 * 
 * 
 * How to create a new visualizer:
 * 
 * 1. Extend BaseVisualizer:
 *    class MyVisualizer extends BaseVisualizer {
 *      constructor(metadata, options = {}) {
 *        super(metadata); // NAME is automatically derived from class name
 *      }
 * 
 * 2. Extract your data from metadata:
 *      extractData(metadata) {
 *        return metadata.mySpecificData || null;
 *      }
 * 
 * 3. Set your styles (optional):
 *      applyStyles(ctx) {
 *        ctx.strokeStyle = "#ff0000";
 *        ctx.fillStyle = "#00ff00";
 *      }
 * 
 * 4. Draw your visualization:
 *      _draw(ctx, epochTime, videoRect) {
 *        if (!this.data) return;
 *        // Your drawing code here
 *      }
 * 
 * Usage:
 *   const visualizer = new MyVisualizer(metadata);
 *   visualizer.display(ctx, epochTime, videoRect);
 *   visualizer.setVisible(false); // Hide
 */
export class BaseVisualizer {
  constructor(metadata) {
    // Automatically derive NAME from class name
    this.NAME = this.constructor.name;
    this._visible = true; // Always start visible, use setVisible() to control

    this.metadata = metadata;
    this.data = this.extractData(metadata);
  }
  
  // Extract data from metadata - subclasses must implement
  extractData(metadata) {
    throw new Error(`${this.constructor.name} must implement extractData()`);
  }
  
  // Check if visualizer has valid data
  isValid() {
    return this.data !== null && this.data !== undefined;
  }
  
  // Show/hide the visualizer
  setVisible(visible) {
    this._visible = visible;
  }
  
  // Apply styles to canvas context - subclasses can override
  applyStyles(ctx) {
    // Default styles - subclasses can override for their specific styling
    ctx.lineWidth = 2;
    ctx.font = "14px Arial";
  }
  
  // Main display method - public
  display(ctx, epochTime, videoRect) {
    if (!this.isValid() || !this._visible) return;
    
    ctx.save();
    this.applyStyles(ctx);
    this._draw(ctx, epochTime, videoRect);
    ctx.restore();
  }
  
  // Drawing implementation - subclasses must implement

  // epochTime: epochTime not video timestamp
  // videoRect: { height,width }
  // ctx: canvas context to draw on
  _draw(ctx, epochTime, videoRect) {
    throw new Error(`${this.constructor.name} must implement _draw()`);
  }
}
 