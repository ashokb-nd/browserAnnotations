import { BaseRenderer } from "./base-renderer.js";

export class CrossRenderer extends BaseRenderer {
  static category = "debug-cross";

  getDefaultOptions() {
    return {
      StrokeColor: "#ff00ff", // Magenta
      LineWidth: 2,
      Opacity: 0.8,
    };
  }

  render(currentTimeMs, videoRect) {
    console.log('debug-cross renderer called with:', { currentTimeMs, videoRect, annotationsCount: this.annotations.length });

    // Save context
    this.ctx.save();

    // Set styles
    const options = this.getDefaultOptions();

    this.ctx.strokeStyle = options.StrokeColor;
    this.ctx.lineWidth = options.LineWidth;
    this.ctx.globalAlpha = options.Opacity;

    // Draw cross from corner to corner
    this.ctx.beginPath();
    
    // Diagonal line from top-left to bottom-right
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(videoRect.width, videoRect.height);
    
    // Diagonal line from top-right to bottom-left
    this.ctx.moveTo(videoRect.width, 0);
    this.ctx.lineTo(0, videoRect.height);
    
    this.ctx.stroke();

    // Draw center lines
      this.ctx.beginPath();
      
      // Horizontal center line
      this.ctx.moveTo(0, videoRect.height / 2);
      this.ctx.lineTo(videoRect.width, videoRect.height / 2);
      
      // Vertical center line
      this.ctx.moveTo(videoRect.width / 2, 0);
      this.ctx.lineTo(videoRect.width / 2, videoRect.height);
      
      this.ctx.stroke();

    // Restore context
    this.ctx.restore();
  }
}
