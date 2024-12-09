/// <reference types="@types/googlemaps" />
import { Router } from '@angular/router';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OffersService } from 'src/app/offers/offers.service';

@Component({
  selector: 'app-edit-profile-contact-information',
  templateUrl: './contact-information.component.html',
  styleUrls: ['./contact-information.component.scss'],
})
export class EditProfileContactInformationComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  userData: User | null = null;
  saved$ = new BehaviorSubject(false);
  showProspectSheet = false;

  contactForm: FormGroup;

  autocomplete: google.maps.places.Autocomplete;

  _unsubscribeAll = new Subject<void>();

  waitAutocomplete: any;

  constructor(
    private _router: Router,
    private _auth: AuthService,
    private _offerService: OffersService
  ) {}

  async ngOnInit() {
    window.addEventListener('keyup', this.onEsc.bind(this));

    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
      this.userData = res;
      if (this.userData) {
        this.makeContactForm(this.userData);
      } else {
        this._router.navigate(['/edit-profile']);
      }
    });
  }

  ngAfterViewInit() {
    this.waitAutocomplete = setInterval(() => {
      const autocomplete = document.getElementById(
        'autocompleteAddress'
      ) as HTMLInputElement;
      if (autocomplete) {
        this.initAutocomplete();
        clearInterval(this.waitAutocomplete);
      }
    }, 500);
  }

  ngOnDestroy(): void {
    window.removeEventListener('keyup', this.onEsc.bind(this));

    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    clearInterval(this.waitAutocomplete);
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

  initAutocomplete() {
    const input = document.querySelector(
      '#autocompleteAddress'
    ) as HTMLInputElement;
    this.autocomplete = new google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: ['us', 'ca'] },
      fields: ['address_components'],
      types: ['address'],
    });
    this.autocomplete.addListener(
      'place_changed',
      this.fillInAddress.bind(this)
    );
  }

  fillInAddress() {
    const place = this.autocomplete.getPlace();
    let address = '';
    let zipCode = '';
    let city = '';
    let state = '';
    let country = '';
    for (const component of place.address_components as google.maps.GeocoderAddressComponent[]) {
      const componentType = component.types[0];
      switch (componentType) {
        case 'street_number': {
          address = `${component.long_name} ${address}`;
          break;
        }

        case 'route': {
          address += component.short_name;
          break;
        }

        case 'postal_code': {
          zipCode = `${component.long_name}${zipCode}`;
          break;
        }

        case 'postal_code_suffix': {
          zipCode = `${zipCode}-${component.long_name}`;
          break;
        }

        case 'locality':
          city = component.long_name;
          break;

        case 'administrative_area_level_1': {
          state = component.short_name;
          break;
        }

        case 'country':
          country = component.long_name;
          break;
      }
    }
    this.contactForm.controls['address'].setValue(address);
    this.contactForm.controls['city'].setValue(city);
    this.contactForm.controls['state'].setValue(state);
    this.contactForm.controls['zipCode'].setValue(zipCode);
    this.contactForm.controls['country'].setValue(country);
  }

  makeContactForm(user: User | null) {
    this.contactForm = new FormGroup({
      contactEmail: new FormControl(
        user && user.contactEmail
          ? user.contactEmail
          : user && user.email
          ? user.email
          : null,
        [Validators.required, Validators.email]
      ),
      hudlAccountLink: new FormControl(
        user && user.hudlAccountLink ? user.hudlAccountLink : ''
      ),
      youtubeAccountLink: new FormControl(
        user && user.youtubeAccountLink ? user.youtubeAccountLink : ''
      ),
      sportsAccountLink: new FormControl(
        user && user.sportsAccountLink ? user.sportsAccountLink : ''
      ),
      instagram: new FormControl(user && user.instagram ? user.instagram : ''),
      phoneNumber: new FormControl(
        user && user.phoneNumber ? user.phoneNumber : null,
        [Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-s./0-9]*$')]
      ),
      twitter: new FormControl(
        user && user.twitter ? user.twitter?.replace('@', '') : null,
        []
      ),
      address: new FormControl(user && user.address ? user.address : null, []),
      city: new FormControl(user && user.city ? user.city : null, []),
      state: new FormControl(user && user.state ? user.state : null, []),
      zipCode: new FormControl(user && user.zipCode ? user.zipCode : null, []),
      country: new FormControl(user && user.country ? user.country : null, []),
    });

    // this.contactForm.controls['twitter'].valueChanges
    //   .pipe(takeUntil(this._unsubscribeAll))
    //   .subscribe((res) => {
    //     if (!res) {
    //       return;
    //     }
    //     if (res && res[0] === '@') {
    //     } else {
    //       const newVal = `@${res}`;
    //       this.contactForm.controls['twitter'].setValue(newVal);
    //     }
    //   });
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
    if (this.contactForm.valid && this.userData) {
      if (this.contactForm.value.twitter) {
        if (this.contactForm.value.twitter[0] === '@') {
        } else {
          const newVal = `@${this.contactForm.value.twitter}`;
          this.contactForm.controls['twitter'].setValue(newVal);
        }
      }
      this._auth.updateUserData(this.userData.id, this.contactForm.value);
      this._offerService.updateAllOffersByUserId(this.userData.id, {
        hudlAccountLink: this.contactForm.value.hudlAccountLink
          ? this.contactForm.value.hudlAccountLink
          : null,
        youtubeAccountLink: this.contactForm.value.youtubeAccountLink
          ? this.contactForm.value.youtubeAccountLink
          : null,
        sportsAccountLink: this.contactForm.value.sportsAccountLink
          ? this.contactForm.value.sportsAccountLink
          : null,
        instagram: this.contactForm.value.instagram
          ? this.contactForm.value.instagram
          : null,
        twitter: this.contactForm.value.twitter
          ? this.contactForm.value.twitter
          : null,
      });
      this.saved$.next(true);
      setTimeout(() => {
        this.saved$.next(false);
      }, 1500);
    } else {
      this.contactForm.markAllAsTouched();
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
