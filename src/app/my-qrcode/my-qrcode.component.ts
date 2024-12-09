import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { User } from '../models/user';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import QrCodeWithLogo from 'qrcode-with-logos';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-my-qrcode',
  templateUrl: './my-qrcode.component.html',
  styleUrls: ['./my-qrcode.component.scss'],
})
export class MyQrcodeComponent {
  _unsubscribeAll: Subject<void> = new Subject();
  user$: Observable<User | null>;
  user: any;
  qrUrl: string = '';

  public qrCodeOption: any;
  constructor(
    private _router: Router,
    private _auth: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  ngOnInit() {
    this.user$ = this._auth.user$;
    this._auth.user$.subscribe((res) => {
      this.user = res;
      this.generateQRCode();
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  async generateQRCode() {
    const url = `${window.location.protocol}//${window.location.host}/prospect-profile/${this.user.unicode}`;
    const imagePreview = this.user.profileImg
      ? await this.processImage(this.user.profileImg, 100, 100)
      : null;

    const logoImage = imagePreview || '/assets/images/logo/logo.png';

    this.qrCodeOption = {
      value: url,
      centerImageSrc: logoImage,
      centerImageSize: 50,
      size: 260,
      errorCorrectionLevel: 'H',
    };
  }

  async processImage(
    imageSrc: string,
    width: number,
    height: number
  ): Promise<string> {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    return new Promise((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width * 10;
        canvas.height = height * 10;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const highResImage = canvas.toDataURL('image/png');
          resolve(highResImage);
        } else {
          reject('Error processing image');
        }
      };

      img.onerror = (err) => {
        reject(err);
      };
    });
  }

  convertQrToImage(): string {
    const qrCanvas: any = document.querySelector('qr-code canvas');
    return qrCanvas?.toDataURL('image/png') || '';
  }

  convertDataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  public async socialShare(platform?: string) {
    if (isPlatformBrowser(this.platformId)) {
      const url = `${window.location.protocol}//${window.location.host}/prospect-profile/${this.user.unicode}`;
      const shareData = {
        title: 'Check out my NXT 1 Prospect Profile!',
        description: 'This is my profile on NXT1',
        url,
      };

      const qrDataUrl = this.convertQrToImage();
      const qrFile = await this.convertDataURLtoFile(qrDataUrl, 'qr-code.png');

      if (platform === 'facebook') {
        this.shareFacebook(shareData.url);
      } else if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [qrFile] })
      ) {
        try {
          await navigator.share({
            files: [qrFile],
            title: shareData.title,
            text: shareData.description,
            url: shareData.url,
          });
          console.log('Content shared successfully');
        } catch (error) {
          console.error('Error sharing content', error);
          this.fallbackShare(shareData);
        }
      } else {
        this.fallbackShare(shareData);
      }
    } else {
      console.log('Sharing is not available in non-browser environments');
    }
  }

  private shareFacebook(url: string) {
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`;
    window.open(facebookShareUrl, '_blank');
  }

  private fallbackShare(shareData: any) {
    console.log(
      'Web Share API is not supported. Implementing fallback share method.'
    );
  }

  onAccountInfo() {
    this._router.navigate(['settings/account-info']);
  }

  onContactUs() {
    this._router.navigate(['settings/contact-us']);
  }

  onMyRefferals() {
    this._router.navigate(['/my-referrals']);
  }

  onFaq() {
    this._router.navigate(['settings/faq']);
  }

  onBack() {
    this._router.navigate(['/home']);
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
}
