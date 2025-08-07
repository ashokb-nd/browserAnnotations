

function extractOutwardDetections(metadata) {
    try {
        const inferenceData = metadata.inference_data || {};
        const observationsData = inferenceData.observations_data || {};
        
        const otl = observationsData.carBoxTrackerListCompressed || 
                   observationsData.carBoxTrackerList || [];

        const detections = [];
        
        for (const frameData of otl) {
            if (frameData.length >= 2) {
                const frameTimestamp = frameData[0];
                const frameDetections = frameData[1];
                
                if (frameDetections && frameDetections.length > 0) {
                    const frameObjects = [];
                    
                    for (const detection of frameDetections) {
                        if (typeof detection === 'object' && detection !== null) {
                            const bbox = convertBboxToEdgeFormat(detection);
                            
                            frameObjects.push({
                                bbox: bbox,
                                track_id: detection.id || detection.idx || -1,
                                object_class: parseInt(detection.objectClass || 0),
                                object_subclass: detection.objectSubClass || '',
                                object_value: detection.objectValue || 0,
                                detection_confidence: parseFloat(detection.detectionConf || 0.0),
                                class_confidence: parseFloat(detection.objectClassConf || 0.0),
                                subclass_confidence: parseFloat(detection.objectSubClassConf || 0.0),
                                value_confidence: parseFloat(detection.objectValueConf || 0.0),
                                time_to_collision: detection.time_to_collision || -1,
                                distance: detection.dist || null
                            });
                        }
                    }
                    
                    if (frameObjects.length > 0) {
                        detections.push({
                            frame_timestamp: frameTimestamp,
                            objects: frameObjects
                        });
                    }
                }
            }
        }
        
        return detections;
        
    } catch (error) {
        console.error('Error:', error.message);
        return [];
    }
}

function convertBboxToEdgeFormat(detection) {
    const xctr = detection.xctr || 0;
    const yctr = detection.yctr || 0;
    const width = detection.width || 0;
    const height = detection.height || 0;
    
    const xmin = xctr - width / 2.0;
    const ymin = yctr - height / 2.0;
    const xmax = xctr + width / 2.0;
    const ymax = yctr + height / 2.0;
    
    return [Math.round(xmin), Math.round(ymin), Math.round(xmax), Math.round(ymax)];
}

// module.exports = extractOutwardDetections;

export { extractOutwardDetections };