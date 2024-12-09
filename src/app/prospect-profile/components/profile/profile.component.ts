import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { isArray } from 'lodash';
import {
  catchError,
  combineLatest,
  firstValueFrom,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { AuthService } from 'src/app/auth/auth.service';
import { Button, Profile, ProspectProfile } from 'src/app/models/prospect';
import { OwnProfile, User } from 'src/app/models/user';
import { POSITION_MAPPING_BY_SPORT } from 'src/app/shared/const';
import {
  ConfirmDialogComponent,
  PurchaseDialogComponent,
} from 'src/app/shared/dialogs';
import { MediaPreviewComponent } from 'src/app/shared/dialogs/media-preview/media-preview.component';
import { ProfileService } from 'src/app/shared/profile.service';
import { ProspectService } from 'src/app/shared/prospect.service';
import { SportService } from 'src/app/shared/sport.service';
import { transformToCollegeSport } from 'src/app/shared/utils';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
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
export class ProfileComponent implements OnInit {
  private _unsubscribeAll: Subject<void> = new Subject();
  private collegeSport: string;
  private appSport: string;
  private userId: string;
  private selectedFile: File;
  private favoriteProfile: string[] = [];
  private categoryId;
  public svgStyle;

  public loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  public showFirstProfile$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public user: User;
  public profileId;
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
  public countProfileFavorite: number = 0;
  public heartUrl: string = 'assets/images/prospect/icon/heart.svg';
  public ownProfiles: OwnProfile[] = [];
  public availableProfiles: string[] = [];
  public showSuccess = false;
  public notiContent = 'Added Under My Profiles';
  public profileCategory: ProspectProfile[];
  public coachs = [];
  public categoryName: string = '';
  @ViewChild('snapshotElement') snapshotElement!: ElementRef;

  constructor(
    private _router: Router,
    private route: ActivatedRoute,
    private _auth: AuthService,
    private _profileService: ProfileService,
    private _sportService: SportService,
    private sanitizer: DomSanitizer,
    private _prospectService: ProspectService,
    private storage: AngularFireStorage,
    private _matDialog: MatDialog
  ) {
    this.getAllFonts();
    this.route.params.subscribe(
      (res: { userId: string; categoryId: string; profileId: string }) => {
        this.userId = res.userId;
        this.categoryId = res.categoryId;
        this.profileId = res.profileId;
      }
    );
  }

  ngOnInit() {
    this.loading$.next(true);
    combineLatest([
      this._profileService.getProfileById(this.profileId),
      this._profileService.getUserData(this.userId),
      this._sportService.getSportsSettings$(),
      this._sportService.getAcademicCategorySettings$(),
      this._profileService.getProspectProfiles(),
    ])
      .pipe(
        take(1),
        takeUntil(this._unsubscribeAll),
        switchMap(
          ([profile, user, sportsSettings, academicSettings, category]) => {
            this.user = user;
            this.coachs = this.findCoaches(this.user);
            this.appSport = this.user.appSport;
            this.ownProfiles = this.user.ownProfiles || [];
            this.availableProfiles = this.user.availableProfiles || [];

            this.favoriteProfile = this.user.favoriteProfile || [];

            const isFavorited = this.favoriteProfile.includes(this.profileId);
            const heartUrlPath = 'assets/images/prospect/icon/';
            const heartIcons = {
              default: `${heartUrlPath}heart.svg`,
              marked: `${heartUrlPath}heart-mark.svg`,
            };
            if (!isFavorited) {
              this.heartUrl = heartIcons.default;
            } else {
              this.heartUrl = heartIcons.marked;
            }

            this.setupUserData();
            this.setupSportData(sportsSettings);

            this.numberOfOffers = this.countElements(this.user.offers) ?? 0;
            this.ATHLETIC_INFO = Object.keys(sportsSettings).reduce(
              (acc, val) => {
                acc[val] = sportsSettings[val].athleticInfo;
                return acc;
              },
              {} as any
            );

            this.SPORTS_STATS = Object.keys(sportsSettings).reduce(
              (acc, val) => {
                acc[val] = sportsSettings[val].stats;
                const keys = Object.keys(acc[val]);
                for (let i = 0; i < keys.length; i++) {
                  if (acc[val][keys[i]]) {
                    acc[val][keys[i]] = this.sortStats(
                      acc[val][keys[i]],
                      keys[i]
                    );
                  }
                  if (acc[val]['Special Teams']) {
                    acc[val]['Special Teams'] = this.sortStats(
                      acc[val]['Special Teams'],
                      'team'
                    );
                  }
                }
                return acc;
              },
              {} as any
            );

            this.ACADEMIC_CATEGORY = academicSettings;
            this.profileCategory = category;

            if (profile) {
              this.categoryName = profile?.categoryName;
              this.setupProfile(profile);
              return this._profileService
                .fetchSVGContent(profile.profileUrl)
                .pipe(
                  catchError((error) => {
                    console.error('Error fetching SVG content:', error);
                    return of(null);
                  })
                );
            }
            return null;
          }
        ),
        tap((svgContent) => {
          this.handleSVGContent(svgContent);
          this.loading$.next(false);
          this.showFirstProfile$.next(true);
          this.setupButtons();
          const isExsitProfile = this.ownProfiles.findIndex(
            (item) => item.id === this.profileId
          );
          if (
            this.availableProfiles.includes(this.profileId) &&
            isExsitProfile === -1
          ) {
            this.useProfile();
          }
          setTimeout(() => {
            this.showFirstProfile$.next(false);
          }, 2000);
        })
      )
      .subscribe();
  }

  async useProfile() {
    try {
      let credit;
      if (this.availableProfiles.includes(this.profileId)) {
        credit = 0;
      } else {
        if (
          this.user.lastActivatedPlan !== 'subscription' &&
          this.currentProfile?.credit > 0 &&
          (this.user['featureCredits'] < this.currentProfile.credit ||
            this.user['featureCredits'] <= 0)
        ) {
          setTimeout(() => {
            this._matDialog.open(PurchaseDialogComponent, {
              autoFocus: false,
              data: {
                user: this.user,
              },
            });
          }, 1000);
          return;
        }

        if (this.user.lastActivatedPlan === 'subscription') {
          credit = 0;
        } else {
          credit = this.currentProfile.credit;
        }

        if (credit > 0) {
          const confirmUseTemplateDialogRef = await this._matDialog.open(
            ConfirmDialogComponent,
            {
              autoFocus: false,
              data: {
                title: '',
                isShowLogo: true,
                message: `Would You Like To Use ${credit} Of Your Template Credits?`,
                firstButtonText: 'Yes',
                secondButtonText: 'No',
                firstButtonColor: '#CCFF00',
                secondButtonColor: '#FF0303',
                firstButtonBorder: '1px solid #fff',
                secondButtonBorder: '1px solid #fff',
              },
            }
          );

          const result = await firstValueFrom(
            confirmUseTemplateDialogRef.afterClosed()
          );
          if (!result) {
            return;
          }

          // Deduct credits after confirmation
          if (
            this.currentProfile.credit > 0 &&
            this.user['featureCredits'] >= this.currentProfile.credit &&
            this.user.lastActivatedPlan !== 'subscription'
          ) {
            this.user['featureCredits'] -= this.currentProfile.credit;
          }
        }
      }

      this._matDialog.closeAll();
      const data = {
        id: this.profileId,
        categoryId: this.categoryId,
        name: '',
        downloadURL: this.currentProfile.profileUrl,
        previewImage: this.currentProfile.thumbnailUrl,
        url: this.currentProfile.thumbnailUrl,
        type: 'profile',
        isLive: false,
        width: 1080,
        height: 1920,
      };
      this.ownProfiles.push(data);
      this.availableProfiles.push(this.profileId);
      this.ownProfiles.forEach((item, i) => {
        item.order = i;
      });
      await this._auth.updateUserData(this.userId, {
        featureCredits: this.user['featureCredits'] || 0,
        availableProfiles: this.availableProfiles,
        ownProfiles: this.ownProfiles,
      });
      const svgString = this.snapshotElement.nativeElement.innerHTML;
      await this._profileService
        .createOwnProfileThumbnail(
          this.userId,
          false,
          svgString,
          this.currentProfile?.backgroundUrl
        )
        .subscribe();
      this.showSuccess = true;
      setTimeout(() => {
        this.showSuccess = false;
      }, 2000);
    } catch (error) {
      console.error(error);
      this.notiContent = 'Failed to save the template';
      this.showSuccess = false;
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

  markFavorite() {
    const isFavorited = this.favoriteProfile.includes(this.profileId);
    const heartUrlPath = 'assets/images/prospect/icon/';
    const heartIcons = {
      default: `${heartUrlPath}heart.svg`,
      marked: `${heartUrlPath}heart-mark.svg`,
    };
    if (isFavorited) {
      this.favoriteProfile = this.favoriteProfile.filter(
        (id) => id !== this.profileId
      );
      this.heartUrl = heartIcons.default;
      this.countProfileFavorite--;
    } else {
      this.favoriteProfile.push(this.profileId);
      this.heartUrl = heartIcons.marked;
      this.countProfileFavorite++;
    }

    this.profileCategory.forEach((category) => {
      category.profiles.forEach((profile) => {
        if (profile.id === this.profileId) {
          profile.favorite = this.countProfileFavorite;
          const dataForUpdate = category;
          this._profileService.markAsFavorited(this.categoryId, dataForUpdate);
          this._auth.updateUserData(this.userId, {
            favoriteProfile: this.favoriteProfile,
          });
          return;
        }
      });
    });
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
    this.onUploadSchedule(this.userId);
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

  private setupProfile(profile: any) {
    this.currentProfile = profile;
    this.buttons = this.currentProfile?.buttons;
    this.currentProfile.mediaColorList.startColor = this.updateNameBgColor();
    this.countProfileFavorite = this.currentProfile.favorite ?? 0;

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
        requestAnimationFrame(() => {
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
        });
      }
    }
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
      this.currentProfile.mediaColorList?.startColor,
      '0'
    );
    const endColorRgba = this.currentProfile.mediaColorList.startColor;
    return `linear-gradient(180deg, ${startColorRgba}, ${endColorRgba})`;
  }

  private convertHexToRgba(hex: string, a: string): string {
    if (!hex) {
      return '';
    }

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

  private async fillSVGWithUserData(svgDocument: Document, user: User) {
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

  private async setImageSource(
    svgDocument: Document,
    element: Element,
    src: string
  ) {
    try {
      if (element instanceof SVGImageElement) {
        element.setAttribute('href', src);
        element.setAttribute('xlink:href', src);
      } else if (element instanceof SVGRectElement) {
        const className = element.getAttribute('class');
        if (className) {
          const pattern = this.findPatternForClass(svgDocument, className);
          if (pattern) {
            const image = pattern.querySelector('image');
            if (image) {
              image.setAttribute('xlink:href', src);
              image.setAttribute('href', src);
            }
          }
        }
      }
    } catch (error) {
      console.error(
        'Error converting image to base64 or setting image source:',
        error
      );
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
      `\\.${className}\\s*{[^}]*fill:\\s*url\\(#(pattern(?:-\\d+)?)\\)`
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
    this._router.navigate(['/media-pro/profiles-pro']);
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
