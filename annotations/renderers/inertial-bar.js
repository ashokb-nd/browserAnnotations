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
    
    // First curve - Accelerometer data (green)
    ctx.strokeStyle = options.Curve1Color;
    ctx.lineWidth = options.CurveLineWidth;
    ctx.beginPath();
    for (let i = 0; i < numPoints; i++) {
      const x = graphX + timeValues[i] * graphWidth; // Use actual time values
      const y = graphY + graphHeight/2 + accelValues[i] * (graphHeight * 0.15); // Use actual accel values
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Second curve - Gyroscope data (red)
    ctx.strokeStyle = options.Curve2Color;
    ctx.lineWidth = options.CurveLineWidth;
    ctx.beginPath();
    for (let i = 0; i < numPoints; i++) {
      const x = graphX + timeValues[i] * graphWidth; // Use actual time values
      const y = graphY + graphHeight/2 + gyroValues[i] * (graphHeight * 0.15); // Use actual gyro values
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
    const drawStrokedText = (text, x, y) => {
      // Draw stroke
      ctx.strokeStyle = options.TextStrokeColor;
      ctx.lineWidth = options.TextStrokeWidth;
      ctx.strokeText(text, x, y);
      // Draw fill
      ctx.fillStyle = options.TextColor;
      ctx.fillText(text, x, y);
    };

    // Set font for all text
    ctx.font = options.TextFont;
    ctx.textBaseline = "bottom";
    
    // Top-left corner (above and to the left of box)
    ctx.textAlign = "left";
    drawStrokedText("Accel X", graphX, graphY - 5);
    
    // Top-right corner (above and to the right of box)
    ctx.textAlign = "right";
    drawStrokedText("Gyro Y", graphX + graphWidth, graphY - 5);
    
    // Bottom-left corner (below and to the left of box)
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    drawStrokedText("IMU Data", graphX, graphY + graphHeight + 5);
    
    // Bottom-right corner (below and to the right of box)
    ctx.textAlign = "right";
    drawStrokedText("Real-time", graphX + graphWidth, graphY + graphHeight + 5);
  }

  _drawTimeline(ctx, currentTimeMs, graphX, graphY, graphWidth, graphHeight, options) {
    // Draw timeline representing current timestamp
    // Assuming the graph represents a time window (e.g., last 10 seconds)
    const timeWindowMs = 10000; // 10 seconds time window
    const currentTimeInWindow = (currentTimeMs % timeWindowMs) / timeWindowMs; // Normalize to 0-1
    const timeLineX = graphX + currentTimeInWindow * graphWidth;
    
    ctx.strokeStyle = options.TimelineColor; // Use professional amber color
    ctx.lineWidth = options.TimelineWidth;
    ctx.beginPath();
    ctx.moveTo(timeLineX, graphY);
    ctx.lineTo(timeLineX, graphY + graphHeight);
    ctx.stroke();
  }

  render(ctx, currentTimeMs, videoRect) {
    // console.log('inertial-bar renderer called with:', { currentTimeMs, videoRect, annotationsCount: this.annotations.length });

    // Save context
    ctx.save();

    // Set styles
    const options = this.getDefaultOptions();

    ctx.globalAlpha = options.Opacity;

    // Graph dimensions and position - more compact and modern
    const padding = 20;
    const graphWidth = videoRect.width * 0.9; // Slightly smaller for better margins
    const graphHeight = videoRect.height * 0.12; // Slightly more compact
    const graphX = (videoRect.width - graphWidth) / 2; // Center horizontally
    const graphY = videoRect.height - graphHeight - padding; // Clean bottom margin

    // Draw background and border
    this._drawBackground(ctx, graphX, graphY, graphWidth, graphHeight, options);

    // Draw grid lines
    this._drawGridLines(ctx, graphX, graphY, graphWidth, graphHeight, options);

    // Generate dummy IMU data (replace with actual data)
    const numPoints = 100;
    const { timeValues, accelValues, gyroValues } = this._generateDummyData(numPoints);
    
    // Draw IMU data curves
    this._drawCurves(ctx, timeValues, accelValues, gyroValues, graphX, graphY, graphWidth, graphHeight, options);

    // Draw labels
    this._drawLabels(ctx, graphX, graphY, graphWidth, graphHeight, options);

    // Draw timeline indicator
    this._drawTimeline(ctx, currentTimeMs, graphX, graphY, graphWidth, graphHeight, options);

    // Restore context
    ctx.restore();

  }
}
