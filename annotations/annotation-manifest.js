
export class Annotation {
  constructor(category,
              startTimeMs,
              durationMs,
              data = {}
              ) {

    this.category = category || null;
    this.startTimeMs = startTimeMs ;
    this.durationMs = durationMs;
    this.data = data || {};

    if (!this.category) {
      throw new Error("Annotation must have a category");
    }
  }

  toJSON() {
    return {
      category: this.category,
      startTimeMs: this.startTimeMs,
      durationMs: this.durationMs,
      data: this.data,
    };
  }
    };

// =========== AnnotationManifest class ===========

export class AnnotationManifest {
  /**
 * Creates annotation manifest with items and metadata
  * @param {string} [version="1.0"] - Schema version
  * @param {object} [metadata={}] - Document metadata
  * @param {Object<string, Annotation[]>} [items={}] - Annotations map by category
   */
  constructor(version="1.0", metadata = {}, items = {}) {
    this.version = version;
    this.metadata = metadata; 
    this.items = items;

  }


  getCategories() {
    return Object.keys(this.items);
  }


  toJSON() {
    const itemsJson = {};
    
    for (const [category, annotations] of Object.entries(this.items)) {
      itemsJson[category] = annotations.map(item => item.toJSON());
    }
    
    return {
      version: this.version,
      metadata: this.metadata,
      items: itemsJson,
    };
  }

}