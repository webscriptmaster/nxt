import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BehaviorSubject, finalize, Subject, takeUntil } from 'rxjs';
import { User } from 'src/app/models/user';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AuthService } from 'src/app/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { CroppImageDialogComponent } from 'src/app/shared/dialogs';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-edit-profile-coach-information',
  templateUrl: './coach-information.component.html',
  styleUrls: ['./coach-information.component.scss'],
})
export class EditProfileCoachInformationComponent implements OnInit, OnDestroy {
  imagePreview: any;
  selectedFile: File | null;
  selectedScheduleFile: File | null;
  userData: User | null = null;

  coachForm: FormGroup;
  secondarySportCoachForm: FormGroup;

  saved$ = new BehaviorSubject(false);
  showProspectSheet = false;
  coachCount: number;
  secondarySportCoachCount: number;
  _unsubscribeAll = new Subject<void>();
  previewSchedule;
  constructor(
    private _router: Router,
    private _auth: AuthService,
    private storage: AngularFireStorage,
    private _matDialog: MatDialog,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    window.addEventListener('keyup', this.onEsc.bind(this));

    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
      this.userData = res;
      if (
        !(
          this.userData?.completeAddSport &&
          this.userData.appSport === 'secondary'
        )
      ) {
        this.coachCount = this.userData?.coachCount || 1;
        this.imagePreview = this.userData?.teamLogoImg
          ? `${this.userData.teamLogoImg}&time=${Date.now()}`
          : null;
        this.makeCoachForm(this.userData);
      } else {
        this.imagePreview = this.userData?.secondarySportTeamLogoImg
          ? `${this.userData.secondarySportTeamLogoImg}&time=${Date.now()}`
          : null;
        this.secondarySportCoachCount =
          this.userData?.secondarySportCoachCount || 1;
        this.makeSecondarySportCoachForm(this.userData);
      }
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('keyup', this.onEsc.bind(this));
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  public goToProfile() {
    const email = this.userData.email.split('@')[0];
    let provider = this.userData.email.split('@')[1];
    if (['gmail.com', 'hotmail.com', 'outlook.com'].includes(provider)) {
      provider = provider.charAt(0);
    }
    const code = `${email}-${provider}`;

    this._router.navigate([`/prospect-profile/${code}`]);
  }

  makeCoachForm(user: User | null) {
    this.coachForm = this.fb.group({});
    const maxCoachNumber = this.coachCount;
    let prefix = 'coach';
    this.coachForm.addControl(
      'teamColor1',
      new FormControl(
        user && user['teamColor1'] ? user['teamColor1'] : null,
        []
      )
    );
    this.coachForm.addControl(
      'teamColor2',
      new FormControl(
        user && user['teamColor2'] ? user['teamColor2'] : null,
        []
      )
    );
    this.coachForm.addControl(
      'upcomingPastEvent',
      new FormControl(
        user && user['upcomingPastEvent'] ? user['upcomingPastEvent'] : null,
        []
      )
    );
    this.coachForm.addControl(
      'upcomingGameLink',
      new FormControl(
        user && user['upcomingGameLink'] ? user['upcomingGameLink'] : null,
        []
      )
    );
    for (let coachNumber = 1; coachNumber <= maxCoachNumber; coachNumber++) {
      prefix = 'coach';
      if (coachNumber !== 1) {
        prefix += coachNumber;
      }
      const coachTitleKey = `${prefix}Title`;
      const coachFirstNameKey = `${prefix}FirstName`;
      const coachLastNameKey = `${prefix}LastName`;
      const coachPhoneNumberKey = `${prefix}PhoneNumber`;
      const coachEmailKey = `${prefix}Email`;
      this.coachForm.addControl(
        coachTitleKey,
        new FormControl(
          user && user[coachTitleKey] ? user[coachTitleKey] : null,
          []
        )
      );
      this.coachForm.addControl(
        coachFirstNameKey,
        new FormControl(
          user && user[coachFirstNameKey] ? user[coachFirstNameKey] : null,
          []
        )
      );
      this.coachForm.addControl(
        coachLastNameKey,
        new FormControl(
          user && user[coachLastNameKey] ? user[coachLastNameKey] : null,
          []
        )
      );
      this.coachForm.addControl(
        coachPhoneNumberKey,
        new FormControl(
          user && user[coachPhoneNumberKey] ? user[coachPhoneNumberKey] : null,
          [Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-s./0-9]*$')]
        )
      );
      this.coachForm.addControl(
        coachEmailKey,
        new FormControl(
          user && user[coachEmailKey] ? user[coachEmailKey] : null,
          [Validators.email]
        )
      );
    }
  }

  makeSecondarySportCoachForm(user: User | null) {
    this.secondarySportCoachForm = this.fb.group({});
    const maxCoachNumber = this.secondarySportCoachCount;
    let prefix = 'secondarySportCoach';

    this.coachForm.addControl(
      'secondarySportTeamColor1',
      new FormControl(
        user && user['teamColor1'] ? user['teamColor1'] : null,
        []
      )
    );
    this.coachForm.addControl(
      'secondarySportTeamColor2',
      new FormControl(
        user && user['teamColor2'] ? user['teamColor2'] : null,
        []
      )
    );
    this.coachForm.addControl(
      'secondarySportUpcomingPastEvent',
      new FormControl(
        user && user['upcomingPastEvent'] ? user['upcomingPastEvent'] : null,
        []
      )
    );
    this.coachForm.addControl(
      'secondarySportUpcomingGameLink',
      new FormControl(
        user && user['upcomingGameLink'] ? user['upcomingGameLink'] : null,
        []
      )
    );
    for (let coachNumber = 1; coachNumber <= maxCoachNumber; coachNumber++) {
      prefix = 'secondarySportCoach';
      if (coachNumber !== 1) {
        prefix += coachNumber;
      }
      const coachTitleKey = `${prefix}Title`;
      const coachFirstNameKey = `${prefix}FirstName`;
      const coachLastNameKey = `${prefix}LastName`;
      const coachPhoneNumberKey = `${prefix}PhoneNumber`;
      const coachEmailKey = `${prefix}Email`;
      this.secondarySportCoachForm.addControl(
        coachTitleKey,
        new FormControl(
          user && user[coachTitleKey] ? user[coachTitleKey] : null,
          []
        )
      );
      this.secondarySportCoachForm.addControl(
        coachFirstNameKey,
        new FormControl(
          user && user[coachFirstNameKey] ? user[coachFirstNameKey] : null,
          []
        )
      );
      this.secondarySportCoachForm.addControl(
        coachLastNameKey,
        new FormControl(
          user && user[coachLastNameKey] ? user[coachLastNameKey] : null,
          []
        )
      );
      this.secondarySportCoachForm.addControl(
        coachPhoneNumberKey,
        new FormControl(
          user && user[coachPhoneNumberKey] ? user[coachPhoneNumberKey] : null,
          [Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-s./0-9]*$')]
        )
      );
      this.secondarySportCoachForm.addControl(
        coachEmailKey,
        new FormControl(
          user && user[coachEmailKey] ? user[coachEmailKey] : null,
          [Validators.email]
        )
      );
      console.log(this.secondarySportCoachForm);
    }
  }

  addNewCoach() {
    if (
      !(
        this.userData?.completeAddSport &&
        this.userData.appSport === 'secondary'
      )
    ) {
      this.coachCount++;
      const coachNumber = this.coachCount;
      const keyPrefix = `coach${coachNumber}`;
      this.coachForm = this.fb.group({
        ...this.coachForm.controls,
        [`${keyPrefix}Title`]: [''],
        [`${keyPrefix}FirstName`]: [''],
        [`${keyPrefix}LastName`]: [''],
        [`${keyPrefix}PhoneNumber`]: [
          '',
          Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-s./0-9]*$'),
        ],
        [`${keyPrefix}Email`]: ['', [Validators.required, Validators.email]],
      });
      return;
    }
    this.secondarySportCoachCount++;
    const coachNumber = this.secondarySportCoachCount;
    const keyPrefix = `secondarySportCoach${coachNumber}`;
    this.secondarySportCoachForm = this.fb.group({
      ...this.secondarySportCoachForm.controls,
      [`${keyPrefix}Title`]: [''],
      [`${keyPrefix}FirstName`]: [''],
      [`${keyPrefix}LastName`]: [''],
      [`${keyPrefix}PhoneNumber`]: [
        '',
        Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-s./0-9]*$'),
      ],
      [`${keyPrefix}Email`]: ['', [Validators.required, Validators.email]],
    });
  }

  getCoachNumbers(): number[] {
    if (
      !(
        this.userData?.completeAddSport &&
        this.userData.appSport === 'secondary'
      )
    ) {
      return Array(this.coachCount)
        .fill(0)
        .map((x, i) => i + 1);
    }
    return Array(this.secondarySportCoachCount)
      .fill(0)
      .map((x, i) => i + 1);
  }

  onBack() {
    this._router.navigate(['/edit-profile']);
  }

  onEditProfile() {
    this._router.navigate(['edit-profile']);
  }

  onSwitchPositions() {
    this._router.navigate(['edit-profile/positions']);
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

  async onSave() {
    if (this.userData) {
      await this.onUploadSchedule(this.userData.id);
      if (
        !(
          this.userData.completeAddSport &&
          this.userData.appSport === 'secondary'
        )
      ) {
        if (this.coachForm.valid) {
          this._auth.updateUserData(this.userData.id, {
            ...this.coachForm.value,
            coachCount: this.coachCount,
          });
          this.saved$.next(true);
          setTimeout(() => {
            this.saved$.next(false);
          }, 1500);
        } else {
          this.coachForm.markAllAsTouched();
        }
      } else {
        if (this.secondarySportCoachForm.valid) {
          this._auth.updateUserData(this.userData.id, {
            ...this.secondarySportCoachForm.value,
            secondarySportCoachCount: this.secondarySportCoachCount,
          });
          this.saved$.next(true);
          setTimeout(() => {
            this.saved$.next(false);
          }, 1500);
        } else {
          this.secondarySportCoachForm.markAllAsTouched();
        }
      }
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
    reader.onload = (_event) => {
      this.openCroppImageDialog(reader.result);
    };
  }

  onScheduleSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.selectedScheduleFile = file;
    this.previewSchedule = this.sanitizer.bypassSecurityTrustResourceUrl(
      URL.createObjectURL(file)
    );
  }

  public async onUploadSchedule(uid: string) {
    if (this.previewSchedule) {
      const filePath = `UserSchedule/${uid}_schedule`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(
        `${filePath}`,
        this.selectedScheduleFile
      );
      task.then((res) => {
        const downloadURL = fileRef.getDownloadURL();
        downloadURL.subscribe((url) => {
          if (url && this.userData) {
            this.selectedScheduleFile = null;
            if (this.userData?.appSport !== 'secondary') {
              this._auth.updateUserData(this.userData.id, {
                schedule: url.split('&token')[0],
              });
              return;
            }
            this._auth.updateUserData(this.userData.id, {
              secondarySportSchedule: url.split('&token')[0],
            });
          }
        });
      });
    }
  }

  onUploadTeamLogo(uid: string) {
    let filePath = `TeamsLogo/${uid}`;
    if (
      this.userData?.completeAddSport &&
      this.userData.appSport === 'secondary'
    ) {
      filePath = `TeamsLogo/${uid}_secondarySport`;
    }
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(`${filePath}`, this.selectedFile);
    task.then((res) => {
      const downloadURL = fileRef.getDownloadURL();
      downloadURL.subscribe((url) => {
        if (url && this.userData) {
          this.selectedFile = null;
          this.imagePreview = url;
          if (
            !(
              this.userData?.completeAddSport &&
              this.userData.appSport === 'secondary'
            )
          ) {
            this._auth.updateUserData(this.userData.id, {
              teamLogoImg: url.split('&token')[0] + `&time: ${Date.now()}`,
            });
          } else {
            this._auth.updateUserData(this.userData.id, {
              secondarySportTeamLogoImg:
                url.split('&token')[0] + `&time: ${Date.now()}`,
            });
          }
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
          if (this.selectedFile && this.userData) {
            this.onUploadTeamLogo(this.userData.id);
          }
        };
      }
    });
  }

  onCloseProspectSheet(event: MouseEvent) {
    if (window.innerWidth >= 1280 && this.showProspectSheet) {
      const target = event.target as HTMLElement;
      if (target.classList.contains('prospect-sheet-container')) {
        this.showProspectSheet = false;
      }
    }
  }

  onEsc(event: KeyboardEvent) {
    if (this.showProspectSheet && event.key === 'Escape') {
      this.showProspectSheet = false;
    }
  }
}
