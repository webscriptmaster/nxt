import { AuthService } from './../../../auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sign-up-complete',
  templateUrl: './complete.component.html',
  styleUrls: ['./complete.component.scss'],
})
export class SignUpCompleteComponent implements OnInit {
  options: AnimationOptions = {
    path: '/assets/images/animations/prospectSheet.json',
  };

  _unsubscribeAll = new Subject<void>();

  constructor(private _router: Router, private _auth: AuthService) {}

  ngOnInit() {
    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((user) => {
      if (user) {
        this._auth.updateUserData(user.id, { completeSignUp: true });
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
      }
    });
  }

  onBack() {
    this._router.navigate(['/auth/offers']);
  }

  onProspectSheet() {
    this._router.navigate(['/auth/prospect-sheet']);
  }
}
