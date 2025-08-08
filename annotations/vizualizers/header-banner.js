import { BaseVisualizer } from "./base-visualizer.js";

/**
 * Header Banner Visualizer - Displays header information including speed, time, and alerts
 * 
 * Expected data structure extracted from metadata:
 * - Session info, device info, speed data, time data, alerts
 */
export class HeaderBanner extends BaseVisualizer {
  constructor(metadata) {
    super(metadata);
  }

  // Extract header banner data from metadata using same logic as header-banner-extractor
  // NOTE: Currently uses mock data for speed, alerts, etc. Real data extraction needs implementation
  extractData(metadata) {

    // Extract session and device information from metadata
    const sessionInfo = metadata?.session_info || {};
    const deviceInfo = metadata?.device_info || {};
    const inferenceData = metadata?.inference_data || {};
    
    // Extract header banner data
    const headerBannerData = {
        // Session details
        sessionId: sessionInfo.session_id || 'Unknown Session',
        timestamp: sessionInfo.start_time || new Date().toISOString(),
        duration: sessionInfo.duration_ms || 0,
        
        // Device information
        deviceModel: deviceInfo.model || 'Unknown Device',
        firmwareVersion: deviceInfo.firmware_version || 'Unknown',
        
        // Alert/inference information
        alertId: metadata.alertId || 'No Alert',
        alertType: metadata.alert_type || 'info',
        confidenceLevel: inferenceData.confidence || 0,
        
        // Display configuration
        position: { x: 0.0, y: 0.0 }, // Top of screen
        styling: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            textColor: '#ffffff',
            fontSize: '16px',
            padding: '8px 16px',
            borderRadius: '4px'
        },
        
        // Banner dimensions
        dimensions: {
            width: 1.0, // Full width
            height: 0.08 // 8% of video height
        }
    };

    return headerBannerData;
  }

  // Apply header banner specific styles
  applyStyles(ctx) {
    // Default styles - will be overridden per element
    ctx.globalAlpha = 1.0;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
  }

  // Draw the header banner
  _draw(ctx, epochTime, videoRect) {
    if (!this.data) return;

    // Header banner options
    const options = {
      BackgroundColor: "#000000", // Black background
      BackgroundOpacity: 0.4, // More transparent
      BorderColor: "#ffffff", // White border
      BorderWidth: 2,
      TextColor: "#ffffff", // White text
      DateTimeFont: "30px Arial",
      SpeedFont: "40px Arial",
      MessageFont: "40px Arial",
      AlertColor: "#FFC107", // Professional amber for alerts
      Padding: 10,
    };

    const L = videoRect.height;
    const W = videoRect.width;

    // Header banner dimensions
    const bannerHeight = L * 0.15; // 15% of video height
    const bannerWidth = W;
    const bannerX = 0;
    const bannerY = 0;

    // Mock data - replace with real extraction from this.data when available
    const timeZone = 'America/Los_Angeles';
    const currentSpeed = 38;
    const speedLimit = 35;
    const alertMessages = ["over speeding"];

    // Draw Speed Badge (top left)
    this._drawSpeedBadge(ctx, currentSpeed, speedLimit, options, bannerY);

    // Draw Date/Time (top right)
    this._drawDateTime(ctx, epochTime, timeZone, options, bannerWidth, bannerY);

    // Draw notification cards (top center)
    this._drawNotificationCards(ctx, alertMessages, options, bannerWidth, bannerY, bannerHeight);
  }

  _drawSpeedBadge(ctx, currentSpeed, speedLimit, options, bannerY) {
    // Draw Speed Badge (top left)
    const badgeWidth = 120;
    const badgeHeight = 120;
    const badgeX = options.Padding;
    const badgeY = options.Padding;
    const cornerRadius = 12;
    
    const badgeColor = "#2C2C2C"; // Darker, more professional grey
    
    // Draw rounded rectangle background
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
    ctx.font = "42px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(currentSpeed.toString(), badgeX + badgeWidth/2, badgeY + badgeHeight * 0.25);
    
    // Draw "mph" (middle section)
    ctx.font = "20px Arial";
    ctx.fillText("mph", badgeX + badgeWidth/2, badgeY + badgeHeight * 0.45);
    
    // Draw speed limit (bottom section)
    ctx.font = "22px Arial";
    ctx.fillText(`LIMIT ${speedLimit}`, badgeX + badgeWidth/2, badgeY + badgeHeight * 0.8);

    return { badgeWidth, badgeHeight, badgeX };
  }

  _drawNotificationCards(ctx, alertMessages, options, bannerWidth, bannerY, bannerHeight) {
    if (alertMessages.length === 0) return;

    // Notification card styling
    const cardPadding = 16;
    const cardSpacing = 8;
    const cardHeight = 50;
    const cardCornerRadius = 8;
    const cardBackgroundColor = "#1F1F1F";
    const cardBorderColor = "#404040";
    
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
      ctx.globalAlpha = 0.95;
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
    const textY = bannerY + options.Padding;
    
    // Set font and text alignment
    ctx.font = options.DateTimeFont;
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    
    // Add text stroke (outline) for better contrast
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    ctx.strokeText(formattedDateTime, rightSideX, textY);
    
    // Draw the main white text
    ctx.fillStyle = options.TextColor;
    ctx.fillText(formattedDateTime, rightSideX, textY);
  }
}
