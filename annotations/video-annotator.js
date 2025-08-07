// VideoAnnotator adds Event Listeners to a video element
// and renders annotations on a canvas element.
// It handles video time updates, resizing, and rendering annotations.


class VideoAnnotator {
  constructor(videoElement,
            annotationManifest,
            canvas,
            rendererCategories = [],
            options = {}) {

    this.video = videoElement;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    if (!this.ctx) {
      throw new Error("Canvas context could not be initialized.");
    }
    
    this.annotationManifest = annotationManifest;
    this.rendererCategories = rendererCategories;

    // Default options with overrides
    this.options = {
      debugMode: false,
      ...options,
    };

    this.isVisible = false;
    this._lastRenderTime = -1;

    // State management
    this.renderers = null;
    this._initializeRenderers();
    this._setupEventListeners();
  }

  _initializeRenderers() {
    // implement it
}


  _setupEventListeners() {
    // 1. on video PTS change
    this.video.addEventListener("timeupdate", () => {
      if (this.isVisible) {
        this._render();
      }
    });

    // 2. Resize observer to handle video resizing
    const resizeObserver = new ResizeObserver(() => {
      this._resize();
    });

    if (this.video instanceof Element) {
      resizeObserver.observe(this.video);
    }

    // 3. when the video loads
    this.video.addEventListener("loadedmetadata", () => {
      this._resize();
    });
  }

  _resize() {
        //pass
        // Resizing is not done by VideoAnnotator.
        // the frontend handles it.
    }

    // pass render signal to the renderers
  _render() {
    // 1. update the current time
    const currentTime = this.video.currentTime;
    if (this._lastRenderTime === currentTime) {
      return;
    }
    this._lastRenderTime = currentTime;

    // 2. handle clearing the canvas
    // === to be implemented ===

    // 3. call render on each renderer
    if (!this.isVisible) {
        for(const renderer of this.renderers) {
          renderer._render();
        }
    }
}
}

export { VideoAnnotator };
