import { BaseRenderer } from "./base-renderer.js";

/**
 * @fileoverview Outward Bounding Boxes Renderer - Renders vehicle/object detection bounding boxes
 * 
 * ANNOTATION DATA STRUCTURE:
 * =========================
 * 
 * Expected annotation format:
 * {
 *   id: "outward-bbox-1",                   // Unique identifier
 *   category: "outward-bounding-boxes",     // Must be "outward-bounding-boxes"
 *   timeRange: {                            // Time visibility range
 *     startMs: 1000,                        //   Start time in milliseconds
 *     endMs: 1200                           //   End time in milliseconds
 *   },
 *   data: {                                 // Outward bounding box data
 *     bbox: {                               //   Bounding box coordinates (normalized 0-1)
 *       x: 0.1,                             //     Left position (0-1)
 *       y: 0.2,                             //     Top position (0-1)
 *       width: 0.3,                         //     Width (0-1)
 *       height: 0.4                         //     Height (0-1)
 *     },
 *     confidence: 0.85,                     //   Detection confidence (0-1)
 *     objectId: "obj_211",                  //   Unique object/vehicle identifier
 *     objectClass: 2,                       //   Object class (2 = vehicle)
 *     distance: 124.63,                     //   Distance in meters
 *     relativeSpeed: 9.83,                  //   Relative speed
 *     lanePosition: -100                    //   Lane position
 *   },
 *   style: {                                // Optional styling overrides
 *     strokeColor: "#00FF00",               //   Box border color (default: green)
 *     fillColor: "rgba(0, 255, 0, 0.1)",   //   Box fill color (default: transparent green)
 *     lineWidth: 2,                         //   Border thickness (default: 2)
 *     showLabel: true,                      //   Show object ID label (default: true)
 *     showConfidence: true,                 //   Show confidence score (default: true)
 *     showDistance: true,                   //   Show distance info (default: true)
 *     labelPosition: "top-left"             //   Label position relative to box
 *   }
 * }
 * 
 * @extends BaseRenderer
 */
export class OutwardBoundingBoxesRenderer extends BaseRenderer {
    static category = "outward-bounding-boxes";

    constructor(annotations) {
        super(annotations);
    }

    /**
     * Get default rendering options for outward bounding boxes
     * @returns {Object} Default options
     */
    getDefaultOptions() {
        return {
            ...super.getDefaultOptions(),
            strokeColor: "#00FF00",              // Green border for vehicle boxes
            fillColor: "rgba(0, 255, 0, 0.1)",  // Transparent green fill
            lineWidth: 2,                        // Border thickness
            showLabel: true,                     // Show object ID
            showConfidence: true,                // Show confidence score
            showDistance: true,                  // Show distance information
            showRelativeSpeed: true,             // Show relative speed
            labelPosition: "top-left",           // Label position
            fontSize: 12,                        // Label font size
            fontFamily: "Arial, sans-serif",     // Label font
            labelPadding: 4,                     // Label padding
            confidenceThreshold: 0.5,            // Minimum confidence to render
            maxDistance: 200                     // Maximum distance to render (meters)
        };
    }

