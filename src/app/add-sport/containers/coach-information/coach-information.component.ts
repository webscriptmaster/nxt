import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { finalize, Subject, takeUntil } from 'rxjs';
import { User } from 'src/app/models/user';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AuthService } from 'src/app/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { CroppImageDialogComponent } from 'src/app/shared/dialogs';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-add-sport-coach-information',
  templateUrl: './coach-information.component.html',
  styleUrls: ['./coach-information.component.scss'],
})
export class AddSportCoachInformationComponent implements OnInit, OnDestroy {
  imagePreview: any;
  selectedFile: File | null;
  selectedScheduleFile: File | null;
  coachCount: number;
  userData: User | null = null;
  previewSchedule;
  coachForm: FormGroup;

  _unsubscribeAll = new Subject<void>();

  constructor(
    private _router: Router,
    private _auth: AuthService,
    private storage: AngularFireStorage,
    private _matDialog: MatDialog,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
      this.userData = res;
      this.imagePreview = this.userData?.secondarySportTeamLogoImg
        ? `${this.userData.secondarySportTeamLogoImg}&time=${Date.now()}`
        : null;
      this.coachCount = this.userData?.secondarySportCoachCount || 1;
      this.makeCoachForm(this.userData);
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  makeCoachForm(user: User | null) {
    this.coachForm = this.fb.group({});
    const maxCoachNumber = this.coachCount;
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

  addNewCoach() {
    this.coachCount++;
    const coachNumber = this.coachCount;
    const keyPrefix = `secondarySportCoach${coachNumber}`;
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
  }

  getCoachNumbers(): number[] {
    return Array(this.coachCount)
      .fill(0)
      .map((x, i) => i + 1);
  }

  onBack() {
    this._router.navigate(['/add-sport/contact-info']);
  }

  async onContinue() {
    if (this.selectedFile && this.userData) {
      this.onUploadTeamLogo(this.userData.id);
    }
    await this.onUploadSchedule(this.userData.id);
    if (this.coachForm.valid && this.userData) {
      this._auth.updateUserData(this.userData.id, {
        ...this.coachForm.value,
        secondarySportCoachCount: this.coachCount,
      });
      this._router.navigate(['/add-sport/academic-info']);
    } else {
      this.coachForm.markAllAsTouched();
    }
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
            this._auth.updateUserData(this.userData.id, {
              secondarySportSchedule: url.split('&token')[0],
            });
          }
        });
      });
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

  onUploadTeamLogo(uid: string) {
    const filePath = `TeamsLogo/${uid}_secondarySport`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(`${filePath}`, this.selectedFile);
    task.then((res) => {
      const downloadURL = fileRef.getDownloadURL();
      downloadURL.subscribe((url) => {
        if (url && this.userData) {
          this.selectedFile = null;
          this.imagePreview = url;
          this._auth.updateUserData(this.userData.id, {
            secondarySportTeamLogoImg: url.split('&token')[0],
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
