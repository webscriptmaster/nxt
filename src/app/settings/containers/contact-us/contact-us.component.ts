import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/auth.service';
import { ContactUsSentResultDialogComponent } from './sent-result-dialog/sent-result-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss'],
})
export class SettingsContactUsComponent implements OnInit {
  subject = '';
  body = '';

  constructor(public auth: AuthService, private _dialog: MatDialog, private _router: Router) {}

  ngOnInit() {
  }

  onBack() {
    history.back();
  }

  onSubmit() {
    this.openMail();
    this.onBack();
    setTimeout(() => {
      this._dialog.open(ContactUsSentResultDialogComponent, {
        disableClose: true,
      });
    }, 250);
  }

  openMail() {
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = `mailto:support@nxt1sports.com?subject=${this.subject}&body=${this.body}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      link.remove();
    }, 0);
  }


  onHome(event: boolean) {
    this._router.navigate(['/home']);
  }


  onProfile(event: boolean) {
    this._router.navigate(['/edit-profile']);
  }

  onSettings(event: boolean) {
    this._router.navigate(['/settings']);
  }

  onEditProfile(event: boolean) {
    this._router.navigate(['/edit-profile']);
  }

  onAddOffers(event: boolean) {
    this._router.navigate(['/offers']);
  }

  onAddSport(event: boolean) {
    this._router.navigate(['/add-sport']);
  }

  onReferFriend(event: boolean) {
    this._router.navigate(['/refer']);
  }

  onContactUs(event: boolean) {
    this._router.navigate(['settings/contact-us']);
  }
}
