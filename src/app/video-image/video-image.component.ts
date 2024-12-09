import { AfterViewInit, Component, Inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { BehaviorSubject, Subject, firstValueFrom, takeUntil } from 'rxjs';
import { User } from '../models/user';
import { DomSanitizer } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { VideoService } from '../shared/video.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { SharedService } from '../shared/shared.service';
@Component({
  selector: 'app-video-image',
  templateUrl: './video-image.component.html',
  styleUrls: ['./video-image.component.scss'],
})
export class VideoImageComponent implements OnInit, AfterViewInit {
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  _unsubscribeAll = new Subject<void>();
  saved$ = new BehaviorSubject(false);
  showProspectSheet = false;
  @Input() flow: string = 'sign-up';
  userData: User | null = null;
  sport: string | null = null;
  sports: any;
  fileName = '';
  url: any[] = [];
  numberOfVideosImages = 3;
  format: string;
  selectedFile: File | null = null;
  videoImage: any = {
    upcomingGamesLink: '',
    videos: [],
    images: [],
  };
  currentVideoImage: any;
  currentObject = {
    url: '',
    type: '',
  };
  dataForRemove: any = [];
  selectedVideoFiles: File[] = [];
  selectedImageFiles: File[] = [];
  thumbNailFiles: File[] = [];
  isMobile: boolean = false;
  constructor(
    private _router: Router,
    private _auth: AuthService,
    private storage: AngularFireStorage,
    protected _sanitizer: DomSanitizer,
    private _videoService: VideoService,
    private _matDialog: MatDialog,
    private breakePoint: BreakpointObserver,
    private _sharedService: SharedService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngAfterViewInit() {}
  async ngOnInit(): Promise<void> {
    this.breakePoint
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });
    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
      this.userData = res;
      if (this.userData) {
        this.initializeSelectedFiles();
        this.populateVideoImageArrays();
        this.setCurrentVideoImage();
        this.syncVideoImageArrays();
        this.transformVideoUrls();
        this.syncPreviewImages();
      }
    });

    if (this.userData.isSavingMedia) {
      const confirmSave = await this.showPopup();
      if (confirmSave) {
        this._router.navigate(['/edit-profile']);
      } else {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._sharedService.cancelPendingRequests();
      }
    } else {
      this._matDialog.closeAll();
    }
  }

  private iOS(): boolean {
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

  public goToProfile() {
    const email = this.userData.email.split('@')[0];
    let provider = this.userData.email.split('@')[1];
    if (['gmail.com', 'hotmail.com', 'outlook.com'].includes(provider)) {
      provider = provider.charAt(0);
    }
    const code = `${email}-${provider}`;

    this._router.navigate([`/prospect-profile/${code}`]);
  }

  private initializeSelectedFiles() {
    if (this.userData?.lastActivatedPlan !== 'trial') {
      this.numberOfVideosImages = 6;
    }
  }

  private populateVideoImageArrays() {
    for (let i = 0; i < this.numberOfVideosImages; i++) {
      if (
        this.videoImage.images.length === this.numberOfVideosImages ||
        this.videoImage.videos.length === this.numberOfVideosImages
      ) {
        break;
      }
      this.videoImage.images.push({
        order: i,
        name: '',
        url: '',
        previewImage: '',
        file: null,
        type: 'image',
      });
      this.videoImage.videos.push({
        order: i,
        name: '',
        url: '',
        previewImage: '',
        file: null,
        type: 'video',
      });
    }
  }

  private setCurrentVideoImage() {
    if (this.userData?.appSport === 'primary' || !this.userData?.appSport) {
      this.currentVideoImage = this.userData?.primaryVideoImage;
    } else {
      this.currentVideoImage = this.userData.secondaryVideoImage;
    }
    this.videoImage.upcomingGamesLink =
      this.currentVideoImage?.upcomingGamesLink ?? '';
  }

  private syncVideoImageArrays() {
    for (let i = 0; i < this.numberOfVideosImages; i++) {
      if (
        this.currentVideoImage?.videos[i] &&
        this.currentVideoImage?.videos[i].previewImage !==
          this.videoImage.videos[i].previewImage
      ) {
        this.videoImage.videos[i] = this.currentVideoImage.videos[i];
      }
      if (
        this.currentVideoImage?.images[i] &&
        this.currentVideoImage.images[i].previewImage !==
          this.videoImage.images[i].previewImage
      ) {
        this.videoImage.images[i] = this.currentVideoImage.images[i];
      }
    }
  }

  private transformVideoUrls() {
    for (let video of this.videoImage.videos) {
      video.transformUrl = this._makeVideoLink(video.url) ?? '';
    }
  }

  private syncPreviewImages() {
    for (let image of this.videoImage.images) {
      if (image.previewImage !== image.url) {
        image.previewImage = image.url;
      }
    }
  }

  onEditProfile() {
    this._router.navigate(['edit-profile']);
  }

  onBack() {
    this.videoImage.videos.forEach((v: any) => {
      delete v.transformUrl;
    });
    if (this.userData) {
      this._auth.updateUserData(this.userData.id, {
        primaryVideoImage: this.videoImage,
      });
    }
    this._router.navigate(['/auth/athletic-information']);
  }

  reset(item: any, i: number, type: string) {
    let target;
    if (type === 'video') {
      this.dataForRemove.push({ name: item.url });
      target = this.videoImage.videos[i];
      target.transformUrl = '';
    } else {
      this.dataForRemove.push({ name: item.url });
      target = this.videoImage.images[i];
    }
    item.url = '';
    target.url = '';
    target.previewImage = '';
  }

  async preview(type: string, item: any) {
    console.log(item);

    this.loading$.next(true);
    try {
      if (item.file) {
        const fileDataURL: any = this._sanitizer.bypassSecurityTrustResourceUrl(
          URL.createObjectURL(item.file)
        );
        this.currentObject.url = fileDataURL;
      } else {
        this.currentObject.url = item.url;
      }
      this.currentObject.type = type;
      this.loading$.next(false);
    } catch (error) {
      console.error('Error processing file:', error);
    }
  }

  closeModal(event: any) {
    this.currentObject = { url: '', type: '' };
  }

  public async add(i: number, type: string, event: any): Promise<any> {
    try {
      if (type === 'video') {
        // const videoFile = await this.promptForVideo();
        const videoFile = event.target.files[0];
        console.log(videoFile);
        this.loading$.next(true);

        const blob = this.base64ToBlob(await this.generateThumbnail(videoFile));
        this.videoImage.videos[i].videoName = videoFile.name;
        this.videoImage.videos[i].file = videoFile;
        const previewImageName = `thumbnail_${Date.now()}_${Math.random()}.png`;
        this.videoImage.videos[i].previewImageName = previewImageName;
        this.selectedVideoFiles.push(videoFile);
        const previewImageFile = new File([blob], previewImageName, {
          type: 'image/png',
        });
        this.videoImage.videos[i].previewImage =
          this._sanitizer.bypassSecurityTrustResourceUrl(
            URL.createObjectURL(previewImageFile)
          );
        this.videoImage.videos[i].thumbnailFile = previewImageFile;
        return this.videoImage;
      } else {
        // const image = await this.promptForImage();
        const image = event.target.files[0];
        const imageDataURL = this._sanitizer.bypassSecurityTrustResourceUrl(
          URL.createObjectURL(image)
        );
        this.videoImage.images[i].file = image;
        this.videoImage.images[i].imageName = image.name;
        this.videoImage.images[i].previewImage = imageDataURL;
        this.selectedImageFiles.push(image);
        return this.videoImage;
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
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

  public promptForVideo(): Promise<File> {
    return new Promise<File>((resolve, reject) => {
      const fileInput: HTMLInputElement = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'video/mov, video/quicktime, video/*';

      fileInput.addEventListener('error', (event: Event) => {
        reject(new Error('Error selecting file'));
      });

      fileInput.addEventListener('change', async (event: Event) => {
        this.loading$.next(true);
        if (fileInput.files && fileInput.files.length > 0) {
          const file = fileInput.files[0];
          const fileReader = new FileReader();
          fileReader.onload = () => {
            resolve(file);
          };
          fileReader.onerror = () => {
            reject(new Error('Error reading file'));
          };
          fileReader.readAsArrayBuffer(file);
        } else {
          reject(new Error('No file selected'));
        }
      });

      fileInput.click();
    });
  }

  public promptForImage(): Promise<File> {
    return new Promise<File>((resolve, reject) => {
      const fileInput: HTMLInputElement = this.document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';

      fileInput.addEventListener('error', (event) => {
        reject(event.error);
      });

      fileInput.addEventListener('change', (event) => {
        if (fileInput.files) {
          resolve(fileInput.files[0]);
        }
      });

      fileInput.click();
    });
  }
  public async generateThumbnail(videoFile: Blob): Promise<string> {
    let timeoutDuration = 1000;
    if (videoFile.type.includes('quicktime') && this.isMobile && this.iOS()) {
      const videoSizeMB = videoFile.size / (1024 * 1024);
      // alert(videoSizeMB)
      if (videoSizeMB < 30) {
        timeoutDuration = videoSizeMB * 100;
      } else {
        timeoutDuration = videoSizeMB * 10;
      }
      // alert(timeoutDuration)
    }

    const video: HTMLVideoElement = await document.createElement('video');
    return new Promise<string>(async (resolve, reject) => {
      try {
        const url = await URL.createObjectURL(videoFile);
        video.src = url;
        video.preload = 'auto';
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        await video.addEventListener('loadeddata', async () => {
          video.currentTime = 1;
          await setTimeout(async () => {
            this.loading$.next(false);
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

        // if (videoFile.type.includes('quicktime') && this.isMobile && this.iOS()) {
        //   await video.addEventListener('loadedmetadata', async () => {
        //     video.currentTime = 1;
        //     await setTimeout(async () => {
        //       this.loading$.next(false);
        //       const canvas = await document.createElement('canvas');
        //       canvas.width = video.videoWidth;
        //       canvas.height = video.videoHeight;
        //       const context = await canvas.getContext('2d');
        //       if (context) {
        //         await context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        //         const thumbnail = await canvas.toDataURL();
        //         await URL.revokeObjectURL(url);
        //         resolve(thumbnail);
        //       } else {
        //         alert('Could not get canvas context');
        //         await URL.revokeObjectURL(url);
        //         reject(new Error('Could not get canvas context'));
        //       }
        //     }, timeoutDuration);
        //   })
        // }
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

  extractFilePathFromUrl(url: string) {
    const match = url.match(/o\/(.*?)\?alt=media/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
    return null;
  }

  async deleteFileByUrl(url: string) {
    const filePath = this.extractFilePathFromUrl(url);
    if (!filePath) {
      return;
    }

    const storageRef = this.storage.ref('');
    const fileRef = storageRef.child(filePath);

    try {
      await fileRef.delete();
      console.log(`File at ${url} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting file from Firebase Storage:', error);
    }
  }

  private async showPopup(): Promise<boolean> {
    const confirmSubmitDialogRef = await this._matDialog.open(
      ConfirmDialogComponent,
      {
        autoFocus: false,
        data: {
          title: 'SAVING...',
          message:
            'Media processing takes time and will be done shortly. Continue finishing profile!',
          info: '',
          firstButtonText: 'CONTINUE',
          secondButtonText: 'CANCEL',
          firstButtonColor: '#FFFFFF',
          secondButtonColor: '#FF0303',
          firstButtonBorder: '1px solid #fff',
          secondButtonBorder: '1px solid #fff',
          isShowLogo: false,
          titleColor: '#CCFF00',
        },
      }
    );
    const res = await firstValueFrom(confirmSubmitDialogRef.afterClosed());
    if (!res) {
      this.cancelUpload();
      return false;
    }
    return true;
  }

  cancelUpload(): void {
    this._auth.updateUserData(this.userData.id, {
      isSavingMedia: false,
    });
  }

  async onContinue() {
    if (!this.userData) return;
    const exsistVideo = this.videoImage.videos.find((v) => v.file);
    const exsistImage = this.videoImage.images.find((v) => v.file);
    let confirmSave;

    if (exsistImage || exsistVideo) {
      confirmSave = await this.showPopup();
      if (confirmSave) {
        this._auth.updateUserData(this.userData.id, {
          isSavingMedia: true,
        });
      } else {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        return;
      }
    }

    const deletionPromises = this.videoImage.videos.map(async (video, i) => {
      if (!video.url && this.dataForRemove[i]) {
        await this.deleteFileByUrl(this.dataForRemove[i].name);
      }
      delete video.transformUrl;
    });
    await Promise.all(deletionPromises);

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

    this._videoService
      .compressAndSaveVideo(data, videoFiles, imageFiles, thumbFiles)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res) => {
        console.log(res);
        this.saved$.next(true);
        setTimeout(() => {
          this.saved$.next(false);
        }, 1500);
      });

    if (this.flow === 'sign-up') {
      this._router.navigate(['/auth/stats']);
    } else {
      if (confirmSave) {
        this._router.navigate(['/edit-profile']);
      }
    }
  }

  async getLinkVideo(event: any, i: number) {
    this.videoImage.videos[i].transformUrl = this._makeVideoLink(event.value);
    this.videoImage.videos[i].url = event.value;
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

  onCloseProspectSheet(event: MouseEvent) {
    if (window.innerWidth >= 1280 && this.showProspectSheet) {
      const target = event.target as HTMLElement;
      if (target.classList.contains('prospect-sheet-container')) {
        this.showProspectSheet = false;
      }
    }
  }
}
