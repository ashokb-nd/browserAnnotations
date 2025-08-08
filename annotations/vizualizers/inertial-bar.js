import { BaseVisualizer } from "./base-visualizer.js";


//NOTE: handling epochTime, videoPTS is not process. 
// TODO: fix it.
/**
 * Inertial Bar Visualizer - Displays IMU/accelerometer data as a time-series graph
 * 
 * Expected data structure extracted from metadata:
 * - sensorMetaData array with accelerometer readings
 */
export class InertialBar extends BaseVisualizer {
  constructor(metadata) {
    super(metadata);
  }

  // Extract inertial bar data from metadata using same logic as inertial-bar-extractor
  extractData(metadata) {
    // Extract IMU/inertial data from sensorMetaData
    const sensorMetaData = metadata?.sensorMetaData;

    if (!sensorMetaData || !Array.isArray(sensorMetaData)) return null;

    // Initialize arrays for accelerometer data
    const acc1 = [];
    const acc2 = [];
    const acc3 = [];
    const epochtime = [];

    // Parse accelerometer data from sensorMetaData
    sensorMetaData.forEach(entry => {
        if (entry.accelerometer) {
            // Parse the accelerometer string format: "  9.68  -0.17  -1.2   1751942812933"
            const accelString = entry.accelerometer.trim();
            const values = accelString.split(/\s+/); // Split by whitespace
            
            if (values.length >= 4) {
                const x = parseFloat(values[0]);
                const y = parseFloat(values[1]);
                const z = parseFloat(values[2]);
                const time = parseInt(values[3]);
                
                // Only add if all values are valid numbers
                if (!isNaN(x) && !isNaN(y) && !isNaN(z) && !isNaN(time)) {
                    acc1.push(x);
                    acc2.push(y);
                    acc3.push(z);
                    epochtime.push(time);
                }
            }
        }
    });

    if (acc1.length === 0) return null;

    // Create inertial bar data structure
    const inertialBarData = {
        // Raw accelerometer data arrays
        acc1: acc1,
        acc2: acc2,
        acc3: acc3,
        epochtime: epochtime
    };

    return inertialBarData;
  }

  // Apply inertial bar specific styles
  applyStyles(ctx) {
    // Default styles - will be overridden per element
    ctx.globalAlpha = 1.0;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
  }

  // Draw the inertial bar
  _draw(ctx, epochTime, videoRect) {
    if (!this.data) return;

    // Inertial bar options - Professional color scheme
    const options = {
      Opacity: 0.95,
      BackgroundColor: "#1a1a1a", // Dark charcoal instead of pure black
      BackgroundOpacity: 0.85, // More opaque for better contrast
      BorderColor: "#4a90e2", // Professional blue border
      BorderWidth: 1.5,
      GridColor: "#3a3a3a", // Subtle gray grid lines
      GridOpacity: 0.4, // More visible grid
      Curve1Color: "#2ecc71", // Professional emerald green for lateral
      Curve2Color: "#e74c3c", // Professional crimson red for driving
      TimelineColor: "#f39c12", // Professional orange/amber
      TextColor: "#ecf0f1", // Soft white for better readability
      LabelColor: "#bdc3c7", // Light gray for labels
      TextFont: "600 15px 'SF Pro Display', -apple-system, system-ui, sans-serif",
      LabelFont: "500 13px 'SF Pro Display', -apple-system, system-ui, sans-serif",
      CurveLineWidth: 2.8, // Slightly thicker for better visibility
      TimelineWidth: 2.5,
      CornerRadius: 6, // Subtle rounded corners
      TextStrokeColor: "#2c3e50", // Dark blue-gray stroke
      TextStrokeWidth: 1.5,
    };

    const L = videoRect.height;
    const W = videoRect.width;

    // Graph dimensions and positioning - make it wider and span more of the screen
    const graphWidth = W * 0.9;   // 90% of video width (increased from 35%)
    const graphHeight = L * 0.15; // 15% of video height (increased from 12%)
    const graphX = W * 0.05;      // 5% margin from left (centered)
    const graphY = L - graphHeight - (L * 0.02);  // 2% margin from bottom

    // Draw background
    this._drawBackground(ctx, graphX, graphY, graphWidth, graphHeight, options);

    // Draw grid lines
    this._drawGridLines(ctx, graphX, graphY, graphWidth, graphHeight, options);

    // Use actual IMU data
    const { acc1, acc2, acc3, epochtime } = this.data;
    
    if (acc2 && acc3 && epochtime) {
      // Convert epoch times to normalized values (0 to 1)
      const minTime = Math.min(...epochtime);
      const maxTime = Math.max(...epochtime);
      const timeRange = maxTime - minTime;
      
      const timeValues = epochtime.map(time => (time - minTime) / timeRange);
      
      // Use acc2 (lateral) and acc3 (driving), ignore acc1 (gravity)
      const lateralValues = acc2;  // Lateral acceleration
      const drivingValues = acc3;  // Driving acceleration
      
      // Draw IMU data curves
      this._drawCurves(ctx, timeValues, lateralValues, drivingValues, graphX, graphY, graphWidth, graphHeight, options);
      
      // Draw labels
      this._drawLabels(ctx, graphX, graphY, graphWidth, graphHeight, options);

      // Draw timeline indicator with video time mapping (not epoch time)
      // For now, show timeline as a percentage of video progress
      const videoProgress = Math.min(1.0, Math.max(0.0, epochTime / 60000)); // Assume max 60 second video
      this._drawTimeline(ctx, videoProgress, graphX, graphY, graphWidth, graphHeight, options);
    } else {
      // Fallback to dummy data if real data not available
      const numPoints = 100;
      const { timeValues, accelValues, gyroValues } = this._generateDummyData(numPoints);
      this._drawCurves(ctx, timeValues, accelValues, gyroValues, graphX, graphY, graphWidth, graphHeight, options);
      
      // Draw labels
      this._drawLabels(ctx, graphX, graphY, graphWidth, graphHeight, options);

      // Draw timeline indicator (fallback) - use video progress
      const videoProgress = Math.min(1.0, Math.max(0.0, epochTime / 60000)); // Assume max 60 second video
      this._drawTimeline(ctx, videoProgress, graphX, graphY, graphWidth, graphHeight, options);
    }
  }

