import { Annotation } from "../annotation-manifest.js";

/**
 * Extract header banner data from video metadata
 * @param {Object} metadata - Video metadata containing session info
 * @returns {Object} Processed header banner data for display
 */
function _getHeaderBannerData(metadata) {
    // Extract session and device information from metadata
    const sessionInfo = metadata?.session_info || {};
    const deviceInfo = metadata?.device_info || {};
    const inferenceData = metadata?.inference_data || {};
    
    // Example: Extract relevant information for header display
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

/**
 * Header banner extractor function
 * Creates annotations for displaying session/alert information as a header banner
 * 
 * @param {Object} video_metadata - Complete video metadata object
 * @param {Object} options - Optional configuration parameters
 * @returns {Array<Annotation>} Array of header banner annotations
 */
function headerBannerExtractor(video_metadata, options = {}) {
    const annotations = [];
    
    // Extract header banner data from metadata
    const headerBannerData = _getHeaderBannerData(video_metadata);
    
    if (headerBannerData) {
        const headerBannerAnnotation = new Annotation(
            'header-banner', // category
            0, // startTimeMs
            999999999, // durationMs - full video duration
            headerBannerData // data
        );
        
        annotations.push(headerBannerAnnotation);
    }

    return annotations;
}

export { headerBannerExtractor };
