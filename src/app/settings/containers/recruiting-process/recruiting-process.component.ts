import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-settings-recruiting-process',
  templateUrl: './recruiting-process.component.html',
  styleUrls: ['./recruiting-process.component.scss'],
})
export class SettingsRecruitingProcessComponent implements OnInit {
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
      this._router.navigate(['/settings']);
    }
  }

  onBack() {
    this._router.navigate(['/settings']);
  }
}
