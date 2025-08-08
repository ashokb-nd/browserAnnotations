/**
 * @fileoverview collection of extractor functions for processing video session metadata
 * @module Extractors
 * 
 * 
 * write about public api of the extractor functions
 * params : video_metadata, options
 * return : list of annotations
 * @example Usage:
 * const annotations = Extractors.hello(metadata, options);
 */

import { AnnotationManifest, Annotation } from './annotation-manifest.js';
import { dsf_extractor } from './extractors-folder/dsf-extractor.js';
import { inertialBarExtractor } from './extractors-folder/inertial-bar-extractor.js';
import { headerBannerExtractor } from './extractors-folder/header-banner-extractor.js';



//  * const detection = new Annotation({
//  *   id: 'det_001',
//  *   category: 'detection',
//  *   timeRange: { startMs: 1000, endMs: 5000 },
//  *   data: { bbox: { x: 0.1, y: 0.1, width: 0.2, height: 0.3 }, confidence: 0.95, class: 'vehicle' }
//  * });
//  * 

const Extractors = {
  hello(video_metadata, options) {
    return [
      new Annotation(
        'hello', // category
        0, // startTimeMs
        Infinity, // durationMs
        { message: 'Hello, world!' } // data
      )
    ];
  },

  // Detection extractor - processes detection data from metadata
  detection(video_metadata, options) {
    const annotations = [];
    
    // Placeholder logic - this would be replaced with actual metadata parsing
    if (video_metadata && video_metadata.detections) {
      video_metadata.detections.forEach((detection, index) => {
        annotations.push(new Annotation(
          'detection', // category
          detection.timestamp || 0, // startTimeMs
          5000, // durationMs
          {
            bbox: detection.bbox || { x: 0.1, y: 0.1, width: 0.2, height: 0.3 },
            confidence: detection.confidence || 0.95,
            class: detection.class || 'vehicle'
          }
        ));
      });
    }
    
    return annotations;
  },

  // Cross extractor for debugging - creates debug crosses
  cross(video_metadata, options) {
    return [
      new Annotation(
        'cross', // category
        0, // startTimeMs
        30000, // durationMs
        {
          debugText: 'Debug Cross from Metadata',
          includeCenterLines: true
        }
      )
    ];
  },

  // Text extractor - creates text overlays from metadata
  text(video_metadata, options) {
    const annotations = [];
    
    // Example: create text annotation from metadata
    if (video_metadata) {
      annotations.push(new Annotation(
        'text', // category
        1000, // startTimeMs
        4000, // durationMs (endMs - startMs = 5000 - 1000)
        {
          text: `Alert ID: ${video_metadata.alertId || 'Unknown'}`,
          position: { x: 0.02, y: 0.02 },
          anchor: 'top-left'
        }
      ));
    }
    
    return annotations;
  },


  // Add more extractor functions as needed

  'inertial-bar' : (video_metadata, options) => {
    return inertialBarExtractor(video_metadata, options);
  },

  "dsf" : (video_metadata, options) => {
    return dsf_extractor(video_metadata);
  },
  
  'header-banner' : (video_metadata, options) => {
    return headerBannerExtractor(video_metadata, options);
  }

};

export {Extractors};