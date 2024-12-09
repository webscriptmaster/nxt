import { MatDialog } from '@angular/material/dialog';
import { ParentsSkipDialogComponent } from './skip-dialog/skip-dialog.component';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-sign-up-parents-information',
  templateUrl: './parents-information.component.html',
  styleUrls: ['./parents-information.component.scss'],
})
export class SignUpParentsInformationComponent implements OnInit, OnDestroy {
  userData: User | null = null;
  parentForm: FormGroup;
  _unsubscribeAll = new Subject<void>();

  constructor(
    private _router: Router,
    private _matDialog: MatDialog,
    private _auth: AuthService
  ) {}

  ngOnInit() {
    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
      this.userData = res;
      if (this.userData) {
        this.makeParentForm(this.userData);
        this.showSkipParentDialog();
      }
    });
  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  makeParentForm(user: User | null) {
    this.parentForm = new FormGroup({
      firstNameParent1: new FormControl(
        user && user.parentInfo && user.parentInfo['firstNameParent1']
          ? user.parentInfo['firstNameParent1']
          : null,
        []
      ),
      lastNameParent1: new FormControl(
        user && user.parentInfo && user.parentInfo['lastNameParent1']
          ? user.parentInfo['lastNameParent1']
          : null,
        []
      ),
      phoneNumberParent1: new FormControl(
        user && user.parentInfo && user.parentInfo['phoneNumberParent1']
          ? user.parentInfo['phoneNumberParent1']
          : null,
        [Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-s./0-9]*$')]
      ),
      emailParent1: new FormControl(
        user && user.parentInfo && user.parentInfo['emailParent1']
          ? user.parentInfo['emailParent1']
          : null,
        [Validators.email]
      ),
      collegeParent1: new FormControl(
        user && user.parentInfo && user.parentInfo['collegeParent1']
          ? user.parentInfo['collegeParent1']
          : null,
        []
      ),
      firstNameParent2: new FormControl(
        user && user.parentInfo && user.parentInfo['firstNameParent2']
          ? user.parentInfo['firstNameParent2']
          : null,
        []
      ),
      lastNameParent2: new FormControl(
        user && user.parentInfo && user.parentInfo['lastNameParent2']
          ? user.parentInfo['lastNameParent2']
          : null,
        []
      ),
      phoneNumberParent2: new FormControl(
        user && user.parentInfo && user.parentInfo['phoneNumberParent2']
          ? user.parentInfo['phoneNumberParent2']
          : null,
        [Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-s./0-9]*$')]
      ),
      emailParent2: new FormControl(
        user && user.parentInfo && user.parentInfo['emailParent2']
          ? user.parentInfo['emailParent2']
          : null,
        [Validators.email]
      ),
      collegeParent2: new FormControl(
        user && user.parentInfo && user.parentInfo['collegeParent2']
          ? user.parentInfo['collegeParent2']
          : null,
        []
      ),
    });
  }

  onBack() {
    this._router.navigate(['/auth/offers']);
  }

  onContinue() {
    if (this.parentForm.valid && this.userData) {
      const oldValues = this.userData.parentInfo
        ? this.userData.parentInfo
        : {};
      const newValues = { ...oldValues, ...this.parentForm.value };
      this._auth.updateUserData(this.userData.id, { parentInfo: newValues });
      this._router.navigate(['/auth/complete']);
    } else {
      this.parentForm.markAllAsTouched();
    }
  }

  async showSkipParentDialog() {
    if (!this._auth.signUpSkipParentShowed) {
      this._auth.signUpSkipParentShowed = true;
      const dialogRef = this._matDialog.open(ParentsSkipDialogComponent, {
        disableClose: true,
      });
      const result = await firstValueFrom(dialogRef.afterClosed());
      if (!result) {
        this._router.navigate(['/auth/complete']);
      }
    }
  }
}
