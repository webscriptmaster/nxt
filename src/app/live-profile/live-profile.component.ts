import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '../shared/profile.service';
import { Button, Profile } from '../models/prospect';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { OwnProfile, User } from '../models/user';
import { SportService } from '../shared/sport.service';
import { transformToCollegeSport } from '../shared/utils';
import { DomSanitizer, Meta, SafeHtml } from '@angular/platform-browser';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { ProspectService } from '../shared/prospect.service';
import { POSITION_MAPPING_BY_SPORT } from '../shared/const';
import { isArray } from 'lodash';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { MatDialog } from '@angular/material/dialog';
import { MediaPreviewComponent } from '../shared/dialogs/media-preview/media-preview.component';
import { isPlatformBrowser } from '@angular/common';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-live-profile',
  templateUrl: './live-profile.component.html',
  styleUrls: ['./live-profile.component.scss'],
  animations: [
    trigger('expandCollapse', [
      state(
        'void',
        style({
          height: '0px',
          opacity: 0,
          overflow: 'hidden',
        })
      ),
      state(
        '*',
        style({
          height: '*',
          opacity: 1,
          overflow: 'hidden',
        })
      ),
      transition('void <=> *', [animate('0.3s ease-in-out')]),
    ]),
  ],
})
export class LiveProfileComponent implements OnInit {
  private _unsubscribeAll: Subject<void> = new Subject();
  private collegeSport: string;
  private code: string;
  private emailCode: string;
  private profileId: string;
  private selectedFile: File;
  private profileForSharing: string = '';

  private ownProfiles: OwnProfile[] = [];
  public loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  public showFirstProfile$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public user: User;
  public currentProfile: Profile;
  public currentSport: { icon: string; name: string };
  public buttons: Button[] = [
    {
      image: 'assets/images/profile/2x/campaign@2x.png',
      title: 'about',
      order: 0,
      color: '#000',
    },
    {
      image: 'assets/images/profile/2x/contact@2x.png',
      title: 'contact',
      order: 1,
      color: '#000',
    },
    {
      image: 'assets/images/profile/2x/Coach@2x.png',
      title: 'coach',
      order: 2,
      color: '#000',
    },
    {
      image: 'assets/images/profile/2x/athletic@2x.png',
      title: 'athletic',
      order: 3,
      color: '#000',
    },
    {
      image: 'assets/images/profile/2x/academic@2x.png',
      title: 'academic',
      order: 4,
      color: '#000',
    },
    {
      image: 'assets/images/profile/2x/stats@2x.png',
      title: 'stats',
      order: 5,
      color: '#000',
    },
    {
      image: 'assets/images/profile/2x/Schedule@2x.png',
      title: 'schedule',
      order: 6,
      color: '#000',
    },
    {
      image: 'assets/images/profile/2x/offers@2x.png',
      title: 'offers',
      order: 7,
      color: '#000',
    },
  ];
  public isLiveView: boolean = false;
  public svgStyle;

  public defaultWatermarkLogo: string =
    'assets/images/profile/2x/MAIN_LOGO@2x.png';
  public defaultDropdownIcon: string = 'assets/images/profile/icons/down.svg';
  public profileContent: SafeHtml;
  public previewSchedule;
  public tabs = [
    { order: 0, label: 'Videos', isActive: true },
    { order: 1, label: 'Graphics', isActive: false },
    { order: 2, label: 'Images', isActive: false },
  ];
  public highlights = [];
  public graphics = [];
  public images = [];
  public activeTab = 0;
  public ATHLETIC_INFO = null;
  public ACADEMIC_CATEGORY = null;
  public SPORTS_STATS = null;
  public numberOfOffers: number = 0;
  public offersArray: string[] = [];
  public coachs = [];
  @ViewChild('snapshotElement') snapshotElement!: ElementRef;
  @ViewChild('contentToDownload', { static: false })
  contentToDownload!: ElementRef;

