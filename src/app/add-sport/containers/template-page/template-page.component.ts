import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user';
import { TEMPLATES } from 'src/app/shared/const';

@Component({
  selector: 'app-add-sport-template-page',
  templateUrl: './template-page.component.html',
  styleUrls: ['./template-page.component.scss'],
})
export class AddSportTemplatePageComponent implements OnInit, OnDestroy {
  _unsubscribeAll = new Subject<void>();
  TEMPLATES = TEMPLATES;
  type = TEMPLATES.GENERAL;
  userData: User | null = null;

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
    this._router.navigate(['/add-sport/templates']);
  }

  onSave(result: any) {
    if (this.userData) {
      if (this.type === TEMPLATES.GENERAL) {
        this._auth.updateUserData(this.userData.id, {
          secondarySportGeneralEmailTemplate: {
            template: result.template,
            subject: result.subject,
            prospectSheet: result.prospectSheet
          },
        });
      }
      if (this.type === TEMPLATES.PERSONAL) {
        this._auth.updateUserData(this.userData.id, {
          secondarySportPersonalEmailTemplate: {
            template: result.template,
            subject: result.subject,
            prospectSheet: result.prospectSheet
          },
        });
      }
      if (this.type === TEMPLATES.OWN) {
        this._auth.updateUserData(this.userData.id, {
          secondarySportOwnEmailTemplate: {
            template: result.template,
            subject: result.subject,
            prospectSheet: result.prospectSheet
          },
        });
      }
    }
  }
}
