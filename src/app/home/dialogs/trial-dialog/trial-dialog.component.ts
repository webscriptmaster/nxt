import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-trial-dialog',
  templateUrl: './trial-dialog.component.html',
  styleUrls: ['./trial-dialog.component.scss'],
})
export class TrialDialogComponent implements OnInit {
  @Input() showTrial = false;
  @Input() userId: string | undefined;

  constructor(private _auth: AuthService) {}
  trialFeatures = [
    { order: 0, text: 'College Library' },
    { order: 1, text: 'Graphics Pro' },
    { order: 2, text: 'Campaigns' },
    { order: 3, text: 'Prospect Center' },
    { order: 4, text: 'Recruit AI' },
    { order: 5, text: 'Recruit Info' },
    { order: 6, text: 'Mixtapes Pro' },
    { order: 7, text: 'Prospect Profiles' },
    { order: 8, text: 'Activity' },
    { order: 9, text: 'Templates' },
    { order: 10, text: 'NXT 1 Center' },
    { order: 11, text: 'Referrals' },
  ];

  ngOnInit() {}

  onClose() {
    this.showTrial = false;
    if (this.userId) {
      this._auth.updateUserData(this.userId, { showedTrialMessage: true });
    }
  }
}
