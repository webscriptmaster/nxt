import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-offer-congratulations',
  templateUrl: './congratulations.component.html',
  styleUrls: ['./congratulations.component.scss'],
})
export class OffersCongratulationsComponent implements OnInit {
  options: AnimationOptions = {
    path: '/assets/images/animations/scholarship.json',
    loop: true,
  };

  share = false;
  constructor(private _router: Router, private _route: ActivatedRoute) {
    this._route.queryParams.subscribe(params => {
      if (params['share']) {
        this.share = params['share'];
      }
    })

  }

  ngOnInit() {}

  onBack() {
    this._router.navigate(['offers/add-offers']);
  }

  onContinue() {
    this._router.navigate(['home']);
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
}
