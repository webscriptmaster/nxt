import { Component, Inject, ViewEncapsulation, Renderer2, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ConfirmDialogComponent implements AfterViewInit {

  title: string;
  message: string;
  info: string;
  firstButtonText: string;
  secondButtonText: string;
  firstButtonColor: string;
  secondButtonColor: string;
  firstButtonBorder: string;
  secondButtonBorder: string;
  isShowLogo: boolean | undefined | null = true;
  isShowButton: boolean | undefined | null = true;
  titleColor: string | undefined | null = '';
  htmlContent: string | undefined | null = '';

  @ViewChild('htmlContentContainer') htmlContentContainer: ElementRef;
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    this.title = data.title;
    this.message = data.message;
    this.info = data.info;
    this.firstButtonText = data.firstButtonText;
    this.secondButtonText = data.secondButtonText;
    this.firstButtonColor = data.firstButtonColor;
    this.secondButtonColor = data.secondButtonColor;
    this.firstButtonBorder = data.firstButtonBorder;
    this.secondButtonBorder = data.secondButtonBorder;
    this.isShowLogo = data.isShowLogo;
    this.titleColor = data.titleColor;
    this.htmlContent = data.htmlContent;
    this.isShowButton = data.isShowButton ?? true;
  }

  ngAfterViewInit() {
    if (this.htmlContent) {
      const container = this.htmlContentContainer.nativeElement;
      container.innerHTML = this.htmlContent;
      const continueButton = container.querySelector('#continue');
      if (continueButton) {
        this.renderer.listen(continueButton, 'click', () => {
          this.dialogRef.close(true);
        });
      }
    }
  }
}
