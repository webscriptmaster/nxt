import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-add-sport-complete',
  templateUrl: './complete.component.html',
  styleUrls: ['./complete.component.scss'],
})
export class AddSportCompleteComponent implements OnInit {
  options: AnimationOptions = {
    path: '/assets/images/animations/prospectSheet.json',
  };

  _unsubscribeAll = new Subject<void>();

  constructor(private _router: Router, private _auth: AuthService) {}

  ngOnInit() {
    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((user) => {
      if (user) {
        this._auth.updateUserData(user.id, {
          completeAddSport: true,
          appSport: 'secondary',
        });
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
      }
    });
  }

  onBack() {
    this._router.navigate(['/add-sport/offers']);
  }

  onProspectSheet() {
    this._router.navigate(['/add-sport/prospect-sheet']);
  }
}
