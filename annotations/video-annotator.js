// VideoAnnotator adds Event Listeners to a video element
// and renders annotations on a canvas element.
// It handles video time updates, resizing, and rendering annotations.



import { AnnotationManifest, Annotation } from "./annotation-manifest.js";
import { BaseRenderer } from "./renderers/base-renderer.js";



// import renderers
import { CrossRenderer } from "./renderers/debug-cross.js";
import { InertialBarRenderer } from "./renderers/inertial-bar.js";
import { DSFRenderer } from "./renderers/dsf-renderer.js";
import {HeaderBanner} from "./renderers/header.js";
import { OutwardBoundingBoxesRenderer } from "./renderers/outward-bounding-boxes-renderer.js";

// import { DetectionRenderer } from "./renderers/detection-renderer.js";
// import { TextRenderer } from "./renderers/text-renderer.js";
// import { GraphRenderer } from "./renderers/graph-renderer.js";
// import { TrajectoryRenderer } from "./renderers/trajectory-renderer.js";
// import { HelloRenderer } from "./renderers/hello-renderer.js";
// import { DSFRenderer } from "./renderers/dsf-renderer.js";



const RENDER_MAP = {
  "debug-cross": CrossRenderer,
  "inertial-bar": InertialBarRenderer,
  "dsf": DSFRenderer,
  "header-banner": HeaderBanner,
  "outward-bounding-boxes": OutwardBoundingBoxesRenderer,
};


class VideoAnnotator {
  constructor(videoElement,
            annotationManifest, // json
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
      copy_video: true, // Copy video frame to canvas before rendering annotations
      ...options,
    };

    this.isVisible = true;
    this._lastRenderTime = -1;

    // State management
    this.renderers = [];
    this._initializeRenderers(this.rendererCategories);

    this._setupEventListeners();
  }

    //intialize the renderers and 
    // share the corresponding annotations with them.
  _initializeRenderers(rendererCategories) {
    console.log(rendererCategories);
    for (const category of rendererCategories) {
      const RendererClass = RENDER_MAP[category];
      if (!RendererClass) {
        console.warn(`Renderer for category "${category}" not found.`);
        continue;
      }

      // get the annotations list for this category
      const annotations = this.annotationManifest.items[category] || [];

      const renderer = new RendererClass( annotations); //Renderer intialization
      console.log(`Initialized renderer for category: ${category}`, renderer);
      this.renderers.push(renderer);
    }
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

    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    }

    // pass render signal to the renderers
  _render() {

    // 1. update the current time
    const currentTime = this.video.currentTime;
    if (this._lastRenderTime === currentTime) {
      return;
    }
    this._lastRenderTime = currentTime;

    // console.log(`VideoAnnotator._render called - isVisible: ${this.isVisible}, renderers count: ${this.renderers.length}`);

    if (this.isVisible) {
        // 2. Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // // 3. Copy video frame to canvas if enabled
        // if (this.options.copy_video) {
        //     this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        // }

        // 4. Call render on each renderer
        const currentTimeMs = currentTime * 1000;
        const videoRect = this._getVideoRect();
        
        for(const renderer of this.renderers) {
          renderer.render(this.ctx, currentTimeMs, videoRect);
        }
    }
}
_getVideoRect() {
    return {
      width: this.video.videoWidth,
      height: this.video.videoHeight
    };
  }
}

export { VideoAnnotator };
