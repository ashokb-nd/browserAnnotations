
// a new renderer should extend this class
// and implement the render method
// it can also override getDefaultOptions to provide custom options
// the render method will be called with the current time in milliseconds and the video rectangle dimensions
export class BaseRenderer {
    static category = "base";
  constructor(annotations) {

    this.annotations = annotations;
    }
  render(ctx, currentTimeMs, videoRect) {
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