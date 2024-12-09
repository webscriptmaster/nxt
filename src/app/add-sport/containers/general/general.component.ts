import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from 'src/app/models/user';
import { finalize, Subject, takeUntil, firstValueFrom } from 'rxjs';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { MatDialog } from '@angular/material/dialog';
import { CroppImageDialogComponent } from 'src/app/shared/dialogs';
import { noWhitespaceValidator } from 'src/app/shared/utils';

@Component({
  selector: 'app-add-sport-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss'],
})
export class AddSportGeneralComponent implements OnInit, OnDestroy {
  imagePreview: any;
  selectedFile: File | null;

  userData: User | null = null;
  athleteOrParentOrCoach = ['Athlete', 'Parent', 'Coach'];
  clases = [
    2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031,
    2032, 2033, 2034, 2035,
  ];

  generalForm: FormGroup;

  _unsubscribeAll = new Subject<void>();

  constructor(
    private _router: Router,
    private _auth: AuthService,
    private storage: AngularFireStorage,
    private _matDialog: MatDialog
  ) {}

  async ngOnInit() {
    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
      this.userData = res;
      this.imagePreview = this.userData?.secondarySportProfileImg
        ? `${this.userData.secondarySportProfileImg}&time=${Date.now()}`
        : null;
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
        user && user.firstName ? user.firstName : null,
        [Validators.required]
      ),
      lastName: new FormControl(user && user.lastName ? user.lastName : null, [
        Validators.required,
      ]),
      secondaryAthleteOrParentOrCoach: new FormControl(user && user.secondaryAthleteOrParentOrCoach ? user.secondaryAthleteOrParentOrCoach : null, [
        Validators.required, noWhitespaceValidator
      ]),
      secondaryHighSchool: new FormControl(
        user && user.highSchool ? user.highSchool : null,
        [Validators.required]
      ),
      secondaryHighSchoolSuffix: new FormControl(
        user && user.highSchoolSuffix ? user.highSchoolSuffix : 'High School',
        [Validators.required]
      ),
      classOf: new FormControl(user && user.classOf ? user.classOf : null, [
        Validators.required,
      ]),
    });
  }

  onBack() {
    if (
      this.userData?.secondarySport &&
      (this.userData?.secondarySport.includes('golf') ||
        this.userData?.secondarySport.includes('wrestling') ||
        this.userData?.secondarySport.includes('tennis'))
    ) {
      this._router.navigate(['/add-sport/choose-sport']);
    } else {
      this._router.navigate(['/add-sport/positions']);
    }
  }

  onContinue() {
    if (this.selectedFile && this.userData) {
      this.onUploadPhoto(this.userData.id);
    }
    if (this.generalForm.valid && this.userData) {
      this._auth.updateUserData(this.userData.id, this.generalForm.value);
      this._router.navigate(['/add-sport/contact-info']);
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
    const filePath = `Users/${uid}_secondarySport`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(`${filePath}`, this.selectedFile);
    task.then((res) => {
      const downloadURL = fileRef.getDownloadURL();
      downloadURL.subscribe((url) => {
        if (url && this.userData) {
          this.selectedFile = null;
          this.imagePreview = url;
          this._auth.updateUserData(this.userData.id, {
            secondarySportProfileImg: url.split('&token')[0],
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