  constructor(
    private _router: Router,
    private route: ActivatedRoute,
    private _auth: AuthService,
    private _profileService: ProfileService,
    private _sportService: SportService,
    private sanitizer: DomSanitizer,
    private _prospectService: ProspectService,
    private storage: AngularFireStorage,
    private _matDialog: MatDialog,
    private metaService: Meta,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.getAllFonts();
    this.route.params.subscribe((res: { code: string; emailCode: string }) => {
      this.code = res.code;
      this.emailCode = res.emailCode;
      if (this.code.length === 8) {
        this.isLiveView = true;
      }
    });
    this.route.queryParams.subscribe((params) => {
      if (params['profile']) {
        this.isLiveView = true;
        this.profileForSharing = params['profile'];
      }
    });
  }

  ngOnInit() {
    this.loading$.next(true);

    let observableTask = [
      this._sportService.getSportsSettings$(),
      this._sportService.getAcademicCategorySettings$(),
    ];

    // if (this.profileForSharing) {
    //   observableTask.unshift(
    //     this._profileService.getUserData(this.profileForSharing)
    //   );
    // }
    // console.log(this.code);

    if (this.code.length === 8) {
      observableTask.unshift(
        this._profileService.getUserDataByCode(this.code, this.emailCode)
      );
    }
    if (this.code.length !== 8) {
      observableTask.unshift(this._profileService.getUserData(this.code));
    }
    combineLatest(observableTask)
      .pipe(
        take(1),
        takeUntil(this._unsubscribeAll),
        switchMap(([user, sportsSettings, academicSettings]) => {
          this.user = user;
          this.coachs = this.findCoaches(this.user);
          this.setupUserData();
          this.setupSportData(sportsSettings);
          this.numberOfOffers = this.countElements(this.user.offers) ?? 0;
          this.ownProfiles = this.user?.ownProfiles || [];
          this.ATHLETIC_INFO = this.processAthleticInfo(sportsSettings);
          this.SPORTS_STATS = this.processSportsStats(sportsSettings);
          this.ACADEMIC_CATEGORY = academicSettings;
          return this.handleProfiles();
        }),
        switchMap((profile) =>
          profile && profile.profileUrl
            ? this._profileService.fetchSVGContent(profile.profileUrl).pipe(
                catchError((error) => {
                  console.error('Error fetching SVG content:', error);
                  return of(null);
                })
              )
            : of(null)
        ),
        tap((svgContent) => {
          this.handleSVGContent(svgContent);
          this.loading$.next(false);
          this.showFirstProfile$.next(true);
          this.setupButtons();
          setTimeout(() => this.showFirstProfile$.next(false), 2000);
        })
      )
      .subscribe();
  }

  private processAthleticInfo(sportsSettings: any): any {
    return Object.keys(sportsSettings).reduce((acc, val) => {
      acc[val] = sportsSettings[val].athleticInfo;
      return acc;
    }, {});
  }

