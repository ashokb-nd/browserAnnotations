/**
 * VideoRecorder - Records annotated video using canvas.captureStream() + MediaRecorder
 * 
 * This class handles recording the composite canvas (video + annotations) 
 * and provides download functionality for the annotated video.
 * 
 * @example
 * const recorder = new VideoRecorder(videoElement, canvasElement);
 * recorder.startRecording();
 * // ... wait for recording to complete
 * recorder.stopRecording(); // Downloads automatically
 */
export class VideoRecorder {
  constructor(videoElement, canvasElement, options = {}) {
    this.video = videoElement;
    this.canvas = canvasElement;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    
    // Recording options
    this.options = {
      mimeType: 'video/mp4;codecs=h264,aac', // Try MP4 first
      videoBitsPerSecond: 8000000, // 8 Mbps - high quality
      audioBitsPerSecond: 128000,  // 128 kbps audio
      frameRate: 30, // 30 fps
      ...options
    };
    
    // Event callbacks
    this.onRecordingStart = options.onRecordingStart || (() => {});
    this.onRecordingStop = options.onRecordingStop || (() => {});
    this.onRecordingProgress = options.onRecordingProgress || (() => {});
    this.onRecordingError = options.onRecordingError || ((error) => console.error('Recording error:', error));
  }

