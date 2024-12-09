import { TEMPLATES } from './../../../../shared/const';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-sign-up-template-page',
  templateUrl: './template-page.component.html',
  styleUrls: ['./template-page.component.scss'],
})
export class SignUpTemplatePageComponent implements OnInit, OnDestroy {
  _unsubscribeAll = new Subject<void>();
  TEMPLATES = TEMPLATES;
  type = TEMPLATES.GENERAL;
  userData: User | null = null;

  saved$ = new BehaviorSubject(false);

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _auth: AuthService
  ) {
    this._route.data.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
      this.type = data['type'];
    });
    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
      this.userData = res;
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onBack() {
    this._router.navigate(['/auth/templates']);
  }

  onSave(result: any) {
    if (this.userData) {
      if (this.type === TEMPLATES.GENERAL) {
        this._auth.updateUserData(this.userData.id, {
          generalEmailTemplate: {
            template: result.template,
            subject: result.subject,
            prospectSheet: result.prospectSheet
          },
        });
      }
      if (this.type === TEMPLATES.PERSONAL) {
        this._auth.updateUserData(this.userData.id, {
          personalEmailTemplate: {
            template: result.template,
            subject: result.subject,
            prospectSheet: result.prospectSheet
          },
        });
      }
      if (this.type === TEMPLATES.OWN) {
        this._auth.updateUserData(this.userData.id, {
          ownEmailTemplate: {
            template: result.template,
            subject: result.subject,
            prospectSheet: result.prospectSheet
          },
        });
      }

      this.saved$.next(true);
      setTimeout(() => {
        this.saved$.next(false);
      }, 1500);
    }

  }
}
