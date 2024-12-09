import { FormControl, Validators } from '@angular/forms';
import { SettingsConfirmDialogComponent } from './../../dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import {
  filter,
  Observable,
  Subject,
  takeUntil,
  BehaviorSubject,
  catchError,
  of,
  firstValueFrom,
} from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { HttpClient } from '@angular/common/http';
import { PLANS } from 'src/app/shared/const';
import { environment } from 'src/environments/environment';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs';

@Component({
  selector: 'app-settings-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss'],
})
export class SettingsAccountInfoComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  user$: Observable<User | null>;
  email: string | null;
  userId: string;
  changeMode = false;
  wrongPassword = false;

  PLANS = PLANS;

  passwordControl = new FormControl('', [Validators.required]);
  newPasswordControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{6,}$/),
  ]);

  isNewPasswordLengthValid = false;
  isNewPasswordHasNumber = false;
  isNewPasswordHasUppercase = false;

  isShowPassword = false;
  isShowNewPassword = false;

  loading$ = new BehaviorSubject(false);
  startDate: Date | null;
  endDate: Date | null;

  private _unsubscribeAll: Subject<void> = new Subject();

  constructor(
    private _auth: AuthService,
    private _router: Router,
    private _fns: AngularFireFunctions,
    private _matDialog: MatDialog,
    private _afAuth: AngularFireAuth,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.user$ = this._auth.user$;
    this.user$
      .pipe(
        filter((user) => user !== null),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe((user: User | null) => {
        if (user) {
          this.email = user.email;
          this.userId = user.id;
          

          this.endDate = user.payment ? user.payment.expiresIn.toDate() : null;
          this.startDate = user.payment ? user.payment.expiresIn.toDate() : null;
          if (this.startDate) {
            this.startDate.setFullYear( this.startDate.getFullYear() - 1);
          }
        
        }
      });
  }

  ngAfterViewInit(): void {
    this.newPasswordControl.valueChanges.subscribe((res) => {
      if (res) {
        this.isNewPasswordLengthValid = res.length >= 6;
        this.isNewPasswordHasNumber = /\d/.test(res);
        this.isNewPasswordHasUppercase = /[A-Z]/.test(res);
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onBack() {
    history.back();
  }

  async onChangeMode() {
    if (!this.changeMode) {
      if (
        this.passwordControl.valid &&
        this.passwordControl.value &&
        this.email
      ) {
        try {
          const password = this.passwordControl.value;
          const result = await this._afAuth.signInWithEmailAndPassword(
            this.email,
            password
          );
          if (result) {
            this.changeMode = true;
          }
        } catch (err) {
          this.wrongPassword = true;
        }
      }
    }
  }

  async onSubmitNewPassword() {
    if (this.newPasswordControl.valid && this.newPasswordControl.value) {
      try {
        this.loading$.next(true);
        await firebase
          .auth()
          .currentUser?.updatePassword(this.newPasswordControl.value);

        this.changeMode = false;
        this.passwordControl.setValue('');
        this.passwordControl.markAsUntouched();
        this.passwordControl.updateValueAndValidity();
        this.newPasswordControl.setValue('');
        this.newPasswordControl.markAsUntouched();
        this.newPasswordControl.updateValueAndValidity();
        this.loading$.next(false);
      } catch (err) {
        this.loading$.next(false);
      }
    }
  }

  async onLogout() {
    const user = await firstValueFrom(this.user$);
    if (user) {
      this._auth.updateUserData(user.id, {
        fcmToken: null,
      });
    }

    await this._auth.SignOut();
    this._router.navigate(['/']);
  }

  async onDelete() {
    const dialogCOnfirlDelete = this._matDialog.open(ConfirmDialogComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        title: 'Are you sure you want to delete your account?',
        message: '',
        info: '',
        firstButtonText: 'Yes',
        secondButtonText: 'Cancel',
        firstButtonColor: '#FF0303',
        secondButtonColor: '#FFF',
        firstButtonBorder: '1px solid #fff',
        secondButtonBorder: '1px solid #fff',
      },
    });
    const result = await firstValueFrom(dialogCOnfirlDelete.afterClosed());
    if(!result) return;
    if (result) {
      this.loading$.next(true);

      try {
        await firstValueFrom(
          this.http.delete(`${environment.apiPaymentURL}/stripe/customer`, {
            body: { uid: this.userId },
          })
        );
      } catch (err) {

      }
      this._fns
        .httpsCallable('deleteUserById')({ userId: this.userId })
        .pipe(
          catchError((err) => {
            this.loading$.next(false);
            return of(null);
          })
        )
        .subscribe((res) => {
          if (res) {
            this._router.navigate(['']);
          }
          this.loading$.next(false);
        });
    }
  }

  onHelp() {
    const url = `https://nxt1sports.com/faqs?block=4`;
    this.openLink(url);
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

  onContactUs() {
    this._router.navigate(['settings/contact-us']);
  }

  openLink(url: any) {
    return new Promise((res, rej) => {
      setTimeout(() => {
        if (url) {
          const link = document.createElement('a');
          link.href = url;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          link.remove();
          res(url);
        } else {
          res(null);
        }
      }, 0);
    });
  }
}