  /**
   * Check if recording is supported in this browser
   * @returns {boolean} True if recording is supported
   */
  static isSupported() {
    return !!(
      HTMLCanvasElement.prototype.captureStream &&
      window.MediaRecorder &&
      (MediaRecorder.isTypeSupported('video/mp4;codecs=h264,aac') || 
       MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus'))
    );
  }

  /**
   * Get supported MIME types for recording
   * @returns {string[]} Array of supported MIME types
   */
  static getSupportedMimeTypes() {
    const types = [
      'video/mp4;codecs=h264,aac',  // Try MP4 first
      'video/mp4',
      'video/webm;codecs=vp9,opus', // WebM as fallback
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm'
    ];
    
    return types.filter(type => MediaRecorder.isTypeSupported(type));
  }

  /**
   * Start recording the annotated video
   * @param {number} duration - Optional duration in seconds (records full video if not specified)
   * @returns {Promise<void>}
   */
  async startRecording(duration = null) {
    if (this.isRecording) {
      throw new Error('Recording already in progress');
    }

    if (!VideoRecorder.isSupported()) {
      throw new Error('Video recording not supported in this browser');
    }

    try {
      // Reset recorded chunks
      this.recordedChunks = [];
      
      // Get canvas stream
      const canvasStream = this.canvas.captureStream(this.options.frameRate);
      
      // Get video audio track if available
      let combinedStream = canvasStream;
      if (this.video.captureStream && !this.video.muted) {
        try {
          const videoStream = this.video.captureStream();
          const audioTracks = videoStream.getAudioTracks();
          
          if (audioTracks.length > 0) {
            // Combine canvas video with original audio
            const tracks = [...canvasStream.getVideoTracks(), ...audioTracks];
            combinedStream = new MediaStream(tracks);
          }
        } catch (audioError) {
          console.warn('Could not capture video audio, continuing with video only:', audioError);
        }
      }

      // Find best supported MIME type
      const supportedTypes = VideoRecorder.getSupportedMimeTypes();
      const mimeType = supportedTypes.find(type => type === this.options.mimeType) || supportedTypes[0];
      
      if (!mimeType) {
        throw new Error('No supported video recording format found');
      }

      // Create MediaRecorder
      const mediaRecorderOptions = {
        mimeType: mimeType,
        videoBitsPerSecond: this.options.videoBitsPerSecond,
      };
      
      if (combinedStream.getAudioTracks().length > 0) {
        mediaRecorderOptions.audioBitsPerSecond = this.options.audioBitsPerSecond;
      }

      this.mediaRecorder = new MediaRecorder(combinedStream, mediaRecorderOptions);

      // Set up event handlers
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
          this.onRecordingProgress(event.data.size, this.recordedChunks.length);
        }
      };

      this.mediaRecorder.onstop = () => {
        this._handleRecordingComplete();
      };

      this.mediaRecorder.onerror = (event) => {
        this.onRecordingError(event.error);
        this.isRecording = false;
      };

      // Start recording
      this.mediaRecorder.start(100); // Collect data every 100ms
      this.isRecording = true;

      // Auto-stop after duration if specified
      if (duration && duration > 0) {
        setTimeout(() => {
          if (this.isRecording) {
            this.stopRecording();
          }
        }, duration * 1000);
      }

      this.onRecordingStart();
      console.log(`Started recording with ${mimeType}`);

    } catch (error) {
      this.onRecordingError(error);
      throw error;
    }
  }

  /**
   * Stop recording and trigger download
   * @returns {Promise<Blob>} The recorded video blob
   */
  async stopRecording() {
    if (!this.isRecording || !this.mediaRecorder) {
      throw new Error('No recording in progress');
    }

    return new Promise((resolve, reject) => {
      const originalOnStop = this.mediaRecorder.onstop;
      
      this.mediaRecorder.onstop = () => {
        originalOnStop();
        
        if (this.recordedChunks.length === 0) {
          reject(new Error('No recorded data available'));
          return;
        }

        const blob = new Blob(this.recordedChunks, { type: this.mediaRecorder.mimeType });
        resolve(blob);
      };

      this.mediaRecorder.stop();
      this.isRecording = false;
    });
  }

  /**
   * Record the entire video duration
   * @returns {Promise<Blob>} The recorded video blob
   */
  async recordFullVideo() {
    if (!this.video.duration || isNaN(this.video.duration)) {
      throw new Error('Video duration not available. Make sure video is loaded.');
    }

    // Reset video to beginning
    const originalTime = this.video.currentTime;
    this.video.currentTime = 0;
    
    // Wait for seek to complete
    await new Promise(resolve => {
      const onSeeked = () => {
        this.video.removeEventListener('seeked', onSeeked);
        resolve();
      };
      this.video.addEventListener('seeked', onSeeked);
    });

    // Start recording
    await this.startRecording();
    
    // Play video (this will render frames to canvas)
    this.video.play();
    
    // Wait for video to end
    await new Promise(resolve => {
      const onEnded = () => {
        this.video.removeEventListener('ended', onEnded);
        resolve();
      };
      this.video.addEventListener('ended', onEnded);
    });

    // Stop recording and get blob
    const blob = await this.stopRecording();
    
    // Restore original time
    this.video.currentTime = originalTime;
    
    return blob;
  }

  /**
   * Record a specific time range
   * @param {number} startTime - Start time in seconds
   * @param {number} endTime - End time in seconds
   * @returns {Promise<Blob>} The recorded video blob
   */
  async recordTimeRange(startTime, endTime) {
    if (startTime >= endTime) {
      throw new Error('Start time must be less than end time');
    }

    if (!this.video.duration || endTime > this.video.duration) {
      throw new Error('End time exceeds video duration');
    }

    // Store original time
    const originalTime = this.video.currentTime;
    
    // Seek to start time
    this.video.currentTime = startTime;
    await new Promise(resolve => {
      const onSeeked = () => {
        this.video.removeEventListener('seeked', onSeeked);
        resolve();
      };
      this.video.addEventListener('seeked', onSeeked);
    });

    // Start recording
    await this.startRecording();
    this.video.play();

    // Stop at end time
    await new Promise(resolve => {
      const checkTime = () => {
        if (this.video.currentTime >= endTime) {
          this.video.pause();
          resolve();
        } else {
          requestAnimationFrame(checkTime);
        }
      };
      requestAnimationFrame(checkTime);
    });

    // Stop recording
    const blob = await this.stopRecording();
    
    // Restore original time
    this.video.currentTime = originalTime;
    
    return blob;
  }

  /**
   * Handle recording completion and trigger download
   * @private
   */
  _handleRecordingComplete() {
    if (this.recordedChunks.length === 0) {
      console.error('No recorded data available');
      return;
    }

    // Create blob from recorded chunks
    const blob = new Blob(this.recordedChunks, { 
      type: this.mediaRecorder.mimeType 
    });

    // Trigger download
    this._downloadBlob(blob);
    
    // Callback
    this.onRecordingStop(blob);
    
    console.log(`Recording complete. Size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
  }

  /**
   * Download a blob as a file
   * @private
   * @param {Blob} blob - The blob to download
   * @param {string} filename - Optional filename
   */
  _downloadBlob(blob, filename = null) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    // Generate filename if not provided
    if (!filename) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const extension = this._getFileExtension(blob.type);
      filename = `annotated-video-${timestamp}.${extension}`;
    }

    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  /**
   * Get file extension from MIME type
   * @private
   * @param {string} mimeType - The MIME type
   * @returns {string} File extension
   */
  _getFileExtension(mimeType) {
    const mimeMap = {
      'video/webm': 'webm',
      'video/mp4': 'mp4',
      'video/ogg': 'ogv',
      'video/avi': 'avi'
    };
    
    return mimeMap[mimeType.split(';')[0]] || 'webm';
  }

  /**
   * Cancel current recording
   */
  cancelRecording() {
    if (this.isRecording && this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.recordedChunks = [];
      console.log('Recording cancelled');
    }
  }

  /**
   * Get recording status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      isRecording: this.isRecording,
      recordedChunks: this.recordedChunks.length,
      totalSize: this.recordedChunks.reduce((size, chunk) => size + chunk.size, 0),
      mimeType: this.mediaRecorder?.mimeType || null
    };
  }
}
