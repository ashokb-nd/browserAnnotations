/**
 * Converts video session metadata to annotation manifests
 * 
 * Basic usage:
 * ===============
 * const manifest = await MetadataToAnnotationConverter.convertToManifest(
 *   metadata, 
 *   ['detection', 'tracking'],
 *   { debugMode: true }
 * );
 */

import { AnnotationManifest, Annotation } from './annotation-manifest.js';
import { Extractors } from './extractors.js';

export class MetadataToAnnotationConverter {
  
  static VERSION = '0.9.0';
  
  /**
   * Convert video session metadata to an AnnotationManifest object / not json
   * @param {Object} video_session_metadata - The video session metadata
   * @param {Array<string>} [annotationCategories=[]] - List of annotation categories to process
   * @param {Object} [options={}] - Optional configuration
   * @returns {AnnotationManifest|null} AnnotationManifest or null if conversion fails
   */
  static convertToManifest(video_session_metadata, annotationCategories = [], options = {}) {
    try {
      const annotationsByCategory = {};

      for (const category of annotationCategories) {
        try {
          const extractor = Extractors[category];
          if (extractor && typeof extractor === 'function') {
            const annotations = extractor(video_session_metadata, options);
            annotationsByCategory[category] = annotations;
          }
        } catch (error) {
          console.error(`Failed to extract '${category}' annotations: ${error.message}`);
        }
      }

      const manifestData = {
        metadata: {
          source: "metadata-converter",
          version: this.VERSION,
          created: new Date().toISOString(),
          extractors: annotationCategories
        },
        items: annotationsByCategory
      };
      const manifest = AnnotationManifest.fromJSON(manifestData);
      return manifest;

    } catch (error) {
      console.error(`Failed to convert metadata to manifest: ${error.message}`);
      return null;
    }
  }


}