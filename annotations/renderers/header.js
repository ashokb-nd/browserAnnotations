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
      AlertColor: "#FFC107", // Professional amber for alerts
      Padding: 10,
    };
  }

  _drawSpeedBadge(ctx, currentSpeed, speedLimit, options, bannerY) {
    // Draw Speed Badge (top left)
    const badgeWidth = 120; // Increased from 100
    const badgeHeight = 120; // Increased from 100
    const badgeX = options.Padding;
    const badgeY = options.Padding;
    const cornerRadius = 12; // Rounded corners
    
    // Determine badge color based on speed vs limit
    const isOverLimit = currentSpeed > speedLimit;
    const badgeColor = "#2C2C2C"; // Darker, more professional grey
    
    // Draw rounded rectangle background (no glow or border)
    ctx.fillStyle = badgeColor;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, cornerRadius);
    ctx.fill();
    
    // Reset alpha for text
    ctx.globalAlpha = 1.0;
    
    // Draw divider line in middle
    const dividerY = badgeY + badgeHeight * 0.6;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(badgeX + 10, dividerY);
    ctx.lineTo(badgeX + badgeWidth - 10, dividerY);
    ctx.stroke();
    
    // Draw current speed (top section)
    ctx.fillStyle = "#ffffff";
    ctx.font = "42px Arial"; // Increased from 32px
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(currentSpeed.toString(), badgeX + badgeWidth/2, badgeY + badgeHeight * 0.25);
    
    // Draw "mph" (middle section)
    ctx.font = "20px Arial"; // Increased from 16px
    ctx.fillText("mph", badgeX + badgeWidth/2, badgeY + badgeHeight * 0.45);
    
    // Draw speed limit (bottom section)
    ctx.font = "22px Arial"; // Increased from 18px
    ctx.fillText(`LIMIT ${speedLimit}`, badgeX + badgeWidth/2, badgeY + badgeHeight * 0.8);

    // Return badge dimensions for layout calculations
    return { badgeWidth, badgeHeight, badgeX };
  }

  _drawNotificationCards(ctx, alertMessages, options, bannerWidth, bannerY, bannerHeight) {
    if (alertMessages.length === 0) return;

    // Notification card styling
    const cardPadding = 16;
    const cardSpacing = 8;
    const cardHeight = 50; // Increased height to accommodate 26px font
    const cardCornerRadius = 8;
    const cardBackgroundColor = "#1F1F1F"; // Darker, more professional background
    const cardBorderColor = "#404040"; // Subtle border color
    
    // Calculate maximum width needed for cards
    ctx.font = "26px Arial";
    ctx.textAlign = "center";
    const maxTextWidth = Math.max(...alertMessages.map(message => ctx.measureText(message).width));
    const cardWidth = maxTextWidth + (cardPadding * 2);
    
    // Position cards vertically at top center
    const startX = (bannerWidth - cardWidth) / 2;
    let currentY = bannerY + options.Padding;

    // Draw each notification card vertically
    alertMessages.forEach((message, index) => {
      // Draw card background
      ctx.fillStyle = cardBackgroundColor;
      ctx.globalAlpha = 0.95; // Slightly more opaque for better contrast
      ctx.beginPath();
      ctx.roundRect(startX, currentY, cardWidth, cardHeight, cardCornerRadius);
      ctx.fill();
      
      // Draw card border
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = cardBorderColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(startX, currentY, cardWidth, cardHeight, cardCornerRadius);
      ctx.stroke();
      
      // Draw text
      ctx.fillStyle = options.AlertColor;
      ctx.font = "26px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(message, startX + cardWidth/2, currentY + cardHeight/2);
      
      // Move to next card position (below)
      currentY += cardHeight + cardSpacing;
    });
  }

  _drawDateTime(ctx, epochTime, timeZone, options, bannerWidth, bannerY) {
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

    // Position at top right
    const rightSideX = bannerWidth - options.Padding;
    
    // Draw Date/Time (top right)
    ctx.fillStyle = options.TextColor;
    ctx.font = options.DateTimeFont;
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText(formattedDateTime, rightSideX, bannerY + options.Padding);
  }

  render(ctx, currentTimeMs, videoRect) {
    // Dummy input values - replace these with actual data inputs
    const epochTime = Date.now(); // Current epoch time
    const timeZone = 'America/Los_Angeles'; // PDT timezone
    const currentSpeed = 38; // Current speed in mph
    const speedLimit = 35; // Speed limit in mph
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

    // Draw background (removed for modern look)
    // ctx.fillStyle = options.BackgroundColor;
    // ctx.globalAlpha = options.BackgroundOpacity;
    // ctx.fillRect(bannerX, bannerY, bannerWidth, bannerHeight);

    // Reset alpha for text (no background drawn)
    ctx.globalAlpha = 1.0;

    // Draw Speed Badge (top left)
    const badgeInfo = this._drawSpeedBadge(ctx, currentSpeed, speedLimit, options, bannerY);

    // Draw Date/Time (top right)
    this._drawDateTime(ctx, epochTime, timeZone, options, bannerWidth, bannerY);

    // Draw notification cards (top center)
    this._drawNotificationCards(ctx, alertMessages, options, bannerWidth, bannerY, bannerHeight);

    // Restore context
    ctx.restore();
  }
}
