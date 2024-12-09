import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  ChangeDetectorRef,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { AnimationOptions } from 'ngx-lottie';
import {
  BehaviorSubject,
  Subject,
  distinctUntilChanged,
  filter,
  firstValueFrom,
  takeUntil,
} from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { OwnProfile, OwnTemplate, User } from 'src/app/models/user';
import {
  ConfirmDialogComponent,
  UploadDialogComponent,
} from 'src/app/shared/dialogs';
import { SharedService } from 'src/app/shared/shared.service';
import { VideoService } from 'src/app/shared/video.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NavigationEnd, Router } from '@angular/router';
import { ProspectService } from 'src/app/shared/prospect.service';
import { isPlatformBrowser, Location } from '@angular/common';
import { ProfileService } from 'src/app/shared/profile.service';
@Component({
  selector: 'app-my-media',
  templateUrl: './my-media.component.html',
  styleUrls: ['./my-media.component.scss'],
  animations: [
    trigger('slide', [
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
      transition('void <=> *', [animate('300ms ease-in-out')]),
    ]),
  ],
})
export class MyMediaComponent {
  videoSelectionCount: number = 0;
  imageSelectionCount: number = 0;
  graphicSelectionCount: number = 0;

  state: boolean = false;
  listProfile: any[];
  isLiveProfile(): boolean {
    return this.edittingItem.isLive;
  }
  currentItems: any[] = [];
  userData: User;
  _unsubscribeAll = new Subject<void>();
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  highlights: any[] = [];
  graphics: any[] = [];
  pinnedProfileList: any[] = [];
  videoImage: any = { upcomingGamesLink: '', videos: [], images: [] };
  saved$ = new BehaviorSubject(false);
  @Input() activeTab2;
  @ViewChild('inputElementForVideo') inputElementForVideo: ElementRef;
  @ViewChild('inputElementForImage') inputElementForImage: ElementRef;
  @ViewChild('shareTemplate', { static: true }) shareTemplate: ElementRef;
  thumbnail: string = '';
  currentObject = { url: '', type: '' };
  edittingItem = {
    url: '',
    pngUrl: '',
    previewImage: '',
    redirectBackUrl: '',
    name: '',
    type: '',
    order: '',
    width: 0,
    height: 0,
    qrCode: false,
    transformUrl: null,
    isDownloading: false,
    isLive: false,
    id: null,
  };
  options: AnimationOptions = {
    path: '/assets/images/prospect/animation/LoadAnimation.json',
    loop: true,
  };

  embedVideo: any = {};
  pinVideoList: any[] = [];
  pinImageList: any[] = [];
  pinGraphicList: any[] = [];
  uploadSpeed: number = 700;
  fileSize: number = 0;
  progress: number = 0;
  intervalId: any;
  isSelecting: boolean = false;
  showBackdrop: boolean = false;
  nxt1Graphics: OwnTemplate[] = [];
  profiles: OwnProfile[] = [];
  currentCategoryId: string;
  currentTemplateId: string;
  isCopy = false;
  firstTapShare = true;
  public liveProfile: OwnProfile;
  private svgStyle;
  user$;
  constructor(
    private _auth: AuthService,
    protected _sanitizer: DomSanitizer,
    private _videoService: VideoService,
    private _matDialog: MatDialog,
    private sharedService: SharedService,
    private breakePoint: BreakpointObserver,
    private prospectService: ProspectService,
    private cdr: ChangeDetectorRef,
    private _router: Router,
    private _profileService: ProfileService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  ngOnInit() {
    this.user$ = this._auth.user$;
    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
      this.userData = res;
      if (this.userData) {
        if (this.userData.isSavingMedia) {
          this.loading$.next(true);
        } else {
          this.loading$.next(false);
        }
        if (this.userData.primaryVideoImage) {
          this.videoImage = this.userData.primaryVideoImage;
        }

        this.highlights = this.userData.primaryVideoImage?.videos
          .filter((item) => item.url !== '')
          .map((item, i) => {
            item.transformUrl = this._makeVideoLink(item.url) ?? '';
            item.order = i;
            if (item.pinnedToProfile) {
              this.pinVideoList.push(item.url);
            }
            return item;
          })
          .sort((a, b) => b.order - a.order);

        this.graphics = this.userData.primaryVideoImage?.images
          .filter((item) => item.url !== '')
          .map((item, i) => {
            item.order = i;
            if (item.pinnedToProfile) {
              this.pinImageList.push(item.url);
            }
            return item;
          })
          .sort((a, b) => b.order - a.order);
        this.nxt1Graphics = this.userData.ownTemplates?.map((item, i) => {
          item.pngUrl = item.pngUrl ?? item.previewImage;
          item.previewImage = item.previewImage ?? item.pngUrl;
          if (item.pinnedToProfile) {
            this.pinGraphicList.push(item.url);
          }
          return item;
        });

        this.profiles = this.userData.ownProfiles || [];
        this.profiles.forEach((profile) => (profile.type = 'profile'));
        this.liveProfile = this.profiles?.find((profile) => profile.isLive);
      }
    });

