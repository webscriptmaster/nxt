import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-sign-up-how-it-works',
  templateUrl: './how-it-works.component.html',
  styleUrls: ['./how-it-works.component.scss'],
})
export class SignUpHowItWorksComponent implements OnInit {
  currentSlide = 1;

  optionsSlide1: AnimationOptions = {
    path: '/assets/images/animations/searchCollege.json',
  };
  optionsSlide2: AnimationOptions = {
    path: '/assets/images/animations/contactCoaches.json',
  };
  optionsSlide3: AnimationOptions = {
    path: '/assets/images/animations/scholarship.json',
  };

  constructor(private _router: Router) {}

  ngOnInit() {}

  onNext() {
    if (this.currentSlide < 4) {
      this.currentSlide += 1;
    } else {
      this._router.navigate(['/auth/notifications'])
    }
  }
}
