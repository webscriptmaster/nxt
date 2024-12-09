import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { Faq, SettingsService } from '../../settings.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-settings-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class SettingsFaqComponent implements OnInit, OnDestroy {
  activeBlocks: { [key: number]: boolean } = {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
    10: false,
    11: false,
    12: false
  };

  faq: null | Faq[] = null;
  faqLeft: null | Faq[] = null;
  faqRight: null | Faq[] = null;

  private _unsubscribeAll: Subject<void> = new Subject<void>();


  constructor(private _router: Router, private _settingsService: SettingsService,
              private activatedRoute: ActivatedRoute,
              private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this._settingsService.getFaq().pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.faq = res.sort((a, b) => a.index - b.index);
      const dividedArrays = this._divideArrayByOddEven(res);
      this.faqLeft = dividedArrays[0];
      this.faqRight = dividedArrays[1];
      this.cdr.detectChanges();
      const faqIndex = this.activatedRoute.snapshot.queryParams['block'];
      if (faqIndex != null) {
        this.activeBlocks[faqIndex] = true;
        setTimeout(() => {
          const mobileElement = document.querySelector(`#mobile-${faqIndex}`) as HTMLElement;
          const desktopElement = document.querySelector(`#desktop-${faqIndex}`) as HTMLElement;
          if (window.innerWidth < 1280) {
            mobileElement.scrollIntoView();
          } else {
            desktopElement.scrollIntoView();
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  _divideArrayByOddEven(inputArray: any[]) {
    var oddArray = [];
    var evenArray = [];

    for (var i = 0; i < inputArray.length; i++) {
      if (i % 2 === 0) {
        oddArray.push(inputArray[i]);
      } else {
        evenArray.push(inputArray[i]);
      }
    }

    return [oddArray, evenArray];
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

  onBack() {
    history.back();
  }


}
