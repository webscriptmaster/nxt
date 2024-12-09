import { AuthService } from './auth/auth.service';
import {
  Component,
  AfterViewInit,
  OnInit,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';
import {
  desktopRouterAnimation,
  mobileRouterAnimation,
} from './shared/animations';
import { filter } from 'rxjs/operators';
import { Subject, takeUntil, switchMap, of, BehaviorSubject } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AnimationOptions } from 'ngx-lottie';
import { MessagingService } from './shared/messaging.service';
import { SportService } from './shared/sport.service';

declare global {
  interface Window {
    setPwaToken: any;
    pwaToken: any;
    webkit: any;
  }
}

window.pwaToken = null;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    window.innerWidth < 1280
      ? mobileRouterAnimation()
      : desktopRouterAnimation(),
  ],
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('splash') splashVideo: ElementRef;

  loading$ = new BehaviorSubject(true);

  touchEvent = false;
  pageX = 0;

  rotateOptions: AnimationOptions = {
    path: '/assets/images/animations/landscape.json',
    loop: true,
  };

  splash = true;
  hideSplash = false;

  private _unsubscirbeUser = new Subject<void>();

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _auth: AuthService,
    private _afAuth: AngularFireAuth,
    private _messagingService: MessagingService,
    private _sportService: SportService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this._router.events
      .pipe(filter((e: any) => e instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.setBodyColor();
      });
    this._sportService.getSportsSettings$().subscribe();
  }

  ngOnInit(): void {
    this._router.events
      .pipe(
        filter((e: any) => e instanceof NavigationEnd),
        switchMap((event) => {
          if (event.url === 'start' || event.url === '/') {
            return this._afAuth.authState;
          } else {
            return of(null);
          }
        }),

        switchMap((authState) => {
          if (authState) {
            return this._auth.userData$.pipe(filter((user) => user !== null));
          } else {
            return of(null);
          }
        }),
        takeUntil(this._unsubscirbeUser)
      )
      .subscribe((res) => {
        if (res) {
          // if (res.payment) {
          if (res.completeSignUp) {
            this._router.navigate(['home']);
            if (window.innerWidth >= 1280) {
              setTimeout(() => {
                this.hideSplash = true;
                setTimeout(() => {
                  this.splash = false;
                }, 300);
              }, 1000);
            }
            return;
          }

          // if (
          //   !res.completeSignUp &&
          //   res.payment.expiresIn &&
          //   Date.now() < res['payment'].expiresIn.toMillis()
          // ) {
          //   this._router.navigate(['auth/welcome']);
          //   if (window.innerWidth >= 1280) {
          //     setTimeout(() => {
          //       this.hideSplash = true;
          //       setTimeout(() => {
          //         this.splash = false
          //       }, 300);
          //     }, 1000)
          //   }
          //   return;
          // } else {
          //   this.onPayment(res.id)
          // }
          // } else {
          //   this.onPayment(res.id)
          // }
        }
        this._unsubscirbeUser.next();
        this._unsubscirbeUser.complete();
        if (window.innerWidth >= 1280) {
          setTimeout(() => {
            this.hideSplash = true;
            setTimeout(() => {
              this.splash = false;
            }, 300);
          }, 1000);
        }
      });

    this._route.queryParams.subscribe((params) => {
      if (params['referral']) {
        this._auth.referralId = params['referral'];
      }
    });

    window.setPwaToken = function (token: any) {
      window.pwaToken = token;
      this._messagingService.updateToken(token);
    }.bind(this);
  }

  ngAfterViewInit() {
    if (window.innerWidth < 1280) {
      this.playSplash();
    }

    const element = document.querySelector('.app-container');

    if (element) {
      const iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
      if (iOS) {
        element.addEventListener('touchstart', (e: any) => {
          // this.touchEvent = true;
          // this.pageX = e.pageX;
          if (
            e.target.className.includes('letter') ||
            e.target.className.includes('alphabet')
          )
            return;
          if (e.pageX > 20 && e.pageX < window.innerWidth - 20) return;
          e.preventDefault();
        });
      }

      // element.addEventListener('touchend', (e: any) => {
      //   this.touchEvent = false
      // });
    }
  }

  prepareRoute(outlet: RouterOutlet) {
    return (
      outlet && outlet.activatedRouteData && outlet.activatedRouteData['page']
    );
  }

  // async onPayment(userId: string) {
  //   openLink(
  //     `https://nxt1sports.com/landing/pricing?step=2&time=${Date.now()}&user=${userId}`
  //   );
  // }

  setBodyColor() {
    const interval = setInterval(() => {
      const divContainer = document.querySelector(
        'div.container'
      ) as HTMLElement;
      if (divContainer) {
        clearInterval(interval);
        const styles = document.defaultView?.getComputedStyle(
          divContainer
        ) as CSSStyleDeclaration;
        const background = styles['background'];
        const backgroundImage = styles['backgroundImage'];
        document.body.style.background = background;
        document.body.style.backgroundImage = backgroundImage;
      }
    }, 100);
  }

  onSplashEnded() {
    this.hideSplash = true;
    setTimeout(() => {
      this.splash = false;
    }, 350);
  }

  playSplash() {
    try {
      const video = this.splashVideo.nativeElement as HTMLVideoElement;
      video.addEventListener('loadeddata', () => {
        video.muted = true;
        setTimeout(() => {
          video.play();
        }, 3000);
      });
    } catch (err) {
      console.log(err);
    }
  }
}
