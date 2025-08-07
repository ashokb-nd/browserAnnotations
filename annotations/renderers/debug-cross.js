import { BaseRenderer } from "./base-renderer.js";

export class CrossRenderer extends BaseRenderer {
  static category = "debug-cross";

  getDefaultOptions() {
    return {
      StrokeColor: "#ff00ff", // Magenta
      LineWidth: 5,
      Opacity: 0.8,
    };
  }

  render(ctx, currentTimeMs, videoRect) {
    console.log('debug-cross renderer called with:', { currentTimeMs, videoRect, annotationsCount: this.annotations.length });

    // Save context
    ctx.save();

    // Set styles
    const options = this.getDefaultOptions();

    ctx.strokeStyle = options.StrokeColor;
    ctx.lineWidth = options.LineWidth;
    ctx.globalAlpha = options.Opacity;


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

    // Restore context
    ctx.restore();
  }
}
