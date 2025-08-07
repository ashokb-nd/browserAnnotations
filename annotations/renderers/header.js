import { BaseRenderer } from "./base-renderer.js";

export class HeaderBanner extends BaseRenderer {
  static category = "header-banner";

  getDefaultOptions() {
    return {
      BackgroundColor: "#000000", // Black background
      BackgroundOpacity: 0.4, // More transparent (reduced from 0.7)
      BorderColor: "#ffffff", // White border
      BorderWidth: 2,
      TextColor: "#ffffff", // White text
      DateTimeFont: "30px Arial", // Increased from 16px
      SpeedFont: "40px Arial", // Increased from 14px
      MessageFont: "40px Arial", // Increased from 14px
      AlertColor: "#b5b59aff", // Yellow for alerts
      Padding: 10,
    };
  }

  render(ctx, currentTimeMs, videoRect) {
    // Dummy input values - replace these with actual data inputs
    const epochTime = Date.now(); // Current epoch time
    const timeZone = 'America/Los_Angeles'; // PDT timezone
    const speedLimit = 65; // Speed limit in mph
    const alertMessages = [
      "Speed Camera Ahead",
      "Construction Zone"
    ];

    // Save context
    ctx.save();

    // Set styles
    const options = this.getDefaultOptions();

    const L = videoRect.height;
    const W = videoRect.width;

    // Header banner dimensions
    const bannerHeight = L * 0.15; // 15% of video height
    const bannerWidth = W;
    const bannerX = 0;
    const bannerY = 0;

    // Draw background
    ctx.fillStyle = options.BackgroundColor;
    ctx.globalAlpha = options.BackgroundOpacity;
    ctx.fillRect(bannerX, bannerY, bannerWidth, bannerHeight);

    // Reset alpha for text (no border drawn)
    ctx.globalAlpha = 1.0;

    // Format date time from epoch
    const date = new Date(epochTime);
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone,
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    });
    const formattedDateTime = formatter.format(date);

    // Right side - Date/Time and Speed Limit
    const rightSideX = bannerWidth - options.Padding;
    
    // Date/Time (top right)
    ctx.fillStyle = options.TextColor;
    ctx.font = options.DateTimeFont;
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText(formattedDateTime, rightSideX, bannerY + options.Padding);

    // Speed Limit (below date/time)
    ctx.font = options.SpeedFont;
    ctx.textBaseline = "middle";
    const speedText = `Speed Limit: ${speedLimit} mph`;
    ctx.fillText(speedText, rightSideX, bannerY + bannerHeight * 0.7);

    // Left side - Alert Messages
    const leftSideX = bannerX + options.Padding;
    ctx.font = options.MessageFont;
    ctx.textAlign = "left";
    ctx.fillStyle = options.AlertColor; // Yellow for alerts

    // Draw alert messages
    alertMessages.forEach((message, index) => {
      const messageY = bannerY + options.Padding + (index * 25); // 25px spacing between messages
      ctx.textBaseline = "top";
      ctx.fillText(message, leftSideX, messageY);
    });

    // Restore context
    ctx.restore();
  }
}
