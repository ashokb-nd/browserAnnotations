import { BaseRenderer } from "./base-renderer.js";

export class InertialBarRenderer extends BaseRenderer {
  static category = "inertial-bar";

  getDefaultOptions() {
    return {
      Opacity: 0.8,
      GraphBoxLineWidth: 2,
      CurveLineWidth: 4,
      Curve1Color: "#FFD700", // Professional light yellow
      Curve2Color: "#32CD32", // Professional light green
      TextColor: "#ffffff", // White
      TextFont: "24px Arial",
    };
  }


  render(ctx, currentTimeMs, videoRect) {
    // console.log('inertial-bar renderer called with:', { currentTimeMs, videoRect, annotationsCount: this.annotations.length });

    // Save context
    ctx.save();

    // Set styles
    const options = this.getDefaultOptions();

    ctx.globalAlpha = options.Opacity;

// draw here 

    // Graph dimensions and position
    const graphWidth = videoRect.width * 0.95; // Almost full width
    const graphHeight = videoRect.height * 0.15; // 15% of video height (increased from 10%)
    const graphX = (videoRect.width - graphWidth) / 2; // Center horizontally
    const graphY = videoRect.height - graphHeight - (videoRect.height * 0.08); // Back to original bottom position

    // Draw graph box
    ctx.strokeStyle = "#ffffff"; // White for graph box
    ctx.lineWidth = options.GraphBoxLineWidth;
    ctx.strokeRect(graphX, graphY, graphWidth, graphHeight);

    // Draw two curves with static IMU data (dummy data for now)
    // Normally you would get: timeValues[], accelValues[], gyroValues[]
    const numPoints = 100;
    
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
    
    // First curve - Accelerometer data (red)
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

    // Second curve - Gyroscope data (blue)
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

    // Draw text at the 4 corners outside the graph box
    ctx.fillStyle = options.TextColor;
    ctx.font = options.TextFont;
    ctx.textBaseline = "bottom";
    
    // Top-left corner (above and to the left of box)
    ctx.textAlign = "left";
    ctx.fillText("Accel X", graphX, graphY - 5);
    
    // Top-right corner (above and to the right of box)
    ctx.textAlign = "right";
    ctx.fillText("Gyro Y", graphX + graphWidth, graphY - 5);
    
    // Bottom-left corner (below and to the left of box)
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillText("IMU Data", graphX, graphY + graphHeight + 5);
    
    // Bottom-right corner (below and to the right of box)
    ctx.textAlign = "right";
    ctx.fillText("Real-time", graphX + graphWidth, graphY + graphHeight + 5);

    // Draw red vertical line representing current timestamp
    // Assuming the graph represents a time window (e.g., last 10 seconds)
    const timeWindowMs = 10000; // 10 seconds time window
    const currentTimeInWindow = (currentTimeMs % timeWindowMs) / timeWindowMs; // Normalize to 0-1
    const timeLineX = graphX + currentTimeInWindow * graphWidth;
    
    ctx.strokeStyle = "#ff0000"; // Red color for timestamp line
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(timeLineX, graphY);
    ctx.lineTo(timeLineX, graphY + graphHeight);
    ctx.stroke();

// draw end

    ctx.restore();

  }
}
