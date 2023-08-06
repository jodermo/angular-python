import {Injectable} from '@angular/core';
import {AppService} from '../app.service';
import {WebcamImage} from "ngx-webcam";
import {Subject} from "rxjs";
import {WebcamComponent as WebcamComp} from "ngx-webcam";


function rgbToHsl(r = 0, g = 0, b = 0) {
  r /= 255, g /= 255, b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h, s, l];
}

function hslToRgb(h = 0, s = 0, l = 0) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    let hue2rgb = function hue2rgb(p: number, q: number, t: number) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

const gammaCorrection = (pixels: Uint8ClampedArray, gamma: number) => {
  let correctionFactor = 1 / gamma;
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = 255 * Math.pow(pixels[i] / 255, correctionFactor);
    pixels[i + 1] = 255 * Math.pow(pixels[i + 1] / 255, correctionFactor);
    pixels[i + 2] = 255 * Math.pow(pixels[i + 2] / 255, correctionFactor);
  }
}
const hueShift = (pixels: Uint8ClampedArray, shift: number) => {
  for (let i = 0; i < pixels.length; i += 4) {
    let hsl = rgbToHsl(pixels[i], pixels[i + 1], pixels[i + 2]);
    hsl[0] = ((hsl[0] || 0) + shift) % 1;
    let rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
    pixels[i] = rgb[0];
    pixels[i + 1] = rgb[1];
    pixels[i + 2] = rgb[2];
  }
}

