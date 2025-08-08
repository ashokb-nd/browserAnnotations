import { Annotation } from "../annotation-manifest.js";

/**
 * Extract inertial bar data from video metadata
 * @param {Object} metadata - Video metadata containing inertial/IMU data
 * @returns {Object} Processed inertial bar data for visualization
 */
function _getInertialBarData(metadata) {
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
        epochtime: epochtime,
        
        // // Position for the bar display (normalized coordinates)
        // position: { x: 0.02, y: 0.85 }, // Bottom left corner
        // // Bar dimensions and styling
        // barConfig: {
        //     width: 0.3,
        //     height: 0.08,
        //     orientation: 'horizontal'
        // }
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
