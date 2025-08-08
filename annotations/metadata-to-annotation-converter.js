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
    console.log(` annotationCategories: ${annotationCategories.join(', ')}`);
    try {
      const annotationsByCategory = {};

      for (const category of annotationCategories) {
        try {
          const extractor = Extractors[category];
          if (extractor && typeof extractor === 'function') {
            const annotations = extractor(video_session_metadata, options);
            annotationsByCategory[category] = annotations;
            console.log(`Extracted ${annotations.length} annotations for category '${category}'`);
            // log annotationsByCategory
            // console.log(`annotations by category: ${annotationsByCategory[category], null, 2)}`);
          }
        } catch (error) {
          console.error(`Failed to extract '${category}' annotations: ${error.message}`);
        }
      }

      console.log(` annotations extracted: ${annotationCategories}`);
      
      const metadata = {
        source: "metadata-converter",
        version: this.VERSION,
        created: new Date().toISOString(),
        extractors: annotationCategories
      };
      
      // Create AnnotationManifest with correct constructor parameters: (version, metadata, items)
      return new AnnotationManifest(this.VERSION, metadata, annotationsByCategory);

    } catch (error) {
      console.error(`Failed to convert metadata to manifest: ${error.message}`);
      return null;
    }
  }


}