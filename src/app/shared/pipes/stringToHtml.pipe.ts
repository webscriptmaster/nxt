import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({
  selector: '[stringToHtml]'
})
export class StringToHtmlDirective implements OnChanges {
  @Input('stringToHtml') htmlString: string;

  constructor(private elementRef: ElementRef) {}

  ngOnChanges() {
    if (this.htmlString) {
      this.elementRef.nativeElement.innerHTML = this.htmlString;
    }
  }
}