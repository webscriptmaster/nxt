import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.scss'],
})
export class StartScreenComponent implements OnInit, OnDestroy {
  imageIndex = 1;
  changeImageInterval: NodeJS.Timer;

  constructor(private _router: Router) {}

  ngOnInit() {
    this._changeImage();
  }

  ngOnDestroy(): void {
    clearInterval(this.changeImageInterval);
  }

  private _changeImage() {
    this.changeImageInterval = setInterval(() => {
      if (this.imageIndex < 5) this.imageIndex += 1;
      else this.imageIndex = 1;
    }, 3000);
  }

  onLogin() {
    this._router.navigate(['auth/sign-in']);
  }
}
