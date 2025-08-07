// This script is to test the outward bounding box extraction functionality
// It's output is saved to a file in the output directory

import {extractOutwardDetections} from '../annotations/extractors-folder/outward_bb.js';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get current directory for relative path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let metadata_path = join(__dirname, "assets", "1", "metadata.json");
// read it and parse it
let metadataPromise = readFile(metadata_path, 'utf-8')
    .then(data => JSON.parse(data));

// Extract outward detections
metadataPromise
    .then(metadata => extractOutwardDetections(metadata))
    .then(async detections => {
        console.log('Outward Detections:', detections);
        
        // Create output directory if it doesn't exist
        const outputDir = join(__dirname, "output");
        await mkdir(outputDir, { recursive: true });
        
        // Store detections in a file
        const outputPath = join(outputDir, "outward_detections.json");
        const outputData = {
            timestamp: new Date().toISOString(),
            source: "metadata.json",
            extractorType: "outward_bb",
            detections: detections
        };
        
        try {
            await writeFile(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');
            console.log(`Detections saved to: ${outputPath}`);
        } catch (writeError) {
            console.error('Error saving detections:', writeError);
        }
    })
    .catch(error => {
        console.error('Error extracting outward detections:', error);
    });
