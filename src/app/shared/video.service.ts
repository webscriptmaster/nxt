import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  private cancelSubject: Subject<void> = new Subject<void>();
  
  constructor(
    private http: HttpClient,
  ) { }

  compressAndSaveVideo(data: any, videoFiles: File[], imageFiles: File[], thumbnailFiles: File[]): Observable<any> {
    const url = `${environment.apiPaymentURL}/video/compress`;
    const formData: FormData = new FormData();
    formData.append('data', JSON.stringify(data));

    const appendFiles = (files: File[]) => {
      for (const file of files) {
        if (file && file.name) {
          formData.append('files', file, file.name);
        }
      }
    };
    appendFiles(videoFiles);
    appendFiles(imageFiles);
    appendFiles(thumbnailFiles);
    return this.http.post(url, formData);
  }
}