const convertToGrayscale = (pixels: Uint8ClampedArray) => {
  for (let i = 0; i < pixels.length; i += 4) {
    let luminance = 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];
    pixels[i] = pixels[i + 1] = pixels[i + 2] = luminance;
  }
}


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
  fps = 8;
  minFps = .1;
  maxFps = 30;
  canvas = document.createElement('canvas');
  fishEyeCanvas = document.createElement('canvas');
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

  staticRecognitionResults: WebcamRecognitionResult[] = [];
  staticRecognitionResultVisible: any = {};


  webcamComponent?: WebcamComp;

  imageQuality = .5;
  imageReader = new FileReader();
  imageSrc?: string;

  fishEyeImageReader = new FileReader();
  fishEyeImageSrc?: string;
  fishEyeStrength = 1;
  fishEyeType = 1;
  fishEyeScale = 2;

  constructor() {
  }

  recognising() {
    return this.recognitionResult?.length;
  }


  init(appService = this.app) {
    this.app = appService;
    if (this.app) {
      this.app.webcam = this;
    }
    this.imageReader.onloadend = () => {
      this.imageSrc = this.imageReader.result as string;
    };
    this.fishEyeImageReader.onloadend = () => {
      this.fishEyeImageSrc = this.fishEyeImageReader.result as string;
    };
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

  start(videoElement = this.video, outputVideoElement = this.outputVideo, startRecognition = this.recognition, onStarted?: () => void, onError?: (error: any) => void) {

    if (videoElement && outputVideoElement && !this.webcamComponent) {
      this.video = videoElement || this.video;
      this.outputVideo = outputVideoElement || this.outputVideo;
      this.loading = true;
      this.started = true;
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
          if (startRecognition) {
            this.startRecognition();
          }
          setTimeout(() => {
            if (onStarted) {
              onStarted();
            }
          }, 0);
        },
        (error: any) => {
          this.onError(error);
          this.loading = false;
          this.started = false;
          if(onError){
            onError(error);
          }
        }
      );
    } else {
      if (this.webcamComponent && (this.webcamComponent as any).video) {
        this.video = (this.webcamComponent as any).video.nativeElement;
        this.webcamComponent.ngAfterViewInit();
      }
      this.loading = false;
      this.started = true;
      this.updateVideo = true;
      this.videoUpdate();
      if (startRecognition) {
        this.startRecognition();
      }
      setTimeout(() => {
        if (onStarted) {
          onStarted();
        }
      }, 0);
    }

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
        this.updateStaticRecognitionResult(true);
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

  saveImage() {
    if (this.canvas && this.app) {
      this.canvas.toBlob((blob: Blob | null) => {
        if (blob && this.app) {
          this.app.uploadFile(blob, 'webcam-upload')
        }
      });
    }
  }

  private videoUpdate() {

    if (this.videoUpdateTimeout) {
      clearTimeout(this.videoUpdateTimeout);
    }

    if (this.updateVideo) {
      if (this.webcamComponent && (this.webcamComponent as any).video) {
        this.video = (this.webcamComponent as any).video.nativeElement;
      }
      if (this.video) {
        if(this.started){
          this.errorMessage = undefined;
        }
        this.captureImageAndSendToServer();
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

  captureImageAndSendToServer() {
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    const ctx = this.canvas.getContext('2d');
    try{
      ctx?.drawImage(this.video, 0, 0);
      this.fishEye(this.video, this.fishEyeStrength, this.fishEyeScale, this.fishEyeType, this.fishEyeCanvas);
      this.canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          this.imageReader.readAsDataURL(blob);
          if (this.recording) {
            this.sendToServer(blob);
          }
        }
      }, 'image/jpeg', this.imageQuality);
      this.fishEyeCanvas.toBlob((blob: Blob | null) => {
        if (blob) {
          this.fishEyeImageReader.readAsDataURL(blob);
        }
      }, 'image/jpeg', this.imageQuality);
    }catch (e) {

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
    const videoUrl = `${apiUrl}/webcam/video?path=${path}&filename=${filename}`;
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
    this.imageSrc = undefined;
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

  setRecognitionModel(name: string, file: any, box: {
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

  private updateStaticRecognitionResult(hideOnNoResult = false) {
    if (this.recognitionResult?.length) {
      for (let i = 0; i < this.recognitionResult.length; i++) {
        if (!this.staticRecognitionResults[i]) {
          this.staticRecognitionResults.push(this.recognitionResult[i]);
        }
      }
      for (let i in this.staticRecognitionResults) {
        const index = parseInt(i);
        if (this.recognitionResult[index]) {
          this.staticRecognitionResultVisible[i] = true;
          Object.assign(this.staticRecognitionResults[i], this.recognitionResult[index]);
        } else {
          this.staticRecognitionResultVisible[i] = false;
        }
      }
    } else if (hideOnNoResult) {
      for (let i in this.staticRecognitionResults) {
        this.staticRecognitionResultVisible[i] = false;
      }
    }
  }

  onError(error?: any) {
    this.started = false;

    if (error?.name === 'NotAllowedError') {
      // User denied permission to access the webcam
      this.errorMessage = 'User denied permission to access the webcam.';
      console.error(this.errorMessage);
    } else if (error?.name === 'NotFoundError') {
      // No webcam found
      this.errorMessage = 'No webcam found.';
      console.error(this.errorMessage);
    } else if (error?.name === 'NotReadableError') {
      // Webcam is in use or the video source allocation failed
      this.errorMessage = 'Failed to access the webcam or the video source is not readable.';
      console.error(this.errorMessage);
    } else if (error) {
      // Other errors
      if (error.message) {
        error = error.message;
      }
      this.errorMessage = 'An error occurred while accessing the webcam: ' + error;
    } else {
      this.errorMessage = 'User denied permission to access the webcam.';
    }
    console.log('onError', this.errorMessage);
  }


  fishEye(
    inputMedia: HTMLImageElement | HTMLVideoElement,
    strength = this.fishEyeStrength,
    fishEyeScale = this.fishEyeScale,
    distortionType = this.fishEyeType,
    outputCanvas = this.fishEyeCanvas,
  ) {
    const c = outputCanvas ? outputCanvas : document.createElement('canvas');
    const ctx = c.getContext('2d');


    if (ctx) {
      const cx = inputMedia.width / 2;
      const cy = inputMedia.height / 2;
      const size = inputMedia.width * 2 - (fishEyeScale * inputMedia.width) / 2;
      const zoom = 1;

      c.width = size;
      c.height = size;
      c.style.left = cx - size / 2 + 'px';
      c.style.top = cy - size / 2 + 'px';

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(
        inputMedia,
        cx - inputMedia.offsetLeft - .5 * size / zoom,
        cy - inputMedia.offsetTop - .5 * size / zoom,
        size / zoom,
        size / zoom,
        0,
        0,
        size,
        size
      );

      try {
        const imgData = ctx.getImageData(0, 0, size, size);
        const pixels = imgData.data;


        gammaCorrection(pixels, .25);
        hueShift(pixels, .5);
        const pixelsCopy: any[] = [];
        let index = 0;
        const h = size;
        const w = size;

        for (let i = 0; i <= pixels.length; i += 4) {
          pixelsCopy[index] = [pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3]];
          index++;
        }

        const dstpixels = pixelsCopy.slice();
        for (let y = 0; y < h; y++) {
          const ny = ((2 * y) / h) - 1;
          const ny2 = ny * ny;
          for (let x = 0; x < w; x++) {
            const nx = ((2 * x) / w) - 1;
            const nx2 = nx * nx;
            const r = Math.sqrt(nx2 + ny2);
            if (0.0 <= r && r <= 1.0) {
              let nr = Math.sqrt(1.0 - r * r);
              nr = (r + ((1.0 - nr) * strength)) / 2.0; // Modify calculation with strength
              if (nr <= 1.0) {
                const theta = Math.atan2(ny, nx);
                const nxn = nr * Math.cos(theta);
                const nyn = nr * Math.sin(theta);
                const x2 = parseInt((((nxn + 1) * w) / 2) + '');
                const y2 = parseInt((((nyn + 1) * h) / 2) + '');
                const srcpos = parseInt((y2 * w + x2) + '');
                if (srcpos >= 0 && srcpos < w * h) {
                  dstpixels[parseInt((y * w + x) + '')] = pixelsCopy[srcpos];
                }
              }
            }
          }
        }

        for (let i = 0; i < dstpixels.length; i++) {
          index = 4 * i;
          if (dstpixels[i] != undefined) {
            pixels[index + 0] = dstpixels[i][0];
            pixels[index + 1] = dstpixels[i][1];
            pixels[index + 2] = dstpixels[i][2];
            pixels[index + 3] = dstpixels[i][3];
          }
        }


        ctx.putImageData(imgData, 0, 0);
      } catch (e) {
        // do nothing
      }

    }
    return outputCanvas;
  }

}