  public async socialShare(platform?: string) {
    if (isPlatformBrowser(this.platformId)) {
      const url = `${window.location.protocol}//${window.location.host}/prospect-profile/${this.user.unicode}`;
      const shareData = {
        title: 'Check out my NXT 1 Prospect Profile!',
        description: 'Check out my NXT 1 Prospect Profile!',
        url,
      };
      if (platform === 'facebook') {
        this.shareFacebook(shareData.url);
      } else if (navigator.share) {
        try {
          await navigator.share({
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
  private findCoaches(data: any): any[] {
    const coaches = [];
    let index = 1;

    while (true) {
      const titleKey = `coach${index === 1 ? '' : index}Title`;
      const emailKey = `coach${index === 1 ? '' : index}Email`;
      const phoneKey = `coach${index === 1 ? '' : index}PhoneNumber`;
      const firstName = `coach${index === 1 ? '' : index}FirstName`;
      const lastName = `coach${index === 1 ? '' : index}LastName`;

      if (data[titleKey] || data[emailKey] || data[phoneKey]) {
        coaches.push({
          title: data[titleKey] || null,
          email: data[emailKey] || null,
          phone: data[phoneKey] || null,
          firstName: data[firstName] || null,
          lastName: data[lastName] || null,
        });
      } else {
        break;
      }
      index++;
    }

    return coaches;
  }

  private processSportsStats(sportsSettings: any): any {
    return Object.keys(sportsSettings).reduce((acc, val) => {
      acc[val] = sportsSettings[val].stats;
      Object.keys(acc[val]).forEach((key) => {
        if (acc[val][key]) {
          acc[val][key] = this.sortStats(acc[val][key], key);
        }
      });
      if (acc[val]['Special Teams']) {
        acc[val]['Special Teams'] = this.sortStats(
          acc[val]['Special Teams'],
          'team'
        );
      }
      return acc;
    }, {});
  }

  private handleProfiles(): Observable<any> {
    if (this.user.ownProfiles?.length > 0) {
      if (this.profileForSharing) {
        return this._profileService
          .getProfileById(this.profileForSharing)
          .pipe(map((profile) => this.setupProfileIfExists(profile)));
      }
      const liveProfile = this.user.ownProfiles.find(
        (item: OwnProfile) => item.isLive
      );
      if (liveProfile && liveProfile.id) {
        return this._profileService
          .getProfileById(liveProfile.id)
          .pipe(map((profile) => this.setupProfileIfExists(profile)));
      }
    }
    return this._profileService.getDefaultProfile().pipe(
      map((profile) => {
        return this.setupProfileIfExists(profile);
      })
    );
  }

  private setupProfileIfExists(profile: any): any {
    if (profile) {
      this.setupProfile(profile);
    }
    return profile;
  }

  private countElements(inputString): number {
    if (!inputString) {
      return 0;
    }
    const elements = inputString.split(',').map((element) => element.trim());
    this.offersArray = elements;
    return elements.length;
  }

  private setupUserData() {
    this.collegeSport = transformToCollegeSport(
      this.user?.appSport === 'secondary'
        ? this.user?.secondarySport!
        : this.user?.primarySport!
    ).toLocaleLowerCase();
    this.setupHighlights();
    this.setupImages();
    this.setupGraphics();
  }

  public preview(item) {
    this._matDialog.open(MediaPreviewComponent, {
      data: {
        preview: item,
      },
      disableClose: true,
    });
  }

  public goToEditProfile() {
    this._router.navigate(['/edit-profile']);
  }

  private sortStats(statsArray: any[], prefix: string): any[] {
    return statsArray.sort((a, b) => {
      if (
        a.field === prefix + '_title_stats' &&
        b.field !== prefix + '_title_stats'
      ) {
        return -1;
      } else if (
        a.field !== prefix + '_title_stats' &&
        b.field === prefix + '_title_stats'
      ) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  private setupHighlights() {
    this.highlights = this.user.primaryVideoImage?.videos
      .filter((item) => item.url !== '' && item.pinnedToProfile)
      .map((item) => ({
        ...item,
        transformUrl: this._makeVideoLink(item.url) ?? '',
      }))
      .sort((a, b) => b.order - a.order);
  }

  private setupImages() {
    this.images = this.user.primaryVideoImage?.images
      .filter((item) => item.url !== '' && item.pinnedToProfile)
      .sort((a, b) => b.order - a.order);
  }

  private setupGraphics() {
    this.graphics =
      this.user.ownTemplates?.filter((item) => item.pinnedToProfile) || [];

    this.graphics.forEach((item) => {
      if (!item.previewImage) {
        item.previewImage = item.pngUrl;
      }
    });
  }

  private setupSportData(sportsSettings: any) {
    const sportList = this._sportService.getOrderedSports(sportsSettings);
    const words = this.collegeSport
      .toLowerCase()
      .replace(/'s/g, 's')
      .split(' ');
    this.currentSport = sportList.find((item) => {
      let formattedName = item.name;
      formattedName = formattedName.replace(/ & /g, ' ');
      return words.every((word) => {
        return formattedName.toLowerCase().includes(word);
      });
    });
    this.currentSport.icon = this.currentSport.icon.replaceAll(' ', '%20');
  }
  private stripGenderFromSport(sport: string): string {
    return sport.replace(/(mens|womens)$/i, '').trim();
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.selectedFile = file;
    this.previewSchedule = this.sanitizer.bypassSecurityTrustResourceUrl(
      URL.createObjectURL(file)
    );
    console.log(this.previewSchedule);
    this.onUploadSchedule(this.code);
  }

  public onUploadSchedule(uid: string) {
    const filePath = `UserSchedule/${uid}_schedule`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(`${filePath}`, this.selectedFile);
    task.then((res) => {
      const downloadURL = fileRef.getDownloadURL();
      downloadURL.subscribe((url) => {
        if (url && this.user) {
          this.selectedFile = null;
          this._auth.updateUserData(this.user.id, {
            schedule: url.split('&token')[0],
          });
        }
      });
    });
  }

  private async setupProfile(profile: any) {
    this.currentProfile = profile;
    this.buttons = this.currentProfile?.buttons;
    this.currentProfile.mediaColorList.startColor = this.updateNameBgColor();
    this.currentProfile.lastUpdated = this.formatDate(
      this.currentProfile.lastUpdated
    );
  }

  private handleSVGContent(svgContent: string | null) {
    if (svgContent) {
      const parser = new DOMParser();
      const svgDocument = parser.parseFromString(svgContent, 'image/svg+xml');

      const element = svgDocument.getElementById('teamLogoImg');
      this.setImageSource(svgDocument, element, '');

      const defs = svgDocument.querySelector('defs');
      if (defs) {
        let styleElement = defs.querySelector('style');
        if (!styleElement) {
          styleElement = svgDocument.createElement('style');
          defs.appendChild(styleElement);
        }

        const oldStyle = styleElement.textContent || '';

        styleElement.textContent = `${oldStyle} ${this.svgStyle}`;
      }

      this.fillSVGWithUserData(svgDocument, this.user);
      const serializer = new XMLSerializer();
      const updatedSVG = serializer.serializeToString(svgDocument);
      this.profileContent = this.sanitizer.bypassSecurityTrustHtml(updatedSVG);
      if (this.user && this.profileContent) {
        requestAnimationFrame(async () => {
          this.addClickEventListener();
          this.adjustTransform('firstName');
          this.adjustTransform('lastName');
          this.adjustTransform('firstName-center');
          this.adjustTransform('lastName-center');
          this.adjustTransform('height');
          this.adjustTransform('height-center');
          this.adjustTransform('weight');
          this.adjustTransform('weight-center');
          this.adjustTransform('primarySportPositions');
          this.adjustTransform('primarySportPositions-center');
          const ownProfiles = this.user?.ownProfiles ?? [];
          const availableProfiles = this.user?.availableProfiles ?? [];
          if (!availableProfiles.includes(this.currentProfile.id)) {
            const data = {
              id: this.currentProfile.id,
              categoryId: '',
              name: '',
              downloadURL: this.currentProfile.profileUrl,
              previewImage: this.currentProfile.thumbnailUrl,
              type: 'profile',
              isLive: true,
              width: 1080,
              height: 1920,
            };
            ownProfiles.push(data);
            availableProfiles.push(this.currentProfile.id);

            ownProfiles.forEach((item, i) => {
              item.order = i;
            });

            await this._auth.updateUserData(this.user?.id, {
              featureCredits: this.user['featureCredits'] || 0,
              availableProfiles: availableProfiles,
              ownProfiles: ownProfiles,
            });
          }

          if (this.code.length !== 8) {
            const svgString = this.snapshotElement.nativeElement.innerHTML;
            this._profileService
              .createOwnProfileThumbnail(
                this.user?.id,
                true,
                svgString,
                this.currentProfile?.backgroundUrl
              )
              .subscribe();
          }
        });
      }
    }
  }

  private adjustTransform(id: string) {
    const translateRegex = /translate\(([^,]+) \s*([^)]+)\)/;
    const elm = document.getElementById(id);
    if (!elm) {
      return;
    }

    const originalAlign = elm.getAttribute('id');
    if (originalAlign.includes('left')) {
      return;
    }
    if (originalAlign.includes('center')) {
      const fontSize = window.getComputedStyle(elm).fontSize;
      const fontFamily = window.getComputedStyle(elm).fontFamily;
      const font = `${fontSize} ${fontFamily}`;
      const widthElement = elm?.getBoundingClientRect().width;

      const originalData = elm.getAttribute('data-original-content');
      const originalTransform = elm.getAttribute('transform');

      const widthOriginalData = this.getTextWidth(originalData, font);
      const match = translateRegex.exec(originalTransform);
      if (match) {
        let x = parseFloat(match[1]);
        let y = parseFloat(match[2]);
        const diff = widthElement - widthOriginalData;
        x -= diff + 20;
        elm.setAttribute('transform', `translate(${x} ${y})`);
      }
    }
  }

  getTextWidth(text: string, font: string): number {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      context.font = font;
      return context.measureText(text).width / 2;
    }
    return 0;
  }

  private setupButtons() {
    this.buttons.forEach((item) => {
      item.isEdit = false;
      item.isExpanded = false;
      item.byPassImage = this.sanitizer.bypassSecurityTrustResourceUrl(
        item.image
      ) as string;
    });
  }

  private getAllFonts() {
    let svgFontFace = '';
    this._prospectService.getAllFonts().subscribe((res) => {
      res.forEach((font) => {
        const styleTag = document.createElement('style');
        const fileExtension =
          font.fileExtension === '.ttf'
            ? 'truetype'
            : font.fileExtension === '.otf'
            ? 'opentype'
            : font.fileExtension === '.woff2'
            ? 'woff2'
            : font.fileExtension === '.woff'
            ? 'woff'
            : font.fileExtension.replace('.', '');
        styleTag.innerHTML = `
          @font-face {
            font-family: "${font.name}";
            src: url(${font.url}) format("${fileExtension}");
            font-display: swap;
          }
        `;
        const head = document.getElementsByTagName('head')[0];
        styleTag.type = 'text/css';
        // head.appendChild(styleTag);
        svgFontFace += styleTag.innerHTML.toString();
      });
      this.svgStyle = svgFontFace;
    });
  }

  public onTabChange(tab) {
    this.tabs.forEach((tab) => {
      tab.isActive = false;
    });
    tab.isActive = true;
    this.activeTab = tab.order;
  }

  private updateNameBgColor(): string {
    if (!this.currentProfile.mediaColorList?.startColor) {
      return '';
    }
    const startColorRgba = this.convertHexToRgba(
      this.currentProfile.mediaColorList.startColor,
      '0'
    );
    const endColorRgba = this.currentProfile.mediaColorList.startColor;
    return `linear-gradient(180deg, ${startColorRgba}, ${endColorRgba})`;
  }

  private convertHexToRgba(hex: string, a: string): string {
    if (hex.startsWith('rgba') || hex.startsWith('rgb')) {
      return hex;
    }

    let r = 0,
      g = 0,
      b = 0;

    if (hex.length == 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length == 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }

    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  private formatDate(inputDate: any): string {
    // inputDate = {
    //   _seconds: 1716575433,
    //   _nanoseconds: 784000000,
    // };
    const inputData = inputDate._seconds
      ? inputDate._seconds
      : inputDate.seconds;
    const date = new Date(inputData * 1000);
    const formattedDate =
      (date.getMonth() + 1).toString().padStart(2, '0') +
      '/' +
      date.getDate().toString().padStart(2, '0') +
      '/' +
      date.getFullYear();
    return formattedDate;
  }

  private _makeVideoLink(link: string): any {
    let finalLink;

    if (link) {
      const youtubeRegExp = new RegExp(
        '^(http(s)?://)?((w){3}.)?(youtu(be|.be))?(.com)?/.+'
      );
      const hudlRegExp = new RegExp(
        '^(http(s)?://)?((w){3}.)?(hudl)?(.com)?/.+'
      );
      if (youtubeRegExp.test(link)) {
        const videoId = this._getYouTubeId(link);
        const youTubeLink = this.sanitizer.bypassSecurityTrustResourceUrl(
          `//www.youtube.com/embed/${videoId}?autoplay=1&showinfo=1&controls=1`
        );
        finalLink = youTubeLink;
      }
      if (hudlRegExp.test(link)) {
        const videoId = this._getHudlId(link);
        const hudlLink = this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.hudl.com/embed/video/${videoId}`
        );
        finalLink = hudlLink;
      }
    }
    return finalLink;
  }

  private _getYouTubeId(url: string) {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  private _getHudlId(url: string) {
    if (!url) return null;
    const regex =
      /(https?:\/\/(www\.)?)?hudl\.com\/(video|embed\/video)\/(.*)/i;
    const match = url.match(regex);
    if (match) {
      return `/${match[4]}`;
    } else {
      return null;
    }
  }

  public toggleExpand(button: any) {
    button.isExpanded = !button.isExpanded;
  }

  private fillSVGWithUserData(svgDocument: Document, user: User) {
    for (const key in user) {
      if (!user.hasOwnProperty(key)) {
        continue;
      }

      let customKey = key;
      const value = user[customKey.split('-')[0]];

      if (typeof value === 'object' && !isArray(value) && value !== null) {
        for (const subKey in value) {
          if (value.hasOwnProperty(subKey)) {
            const nestedElement = svgDocument.getElementById(subKey);

            if (nestedElement) {
              let nestedValue = value[subKey];
              if (subKey === 'height') {
                nestedValue = this.convertToFeet(nestedValue);
              }
              if (subKey.endsWith('Img')) {
                this.setImageSource(svgDocument, nestedElement, nestedValue);
              } else {
                this.setElementContent(nestedElement, nestedValue);
              }
            }
          }
        }
      } else {
        let element = svgDocument.getElementById(customKey);
        if (
          !element &&
          [
            'firstName',
            'lastName',
            'height',
            'weight',
            'primarySportPositions',
          ].includes(customKey)
        ) {
          element = svgDocument.getElementById(customKey + '-center');
        }
        if (element) {
          const processedValue =
            customKey === 'primarySport'
              ? this.stripGenderFromSport(value)
              : value;

          if (customKey.endsWith('Img')) {
            this.setImageSource(svgDocument, element, processedValue);
          } else {
            this.setElementContent(element, processedValue);
          }
        }
      }
    }
  }

  public convertToFeet(inches: any): string {
    if (!inches || inches === 0) {
      return '';
    }
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}`;
  }

  public liveView(): void {
    let url = `${window.location.protocol}//${window.location.host}/prospect-profile/${this.user.unicode}`;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    if (this.isIOS()) {
      this.openInSafari(url);
    } else {
      this.openLink(url);
    }
  }

  openInSafari(url: string): void {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const safariUrl = `openexternalurl://?${encodeURIComponent(url)}`;

    window.location.href = safariUrl;
  }

  isIOS(): boolean {
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    );
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

  private setElementContent(
    element: Element,
    value: any,
    newCase: 'uppercase' | 'lowercase' | 'capitalize' | 'mixed' = 'mixed'
  ) {
    const originalContent = element.textContent || '';
    const originalCase = this.determineStringCase(originalContent);

    let formattedValue = this.formatContent(
      this.currentSport.name.toLowerCase(),
      value
    );
    formattedValue = this.convertToCase(formattedValue, newCase);
    if (element instanceof SVGTextElement) {
      const tspans = element.getElementsByTagName('tspan');
      if (tspans.length > 0) {
        Array.from(tspans).forEach(
          (tspan) => (tspan.textContent = formattedValue)
        );
      } else {
        element.textContent = formattedValue;
      }
    } else {
      element.textContent = formattedValue;
    }

    element.setAttribute('data-original-content', originalContent);
    element.setAttribute('data-original-case', originalCase);
  }

  private setImageSource(svgDocument: Document, element: Element, src: string) {
    if (element instanceof SVGImageElement) {
      element.setAttribute('href', src);
    } else if (element instanceof SVGRectElement) {
      const className = element.getAttribute('class');
      if (className) {
        const pattern = this.findPatternForClass(svgDocument, className);
        if (pattern) {
          const image = pattern.querySelector('image');
          if (image) {
            image.setAttribute('href', src);
          }
        }
      }
    }
  }

  private findPatternForClass(
    svgDocument: Document,
    className: string
  ): Element | null {
    const defs = svgDocument.querySelector('defs');
    if (!defs) return null;

    const style = defs.querySelector('style');
    if (!style) return null;

    const styleContent = style.textContent || '';
    const regex = new RegExp(
      `\\.${className}\\s*{[^}]*fill:\\s*url\\(#(pattern-\\d+)\\)`
    );
    const match = styleContent.match(regex);

    if (match && match[1]) {
      const patternId = match[1];
      return svgDocument.getElementById(patternId) as Element;
    }

    return null;
  }

  private addClickEventListener() {
    for (const key in this.user) {
      if (this.user.hasOwnProperty(key)) {
        const element = document.getElementById(key);
        if (element) {
          if (
            [
              'twitter',
              'hudlAccountLink',
              'youtubeAccountLink',
              'instagram',
              'sportsAccountLink',
            ].includes(key)
          ) {
            element.style.cursor = 'pointer';
          }
          const value = this.user[key];

          const eventHandler = (event: MouseEvent) => {
            switch (key) {
              case 'twitter':
                this.onTwitter(value);
                break;
              case 'hudlAccountLink':
                this.onHudl(value);
                break;
              case 'youtubeAccountLink':
                this.onYoutube(value);
                break;
              case 'instagram':
                this.onInstagram(value);
                break;
              case 'sportsAccountLink':
                this.onSport247(value);
                break;
            }
          };
          element.removeEventListener('click', eventHandler as EventListener);
          if (value) {
            element.addEventListener('click', eventHandler as EventListener);
          }
        }
      }
    }
  }

  private determineStringCase(str: string): string {
    if (str === str.toUpperCase()) {
      return 'uppercase';
    }
    if (str === str.toLowerCase()) {
      return 'lowercase';
    }
    if (str === str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()) {
      return 'capitalize';
    }
    return 'mixed';
  }

  private convertToCase(
    str: string,
    caseType: 'uppercase' | 'lowercase' | 'capitalize' | 'mixed'
  ): string {
    switch (caseType) {
      case 'uppercase':
        return str.toUpperCase();
      case 'lowercase':
        return str.toLowerCase();
      case 'capitalize':
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      case 'mixed':
      default:
        return str;
    }
  }

  private formatContent(sport: string, value: any): string {
    if (Array.isArray(value)) {
      const position = value.join(', ');
      return this.mapPosition(
        this.currentSport.name.toLowerCase(),
        position
      ).toUpperCase();
    } else if (typeof value === 'string' || typeof value === 'number') {
      return this.mapPosition(sport, String(value)).toUpperCase();
    } else if (value !== null && value !== undefined) {
      return JSON.stringify(value);
    }
    return '';
  }

  private mapPosition(sport: string, position: string): string {
    sport = this.stripGenderFromSport(sport);
    sport = sport.replaceAll(' ', '_');
    const sportMapping = POSITION_MAPPING_BY_SPORT[sport.toLowerCase()];
    if (sportMapping) {
      if (position.includes(',')) {
        const positions = position
          .split(',')
          .map((pos) => pos.trim().toLowerCase());

        const mappedPositions = positions
          .map((pos) => sportMapping[pos] || pos)
          .filter((pos) => pos !== undefined);

        return mappedPositions.join('/');
      } else {
        const mappedPosition = sportMapping[position.toLowerCase()];
        return mappedPosition || position;
      }
    }

    return position;
  }

  onTwitter(tag: string): void {
    if (tag && tag.includes('https://twitter.com/')) {
      this.onLink(tag);
      return;
    }
    const url = `https://twitter.com/${tag}`;
    this.onLink(url);
  }

  onHudl(tag: string) {
    if (tag && tag.includes('https://www.hudl.com/')) {
      this.onLink(tag);
      return;
    }
    const url = `https://www.hudl.com/${tag}`;
    this.onLink(url);
  }

  onSport247(tag: string) {
    if (tag && tag.includes('https://www.247sports.com/')) {
      this.onLink(tag);
      return;
    }
    const url = `https://www.247sports.com/${tag}`;
    this.onLink(url);
  }

  onYoutube(tag: string) {
    if (tag && tag.includes('https://www.youtube.com/')) {
      this.onLink(tag);
      return;
    }
    const url = `https://www.youtube.com/${tag}`;
    this.onLink(url);
  }

  onInstagram(tag: string) {
    if (tag && tag.includes('https://www.instagram.com/')) {
      this.onLink(tag);
      return;
    }
    const url = `https://www.instagram.com/${tag}`;

    this.onLink(url);
  }

  onLink(url: string) {
    return new Promise((res, rej) => {
      if (!url) {
        rej(null);
      }
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

  onBack() {
    this._router.navigate(['/home']);
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
}