    /**
     * Render outward bounding boxes for the current time
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} currentTimeMs - Current video time in milliseconds
     * @param {Object} videoRect - Video dimensions {width, height}
     */
    render(ctx, currentTimeMs, videoRect) {
        const options = this.getDefaultOptions();
        
        // Debug logging
        console.log('OutwardBoundingBoxesRenderer.render called:', {
            annotationsCount: this.annotations.length,
            currentTimeMs: currentTimeMs,
            videoRect: videoRect
        });
        
        if (this.annotations.length === 0) {
            console.log('No annotations available for OutwardBoundingBoxesRenderer');
            return;
        }
        
        // Find annotations with timestamps just below current time (within 300ms)
        // Only show the most recent detection that's earlier than current time
        const activeAnnotations = [];
        
        if (this.annotations.length > 0) {
            // Convert current video time to epoch timestamp
            const currentEpochTime = this.annotations[0].data.videoStartTime + currentTimeMs;
            
            // Find all annotations that are before current time and within 300ms
            const candidateAnnotations = this.annotations.filter(annotation => {
                const { detectionTimestamp } = annotation.data;
                const timeDiff = currentEpochTime - detectionTimestamp;
                
                // Only consider detections that are:
                // 1. Before current time (timeDiff > 0)
                // 2. Within 300ms of current time (timeDiff <= 300)
                return timeDiff > 0 && timeDiff <= 300;
            });
            
            if (candidateAnnotations.length > 0) {
                // Find the most recent (closest) timestamp that's still before current time
                const mostRecentTimestamp = Math.max(...candidateAnnotations.map(a => a.data.detectionTimestamp));
                
                // Get all detections from that specific timestamp
                activeAnnotations.push(...candidateAnnotations.filter(annotation => 
                    annotation.data.detectionTimestamp === mostRecentTimestamp
                ));
                
                console.log('Active annotations found:', {
                    currentEpochTime,
                    mostRecentTimestamp,
                    timeDiff: currentEpochTime - mostRecentTimestamp,
                    count: activeAnnotations.length
                });
            }
        }

        console.log(`Found ${activeAnnotations.length} active annotations at time ${currentTimeMs}`);

        activeAnnotations.forEach(annotation => {
            const { bbox, objectClass, objectId, videoStartTime, detectionTimestamp, originalCoords } = annotation.data;
            
            // Convert normalized coordinates to pixel coordinates
            const x = bbox.x * videoRect.width;
            const y = bbox.y * videoRect.height;
            const width = bbox.width * videoRect.width;
            const height = bbox.height * videoRect.height;

            // Get color based on object class
            const colors = this._getObjectClassColors();
            const strokeColor = colors[objectClass] || options.strokeColor;
            const fillColor = strokeColor.replace(')', ', 0.1)').replace('rgb', 'rgba');

            // Set rendering style
            ctx.strokeStyle = annotation.style?.strokeColor || strokeColor;
            ctx.lineWidth = annotation.style?.lineWidth || options.lineWidth;

            // Draw bounding box (border only, no fill)
            ctx.strokeRect(x, y, width, height);

            // Draw label if enabled
            if (options.showLabel) {
                this._renderLabel(ctx, x, y, width, height, {
                    objectId: objectId,
                    objectClass: objectClass,
                    options: options
                });
            }
        });
    }

    /**
     * Get color mapping for different object classes
     * @returns {Object} Object class to color mapping
     * @private
     */
    _getObjectClassColors() {
        return {
            1: "#FF0000",    // Red for class 1
            2: "#00FF00",    // Green for class 2 (vehicles)
            100: "#0000FF",  // Blue for class 100
            200: "#FFFF00",  // Yellow for class 200
            300: "#FF00FF",  // Magenta for class 300
            20000: "#00FFFF" // Cyan for class 20000
        };
    }

    /**
     * Render object label and class info
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - Bounding box x coordinate
     * @param {number} y - Bounding box y coordinate
     * @param {number} width - Bounding box width
     * @param {number} height - Bounding box height
     * @param {Object} labelData - Label data containing objectId, objectClass, etc.
     * @private
     */
    _renderLabel(ctx, x, y, width, height, labelData) {
        const { objectId, objectClass, options } = labelData;
        
        // Set font style
        ctx.font = `${options.fontSize}px ${options.fontFamily}`;
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        
        // Create label text
        const labelText = `ID: ${objectId} | Class: ${objectClass}`;
        
        // Measure text dimensions
        const textMetrics = ctx.measureText(labelText);
        const textWidth = textMetrics.width;
        const textHeight = options.fontSize;
        
        // Calculate label position (above the bounding box)
        const labelX = x;
        const labelY = y - options.labelPadding;
        
        // Draw label background
        const bgPadding = 4;
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(
            labelX - bgPadding, 
            labelY - textHeight - bgPadding, 
            textWidth + (bgPadding * 2), 
            textHeight + (bgPadding * 2)
        );
        
        // Draw label text
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(labelText, labelX, labelY);
        
        // Add text stroke for better visibility
        ctx.strokeText(labelText, labelX, labelY);
    }
}
