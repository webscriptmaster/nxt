import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user';
import { CroppImageDialogComponent } from 'src/app/shared/dialogs';
import { SharedService } from 'src/app/shared/shared.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit {
  imagePreview: any;
  imagePreviewTemp: any = '';
  selectedFile: File | null;

  user$: Observable<User | null>;
  userData: User | null = null;
  userId: any;

  statsInfo = false;
  parentsInfo = false;

  hideStats = true;
  loading$ = new BehaviorSubject<boolean>(false);
  _unsubscribeAll = new Subject<void>();

  sport: string | null = null;
  redirectUrl: string | null = null;

  constructor(
    private _router: Router,
    private route: ActivatedRoute,
    private _auth: AuthService,
    private storage: AngularFireStorage,
    private _matDialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private navigationHistory: SharedService
  ) {
    this.user$ = this._auth.user$;
    this.route.queryParams.subscribe((params: any) => {
      this.redirectUrl = params.redirectUrl;
    });
  }

  ngOnInit() {
    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
      this.userData = res;
      this.userId = this.userData?.id;
      if (
        !(
          this.userData?.completeAddSport &&
          this.userData.appSport === 'secondary'
        )
      ) {
        if (this.userData) {
          this.imagePreview = this.userData?.profileImg
            ? `${this.userData.profileImg}&time=${Date.now()}`
            : null;
          this.sport = this._setSport(this.userData.primarySport);
        }
      } else {
        if (this.userData) {
          this.imagePreview = this.userData?.secondarySportProfileImg
            ? `${this.userData.secondarySportProfileImg}&time=${Date.now()}`
            : null;
          this.sport = this._setSport(this.userData.secondarySport);
        }
      }

      if (this.sport) {
        if (
          this.sport.includes('golf') ||
          this.sport.includes('cross_country') ||
          this.sport.includes('wrestling') ||
          this.sport.includes('rowing') ||
          this.sport.includes('gymnastics')
        ) {
          this.hideStats = true;
        } else {
          this.hideStats = false;
        }
      }
      if (this.imagePreviewTemp !== '') {
        this.imagePreview = this.imagePreviewTemp;
        this.loading$.next(false);
      }
    });
  }

  async onBack() {
    if (this.redirectUrl) {
      this._router.navigate([this.redirectUrl], {
        queryParams: {
          active: 3,
        },
      });
    } else {
      this._router.navigate(['home']);
    }
    // this.navigationHistory.back();
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
    let filePath = `Users/${uid}`;
    if (
      this.userData?.completeAddSport &&
      this.userData.appSport === 'secondary'
    ) {
      filePath = `Users/${uid}_secondarySport`;
    }
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(`${filePath}`, this.selectedFile);
    task.then((res) => {
      const downloadURL = fileRef.getDownloadURL();
      downloadURL.subscribe((url) => {
        if (url && this.userData) {
          this.selectedFile = null;
          this.imagePreview = url;
          this.cdr.detectChanges();
          if (
            !(
              this.userData?.completeAddSport &&
              this.userData.appSport === 'secondary'
            )
          ) {
            this._auth.updateUserData(this.userData.id, {
              profileImg: url.split('&token')[0] + `&time=${Date.now()}`,
            });
          } else {
            this._auth.updateUserData(this.userData.id, {
              secondarySportProfileImg:
                url.split('&token')[0] + `&time=${Date.now()}`,
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
        this.loading$.next(true);
        this.selectedFile = res;
        var reader = new FileReader();
        reader.readAsDataURL(res);
        reader.onload = async (_event) => {
          this.imagePreviewTemp = reader.result;
          if (this.selectedFile && this.userData) {
            this.onUploadPhoto(this.userData.id);
          }
        };
      }
    });
  }

  onTemplates() {
    this._router.navigate(['/edit-profile/templates']);
  }
  onGeneral() {
    this._router.navigate(['/edit-profile/general']);
  }
  onAboutMe() {
    this._router.navigate(['edit-profile/about-me']);
  }
  onVideoImage() {
    this._router.navigate(['/edit-profile/media']);
  }
  onContactInfo() {
    this._router.navigate(['edit-profile/contact-info']);
  }
  onAcademicInfo() {
    this._router.navigate(['edit-profile/academic-info']);
  }
  onAthleticInfo() {
    this._router.navigate(['edit-profile/athletic-info']);
  }
  onCoachInfo() {
    this._router.navigate(['edit-profile/coach-info']);
  }
  onStats() {
    this._router.navigate(['edit-profile/stats']);
  }
  onParents() {
    this._router.navigate(['edit-profile/parents-info']);
  }

  onShowStatsInfo(e: Event) {
    e.stopPropagation();
    this.statsInfo = true;
  }

  onShowParentsInfo(e: Event) {
    e.stopPropagation();
    this.parentsInfo = true;
  }

  onHelp() {
    const url = `https://nxt1sports.com/faqs`;
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

  onContactUs(event: boolean) {
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

  private _setSport(sport: string) {
    const key = sport
      ?.split(' ')
      .filter((w) => w != 'mens' && w != 'womens' && w != '&')
      .join('_');
    return key;
  }
}
