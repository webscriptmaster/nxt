import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-about-me',
  templateUrl: './about-me.component.html',
  styleUrls: ['./about-me.component.scss'],
})
export class AboutMeComponent implements OnInit {
  userData: User | null = null;
  saved$ = new BehaviorSubject(false);
  aboutMeForm: FormGroup;
  showProspectSheet = false;
  _unsubscribeAll = new Subject<void>();
  countWords = 0;

  constructor(private _router: Router, private _auth: AuthService) {}

  ngOnInit(): void {
    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
      this.userData = res;
      this.makeForm(this.userData);
      this.countWords = this.userData?.aboutMe?.trim().split(/\s+/).length || 0;
    });
  }

  makeForm(user: User | null) {
    const initialAboutMeText = `Hi, my name is ${
      user?.firstName || '[First Name]'
    } ${
      user?.lastName || '[Last Name]'
    }, and I'm [Age] years old. I've been playing ${
      user?.primarySport || '[Sport]'
    } for [number] years, and I love pushing myself to improve every day. I play ${
      user?.primarySportPositions
    }. Off the field, I enjoy [hobbies/interests], which helps me stay focused and balanced. I'm excited to continue learning, growing, and achieving new goals in my athletic journey.`;

    this.aboutMeForm = new FormGroup({
      aboutMe: new FormControl(
        user && user.aboutMe ? user.aboutMe : initialAboutMeText,
        [maxWordsValidator(75)]
      ),
    });
  }

  countWord(event: any): number {
    if (!this.aboutMeForm || this.aboutMeForm.get('aboutMe')?.value === null) {
      return 0;
    }
    const text = this.aboutMeForm.get('aboutMe')?.value;
    this.countWords = text.trim().split(/\s+/).length;
    if (this.countWords > 75) {
      event.preventDefault();
      event.stopPropagation();
      return 0;
    }
    return this.countWords;
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

  onSave() {
    if (this.userData) {
      if (this.aboutMeForm.valid) {
        this._auth.updateUserData(this.userData.id, this.aboutMeForm.value);
        this.saved$.next(true);
      }
      setTimeout(() => {
        this.saved$.next(false);
      }, 1500);
    } else {
      this.aboutMeForm.markAllAsTouched();
    }
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

export function maxWordsValidator(maxWords: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value: string = control.value;
    if (value) {
      const wordCount = value.trim().split(/\s+/).length;
      if (wordCount > maxWords) {
        return { maxWordsExceeded: { maxWords } };
      }
    }
    return null;
  };
}
