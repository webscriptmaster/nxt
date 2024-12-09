import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-media-preview',
  templateUrl: './media-preview.component.html',
  styleUrls: ['./media-preview.component.scss'],
})
export class MediaPreviewComponent implements OnInit {
  public preview: any;
  public mediaReady: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<MediaPreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.preview = this.data.preview;
    console.log(this.preview);
  }

  handleClick() {
    this.dialogRef.close();
  }

  stopPropagation(e: Event) {
    e.stopPropagation();
  }

  mediaLoaded() {
    this.mediaReady = true;
    console.log('Media is loaded, mediaReady:', this.mediaReady);
  }
}
