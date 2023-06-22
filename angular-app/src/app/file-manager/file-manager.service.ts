import {Injectable} from '@angular/core';
import {AppService} from "../app.service";


export interface ServerFile {
  name: string;
  type: string;
  mime_type: string;
  path: string;
  directory: string;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class FileManagerService {
  selectedFile?: File;
  isDragOver = false;

  error?: any;
  uploaded?: File;

  uploadedFiles: File[] = [];

  serverFiles: any = {};
  serverFilesLoading: any = {};
  previewUrls: any = {};

  fallbackImage = '/assets/fallback.png';
  uploadPath = 'upload';

  private app?: AppService;

  constructor() {
  }


  init(app = this.app) {
    this.app = app;
    this.selectedFile = undefined;
    this.loadUploadedFiles();
  }

  reset() {
    this.init();
    this.uploaded = undefined;
    this.error = undefined;
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] as File;
  }

  async uploadFile(uploadPath = this.uploadPath): Promise<void> {
    if (!this.selectedFile) {
      console.log('No file selected.');
      return;
    }
    this.error = undefined;
    const uploadFile = this.selectedFile;
    try {
      this.app ? await this.app.uploadFile(uploadFile, uploadPath) : undefined;
      this.uploadedFiles.push(uploadFile);
      this.uploaded = uploadFile;
      this.init();
    } catch (error) {
      console.error('File upload failed', error);
      this.error = error;
      this.uploaded = undefined;
    }
  }

  getFileSize(fileSize: number): string {
    if (fileSize < 1024) {
      return fileSize + ' B';
    } else if (fileSize < 1048576) {
      return (fileSize / 1024).toFixed(2) + ' KB';
    } else {
      return (fileSize / 1048576).toFixed(2) + ' MB';
    }
  }

  onDragEnter(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files[0] as File;
    this.selectedFile = file;
  }

  isImageFile(file: any): boolean {
    const type = file.mime_type ? file.mime_type : file.type ? file.type : '';
    return type.startsWith('image/');
  }

  getPreviewUrl(file: File | null) {
    if (file && this.isImageFile(file)) {
      if (this.previewUrls[file.name]) {
        return this.previewUrls[file.name];
      }

      const reader = new FileReader();
      reader.addEventListener(
        'load',
        () => {
          if (typeof reader.result === 'string') {
            Promise.resolve(reader.result).then((src: string) => {
              this.previewUrls[file.name] = src;
            });
          }
        },
        false
      );
      reader.readAsDataURL(file);
      return this.fallbackImage;
    } else {
      return this.fallbackImage;
    }
  }

  files(uploadPath = this.uploadPath): ServerFile[] {
    if (this.serverFiles[uploadPath]) {
      return this.serverFiles[uploadPath];
    } else if (!this.serverFilesLoading[uploadPath]) {
      this.loadUploadedFiles(uploadPath);
    }
    return [];
  }

  loadUploadedFiles(uploadPath = this.uploadPath) {
    this.serverFilesLoading[uploadPath] = true;
    if (this.uploadPath && this.app) {
      this.app.getFiles(this.uploadPath, (result?: any) => {
        this.serverFiles[uploadPath] = result && result.files as ServerFile[] ? result.files : [];
        this.serverFilesLoading[uploadPath] = false;
      })
    }

  }

  onUploadPathChanged(uploadPath = this.uploadPath) {
    this.loadUploadedFiles(uploadPath);
  }
}