  _drawBackground(ctx, graphX, graphY, graphWidth, graphHeight, options) {
    // Draw modern background with rounded corners
    ctx.fillStyle = options.BackgroundColor;
    ctx.globalAlpha = options.BackgroundOpacity;
    ctx.beginPath();
    ctx.roundRect(graphX, graphY, graphWidth, graphHeight, options.CornerRadius);
    ctx.fill();

    // Draw subtle border
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = options.BorderColor;
    ctx.lineWidth = options.BorderWidth;
    ctx.beginPath();
    ctx.roundRect(graphX, graphY, graphWidth, graphHeight, options.CornerRadius);
    ctx.stroke();
  }

  _drawGridLines(ctx, graphX, graphY, graphWidth, graphHeight, options) {
    // Draw subtle grid lines for better readability
    ctx.strokeStyle = options.GridColor;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = options.GridOpacity;

    // Horizontal grid lines
    for (let i = 1; i < 4; i++) {
      const y = graphY + (graphHeight * i / 4);
      ctx.beginPath();
      ctx.moveTo(graphX, y);
      ctx.lineTo(graphX + graphWidth, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 1; i < 8; i++) {
      const x = graphX + (graphWidth * i / 8);
      ctx.beginPath();
      ctx.moveTo(x, graphY);
      ctx.lineTo(x, graphY + graphHeight);
      ctx.stroke();
    }

    ctx.globalAlpha = 1.0; // Reset alpha
  }

  _drawCurves(ctx, timeValues, accelValues, gyroValues, graphX, graphY, graphWidth, graphHeight, options) {
    const maxG = 0.75; // Max G-force to display (clamps beyond this)
    const gScale = (graphHeight / 2) / maxG; // Scale factor for G values
    const numPoints = Math.min(timeValues.length, accelValues.length, gyroValues.length);

    // First curve - Lateral acceleration (green)
    ctx.strokeStyle = options.Curve1Color;
    ctx.lineWidth = options.CurveLineWidth;
    ctx.globalAlpha = options.Opacity;
    ctx.beginPath();
    for (let i = 0; i < numPoints; i++) {
      const x = graphX + timeValues[i] * graphWidth;
      // Scale accel values: center + (value * scale), clamped to ±0.75G
      const clampedAccel = Math.max(-maxG, Math.min(maxG, accelValues[i]));
      const y = graphY + graphHeight/2 - (clampedAccel * gScale); // Negative because canvas Y increases downward
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Second curve - Driving acceleration (red)
    ctx.strokeStyle = options.Curve2Color;
    ctx.lineWidth = options.CurveLineWidth;
    ctx.beginPath();
    for (let i = 0; i < numPoints; i++) {
      const x = graphX + timeValues[i] * graphWidth;
      // Scale gyro values: center + (value * scale), clamped to ±0.75G
      const clampedGyro = Math.max(-maxG, Math.min(maxG, gyroValues[i]));
      const y = graphY + graphHeight/2 - (clampedGyro * gScale); // Negative because canvas Y increases downward
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }

  _drawLabels(ctx, graphX, graphY, graphWidth, graphHeight, options) {
    // Helper function for drawing text with stroke for visibility
    const drawStrokedText = (text, x, y, fillColor = options.TextColor) => {
      // Draw stroke for visibility
      ctx.strokeStyle = options.TextStrokeColor;
      ctx.lineWidth = options.TextStrokeWidth;
      ctx.strokeText(text, x, y);
      // Draw fill with specified color
      ctx.fillStyle = fillColor;
      ctx.fillText(text, x, y);
    };

    // Set font for all text
    ctx.font = options.TextFont;
    ctx.globalAlpha = 1.0; // Ensure full opacity for text
    
    // Top-right corner: "BKWD|LEFT" with proper colors
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    
    // Split the text for different colors
    const bkwdWidth = ctx.measureText("BKWD").width;
    const separatorWidth = ctx.measureText("|").width;
    const leftWidth = ctx.measureText("LEFT").width;
    
    const endX = graphX + graphWidth - 8;
    const topY = graphY + 20;
    
    // Draw "LEFT" in green (lateral color)
    drawStrokedText("LEFT", endX, topY, options.Curve1Color);
    
    // Draw "|" separator in white
    const leftX = endX - leftWidth;
    drawStrokedText("|", leftX - separatorWidth, topY, options.TextColor);
    
    // Draw "BKWD" in red (driving color)
    const separatorX = leftX - separatorWidth;
    drawStrokedText("BKWD", separatorX, topY, options.Curve2Color);

    // Bottom-right corner: "FWD|RIGHT" with proper colors
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    
    const fwdWidth = ctx.measureText("FWD").width;
    const rightWidth = ctx.measureText("RIGHT").width;
    
    const bottomY = graphY + graphHeight - 8;
    
    // Draw "RIGHT" in green (lateral color)
    drawStrokedText("RIGHT", endX, bottomY, options.Curve1Color);
    
    // Draw "|" separator in white
    const rightX = endX - rightWidth;
    drawStrokedText("|", rightX - separatorWidth, bottomY, options.TextColor);
    
    // Draw "FWD" in red (driving color)
    const separatorX2 = rightX - separatorWidth;
    drawStrokedText("FWD", separatorX2, bottomY, options.Curve2Color);
  }

  _drawTimeline(ctx, videoProgress, graphX, graphY, graphWidth, graphHeight, options) {
    // videoProgress is a value between 0 and 1 representing video playback position
    
    // Calculate timeline position directly from video progress
    const timelineX = graphX + (videoProgress * graphWidth);
    
    // Clamp to graph bounds
    if (timelineX < graphX || timelineX > graphX + graphWidth) return;
    
    // Draw timeline indicator
    ctx.strokeStyle = options.TimelineColor;
    ctx.lineWidth = options.TimelineWidth;
    ctx.globalAlpha = 1.0; // Full opacity for better visibility
    ctx.beginPath();
    ctx.moveTo(timelineX, graphY - 5); // Extend slightly above graph
    ctx.lineTo(timelineX, graphY + graphHeight + 5); // Extend slightly below graph
    ctx.stroke();
    
    // Reset alpha
    ctx.globalAlpha = 1.0;
  }

  _generateDummyData(numPoints) {
    const timeValues = [];
    const accelValues = [];
    const gyroValues = [];
    
    for (let i = 0; i < numPoints; i++) {
      const t = i / (numPoints - 1);
      timeValues.push(t);
      
      // Generate smooth curves with some randomness
      accelValues.push(0.3 * Math.sin(t * 4 * Math.PI) + 0.1 * (Math.random() - 0.5));
      gyroValues.push(0.2 * Math.cos(t * 6 * Math.PI) + 0.1 * (Math.random() - 0.5));
    }
    
    return { timeValues, accelValues, gyroValues };
  }
}
