import { Directive, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[wordSplitter]'
})
export class WordSplitterDirective implements AfterViewInit {

  constructor(private el: ElementRef) { }

  ngAfterViewInit(): void {
    const text = this.el.nativeElement.textContent;
    const words = text.split(' ');

    let html = '';
    words.forEach((word: string, index: number) => {
      html += `<div style="margin-right: 3px">${word}</div>`;
      if (index !== words.length - 1) {
        html += ' '; // Add a space between words
      }
    });

    this.el.nativeElement.style.display = 'flex';
    this.el.nativeElement.style.alignItems = 'center';
    this.el.nativeElement.style.flexWrap = 'wrap';
    this.el.nativeElement.innerHTML = html;
  }

}