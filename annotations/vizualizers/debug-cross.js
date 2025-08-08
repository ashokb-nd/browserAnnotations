import { BaseVisualizer } from "../vizualizers/base-visualizer.js";

export class Cross extends BaseVisualizer {
  constructor(metadata) {
    super(metadata);
  }

  // Extract data - for debug cross, we don't need specific data from metadata
  // This is a static visualization that always shows the cross
  extractData(metadata) {
    // Debug cross doesn't depend on any specific metadata
    return {};
  }

  // Apply custom styles for the cross
  applyStyles(ctx) {
    ctx.strokeStyle = "#ff00ff"; // Magenta
    ctx.lineWidth = 5;
    ctx.globalAlpha = 0.8;
  }

  // Draw the debug cross
  _draw(ctx, epochTime, videoRect) {
    const L = videoRect.height;
    const W = videoRect.width;

    // Draw cross from corner to corner
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W, L);
    ctx.moveTo(W, 0);
    ctx.lineTo(0, L);
    ctx.stroke();

    // Draw center cross as plus
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, L);
    ctx.moveTo(0, L / 2);
    ctx.lineTo(W, L / 2);
    ctx.stroke();
  }
}
