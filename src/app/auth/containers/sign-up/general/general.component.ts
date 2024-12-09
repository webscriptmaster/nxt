import { CroppImageDialogComponent } from './../../../../shared/dialogs/cropp-image-dialog/cropp-image-dialog.component';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Social, SocialResponse, User } from 'src/app/models/user';
import { finalize, Subject, takeUntil, firstValueFrom, map, take } from 'rxjs';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { MatDialog } from '@angular/material/dialog';
import { noWhitespaceValidator } from 'src/app/shared/utils';
import { SocialLoginService } from 'src/app/shared/social-login.service';
import { SportService } from 'src/app/shared/sport.service';

@Component({
  selector: 'app-sign-up-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss'],
})
export class SignUpGeneralComponent implements OnInit, OnDestroy {
  imagePreview: any;
  selectedFile: File | null;

  userData: User | null = null;

  clases = [
    2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031,
    2032, 2033, 2034, 2035,
  ];
  athleteOrParentOrCoach = ['Athlete', 'Parent', 'Coach'];

  generalForm: FormGroup;
  noRecruitForm: FormGroup;
  socialData: Social;
  _unsubscribeAll = new Subject<void>();
  public sports: any;
  public sportsList: any[] = [];
  constructor(
    private _router: Router,
    private _auth: AuthService,
    private storage: AngularFireStorage,
    private _matDialog: MatDialog,
    private socialLoginService: SocialLoginService,
    private _sportService: SportService
  ) {
    this.socialLoginService.data$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data: SocialResponse) => {
        this.socialData = {
          picture: data?.user?.photoURL ?? null,
          firstName: data?.user?.given_name ?? '',
          lastName: data?.user?.family_name ?? '',
          displayName: data?.user?.displayName ?? '',
          email: data?.user?.email ?? null,
        };
      });
  }

  async ngOnInit() {
    this._sportService
      .getSportsSettings$()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res) => {
        this.sports = res;
        this.sportsList = this._sportService.getOrderedSports(res);
      });
    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
      this.userData = res;
      this.imagePreview = this.userData?.profileImg
        ? `${this.userData.profileImg}&time=${Date.now()}`
        : this.socialData?.picture ?? null;
      if (!this.userData?.isRecruit) {
        this.makeNoRecruitForm(this.userData);
        return;
      }
      this.makeGeneralForm(this.userData);
    });
  }
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  makeGeneralForm(user: User | null) {
    this.generalForm = new FormGroup({
      firstName: new FormControl(
        user && user.firstName
          ? user.firstName
          : this.socialData?.firstName
          ? this.socialData?.firstName
          : this.socialData?.displayName,
        [Validators.required, noWhitespaceValidator]
      ),
      lastName: new FormControl(
        user && user.lastName ? user.lastName : this.socialData?.lastName,
        [Validators.required, noWhitespaceValidator]
      ),
      athleteOrParentOrCoach: new FormControl(
        user && user.athleteOrParentOrCoach
          ? user.athleteOrParentOrCoach
          : null,
        [Validators.required, noWhitespaceValidator]
      ),
      highSchool: new FormControl(
        user && user.highSchool ? user.highSchool : null,
        [Validators.required, noWhitespaceValidator]
      ),
      highSchoolSuffix: new FormControl(
        user && user.highSchoolSuffix ? user.highSchoolSuffix : 'High School',
        [Validators.required]
      ),
      classOf: new FormControl(user && user.classOf ? user.classOf : null, [
        Validators.required,
      ]),
      club: new FormControl(user && user.club ? user.club : null),
    });
  }

  makeNoRecruitForm(user: User | null) {
    this.noRecruitForm = new FormGroup({
      firstName: new FormControl(
        user && user.firstName
          ? user.firstName
          : this.socialData?.firstName
          ? this.socialData?.firstName
          : this.socialData?.displayName,
        [Validators.required, noWhitespaceValidator]
      ),
      lastName: new FormControl(
        user && user.lastName ? user.lastName : this.socialData?.lastName,
        [Validators.required, noWhitespaceValidator]
      ),
      email: new FormControl(
        user && user.email
          ? user.email
          : this.socialData.email
          ? this.socialData?.email
          : null,
        [Validators.required, noWhitespaceValidator]
      ),
      primarySport: new FormControl(user && user.sport ? user.sport : null, [
        Validators.required,
        noWhitespaceValidator,
      ]),
      organization: new FormControl(
        user && user.organization ? user.organization : null
      ),
      secondOrganization: new FormControl(
        user && user.secondOrganization ? user.secondOrganization : null
      ),
      coachTitle: new FormControl(
        user && user.coachTitle ? user.coachTitle : null
      ),
    });
  }

  onBack() {
    this._router.navigate(['/auth/welcome']);
  }

  onContinue() {
    if (this.selectedFile && this.userData) {
      this.onUploadPhoto(this.userData.id);
    }
    if (this.userData) {
      if (this.generalForm && this.generalForm.valid) {
        this._auth.updateUserData(this.userData.id, this.generalForm.value);
        this._router.navigate(['/auth/choose-sport']);
      }
      if (this.noRecruitForm && this.noRecruitForm.valid) {
        this._auth.updateUserData(this.userData.id, {
          ...this.noRecruitForm.value,
          completeSignUp: true,
          appSport: 'primary',
        });
        this._router.navigate(['/auth/notifications']);
      }
    } else {
      this.generalForm.markAllAsTouched();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.selectedFile = file;
    var mimeType = file.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (_event) => {
      // this.imagePreview = reader.result;
      this.openCroppImageDialog(reader.result);
    };
  }

  onUploadPhoto(uid: string) {
    const filePath = `Users/${uid}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(`${filePath}`, this.selectedFile);
    task.then((res) => {
      const downloadURL = fileRef.getDownloadURL();
      downloadURL.subscribe((url) => {
        if (url && this.userData) {
          this.selectedFile = null;
          this.imagePreview = url;
          this._auth.updateUserData(this.userData.id, {
            profileImg: url.split('&token')[0],
          });
        }
      });
    });
  }

  openCroppImageDialog(img: any) {
    const dialogRef = this._matDialog.open(CroppImageDialogComponent, {
      disableClose: true,
      data: {
        img,
      },
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.selectedFile = res;
        var reader = new FileReader();
        reader.readAsDataURL(res);
        reader.onload = async (_event) => {
          this.imagePreview = reader.result;
        };
      }
    });
  }
}
