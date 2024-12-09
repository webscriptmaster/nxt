import { AuthService } from './../../auth.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-help',
  templateUrl: './login-help.component.html',
  styleUrls: ['./login-help.component.scss'],
})
export class LoginHelpComponent implements OnInit {
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  emailError = false;

  constructor(private _router: Router, private _auth: AuthService) {}

  ngOnInit() {}

  onBack() {
    this._router.navigate(['auth/sign-in']);
  }

  async onSendEmail() {
    if (this.emailControl.invalid) {
      return;
    }
    try {
      const email = this.emailControl.value;
      if (email) {
        await this._auth.resetPasswordEmail(email);
        this._auth.resetPasswordEmailSended$.next(true);
        this._router.navigate(['/auth/sign-in']);
      }
    } catch (err) {
      this.emailError = true;
    }
  }
}
