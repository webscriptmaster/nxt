import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-sign-up-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class SignUpWelcomeComponent implements OnInit {
  options: AnimationOptions = {
    path: '/assets/images/animations/profile.json',
    loop: false,
  };
  private _unsubscribeAll = new Subject();
  private userData: User;
  public isRecruit: string;

  public recruitValue = ['Yes', 'No'];

  constructor(private _router: Router, private _auth: AuthService) {}

  async ngOnInit() {
    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
      this.userData = res;
    });
    if (this.userData) {
      this.isRecruit =
        this.userData?.isRecruit === undefined
          ? ''
          : this.userData?.isRecruit
          ? 'Yes'
          : 'No';
    }
  }
  onGetStarted() {
    this._auth.updateUserData(this.userData.id, {
      isRecruit: this.isRecruit === 'Yes' ? true : false,
    });
    this._router.navigate(['/auth/general']);
  }

  onChangeSelect(event: string) {
    this.isRecruit = event;
    this._auth.updateUserData(this.userData.id, {
      isRecruit: this.isRecruit === 'Yes' ? true : false,
    });
  }
}
