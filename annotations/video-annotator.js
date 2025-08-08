// VideoAnnotator adds Event Listeners to a video element
// and renders annotations on a canvas element.
// It handles video time updates, resizing, and rendering annotations.



import { BaseVisualizer } from "./vizualizers/base-visualizer.js";



// import visualizers
import { CrossVisualizer } from "./vizualizers/debug-cross.js";
import { DSFVisualizer } from "./vizualizers/dsf.js";
import { HeaderBannerVisualizer } from "./vizualizers/header-banner.js";
import { InertialBarVisualizer } from "./vizualizers/inertial-bar.js";
import { OutwardBoundingBoxesVisualizer } from "./vizualizers/outward-bounding-boxes.js";
// import { InertialBarRenderer } from "./renderers/inertial-bar.js";
// import { DSFRenderer } from "./renderers/dsf-renderer.js";
// import {HeaderBanner} from "./renderers/header.js";
// import { OutwardBoundingBoxesRenderer } from "./renderers/outward-bounding-boxes-renderer.js";

// import { DetectionRenderer } from "./renderers/detection-renderer.js";
// import { TextRenderer } from "./renderers/text-renderer.js";
// import { GraphRenderer } from "./renderers/graph-renderer.js";
// import { TrajectoryRenderer } from "./renderers/trajectory-renderer.js";
// import { HelloRenderer } from "./renderers/hello-renderer.js";
// import { DSFRenderer } from "./renderers/dsf-renderer.js";



const VISUALIZER_MAP = {
  "debug-cross": CrossVisualizer,
  "dsf": DSFVisualizer,
  "header-banner": HeaderBannerVisualizer,
  "inertial-bar": InertialBarVisualizer,
  "outward-bounding-boxes": OutwardBoundingBoxesVisualizer,
};


class VideoAnnotator {
  constructor(videoElement,
            metadata, // metadata object
            canvas,
            visualizerCategories = [],
            options = {}) {

    this.video = videoElement;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    if (!this.ctx) {
      throw new Error("Canvas context could not be initialized.");
    }
    
    this.metadata = metadata;
    this.visualizerCategories = visualizerCategories;

    // Default options with overrides
    this.options = {
      debugMode: false,
      copy_video: true, // Copy video frame to canvas before rendering annotations
      ...options,
    };

    this.isVisible = true;
    this._lastRenderTime = -1;

    // State management
    this.visualizers = [];
    this._initializeVisualizers(this.visualizerCategories);

    this._setupEventListeners();
  }

    //initialize the visualizers and 
    // share the corresponding metadata with them.
  _initializeVisualizers(visualizerCategories) {
    console.log(visualizerCategories);
    for (const category of visualizerCategories) {
      const VisualizerClass = VISUALIZER_MAP[category];
      if (!VisualizerClass) {
        console.warn(`Visualizer for category "${category}" not found.`);
        continue;
      }

      // pass the metadata directly to each visualizer
      const visualizer = new VisualizerClass(this.metadata); //Visualizer initialization
      console.log(`Initialized visualizer for category: ${category}`, visualizer);
      this.visualizers.push(visualizer);
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

    // console.log(`VideoAnnotator._render called - isVisible: ${this.isVisible}, visualizers count: ${this.visualizers.length}`);

    if (this.isVisible) {
        // 2. Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // // 3. Copy video frame to canvas if enabled
        // if (this.options.copy_video) {
        //     this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        // }

        // 4. Call display on each visualizer
        const currentTimeMs = currentTime * 1000;
        const videoRect = this._getVideoRect();
        
        for(const visualizer of this.visualizers) {
          visualizer.display(this.ctx, currentTimeMs, videoRect);
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
