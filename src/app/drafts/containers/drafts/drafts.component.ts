import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { CreateEmailService } from 'src/app/create-email/create-email.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-drafts',
  templateUrl: './drafts.component.html',
  styleUrls: ['./drafts.component.scss'],
})
export class DraftsComponent implements OnInit, OnDestroy {
  user: User;
  drafts = [];
  editMode = false;

  _unsubscribeAll = new Subject<void>();
  constructor(
    private _auth: AuthService,
    private _createEmailService: CreateEmailService,
    private _router: Router
  ) {}

  ngOnInit() {
    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
      this.user = res as User;

      if (this.user?.id) {
        this._createEmailService
          .getDrafts(this.user?.id)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((res: any) => {
            this.drafts = res;
          });
      }
    });
  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onSelectDraft(contacts: any) {
    this._createEmailService.selectedContacts$.next(contacts);
    this._router.navigate(['create-email']);
  }

  onBack() {
    history.back();
  }

  onEditMode() {
    this.editMode = true;
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
