
export class BaseRenderer {
    static category = "base";
  constructor(canvas,
    annotations
  ) {

    this.canvas = canvas;
    this.annotations = annotations;
    this.ctx = canvas.getContext("2d");
    }
  render(currentTimeMs,videoRect) {
    throw new Error("render() method must be implemented by subclasses");
  }


  getDefaultOptions() {
    return {
    //   defaultStrokeColor: "#ff00ff", // Magenta
    //   defaultLineWidth: 2,
    //   defaultOpacity: 0.8,
    };
}
_denormalizePoint(point, videoRect) {
// Convert a point from normalized coordinates (0 to 1) to pixel coordinates
//videoRect : size of canvas in pixels
return {
    x: point.x * videoRect.width,
    y: point.y * videoRect.height,
};
}



}