import { AfterViewInit, Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appAsterickSign]'
})
export class AsterickSignDirective implements AfterViewInit  {

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @Input() showAsterisk: boolean = true;
  
  ngAfterViewInit() {
    const span = this.renderer.createElement('span');
    const text = this.renderer.createText('*');
    this.renderer.setStyle(span, 'color', '#FF0303');
    this.renderer.setStyle(span, 'margin-left', '3px');
    this.renderer.appendChild(span, text);
    this.renderer.appendChild(this.el.nativeElement, span);
  }

}
