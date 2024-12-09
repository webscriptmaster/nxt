import { Component, Inject, OnInit, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import Cropper from 'cropperjs';

@Component({
  selector: 'app-cropp-image-dialog',
  templateUrl: './cropp-image-dialog.component.html',
  styleUrls: ['./cropp-image-dialog.component.scss'],
})
export class CroppImageDialogComponent implements OnInit, AfterViewInit {
  // croppedImage: any;
  // cropper = { x1: 50, x2: 50, y1: 50, y2: 50 };
  cropper: Cropper;

  constructor(
    public dialogRef: MatDialogRef<CroppImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.initCropp(this.data.img);
  }

  initCropp(img: string) {
    const image = new Image();
    image.src = this.data.img;

    image.onload = () => {
      const imageEl = document.getElementById('image') as HTMLImageElement;
      imageEl.src = image.src;
      imageEl.width = 320;
      imageEl.height = 320;

      if (image) {
        this.cropper = new Cropper(imageEl, {
          aspectRatio: 1,
          autoCropArea: 1,
          viewMode: 0,
          cropBoxMovable: false,
          cropBoxResizable: false,
          dragMode: 'move',
          background: false,
          minCanvasWidth: 320,
          minContainerWidth: 320,
          minCropBoxWidth: 160,
          center: false,
          guides: false,
        });
      }
    };

    // const croppEl = document.getElementById('cropp');

    // if (croppEl) {
    //   const containerWidth = 320;
    //   const containerHeight = 320;

    // }
  }

  getRoundedCanvas(sourceCanvas: any) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var width = sourceCanvas.width;
    var height = sourceCanvas.height;
    var size = Math.min(width, height);
    canvas.width = size;
    canvas.height = size;
    if (context) {
      context.imageSmoothingEnabled = true;
      context.drawImage(sourceCanvas, 0, 0, width, height);
      context.globalCompositeOperation = 'destination-in';
      context.beginPath();
      context.rect(0, 0, width, height);
      context.fill();
    }

    return canvas;
  }

  onClose() {
    this.dialogRef.close();
  }

  async onCropp() {
    const croppedCanvas = this.cropper.getCroppedCanvas();
    const roundedCanvas = this.getRoundedCanvas(croppedCanvas);

    roundedCanvas.toBlob((res) => {
      this.dialogRef.close(res);
    });

    // const result = await this.croppie.result({ type: 'blob' });
  }
}
