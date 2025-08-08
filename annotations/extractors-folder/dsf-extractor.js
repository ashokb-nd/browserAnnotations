

import { Annotation } from "../annotation-manifest.js";

function _getLaneCalMessage(metadata) {

    // FILTER_SHORT_TRACKS = true
    const MIN_TRACK_LENGTH = 3;
    const CANONICAL_OUTWARD_IMAGE_WIDTH = 1920;
    const CANONICAL_OUTWARD_IMAGE_HEIGHT = 1080;
    const CANONICAL_INWARD_IMAGE_WIDTH = 1280;
    const CANONICAL_INWARD_IMAGE_HEIGHT = 720;
    const CANONICAL_DMS_IMAGE_WIDTH = 1296;
    const CANONICAL_DMS_IMAGE_HEIGHT = 1296;
  // Extract lane calibration parameters
  const inferenceData = metadata?.inference_data || {};
  const observationsData = inferenceData?.observations_data || {};
  const laneCalParams = observationsData?.laneCalibrationParams;

  if (!laneCalParams) return null;

  let [vanishingPointEstimate, _, xInt, imageHeight] = laneCalParams;

  // Convert to 1920x1080 resolution scale
  const scale = CANONICAL_OUTWARD_IMAGE_HEIGHT / imageHeight;

  vanishingPointEstimate = vanishingPointEstimate.map(x => x * scale);
  xInt = xInt.map(x => x * scale);
  imageHeight = CANONICAL_OUTWARD_IMAGE_HEIGHT;

  // Create short lane calibration segments: bottom corners to 5% up from bottom
  // Instead of full triangle to vanishing point, create short calibration markings
  // Triangle vertices: 
  // 1. Bottom left (xInt[0], imageHeight) to 5% up along the lane line
  // 2. Bottom right (xInt[1], imageHeight) to 5% up along the lane line

  // Calculate 5% up from bottom
  const calibrationHeight = imageHeight * 0.05; // 5% of image height
  const topY = imageHeight - calibrationHeight; // Y coordinate for top of calibration segment
  
  // For each lane line, calculate where it would be at the 5% mark
  // Left lane line direction vector from bottom to vanishing point
  const leftDirX = vanishingPointEstimate[0] - xInt[0];
  const leftDirY = vanishingPointEstimate[1] - imageHeight;
  const leftLength = Math.sqrt(leftDirX * leftDirX + leftDirY * leftDirY);
  
  // Right lane line direction vector from bottom to vanishing point  
  const rightDirX = vanishingPointEstimate[0] - xInt[1];
  const rightDirY = vanishingPointEstimate[1] - imageHeight;
  const rightLength = Math.sqrt(rightDirX * rightDirX + rightDirY * rightDirY);
  
  // Calculate end points at 5% height for each lane
  const leftEndX = xInt[0] + (leftDirX / leftLength) * calibrationHeight;
  const leftEndY = topY;
  
  const rightEndX = xInt[1] + (rightDirX / rightLength) * calibrationHeight;  
  const rightEndY = topY;

  // Return normalized coordinates (0-1 range) for the short calibration segments
  const laneCalMessage = [
    // Left calibration segment: bottom-left to 5% up
    [[xInt[0] / CANONICAL_OUTWARD_IMAGE_WIDTH, 1.0],
     [leftEndX / CANONICAL_OUTWARD_IMAGE_WIDTH, leftEndY / imageHeight]],
    // Right calibration segment: bottom-right to 5% up
    [[xInt[1] / CANONICAL_OUTWARD_IMAGE_WIDTH, 1.0],
     [rightEndX / CANONICAL_OUTWARD_IMAGE_WIDTH, rightEndY / imageHeight]]
  ];

  return laneCalMessage;
}

//  the annotations structure as follows
// {
//   id: '#randomId',
//   category: 'dsf',
//   timeRange: { startMs: 0, endMs: 999999999 },
//   data: {
//     laneCalMessage: _getLaneCalMessage()
//   }
// }

function dsf_extractor(video_metadata) {
  const annotations = [];
  
  // Create lane calibration annotation using Annotation class
  const laneCalMessage = _getLaneCalMessage(video_metadata);
  if (laneCalMessage) {
    const laneAnnotation = new Annotation(
      'dsf', // category
      0, // startTimeMs
      999999999, // durationMs 
      {
        "vanishing_triangle": laneCalMessage
      }
    );
    
    annotations.push(laneAnnotation);
  }

  return annotations;
}

export { dsf_extractor };