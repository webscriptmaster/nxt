import { ElementRef, Directive, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appLazyLoadImage]'
})
export class LazyLoadImageDirective implements OnInit {

  @Input() appLazyLoadImage!: string;
  @Input() loadingImage!: string;
  constructor(
    private el: ElementRef
  ) { }

  ngOnInit(): void {
    const imgElement = this.el.nativeElement as HTMLImageElement;
    imgElement.src = this.loadingImage;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const mainImage = new Image();
          mainImage.src = this.appLazyLoadImage;

          mainImage.onload = () => {
            imgElement.src = this.appLazyLoadImage;
          };

          obs.unobserve(entry.target);
        }
      });
    });
    observer.observe(imgElement);
  }
}