    this.breakePoint
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe((result) => {
        this.showBackdrop = !result.matches;
      });
    this.getAllFonts();
  }

  getAllFonts() {
    let svgFontFace = '';
    this.prospectService.getAllFonts().subscribe((res) => {
      res.forEach((font) => {
        const styleTag = document.createElement('style');
        const fileExtension =
          font.fileExtension === '.ttf'
            ? 'truetype'
            : font.fileExtension === '.otf'
            ? 'opentype'
            : font.fileExtension.replace('.', '');
        styleTag.innerHTML = `
          @font-face {
            font-family: "${font.name}";
            src: url(${font.url}) format("${fileExtension}");
          }
        `;
        styleTag.type = 'text/css';
        svgFontFace += styleTag.innerHTML.toString();
      });
      this.svgStyle = svgFontFace;
    });
  }

  startFakeUpload() {
    this.progress = 0;
    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      if (this.progress >= 100) {
        clearInterval(this.intervalId);
        this.progress = 100;
      } else {
        this.progress += ((this.uploadSpeed * 1024) / this.fileSize) * 100;
        if (this.progress > 90) this.progress = 90;
        this.progress = Math.round(this.progress);
      }
    }, 1000);
  }

  deleteItem(item: any): void {
    if (item.type === 'video') {
      const index = this.highlights.findIndex((v) => v.url === item.url);
      console.log(this.highlights[index]);
      const deleteTasks = [
        this._profileService.deleteFilebyUrl(
          this.highlights[index].previewImage
        ),
        this._profileService.deleteFilebyUrl(this.highlights[index].url),
      ];

      Promise.all(deleteTasks)
        .then(() => {
          console.log('All files deleted successfully');
        })
        .catch((error) => {
          console.error('Error deleting files:', error);
        });
      this.highlights.splice(index, 1);
      this.highlights.forEach((v, i) => {
        delete v.transformUrl;
      });
      this.highlights
        .filter((item) => item.url && item.previewImage)
        .forEach((item, i) => (item.order = i));
      this.videoImage.videos = this.highlights;

      this._auth.updateUserData(this.userData.id, {
        primaryVideoImage: this.videoImage,
      });
    }

    if (item.type === 'image') {
      const index = this.graphics.findIndex((v) => v.url === item.url);
      this.graphics.splice(index, 1);
      this.videoImage.videos.forEach((v, i) => {
        delete v.transformUrl;
      });
      this.graphics
        .filter((item) => item.url && item.previewImage)
        .forEach((item, i) => (item.order = i));
      this.videoImage.images = this.graphics;
      this._auth.updateUserData(this.userData.id, {
        primaryVideoImage: this.videoImage,
      });
    }

    if (item.type === 'graphic') {
      const index = this.nxt1Graphics.findIndex((v) => v.order === item.order);
      const deleteTasks = [
        this._profileService.deleteFilebyUrl(this.nxt1Graphics[index].pngUrl),
        this._profileService.deleteFilebyUrl(
          this.nxt1Graphics[index].previewImage
        ),
        this._profileService.deleteFilebyUrl(this.nxt1Graphics[index].url),
      ];

      Promise.all(deleteTasks)
        .then(() => {
          console.log('All files deleted successfully');
        })
        .catch((error) => {
          console.error('Error deleting files:', error);
        });

      this.nxt1Graphics.splice(index, 1);
      this._auth.updateUserData(this.userData.id, {
        ownTemplates: this.nxt1Graphics,
      });
    }

    if (item.type === 'profile') {
      const index = this.profiles.findIndex((v) => v.order === item.order);
      this._profileService
        .deleteFilebyUrl(this.profiles[index].previewImage)
        .then();
      this.profiles.splice(index, 1);
      this._auth.updateUserData(this.userData.id, {
        ownProfiles: this.profiles,
      });
    }

    this.state = false;
    this.saved$.next(true);

    setTimeout(() => {
      this.saved$.next(false);
      this.cdr.detectChanges();
    }, 3000);
  }

  goToEdit(page = '') {
    if (this.edittingItem.type === 'profile') {
      this._router.navigate(['edit-profile'], {
        queryParams: {
          redirectUrl: '/media-pro/profiles-pro',
        },
      });
      return;
    }
    if (page != '') {
      this.edittingItem.redirectBackUrl = page;
    } else {
      this.edittingItem.redirectBackUrl = '';
    }

    this._router.navigate(
      [
        `media-pro/graphics-pro/template/${this.currentCategoryId}/${this.currentTemplateId}`,
      ],
      { queryParams: this.edittingItem }
    );
  }

  async downloadAsPng() {
    // if PNG is available, downloading it without trying to convert SVG into PNG
    if (this.edittingItem?.pngUrl) {
      fetch(this.edittingItem?.pngUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.target = '_blank';
          link.download = `${
            this.edittingItem.name || this.generateFallbackName()
          }.png`;
          link.click();
          window.URL.revokeObjectURL(downloadUrl);
        });

      return;
    }

    if (this.edittingItem.isDownloading) {
      return;
    }

    const svgUrl = this.edittingItem.url;
    this.edittingItem.isDownloading = true;
    this.prospectService.downloadSvgAsPng(svgUrl).subscribe(
      (pngUrl) => {
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `${this.edittingItem.name}.png`;
        link.click();
        this.edittingItem.isDownloading = false;
      },
      (error) => console.error('Error downloading SVG as PNG:', error)
    );
  }

  private fallbackShare(shareData: any) {
    console.log(
      'Web Share API is not supported. Implementing fallback share method.'
    );
  }

  async socialShare() {
    const shareFunc = (blob) => {
      const file = new File(
        [blob],
        `${this.edittingItem.name || this.generateFallbackName()}.png`,
        {
          type: 'image/png',
        }
      );
      this.edittingItem.isDownloading = false;

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        const graphicLink = this.getShareUrl();

        const profileUrl = `${window.location.protocol}//${window.location.host}/prospect-profile/${this.userData.unicode}`;
        const shareData = {
          files: null,
          title: '',
          text: '',
        };

        if (this.edittingItem.type === 'profile') {
          shareData.files = [file];
          shareData.title =
            'Check out my NXT 1 Prospect Profile! nxt1sports.com';
          shareData.text = `${profileUrl}`;
        } else {
          shareData.files = [file];
          shareData.title = `Check out my NXT 1 Graphic! nxt1sports.com`;
          shareData.text = `Check out my NXT 1 Graphic! nxt1sports.com`;
        }

        if (navigator.share) {
          navigator
            .share(shareData)
            .then(() => console.log('Content shared successfully'))
            .catch((error) => {
              console.error('Error sharing content', error);
              this.fallbackShare(shareData);
            });
        } else {
          this.fallbackShare(shareData);
          alert('Web Share API is not supported in your browser.');
        }
      }
    };

    if (
      this.edittingItem?.type === 'profile' &&
      this.edittingItem.previewImage
    ) {
      fetch(this.edittingItem?.previewImage)
        .then((response) => response.blob())
        .then(shareFunc);
      return;
    }

    // if PNG is available, downloading it without trying to convert SVG into PNG
    if (this.edittingItem?.type !== 'profile' && this.edittingItem?.pngUrl) {
      fetch(this.edittingItem?.pngUrl)
        .then((response) => response.blob())
        .then(shareFunc);

      return;
    }

    if (this.edittingItem.isDownloading) {
      return;
    }

    // Fetch the SVG URL and proceed with the share action
    const svgUrl = this.edittingItem.url;

    this.edittingItem.isDownloading = true;

    this.prospectService.downloadSvgAsPng(svgUrl).subscribe((pngUrl) => {
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `${
        this.edittingItem.name || this.generateFallbackName()
      }.png`;
      fetch(pngUrl)
        .then((response) => response.blob())
        .then(shareFunc)
        .catch((error) => console.error('Error fetching the PNG blob:', error));
    });
  }

  getShareUrl(): string {
    const emailPrefix = this.userData.email.split('@')[0];
    const hostname = window.location.hostname;
    const port = window.location.port;
    const baseUrl = port ? `${hostname}:${port}` : hostname;
    const graphicName = this.edittingItem.name || this.generateFallbackName();
    return `/athlete/${emailPrefix}/${this.userData.lastName}/${graphicName}`;
  }

  generateFallbackName(): string {
    if (this.edittingItem.type !== 'profile') {
      return `NXT1-graphic-${Date.now()}`;
    }
    return `NXT1-profile-${Date.now()}`;
  }

  copyLink(): Promise<boolean> {
    const emailPrefix = this.userData.email.split('@')[0];
    const hostname = window.location.hostname;
    const port = window.location.port;
    const baseUrl = port ? `${hostname}:${port}` : hostname;
    const fallbackGraphicName = this.generateFallbackName();

    const protocol = hostname === 'localhost' ? 'http' : 'https';

    const urlCopy =
      this.edittingItem.type === 'graphic'
        ? `${protocol}://${baseUrl}/athlete/${emailPrefix}/${
            this.userData.lastName
          }/${this.edittingItem.name || fallbackGraphicName}`
        : `${protocol}://${baseUrl}/prospect-profile/${this.userData.unicode}?profile=${this.edittingItem.id}`;

    return new Promise((resolve, reject) => {
      if (navigator.clipboard && window.isSecureContext) {
        this.isCopy = true;
        navigator.clipboard
          .writeText(urlCopy)
          .then(() => {
            resolve(true);
          })
          .catch((err) => {
            console.error('Failed to copy: ', err);
            reject(err);
          })
          .finally(() => {
            setTimeout(() => {
              this.isCopy = false;
            }, 3000);
          });
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = urlCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '0';
        textArea.style.top = '0';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          if (successful) {
            this.isCopy = true;
            console.log('Text copied to clipboard');
            resolve(true);
          } else {
            this.isCopy = false;
            console.error('Unable to copy to clipboard');
            resolve(false);
          }
        } catch (err) {
          console.error('Failed to copy: ', err);
          document.body.removeChild(textArea);
          reject(err);
        } finally {
          setTimeout(() => {
            this.isCopy = false;
          }, 3000);
        }
      }
    });
  }

  public iOS(): boolean {
    return (
      [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod',
      ].includes(navigator.platform) ||
      (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
    );
  }

  async openUploadDialog(type: string): Promise<any> {
    const uploadDialog = this._matDialog.open(UploadDialogComponent, {
      disableClose: false,
      autoFocus: false,
      data: {
        type,
      },
    });
    const res = await firstValueFrom(uploadDialog.afterClosed());
    if (!res) return;

    if (res && typeof res === 'boolean') {
      if (type === 'video') {
        this.inputElementForVideo.nativeElement.click();
        return;
      }
      this.inputElementForImage.nativeElement.click();
      return;
    }

    if (res !== '') {
      this.getLinkVideo(res);
      this.onSave();
    }
  }

  async getLinkVideo(event: any) {
    const i = this.videoImage.videos.length || 0;
    this.videoImage.videos[i] = {
      order: i,
      name: '',
      url: '',
      previewImage: '',
      file: null,
      type: 'video',
    };
    this.videoImage.videos[i].url = event;
  }

  openEdit(item: any) {
    this.currentTemplateId = item.id;
    this.currentCategoryId = item.categoryId;
    const transformUrl = ['hudl', 'youtube'].some((keyword) =>
      item.url?.includes(keyword)
    )
      ? this._makeVideoLink(item.url)
      : '';
    this.edittingItem = {
      url: item.downloadURL ?? item.url,
      pngUrl: item.pngUrl,
      previewImage: item.previewImage,
      redirectBackUrl: '',
      name: item.name,
      type: item.type,
      order: item.order,
      transformUrl,
      width: item.width,
      height: item.height,
      qrCode: item.qrCode,
      isDownloading: false,
      isLive: item.isLive,
      id: item.id,
    };

    this.state = !this.state;
  }
  closeEdit() {
    this.state = false;
  }

  openSelecting() {
    this.isSelecting = true;
    this.pinnedProfileList = [];
    this.pinnedProfileList.push(this.liveProfile.url);
  }

  saveToProfile() {
    this.loading$.next(true);
    this.isSelecting = false;
    this.videoImage.videos?.forEach((item) => {
      if (this.pinVideoList.includes(item.url)) {
        item.pinnedToProfile = true;
      } else {
        item.pinnedToProfile = false;
      }
    });

    this.videoImage.images?.forEach((item) => {
      if (this.pinImageList.includes(item.url)) {
        item.pinnedToProfile = true;
      } else {
        item.pinnedToProfile = false;
      }
    });

    this.userData.ownTemplates?.forEach((item) => {
      if (this.pinGraphicList.includes(item.url)) {
        item.pinnedToProfile = true;
      } else {
        item.pinnedToProfile = false;
      }
    });

    this._auth.updateUserData(this.userData.id, {
      primaryVideoImage: this.videoImage,
      ownTemplates: this.userData?.ownTemplates || [],
    });
    this.loading$.next(false);
  }

  selectVideoToPin(item: any, type: string) {
    const index = this.pinVideoList.indexOf(item.url);
    if (index === -1) {
      this.pinVideoList.push(item.url);
      item.selectionOrder = ++this.videoSelectionCount;
    } else {
      this.pinVideoList.splice(index, 1);
      if (this.videoSelectionCount > 0) {
        this.videoSelectionCount--;
      }
      this.updateSelectionOrder(this.pinVideoList, 'video');
    }
  }

  selectImageToPin(item: any, type: string) {
    const index = this.pinImageList.indexOf(item.url);
    if (index === -1) {
      this.pinImageList.push(item.url);
      item.selectionOrder = ++this.imageSelectionCount;
    } else {
      this.pinImageList.splice(index, 1);
      if (this.imageSelectionCount > 0) {
        this.imageSelectionCount--;
      }
      this.updateSelectionOrder(this.pinImageList, 'image');
    }
  }

  selectGraphicToPin(item: any, type: string) {
    const index = this.pinGraphicList.indexOf(item.url);
    if (index === -1) {
      this.pinGraphicList.push(item.url);
      item.selectionOrder = ++this.graphicSelectionCount;
    } else {
      this.pinGraphicList.splice(index, 1);
      if (this.graphicSelectionCount > 0) {
        this.graphicSelectionCount--;
      }
      this.updateSelectionOrder(this.pinGraphicList, 'graphic');
    }
  }

  private updateSelectionOrder(list: any[], type: string) {
    list.forEach((url, index) => {
      const item = this.findItemByUrl(url, type);
      if (item) {
        item.selectionOrder = index + 1;
      }
    });
  }

  private findItemByUrl(url: string, type: string): any {
    switch (type) {
      case 'video':
        return this.highlights.find((item) => item.url === url);
      case 'image':
        return this.profiles.find((item) => item.url === url);
      case 'graphic':
        return this.graphics.find((item) => item.url === url);
      default:
        return null;
    }
  }

  switchProfile(item: any, type: string) {
    this.pinnedProfileList = [];
    const index = this.pinnedProfileList.indexOf(item.url);
    if (index === -1) {
      this.pinnedProfileList.push(item.url);
    } else {
      this.pinnedProfileList.splice(index, 1);
    }
  }

  saveAsNewProfile() {
    this.isSelecting = false;
    this.profiles.forEach((item) => {
      if (this.pinnedProfileList.includes(item.url)) {
        item.isLive = true;
      } else {
        item.isLive = false;
      }
    });
    this._auth.updateUserData(this.userData.id, {
      ownProfiles: this.profiles,
    });
  }

  saveName(type: string) {
    if (type === 'video') {
      const index = this.userData.primaryVideoImage.videos.findIndex(
        (item) => item.order === parseInt(this.edittingItem.order)
      );
      this.userData.primaryVideoImage.videos[index].name =
        this.edittingItem.name;
      this.videoImage.videos.forEach((v, i) => {
        delete v.transformUrl;
      });
      this._auth.updateUserData(this.userData.id, {
        primaryVideoImage: this.userData.primaryVideoImage,
      });
    }

    if (type === 'image') {
      const index = this.userData.primaryVideoImage.images.findIndex(
        (item) => item.order === parseInt(this.edittingItem.order)
      );
      this.userData.primaryVideoImage.images[index].name =
        this.edittingItem.name;

      this.videoImage.videos.forEach((v, i) => {
        delete v.transformUrl;
      });
      this.videoImage.images.forEach((v, i) => {
        delete v.transformUrl;
      });
      this._auth.updateUserData(this.userData.id, {
        primaryVideoImage: this.userData.primaryVideoImage,
      });
    }
    if (type === 'graphic') {
      const index = this.userData.ownTemplates.findIndex(
        (item) => item.order === parseInt(this.edittingItem.order)
      );
      this.userData.ownTemplates[index].name = this.edittingItem.name;
      this._auth.updateUserData(this.userData.id, {
        ownTemplates: this.userData.ownTemplates,
      });
    }

    if (type === 'profile') {
      const index = this.userData.ownProfiles.findIndex(
        (item) => item.order === parseInt(this.edittingItem.order)
      );
      this.userData.ownProfiles[index].name = this.edittingItem.name;
      this._auth.updateUserData(this.userData.id, {
        ownProfiles: this.userData.ownProfiles,
      });
    }
    this.saved$.next(true);
    this.sharedService.setViewingTemplates(null);
    setTimeout(() => {
      this.saved$.next(false);
      this.cdr.detectChanges();
    }, 3000);

    this.state = false;
  }

  public async add(type: string, event: any): Promise<any> {
    try {
      if (type === 'video') {
        const i = this.videoImage.videos.length;
        this.videoImage.videos[i] = {
          order: i,
          name: '',
          url: '',
          previewImage: '',
          file: null,
          type: 'video',
        };
        const videoFile = event.target.files[0];
        this.thumbnail = '   ';
        this.progress = 1;
        this.loading$.next(true);
        this.fileSize = videoFile.size;
        const thumbnailBase64 = await this.generateThumbnail(videoFile);
        this.thumbnail = `url(${thumbnailBase64})`;
        this.startFakeUpload();
        const blob = this.base64ToBlob(thumbnailBase64);
        this.videoImage.videos[i].videoName = videoFile.name;
        this.videoImage.videos[i].file = videoFile;
        const previewImageName = `thumbnail_${Date.now()}_${Math.random()}.png`;
        this.videoImage.videos[i].previewImageName = previewImageName;
        const previewImageFile = new File([blob], previewImageName, {
          type: 'image/png',
        });
        this.videoImage.videos[i].previewImage =
          this._sanitizer.bypassSecurityTrustResourceUrl(
            URL.createObjectURL(previewImageFile)
          );
        this.videoImage.videos[i].thumbnailFile = previewImageFile;
        this.onSave();
      } else {
        this.uploadSpeed = 500;
        const i = this.videoImage.images.length;
        this.videoImage.images[i] = {
          order: i,
          name: '',
          url: '',
          previewImage: '',
          file: null,
          type: 'image',
        };
        const image = event.target.files[0];
        this.thumbnail = '   ';
        this.progress = 1;
        this.loading$.next(true);
        this.fileSize = image.size;
        const imageDataURL = this._sanitizer.bypassSecurityTrustResourceUrl(
          URL.createObjectURL(image)
        );
        this.startFakeUpload();
        this.thumbnail = imageDataURL.toString();
        this.videoImage.images[i].file = image;
        this.videoImage.images[i].imageName = image.name;
        this.videoImage.images[i].previewImage = imageDataURL;
        this.onSave();
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async onSave() {
    if (!this.userData) return;
    this.loading$.next(true);
    const createData = (items, type) =>
      items.map((item) => ({
        id: this.userData.id,
        order: item.order,
        name: item.name,
        url: item.url,
        [`${type}Name`]: item[`${type}Name`],
        previewImageName: type === 'video' ? item.previewImageName : null,
        previewImage: item.previewImage,
        type: item.type,
      }));

    const videos = createData(this.videoImage.videos, 'video');
    const images = createData(this.videoImage.images, 'image');

    const extractFiles = (items, fileKey) =>
      items.map((item) => item[fileKey]).filter((file) => file !== null);

    const videoFiles = extractFiles(this.videoImage.videos, 'file');
    const imageFiles = extractFiles(this.videoImage.images, 'file');
    const thumbFiles = extractFiles(this.videoImage.videos, 'thumbnailFile');

    const data = {
      upcomingGamesLink: this.videoImage.upcomingGamesLink,
      videos,
      images,
    };

    this._auth.updateUserData(this.userData.id, {
      isSavingMedia: true,
    });

    this._videoService
      .compressAndSaveVideo(data, videoFiles, imageFiles, thumbFiles)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res) => {
        this.loading$.next(false);
        clearInterval(this.intervalId);
        this._auth.updateUserData(this.userData.id, {
          isSavingMedia: false,
        });
        this.intervalId = setInterval(() => {
          if (this.progress >= 100) {
            clearInterval(this.intervalId);
          } else {
            this.progress += ((this.uploadSpeed * 1024) / this.fileSize) * 100;
            if (this.progress > 100) this.progress = 100;
            this.progress = Math.round(this.progress);
          }
        }, 100);
        this.thumbnail = '';
      });
  }

  public async generateThumbnail(videoFile: Blob): Promise<string> {
    let timeoutDuration = 1000;
    if (videoFile.type.includes('quicktime') && this.iOS()) {
      const videoSizeMB = videoFile.size / (1024 * 1024);
      if (videoSizeMB < 30) {
        timeoutDuration = videoSizeMB * 100;
      } else {
        timeoutDuration = videoSizeMB * 10;
      }
    }

    const video: HTMLVideoElement = await document.createElement('video');
    return new Promise<string>(async (resolve, reject) => {
      try {
        const url = await URL.createObjectURL(videoFile);
        video.src = url;
        video.preload = 'auto';
        // video.autoplay = true;
        video.pause();
        video.muted = true;
        video.playsInline = true;
        await video.addEventListener('loadeddata', async () => {
          video.currentTime = 1;
          await setTimeout(async () => {
            const canvas = await document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = await canvas.getContext('2d');
            if (context) {
              await context.drawImage(
                video,
                0,
                0,
                video.videoWidth,
                video.videoHeight
              );
              const thumbnail = await canvas.toDataURL();
              await URL.revokeObjectURL(url);
              resolve(thumbnail);
            } else {
              alert('Could not get canvas context');
              await URL.revokeObjectURL(url);
              reject(new Error('Could not get canvas context'));
            }
          }, timeoutDuration);
        });

        video.onerror = (error: any) => {
          URL.revokeObjectURL(url);
          alert(error.message);
          reject(new Error('Error loading video: ' + error.message));
        };
        video.load();
      } catch (error) {
        alert('last err' + error);
        reject(error);
      }
    });
  }

  async preview(type: string, item: any) {
    try {
      if (item.file) {
        const fileDataURL: any = this._sanitizer.bypassSecurityTrustResourceUrl(
          URL.createObjectURL(item.file)
        );
        this.currentObject.url = fileDataURL;
      } else {
        this.currentObject.url =
          type !== 'video' ? item.previewImage : item.url;
      }
      this.currentObject.type = type;
    } catch (error) {
      console.error('Error processing file:', error);
    }
  }

  base64ToBlob(base64String: string) {
    const byteString = atob(base64String.split(',')[1]);
    const mimeString = base64String.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([arrayBuffer], { type: mimeString });
  }

  closeModal(event: any) {
    this.currentObject = { url: '', type: '' };
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
        const youTubeLink = this._sanitizer.bypassSecurityTrustResourceUrl(
          `//www.youtube.com/embed/${videoId}?autoplay=1&showinfo=1&controls=1`
        );
        finalLink = youTubeLink;
      }
      if (hudlRegExp.test(link)) {
        const videoId = this._getHudlId(link);
        const hudlLink = this._sanitizer.bypassSecurityTrustResourceUrl(
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

  stripGenderFromSport(sport: string): string {
    return sport.replace(/(mens|womens)$/i, '').trim();
  }
}
