
export class BaseRenderer {
  constructor(canvas,
    annotations
  ) {

    this.canvas = canvas;
    this.annotations = annotations;
    this.context = canvas.getContext("2d");
    }
  render(currentTimeMs,videoRect) {
    throw new Error("render() method must be implemented by subclasses");
  }

_denormalizePoint(point, videoRect) {
return {
    x: point.x * videoRect.width,
    y: point.y * videoRect.height,
};
}




}