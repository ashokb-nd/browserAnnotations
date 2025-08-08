import { BaseRenderer } from "./base-renderer.js";

export class InertialBarRenderer extends BaseRenderer {
  static category = "inertial-bar";

  getDefaultOptions() {
    return {
      Opacity: 0.95, // High opacity for elements
      BackgroundColor: "#000000", // Pure black for better video visibility
      BackgroundOpacity: 0.25, // Much more transparent background
      BorderColor: "#ffffff", // White border for contrast
      BorderWidth: 1,
      GridColor: "#ffffff", // White grid lines
      GridOpacity: 0.15, // Very subtle grid
      Curve1Color: "#00FF88", // Bright green for visibility
      Curve2Color: "#FF4444", // Bright red for visibility
      TimelineColor: "#FFC107", // Professional amber
      TextColor: "#ffffff", // Pure white text
      LabelColor: "#ffffff", // White labels
      TextFont: "bold 16px 'SF Pro Display', system-ui, -apple-system, sans-serif",
      LabelFont: "14px 'SF Pro Display', system-ui, -apple-system, sans-serif",
      CurveLineWidth: 2.5, // Slightly thinner but still visible
      TimelineWidth: 3, // Thicker timeline for visibility
      CornerRadius: 8, // Smaller radius for less bulk
      TextStrokeColor: "#000000", // Black stroke for text visibility
      TextStrokeWidth: 2,
    };
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
    
    // Horizontal center line
    const centerY = graphY + graphHeight / 2;
    ctx.beginPath();
    ctx.moveTo(graphX + 10, centerY);
    ctx.lineTo(graphX + graphWidth - 10, centerY);
    ctx.stroke();
    
    // Vertical grid lines (every 25%)
    for (let i = 1; i < 4; i++) {
      const x = graphX + (graphWidth * i / 4);
      ctx.beginPath();
      ctx.moveTo(x, graphY + 5);
      ctx.lineTo(x, graphY + graphHeight - 5);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1.0;
  }

  _generateDummyData(numPoints) {
    // Dummy static data - replace with actual IMU data
    const timeValues = [];
    const accelValues = [];
    const gyroValues = [];
    
    // Generate dummy static data
    for (let i = 0; i < numPoints; i++) {
      timeValues.push(i / numPoints); // Normalized time 0 to 1
      accelValues.push(Math.sin(i / numPoints * Math.PI * 3) * 2.5); // Static accelerometer data
      gyroValues.push(Math.cos(i / numPoints * Math.PI * 2) * 1.8);   // Static gyroscope data
    }
    
    return { timeValues, accelValues, gyroValues };
  }

  _drawCurves(ctx, timeValues, accelValues, gyroValues, graphX, graphY, graphWidth, graphHeight, options) {
    const numPoints = timeValues.length;
    
    // Scale factor: graph height represents -0.75G to +0.75G range
    const maxG = 0.75;
    const gScale = (graphHeight / (2 * maxG)) * 0.6; // Reduced from full scale to 60% for less vertical movement
    
    // First curve - Lateral acceleration (green)
    ctx.strokeStyle = options.Curve1Color;
    ctx.lineWidth = options.CurveLineWidth;
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
      // Draw stroke
      ctx.strokeStyle = options.TextStrokeColor;
      ctx.lineWidth = options.TextStrokeWidth;
      ctx.strokeText(text, x, y);
      // Draw fill with specified color
      ctx.fillStyle = fillColor;
      ctx.fillText(text, x, y);
    };

    // Set font for all text
    ctx.font = options.TextFont;
    
    // Top-right corner: "BKWD|LEFT" with proper colors
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    
    // Split the text for different colors
    const topRightText = "BKWD|LEFT";
    const bkwdWidth = ctx.measureText("BKWD").width;
    const separatorWidth = ctx.measureText("|").width;
    const leftWidth = ctx.measureText("LEFT").width;
    const totalWidth = bkwdWidth + separatorWidth + leftWidth;
    
    const endX = graphX + graphWidth;
    const topY = graphY - 5;
    
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
    
    const bottomRightText = "FWD|RIGHT";
    const fwdWidth = ctx.measureText("FWD").width;
    const rightWidth = ctx.measureText("RIGHT").width;
    
    const bottomY = graphY + graphHeight + 5;
    
    // Draw "RIGHT" in green (lateral color)
    drawStrokedText("RIGHT", endX, bottomY, options.Curve1Color);
    
    // Draw "|" separator in white
    const rightX = endX - rightWidth;
    drawStrokedText("|", rightX - separatorWidth, bottomY, options.TextColor);
    
    // Draw "FWD" in red (driving color)
    const separatorX2 = rightX - separatorWidth;
    drawStrokedText("FWD", separatorX2, bottomY, options.Curve2Color);
    
    // Top-left corner: Show +0.75G scale
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    drawStrokedText("+0.75G", graphX, graphY - 5, options.TextColor);
    
    // Bottom-left corner: Show -0.75G scale
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    drawStrokedText("-0.75G", graphX, graphY + graphHeight + 5, options.TextColor);
  }

