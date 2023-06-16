import {Component} from '@angular/core';
import {AppService} from '../../app.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  selectedFile?: File;
  isDragOver = false;

  error?: any;
  uploaded?: File;

  uploadedFiles: File[] = [];

  previewUrls: any = {};

  fallbackImage = '/assets/fallback.png';

  constructor(public app: AppService) {
  }

  init() {
    this.selectedFile = undefined;
  }

  reset() {
    this.init();
    this.uploaded = undefined;
    this.error = undefined;
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] as File;
  }

  async uploadFile(): Promise<void> {
    if (!this.selectedFile) {
      console.log('No file selected.');
      return;
    }
    this.error = undefined;
    const uploadFile = this.selectedFile;
    try {
      const result = await this.app.uploadFile(uploadFile);
      console.log('File uploaded successfully', result, uploadFile);
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

  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  getPreviewUrl(file: File | null) {
    if (file && this.isImageFile(file)) {
      if (this.previewUrls[file.name]) {
        return this.previewUrls[file.name];
      }
      const setFileSrc = (src: string) => {
        this.previewUrls[file.name] = src;
      };
      const reader = new FileReader();
      reader.addEventListener(
        'load',
        () => {
          if (typeof reader.result === 'string') {
            Promise.resolve(reader.result).then((src: string) => {
              console.log('src', src);
              setFileSrc(src);
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
}
