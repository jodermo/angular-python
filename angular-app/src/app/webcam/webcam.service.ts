import {Injectable} from '@angular/core';
import {AppService} from '../app.service';
import {WebcamImage} from "ngx-webcam";
import {Subject} from "rxjs";


export class WebcamRecognitionModelAnnotation {
  name?: string;
  file?: string;
  xmin = 25;
  ymin = 25;
  xmax = 175;
  ymax = 175;
}

export class WebcamRecognitionModelConfiguration {
  image_width = 200;
  image_height = 200;
  annotations: WebcamRecognitionModelAnnotation[] = [];
}

export class WebcamRecognitionModel {
  id?: number;
  name?: string;
  type = 'default';
  configuration = new WebcamRecognitionModelConfiguration();
  path: string = 'recognition-model';
  model?: string;
}


export interface WebcamRecognitionResult {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
  text?: string;
}


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
  fileName = 'webcam.webm';
  outputVideo?: HTMLVideoElement;
  outputVideoIsValid = false;
  updateVideo = false;
  capturedImage?: WebcamImage;
  fps = 8;
  minFps = .1;
  maxFps = 30;

  videoVersion = Date.now();

  private videoUpdateTimeout?: any;
  private videoRecognitionTimeout?: any;
  faceImages: string[] = [];
  faceImageAvailable = false;
  lastFaceImage?: string;
  triggerObservable: Subject<void> = new Subject<void>();
  recording = false;
  private onRecogniseImageCallbacks: ((results: WebcamRecognitionResult[]) => void)[] = [];
  recognitionResults: WebcamRecognitionResult[][] = [];
  recognitionResult?: WebcamRecognitionResult[];
  recognition = false;
  recognitionModels: WebcamRecognitionModel[] = [];
  recognitionModel?: WebcamRecognitionModel;


  constructor() {
  }


  init(appService = this.app) {
    this.app = appService;
    if (this.app) {
      this.app.webcam = this;
    }
    this.loadData();
  }

  loadData() {
    if (this.app && this.app.loadTextToSpeechResults) {
      this.app.loadTextToSpeechResults = false;
      this.app.API.get('image-recognition-model', (results?: WebcamRecognitionModel[]) => {
        this.recognitionModels = results?.length ? results : this.recognitionModels;
        if (this.app) {
          this.app.recognitionModels = this.recognitionModels;
        }
      });
    }
  }

  newRecognitionModel() {
    this.recognitionModel = new WebcamRecognitionModel();
  }

  setVideoElements(videoElement = this.video, outputVideoElement = this.outputVideo) {
    this.video = videoElement || this.video;
    this.outputVideo = outputVideoElement || this.outputVideo;
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
        console.log('start error', error);
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

  startRecord() {
    this.recording = true;
  }

  stopRecord() {
    this.recording = false;
  }

  startRecognition() {
    this.recognition = true;
    this.videoRecognition();
  }

  stopRecognition() {
    this.recognition = false;
  }

  handleImage(webcamImage: WebcamImage) {

    if (this.app) {
      // Convert the captured image to base64 format
      const imageData = webcamImage.imageAsBase64;
      // Send the image data to the Python backend
      this.app.post(this.app.API.url + '/image-recognition/stream/', {image: imageData}, (response: WebcamRecognitionResult[]) => {
        this.recognitionResults.push(response);
        this.recognitionResult = response;
        for (const callback of this.onRecogniseImageCallbacks) {
          callback(response);
        }
        // Handle the response from the backend
        // You can update your UI or perform further actions based on the results

      })
    }
  }

  captureImage() {
    this.triggerObservable.next();
  }


  private videoUpdate() {
    if (this.videoUpdateTimeout) {
      clearTimeout(this.videoUpdateTimeout);
    }
    if (this.updateVideo) {
      if (this.video) {
        this.captureImageAndSendToServer(this.video);
        // this.checkVideoSrcValidity();
      }
      this.videoUpdateTimeout = setTimeout(() => {
        this.videoUpdate();
      }, (1000 / this.fps));
    }
  }

  private videoRecognition() {
    if (this.videoRecognitionTimeout) {
      clearTimeout(this.videoRecognitionTimeout);
    }
    if (this.recognition) {
      if (this.video) {
        this.captureImage();
      }
      this.videoRecognitionTimeout = setTimeout(() => {
        this.videoRecognition();
      }, (1000 / this.fps));
    }
  }

  captureImageAndSendToServer(videoElement: HTMLVideoElement) {
    if (this.recording) {
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
  }

  sendToServer(file: Blob, filename = this.fileName, path = this.filePath) {
    if (this.app && this.recording) {
      const formData = new FormData();
      formData.append('file', file, filename);
      formData.append('filename', filename);
      formData.append('path', path);
      formData.append('fps', this.fps + '');
      this.app.post(this.app.API.url + '/webcam/image', formData, (result: any) => {
        if (result?.ace_image_path) {
          this.faceImageAvailable = false;
          this.lastFaceImage = result.ace_image_path;
          this.faceImages.push(result.ace_image_path);
          setTimeout(() => {
            this.faceImageAvailable = true;
          }, 0);
        }
      }, () => {
      }, 'form');
    }
  }

  checkVideoSrcValidity(video = this.outputVideo): void {
    if (video && !this.outputVideoIsValid) {
      video.onerror = () => {
        // Video source is not valid
        this.outputVideoIsValid = false;
      };
      video.onloadeddata = () => {
        // Video source is valid
        this.outputVideoIsValid = true;
      };
      video.src = this.videoSrc();
      video.load();
    }
  }

  videoSrc(filename = this.fileName, path = this.filePath): string {
    const apiUrl = this.app ? this.app.API.url : '';
    const videoUrl = `${apiUrl}/webcam/video?path=${path}&filename=${filename}&v=` + this.videoVersion;
    return videoUrl;
  }


  stop() {
    this.videoVersion = Date.now();
    if (this.video.srcObject) {
      const stream = this.video.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => {
        track.stop();
      });
      this.checkVideoSrcValidity();
    }
    this.video.srcObject = null;
    this.recording = false;
    this.updateVideo = false;
    this.started = false;
  }

  faceImage() {
    const apiUrl = this.app ? this.app.API.url : '';
    if (this.lastFaceImage) {
      return apiUrl + '/' + this.lastFaceImage;
    }
    return this.faceImages.length ? apiUrl + '/' + this.faceImages[this.faceImages.length - 1] : '';
  }

  onRecogniseImage(callback: (result: WebcamRecognitionResult[]) => void) {
    this.onRecogniseImageCallbacks.push(callback);
  }

  setRecognitionModel(name: string, file: any, box : {
    xmin: number,
    ymin: number,
    xmax: number,
    ymax: number,
  }, recognitionModel = this.recognitionModel) {
    if (this.app && recognitionModel) {
      this.app.post(this.app.API.url + '/image-recognition/model/', {
        name: name,
        file: file,
        model: this.recognitionModel,
        xmin: box.xmin,
        ymin: box.ymin,
        xmax: box.xmax,
        ymax: box.ymax,
      }, (result: WebcamRecognitionModel) => {
        recognitionModel = result;
      });

    }

  }
}
