import {Injectable} from '@angular/core';
import {AppService} from '../app.service';

@Injectable({
  providedIn: 'root'
})
export class WebcamService {
  app?: AppService;
  errorMessage?: string;
  video: HTMLVideoElement = document.createElement('video');
  loading = false;
  started = false;
  filePath = 'webcam-recording';
  fileName = 'webcam.mp4';
  outputVideo?: HTMLVideoElement;
  outputVideoIsValid = false;
  updateVideo = false;
  private videoUpdateTimeout?: any;
  private videoUpdateRate = (1000 / 8) // 8 fps;

  constructor() {
  }

  init(appService = this.app) {
    this.app = appService;
    if (this.app) {
      this.app.webcam = this;
    }
  }

  start(videoElement = this.video, outputVideoElement = this.outputVideo) {
    this.video = videoElement || this.video;
    this.outputVideo = outputVideoElement || this.outputVideo;
    this.loading = true;

    const constraints = {
      video: true
    };
    this.errorMessage = undefined;
    navigator.mediaDevices.getUserMedia(constraints).then(
      (stream: MediaStream) => {
        this.errorMessage = undefined;
        this.video.srcObject = stream;
        this.video.play();
        this.loading = false;
        this.started = true;
        this.updateVideo = true;
        this.videoUpdate();
      },
      (error: any) => {
        if (error.name === 'NotAllowedError') {
          // User denied permission to access the webcam
          this.errorMessage = 'User denied permission to access the webcam.';
          console.error(this.errorMessage);
        } else if (error.name === 'NotFoundError') {
          // No webcam found
          this.errorMessage = 'No webcam found.';
          console.error(this.errorMessage);
        } else if (error.name === 'NotReadableError') {
          // Webcam is in use or the video source allocation failed
          this.errorMessage = 'Failed to access the webcam or the video source is not readable.';
          console.error(this.errorMessage);
        } else {
          // Other errors
          this.errorMessage = 'An error occurred while accessing the webcam: ' + error;
          console.error(this.errorMessage, error);
        }
        this.loading = false;
        this.started = false;
      }
    );
  }

  private videoUpdate() {
    if (this.videoUpdateTimeout) {
      clearTimeout(this.videoUpdateTimeout);
    }
    console.log('videoUpdate', this.video, this.updateVideo);
    if (this.updateVideo) {
      if (this.video) {
        this.captureImageAndSendToServer(this.video);
       // this.checkVideoSrcValidity();
      }
      this.videoUpdateTimeout = setTimeout(() => {
        this.videoUpdate();
      }, this.videoUpdateRate);
    }
  }

  captureImageAndSendToServer(videoElement: HTMLVideoElement) {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoElement, 0, 0);
    canvas.toBlob((blob: Blob | null) => {
      if (blob) {
        this.sendToServer(blob);
      }
    }, 'image/jpeg', 0.5);
  }

  sendToServer(file: Blob, filename = this.fileName, path = this.filePath) {
    if (this.app) {
      const formData = new FormData();
      formData.append('file', file, filename);
      formData.append('filename', filename);
      formData.append('path', path);
      formData.append('fps', (1000 / this.videoUpdateRate )+ '');
      this.app.post(this.app.API.url + '/webcam/image', formData, () => {
      }, () => {
      }, 'form');
    }
  }

  checkVideoSrcValidity(video = this.outputVideo): void {
    if (video && !this.outputVideoIsValid) {
      video.onerror = () => {
        // Video source is not valid
        this.outputVideoIsValid = false;
        console.log('Invalid video source');
      };
      video.onloadeddata = () => {
        // Video source is valid
        this.outputVideoIsValid = true;
        console.log('Valid video source');
      };
      video.src = this.videoSrc();
      video.load();
    }
  }

  videoSrc(filename = this.fileName, path = this.filePath): string {
    const apiUrl = this.app ? this.app.API.url : '';
    const videoUrl = `${apiUrl}/webcam/video?filename=${filename}&path=${path}`;
    return videoUrl;
  }


  stop() {
    if (this.video.srcObject) {
      const stream = this.video.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => {
        track.stop();
      });
      this.video.srcObject = null;
      this.started = false;
      this.updateVideo = false;
    }
  }
}
