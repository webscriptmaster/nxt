import { AuthService } from './../auth/auth.service';
import { CreateEmailService } from 'src/app/create-email/create-email.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-connect-email',
  templateUrl: './connect-email.component.html',
  styleUrls: ['./connect-email.component.scss'],
})
export class ConnectEmailComponent implements OnInit {
  message: any = null;
  constructor(
    private _route: ActivatedRoute,
    private _emailService: CreateEmailService,
    private _authService: AuthService
  ) {
    _route.queryParams.subscribe(async (query: any) => {
      if (!!query.code && !!query.state) {
        const res = (await this._emailService.getTokenFromCode(
          query.code
        )) as any;

        if (res.email && res.refresh_token) {
          try {
            const candidate = await this._authService.getUserByConnectedEmail(
              res.email
            );
            if (candidate) {
              const token = candidate.connectedGmailToken;
              await this._authService.updateUserData(query.state, {
                connectedGmailToken: token,
                connectedEmail: res.email,
              });
            } else {
              await this._authService.updateUserData(query.state, {
                connectedGmailToken: res.refresh_token,
                connectedEmail: res.email,
              });
            }
          } catch (err) {
            this.message = err;
          }

          this.message = `Email connected!`;
          window.close();
        } else {
          this.message = `Something Went Wrong`;
        }
      } else {
        this.message = `Something Went Wrong`;
      }
    });
  }

  ngOnInit() {}
}
