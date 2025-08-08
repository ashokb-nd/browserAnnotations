import { Annotation } from "../annotation-manifest.js";

/**
 * Extract inertial bar data from video metadata
 * @param {Object} metadata - Video metadata containing inertial/IMU data
 * @returns {Object} Processed inertial bar data for visualization
 */
function _getInertialBarData(metadata) {
    // Extract IMU/inertial data from metadata
    const inferenceData = metadata?.inference_data || {};
    const observationsData = inferenceData?.observations_data || {};
    const imuData = observationsData?.imu_data;

    if (!imuData) return null;

    // Example: Process accelerometer and gyroscope data
    // This would extract actual sensor readings and convert them to visualization format
    const inertialBarData = {
        acceleration: {
            x: imuData.accel_x || 0,
            y: imuData.accel_y || 0,
            z: imuData.accel_z || 0
        },
        gyroscope: {
            pitch: imuData.gyro_pitch || 0,
            roll: imuData.gyro_roll || 0,
            yaw: imuData.gyro_yaw || 0
        },
        // Position for the bar display (normalized coordinates)
        position: { x: 0.02, y: 0.85 }, // Bottom left corner
        // Bar dimensions and styling
        barConfig: {
            width: 0.3,
            height: 0.08,
            orientation: 'horizontal'
        }
    };

    return inertialBarData;
}

/**
 * Inertial bar extractor function
 * Creates annotations for displaying inertial/IMU data as a bar visualization
 * 
 * @param {Object} video_metadata - Complete video metadata object
 * @param {Object} options - Optional configuration parameters
 * @returns {Array<Annotation>} Array of inertial bar annotations
 */
function inertialBarExtractor(video_metadata, options = {}) {
    const annotations = [];
    
    // Extract inertial bar data from metadata
    const inertialBarData = _getInertialBarData(video_metadata);
    
    if (inertialBarData) {
        const inertialBarAnnotation = new Annotation(
            'inertial-bar', // category
            0, // startTimeMs
            999999999, // durationMs - full video duration
            inertialBarData // data
        );
        
        annotations.push(inertialBarAnnotation);
    }

    return annotations;
}

export { inertialBarExtractor };