  _drawTimeline(ctx, currentTimeMs, minEpochTime, maxEpochTime, graphX, graphY, graphWidth, graphHeight, options) {
    // Convert current video time (milliseconds) to epoch time equivalent
    // Assuming video starts at minEpochTime
    const currentEpochTime = minEpochTime + currentTimeMs;
    
    // Calculate position within the epoch time range
    const epochTimeRange = maxEpochTime - minEpochTime;
    const timelineProgress = Math.max(0, Math.min(1, (currentEpochTime - minEpochTime) / epochTimeRange));
    
    const timeLineX = graphX + timelineProgress * graphWidth;
    
    ctx.strokeStyle = options.TimelineColor;
    ctx.lineWidth = options.TimelineWidth;
    ctx.beginPath();
    ctx.moveTo(timeLineX, graphY);
    ctx.lineTo(timeLineX, graphY + graphHeight);
    ctx.stroke();
  }

  render(ctx, currentTimeMs, videoRect) {
    // Find active inertial-bar annotations for current time
    const activeAnnotations = this.annotations.filter(annotation => {
      return currentTimeMs >= annotation.startTimeMs && 
             currentTimeMs <= (annotation.startTimeMs + annotation.durationMs);
    });

    if (activeAnnotations.length === 0) return;

    // Save context
    ctx.save();

    // Set styles
    const options = this.getDefaultOptions();

    ctx.globalAlpha = options.Opacity;

    // Graph dimensions and position - more compact and modern
    const padding = 20;
    const graphWidth = videoRect.width * 0.9; // Slightly smaller for better margins
    const graphHeight = videoRect.height * 0.08; // Reduced from 0.12 to 0.08 (smaller vertical size)
    const graphX = (videoRect.width - graphWidth) / 2; // Center horizontally
    const graphY = videoRect.height - graphHeight - padding; // Clean bottom margin

    // Draw background and border
    this._drawBackground(ctx, graphX, graphY, graphWidth, graphHeight, options);

    // Draw grid lines
    this._drawGridLines(ctx, graphX, graphY, graphWidth, graphHeight, options);

    // Use actual IMU data from annotations
    const annotation = activeAnnotations[0]; // Use first active annotation
    const { acc1, acc2, acc3, epochtime } = annotation.data;
    
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

      // Draw timeline indicator with proper epoch time mapping
      this._drawTimeline(ctx, currentTimeMs, minTime, maxTime, graphX, graphY, graphWidth, graphHeight, options);
    } else {
      // Fallback to dummy data if real data not available
      const numPoints = 100;
      const { timeValues, accelValues, gyroValues } = this._generateDummyData(numPoints);
      this._drawCurves(ctx, timeValues, accelValues, gyroValues, graphX, graphY, graphWidth, graphHeight, options);
      
      // Draw labels
      this._drawLabels(ctx, graphX, graphY, graphWidth, graphHeight, options);

      // Draw timeline indicator (fallback)
      this._drawTimeline(ctx, currentTimeMs, 0, 10000, graphX, graphY, graphWidth, graphHeight, options);
    }

    // Restore context
    ctx.restore();

  }
}
