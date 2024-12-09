import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  Subject,
  filter,
  firstValueFrom,
  forkJoin,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Category, Template } from 'src/app/models/prospect';
import { OwnTemplate, User } from 'src/app/models/user';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog.component';
import { ProspectService } from 'src/app/shared/prospect.service';
import {
  SVG,
  Svg,
  Element as SVGElement,
  Text as SVGText,
} from '@svgdotjs/svg.js';
import '@svgdotjs/svg.draggable.js';
import '@svgdotjs/svg.filter.js';
import '@svgdotjs/svg.resize.js';
import '@svgdotjs/svg.panzoom.js';
import '@svgdotjs/svg.select.js';
import { Rect, Image as svgImage, G } from '@svgdotjs/svg.js';
import { CollegeLibraryService } from 'src/app/college-library/college-library.service';
import { transformToCollegeSport } from 'src/app/shared/utils';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {
  CroppImageDialogComponent,
  EditNameDialogComponent,
  PurchaseDialogComponent,
} from 'src/app/shared/dialogs';
import QrCodeWithLogo from 'qrcode-with-logos';
import { environment } from 'src/environments/environment';
// import { removeBackground, preload, Config } from '@imgly/background-removal';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Buffer } from 'buffer';
import { Circle } from '@svgdotjs/svg.js';
import { Polygon } from '@svgdotjs/svg.js';
import { Tspan } from '@svgdotjs/svg.js';
import { Text } from '@svgdotjs/svg.js';
import { text } from '@fortawesome/fontawesome-svg-core';
import { ColorPickerDirective } from 'ngx-color-picker';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss'],
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
          bottom: 0,
          position: 'absolute',
        })
      ),
      transition('void => *', [
        style({ height: '0px', opacity: 0, transform: 'translateY(100%)' }),
        animate(
          '300ms ease-out',
          style({ height: '*', opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition('* => void', [
        style({ height: '*', opacity: 1, transform: 'translateY(0)' }),
        animate(
          '300ms ease-out',
          style({ height: '0px', opacity: 0, transform: 'translateY(100%)' })
        ),
      ]),
    ]),
    trigger('slideUp', [
      state(
        'void',
        style({
          height: '0px',
          opacity: 0,
          display: 'none',
          overflow: 'hidden',
        })
      ),
      state(
        '*',
        style({
          height: '*',
          opacity: 1,
          overflow: 'auto',
          bottom: 0,
          position: 'absolute',
        })
      ),
      transition('void => *', [
        style({ height: '0px', opacity: 0, transform: 'translateY(100%)' }),
        animate(
          '300ms ease-out',
          style({ height: '*', opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition('* => void', [
        style({ height: '*', opacity: 1, transform: 'translateY(0)' }),
        animate(
          '300ms ease-out',
          style({ height: '0px', opacity: 0, transform: 'translateY(100%)' })
        ),
      ]),
    ]),
  ],
})
export class TemplateComponent implements OnInit, AfterViewInit, OnDestroy {
  state: boolean = true;
  category: Category;
  template: Template;

  categoryName: string;
  isShowEditing: boolean = false;
  isShowUseTemplate: boolean = true;
  heartUrl: string = 'assets/images/prospect/icon/heart.svg';
  favoriteTemplate: string[] = [];
  availableTemplate: string[] = [];
  previousQueryParam: any = {};
  categoryId: string;
  templateId: string;
  user$: Observable<User | null>;
  user: User;
  countTemplateFavorite: number = 0;
  _unsubscribeAll: Subject<void> = new Subject();
  loading$ = new BehaviorSubject<boolean>(false);
  saved$ = new BehaviorSubject(false);
  graphicName: string;
  isElementMoved: boolean = false;
  keyboardShortcutsInitialized = false;
  dragMoveTimeStamp = 0;
  currentPercentage: number;
  currentLineSpacingPercentage: number;
  currentLetterSpacingPercentage: number;
  showSuccess = false;
  notiContent = 'Added Under My Media';
  isSaved = false;
  currentAnglePercentage: number;
  currentDistancePercentage: number;
  currentBlurPercentage: number;
  currentBorderRadiusPercentage: number;
  currentBorderWeightPercentage: number;
  flipState: string;
  isShowQRCode: boolean = false;
  ownTemplates: OwnTemplate[] = [];
  collegeSport: any;
  taggedColleges: any;
  nameFilter: string | null = null;
  stateFilter: string | null = null;
  divisionFilter: string | null = null;
  conferenceFilter: string | null = null;
  taggedFilter = false;
  firstTapShare: boolean = true;
  isLogoClipped: boolean = false;
  isActive = false;
  toggleActive() {
    this.isActive = !this.isActive;
    setTimeout(() => {
      this.isActive = false;
    }, 100);
  }

  @ViewChild('svgContainer', { static: true }) svgContainer: ElementRef;
  @ViewChild('textEditor', { static: true }) textEditor: ElementRef;
  @ViewChild('fileInput', { static: true }) fileInput: ElementRef;
  @ViewChild('loadingTemplate', { static: true }) loadingTemplate: ElementRef;
  @ViewChild('shareTemplate', { static: true }) shareTemplate: ElementRef;

  private draw: Svg;
  private rectImage: Rect;
  private rectImageInDefs: Rect;
  private imageContainer: svgImage;
  fonts: string[] = [];
  selectedElement: SVGElement | any;
  selectedTextElement: SVGText;
  private history: { elements: SVGElement[]; defs: SVGElement[] }[] = [];
  private currentIndex: number = -1;
  private isCtrlPressed: boolean = false;
  private zoomLevel: number = 1;
  copiedElement: SVGElement | any;
  prevZoomLevel: number;
  selectedFile: File | null = null;
  viewBoxX: number = 0;
  viewBoxY: number = 0;
  centerX: number = 0;
  centerY: number = 0;
  originalLayerTranslateX: number = 0;
  originalLayerTranslateY: number = 0;
  private isPanning = false;
  private startDistance = 0;
  deleteButton: any;
  alignButton: any;
  alignmentIcon: string = 'assets/images/prospect/3x/Left-aligned.png';
  private lastTap = 0;
  private doubleTapDelay = 300; // milliseconds
  private tapPosition = { x: 0, y: 0 };
  isDoubleTap = false;
  isSingleTouch = false;
  currentAction = 'bringForward';
  currentActionText = 'Move Layer';
  keyWord: string;
  selectedIndex: number = -1;
  layers: any[] = [];
  textWrapperState: 'void' | '*' = 'void';
  mediaWrapperState: 'void' | '*' = 'void';
  logoWrapperState: 'void' | '*' = 'void';
  elementWrapperState: 'void' | '*' = 'void';
  textToolsState = {
    addTextBoxState: false,
    changeFontState: false,
    changeFontSizeState: false,
    changeColorState: false,
    changeBorderState: false,
    changeSpacingState: false,
    changeOpacityState: false,
    changeShadowState: false,
  };
  mediaToolsState = {
    flipState: 0,
    changeOpacityState: false,
    changeBorderState: false,
    changeFilterState: false,
    changeColorState: false,
  };
  shapes = [];
  vectors = [];
  images = [];
  private lastZoomLevel: number = 1;
  private zoomSmoothingFactor: number = 0.3;
  colleges: any;
  selectedElements = [];
  cropMode: boolean = false;
  private cropRect!: Rect;
  filter: any;
  mainFnBarState: boolean = true;
  textFnBarState: boolean = false;
  mediaFnBarState: boolean = false;
  elementFnBarState: boolean = false;
  defaultLabel: string;
  svgTranslateX: number;
  svgTranslateY: number;
  _unsubscribeALL: Subject<void> = new Subject();
  textStyle = {
    content: null,
    font: null,
    fontSize: null,
    borderType: 'none',
    borderWidth: 0,
    borderColor: '#000',
    fill: '#fff',
    letterSpacing: 0,
    lineSpacing: 0,
    opacity: 1,
    angle: 0,
    distance: 0,
    shadowColor: null,
    blur: 0,
  };
  textBorderSidePadding = 20; // equivalent to padding-left and padding-right
  maxValue = {
    fontSize: 400,
    borderWidth: 20,
    letterSpacing: 50,
    lineSpacing: 50,
    opacity: 1,
    angle: 20,
    distance: 20,
    blur: 20,
    borderRadius: 200,
  };
  imageStyle = {
    opacity: 1,
    borderType: null,
    borderWidth: 0,
    borderRadius: 0,
    borderColor: '',
    strokeDashX: 0,
    strokeDashY: 0,
  };
  private templateEdit;
  private originalStyle;
  private svgStyle;
  private initialViewBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null = null;

  isDownloading = false;
  isSharing = false;
  isSmallScreen = false;
  isDragging = false;
  touchStartSubscription: any;
  redirectBackUrl = '';
  initialPNG: any;
  rotationTimer: any;
  color: string | null = null;

  // logging flags
  isElementPositionLoggingEnabled = false;
  isEventLoggingEnabled = true;

  constructor(
    private _router: Router,
    private _auth: AuthService,
    private route: ActivatedRoute,
    private prospectService: ProspectService,
    private _matDialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private _collegeService: CollegeLibraryService,
    private storage: AngularFireStorage,
    private breakpointObserver: BreakpointObserver
  ) {
    this.user$ = this._auth.user$;
    this.initializeUserData();
    this.prevZoomLevel = 0;
  }

  ngAfterViewInit() {
    this.route.queryParams.subscribe((params) => {
      this.templateEdit = params['url'];
      this.graphicName = params['name'];
      this.redirectBackUrl = params['redirectBackUrl'];
    });

    this.route.params.subscribe(async (params) => {
      this.categoryId = params['categoryId'];
      this.templateId = params['templateId'];
      // this.location.replaceState(
      //   `media-pro/graphic-pro/${this.categoryId}/${this.templateId}`
      // );
      const currentTemplate = this.ownTemplates.find((template) => {
        return template.id === this.templateId;
      });
      const res = await fetch(this.template?.thumbnail);

      if (res && res.status != 404) {
        this.initialPNG = await res.blob();
      }
      this.getCategoryById();
    });

    this.adjustViewBox();
    this.setupKeyboardShortcuts();
    this.cdr.detectChanges();
  }

  async ngOnInit() {
    this.draw = SVG()
      .addTo(this.svgContainer.nativeElement)
      .size('100%', '100%');

    const viewBox = this.draw.viewbox();
    this.viewBoxX = viewBox.x;
    this.viewBoxY = viewBox.y;
    this.attachTouchEvents();
    this.getAllFonts();
    this.setupKeyboardShortcuts();
    this.isSmallScreen =
      this.breakpointObserver.isMatched('(max-width: 768px)');

    this.loading$.next(false);
  }

  getAllFonts() {
    let svgFontFace = '';
    this.prospectService.getAllFonts().subscribe((res) => {
      res.forEach((font) => {
        this.fonts.push(font.name.toUpperCase());
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
        const head = document.getElementsByTagName('head')[0];
        styleTag.type = 'text/css';
        head.appendChild(styleTag);
        svgFontFace += styleTag.innerHTML.toString();
      });
      this.svgStyle = svgFontFace;
      this.fonts = [...new Set(this.fonts)];
    });
  }

  getAllElements() {
    forkJoin([
      this.prospectService.getAllShape(),
      this.prospectService.getAllVector(),
      this.prospectService.getAllImage(),
    ]).subscribe((results) => {
      this.shapes = results[0];
      this.vectors = results[1];
      this.images = results[2];
    });
  }

  onOuterSvgClick(event: MouseEvent | TouchEvent) {
    const clickedElement = event.target as Element;
    const outerSvg = event.currentTarget as Element;
    const innerSvg = outerSvg.querySelector('svg');
    const childInnerSvg = innerSvg?.querySelector('svg');

    if (
      childInnerSvg &&
      !childInnerSvg.contains(clickedElement) &&
      !this.cropMode
    ) {
      this.handleOuterSvgClick();
    }
  }

  private handleOuterSvgClick() {
    console.log('Handling click outside inner SVG');
    this.isDoubleTap = false;
    this.onCloseTextFnBar();
    this.onCloseMediatFnBar();
    this.deselectElement();
    this.adjustViewBox();
  }

  private initializeUserData() {
    this.user$
      .pipe(
        takeUntil(this._unsubscribeAll),
        switchMap((user: any) => {
          this.user = user;
          this.ownTemplates = user.ownTemplates || [];
          const appSport =
            user.appSport === 'secondary'
              ? user.secondarySport
              : user.primarySport;
          this.collegeSport = transformToCollegeSport(appSport);
          this.taggedColleges = this.user?.taggedColleges
            ? this.user?.taggedColleges.reduce((acc: any, val: any) => {
                acc[val] = true;
                return acc;
              }, {})
            : {};
          return EMPTY;
        })
      )
      .subscribe();
  }

  changeTeamLogo(event: any) {
    const file = event.target.files[0];
    this.selectedFile = file;
    var mimeType = file.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (_event) => {
      this.checkTransparency(reader.result, (hastTransparency: boolean) => {
        this.isLogoClipped = !hastTransparency;
        if (hastTransparency) {
          this.selectedFile = file;
          if (this.selectedFile && this.user) {
            this.onUploadTeamLogo(this.user.id);
          }
        } else {
          this.openCroppImageDialog(reader.result);
        }
      });
    };
  }

  openCroppImageDialog(img: any) {
    const dialogRef = this._matDialog.open(CroppImageDialogComponent, {
      disableClose: true,
      data: {
        img,
      },
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.selectedFile = res;
        var reader = new FileReader();
        reader.readAsDataURL(res);
        reader.onload = async (_event) => {
          if (this.selectedFile && this.user) {
            this.onUploadTeamLogo(this.user.id);
          }
        };
      }
    });
  }

  onUploadTeamLogo(uid: string) {
    let filePath = `TeamsLogo/${uid}`;
    if (this.user?.completeAddSport && this.user.appSport === 'secondary') {
      filePath = `TeamsLogo/${uid}_secondarySport`;
    }
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(`${filePath}`, this.selectedFile);
    task.then((res) => {
      const downloadURL = fileRef.getDownloadURL();
      downloadURL.subscribe((url) => {
        if (url && this.user) {
          this.selectedFile = null;
          // this.imagePreview = url;
          if (
            !(this.user?.completeAddSport && this.user.appSport === 'secondary')
          ) {
            this._auth.updateUserData(this.user.id, {
              teamLogoImg: url.split('&token')[0] + `&time: ${Date.now()}`,
            });
          } else {
            this._auth.updateUserData(this.user.id, {
              secondarySportTeamLogoImg:
                url.split('&token')[0] + `&time: ${Date.now()}`,
            });
          }
          this.addLogoToSvg(url.split('&token')[0] + `&time: ${Date.now()}`); // Add this line
        }
      });
    });
  }

  // Method to add the logo to the SVG and select it
  addLogoToSvg(imageUrl: string) {
    const group = this.draw.group();

    // Create clipPath
    const clipPath = this.draw.clip();
    const clipRect = this.draw.rect(550, 700).move(0, 0);
    clipPath.add(clipRect);

    // Create image
    const image = this.draw.image(imageUrl).front();
    image.size(550, 700);

    // Apply clipPath for image
    image.clipWith(clipPath);

    // Add image to group
    group.add(image);

    // Create border for group
    const border = this.draw
      .rect(550, 700)
      .fill('none')
      .stroke({ color: 'none', width: 0 });
    group.add(border);

    const viewBox = this.draw.viewbox();
    const x = (viewBox.width - 150) / 2 + viewBox.x;
    const y = (viewBox.height - 300) / 2 + viewBox.y;
    group.move(x, y);
    border.move(x, y);
    clipRect.move(x, y);

    const random = Math.random().toString(36).substr(2, 9);
    group
      .draggable()
      .resize({ preserveAspectRatio: true, aroundCenter: true })
      .on('dragmove', (event) => {
        clipRect.move(image.bbox().x, image.bbox().y);
        this.isElementMoved = true;
      })
      .on('dragend', (event: any) => {
        if (this.isElementMoved) {
          // this.deselectElement();
          this.saveToHistory();
        }
        this.isElementMoved = false;
      })
      .on('resize', () => {
        const { x, y, width, height } = border.bbox();
        clipRect.move(x, y).size(width, height);
        this.saveToHistory();
      });
    border
      .draggable()
      .resize({ preserveAspectRatio: true, aroundCenter: true })
      .on('dragmove', (event) => {
        clipRect.move(image.bbox().x, image.bbox().y);
        this.isElementMoved = true;
      })
      .on('dragend', (event: any) => {
        if (this.isElementMoved) {
          // this.deselectElement();
          this.saveToHistory();
        }
        this.isElementMoved = false;
      })
      .on('resize', (event) => {
        this.logEvent('Group resize', event);
        const { x, y, width, height } = border.bbox();
        clipRect.move(x, y).size(width, height);
        image.move(x, y).size(width, height).transform(border.transform());
        this.saveToHistory();
      });
    border.id('Image' + random);
    image.id('Image' + random);
    clipPath.id('Image' + random);
    this.rectImage = border;
    this.rectImageInDefs = clipRect;
    this.layers.unshift(border);
    this.selectElement(group);

    this.saveToHistory();
  }

  getColleges(filters: any, taggedColleges: any) {
    this.loading$.next(true);

    const isTaggedEmpty = filters.tagged && !Object.keys(taggedColleges).length;

    if (isTaggedEmpty) {
      this.colleges = [];
      this.loading$.next(false);
      return;
    }
    this._collegeService
      .getFilteredColleges(filters, taggedColleges)
      .pipe(
        takeUntil(this._unsubscribeALL),
        tap(() => {
          this.loading$.next(false);
        })
      )
      .subscribe((res) => {
        this.colleges = res.sort((a: any, b: any) =>
          a.name.localeCompare(b.name)
        );
      });
  }

  onSearch() {
    this.getColleges(
      {
        sport: this.collegeSport,
        conference: this.conferenceFilter,
        state: this.stateFilter,
        division: this.divisionFilter,
        word: this.nameFilter,
        tagged: this.taggedFilter,
      },
      this.taggedColleges
    );
  }

  setPositionCenter(element: SVGElement) {
    const svgObject = document.getElementById('svgContent') as HTMLImageElement;
    const textEditObject = document.getElementById(
      'textEditor'
    ) as HTMLImageElement;

    const svgBoundingBox = svgObject.getBoundingClientRect();
    const textEditObjectBoundingBox = textEditObject.getBoundingClientRect();
    const actualWidth = svgBoundingBox.width;
    const actualHeight = svgBoundingBox.height;
    // const svgWidth = svgObject.attr('width') as number;
    // const svgHeight = svgObject.attr('height') as number;
    const elementBoxWidth = textEditObjectBoundingBox.width;
    const elementBoxHeight = textEditObjectBoundingBox.height;

    if (element.type === 'circle') {
      const centerX = (actualWidth - elementBoxWidth) / 2;
      const centerY = (actualHeight - elementBoxHeight) / 2;
      return { centerX, centerY };
    }
    // if (element.type === 'text') {
    //   const centerX = actualWidth / 2 - elementBoxWidth;
    //   const centerY = actualHeight + actualWidth - centerX / 2;
    //   return { centerX, centerY };
    // }
    const centerX = (actualWidth - elementBoxWidth) / 2 + this.svgTranslateX;
    const centerY = (actualHeight - elementBoxHeight) / 2 + this.svgTranslateY;
    return { centerX, centerY };
  }

  checkTransparency(
    image: any,
    callback: (hasTransparency: boolean) => void
  ): void {
    let img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      )?.data;

      // empty image
      if (!imageData || imageData.length == 0) {
        callback(false);
        return;
      }

      for (let i = 0; i < imageData.length * 0.99; i += 4) {
        if (imageData[i + 3] < 255) {
          callback(true);
          return;
        }
      }

      callback(false);
      return;
    };

    img.src = image;
  }

  selectImage(url: string, type: string) {
    this.prospectService.urlToBase64(url).subscribe({
      next: (base64) => {
        this.checkTransparency(base64, (hasTransparency: boolean) => {
          this.saveToHistory();
          this.addImageToSvg(base64, !hasTransparency);
          return;
        });
      },
      error: (error) => {
        console.error('Error converting URL to Base64', error);
      },
    });
  }

  applyFilter(filterType: string) {
    const filterMap: { [key: string]: (add: any) => void } = {
      blur: (add: any) => {
        // original CSS function: blur(5px)
        add.gaussianBlur(5);
      },
      brightness: (add: any) => {
        // original CSS function: brightness(150%)
        // this is not an exact substitute of brightness(150%)
        let slope = 2.2;
        let intercept = -0.03;
        add.componentTransfer({
          r: {
            type: 'linear',
            slope: slope,
            intercept: intercept,
          },
          g: {
            type: 'linear',
            slope: slope,
            intercept: intercept,
          },
          b: {
            type: 'linear',
            slope: slope,
            intercept: intercept,
          },
        });
      },
      contrast: (add: any) => {
        // original CSS function: conrast(200%)
        // this is not an exact substitute of conrast(200%) CSS function
        const slope = 1.7;
        const intercept = -(0.3 * slope) + 0.4;
        add.componentTransfer({
          r: {
            type: 'linear',
            slope: slope,
            intercept: intercept,
          },
          g: {
            type: 'linear',
            slope: slope,
            intercept: intercept,
          },
          b: {
            type: 'linear',
            slope: slope,
            intercept: intercept,
          },
        });
      },
      hueRotate: (add: any) => {
        // original CSS function: hue-rotate(90deg)
        add.colorMatrix('hueRotate', 90);
      },
      dropShadow: (add: any) => {
        // original CSS function: drop-shadow(8px 8px 10px rgba(0,0,0,0.5))
        // this filter is not being used anymore
      },
      grayscale: (add: any) => {
        // original CSS function: grayscale(100%)
        add.colorMatrix('saturate', 0);
      },
      invert: (add: any) => {
        // original CSS function: invert(100%)
        add.colorMatrix(
          'matrix',
          [-1, 0, 0, 0, 1, 0, -1, 0, 0, 1, 0, 0, -1, 0, 1, 0, 0, 0, 1, 0]
        );
      },
      saturate: (add: any) => {
        // original CSS function: saturate(200%)
        add.colorMatrix(
          'matrix',
          [
            1.85, -0.775, -0.078, 0.0, 0.0, -0.231, 1.31, -0.078, 0.0, 0.0,
            -0.231, -0.775, 2.01, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0,
          ]
        );
      },
      sepia: (add: any) => {
        // original CSS function: sepia(100%)
        add.colorMatrix(
          'matrix',
          [
            0.343, 0.669, 0.119, 0, 0, 0.249, 0.626, 0.13, 0, 0, 0.172, 0.334,
            0.111, 0, 0, 0.0, 0.0, 0.0, 1, 0,
          ]
        );
      },
    };

    const filter = filterMap[filterType];

    if (filter) {
      this.imageContainer.filterWith(filter);
    } else {
      this.imageContainer.unfilter();
    }
  }

  getCategoryById() {
    this.prospectService
      .getCategoryById(this.categoryId, this.templateId)
      .pipe(
        tap((res) => this.handleCategoryResponse(res)),
        switchMap(() => this._auth.user$),
        filter((res) => !!res),
        takeUntil(this._unsubscribeAll),
        switchMap((user) => this.handleUserResponse(user))
      )
      .subscribe();
  }

  handleUserResponse(user: any) {
    this.user = user;
    this.favoriteTemplate = this.user.favoriteTemplate || [];
    this.availableTemplate = this.user.availableTemplate || [];
    this.updateHeartUrl();
    if (this.availableTemplate.includes(this.templateId)) {
      this._matDialog.closeAll();
      if (!this.isSaved) {
        this._matDialog.open(ConfirmDialogComponent, {
          autoFocus: false,
          data: {
            title: '',
            isShowLogo: true,
            isShowButton: false,
            htmlContent: this.loadingTemplate.nativeElement.innerHTML,
          },
        });
      }
      let svgTemplate;
      if (!this.templateEdit) {
        svgTemplate = this.template.svg;
      } else {
        svgTemplate = this.templateEdit;
        this.route.queryParams.subscribe((params) => {
          this.template.qrCode = params['qrCode'] === 'true' ? true : false;
          this.template.width = params['width'];
          this.template.height = params['height'];
        });
      }
      this.isShowUseTemplate = false;

      if (!svgTemplate) {
        this.loading$.next(false);
        this._matDialog.closeAll();
        return EMPTY;
      }
      if (this.isSaved) {
        return EMPTY;
      }
      return this.prospectService.fetchSVGContent(svgTemplate).pipe(
        tap((svgContent) => {
          this.handleSVGContent(svgContent);
          const gElement =
            this.svgContainer.nativeElement.querySelector('g[transform]');
          if (gElement) {
            const transformValue = gElement.getAttribute('transform');
            let translateX = 0;
            let translateY = 0;

            const translateMatch = transformValue.match(/translate\(([^)]+)\)/);

            if (translateMatch) {
              const values = translateMatch[1].split(' ');
              translateX = parseFloat(values[0]) || 0;
              translateY = parseFloat(values[1]) || 0;
            } else {
              const matrixMatch = transformValue.match(/matrix\(([^)]+)\)/);
              if (matrixMatch) {
                const values = matrixMatch[1].split(',');
                translateX = parseFloat(values[4]) || 0;
                translateY = parseFloat(values[5]) || 0;
              }
            }

            this.svgTranslateX = translateX;
            this.svgTranslateY = translateY;
          } else {
            this.svgTranslateX = 0;
            this.svgTranslateY = 0;
          }
          this._matDialog.closeAll();

          this.originalStyle = this.draw
            .nested()
            .defs()
            .findOne('style')?.node.innerHTML;
          if (this.originalStyle) {
            this.originalStyle = this.originalStyle + this.svgStyle;
          } else {
            this.originalStyle = this.svgStyle;
          }
          if (this.draw.nested().defs().findOne('style')) {
            this.draw.nested().defs().findOne('style').node.innerHTML =
              this.originalStyle;
          } else {
            this.draw.nested().defs().style().node.innerHTML =
              this.originalStyle;
          }
        })
      );
    } else {
      this.isShowEditing = false;
      this.loading$.next(false);
      return EMPTY;
    }
  }

  async handleCategoryResponse(res: any) {
    this.category = res;
    this.categoryName = this.category.name;
    this.template = this.category.templates?.find(
      (t: any) => t.id === this.templateId
    );
    if (!this.template) {
      this.route.queryParams.subscribe((params) => {
        this.template = {
          qrCode: params['qrCode'],
          width: params['width'],
          height: params['height'],
        };
      });
    } else {
      const res = await fetch(this.template?.thumbnail);
      this.initialPNG = await res.blob();
    }
    this.countTemplateFavorite = this.template?.favorite || 0;
  }

  private handleSVGContent(svgContent: string) {
    this.svgContainer.nativeElement.style.visibility = 'hidden';
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;
    const serializedSVG = new XMLSerializer().serializeToString(svgElement);
    this.loadSVG(serializedSVG);
    this.isShowEditing = true;
    setTimeout(() => {
      this.adjustViewBox();
      this.svgContainer.nativeElement.style.visibility = 'visible';
    }, 0);
  }
  private adjustViewBox() {
    const element = this.svgContainer.nativeElement.getBoundingClientRect();
    const containerWidth = element.width;
    const containerHeight = element.height;

    if (containerWidth && containerHeight) {
      const svgElement = this.svgContainer.nativeElement.querySelector('svg');
      if (svgElement) {
        const templateWidth = parseFloat(this.template.width.toString());
        const templateHeight = parseFloat(this.template.height.toString());

        if (templateWidth && templateHeight) {
          // Determine the zoom level based on the screen width
          const screenWidth = window.innerWidth;
          const isDesktop = screenWidth > 1280;
          const zoomLevelFactor = isDesktop ? 0.75 : 0.9; // Adjust the factor for desktop screens

          const minZoomLevelWidth = containerWidth / templateWidth;
          const minZoomLevelHeight = containerHeight / templateHeight;
          const minZoomLevel = Math.min(minZoomLevelWidth, minZoomLevelHeight);

          this.zoomLevel = this.state
            ? minZoomLevel * zoomLevelFactor
            : minZoomLevel;

          // Check if any state is active and adjust the zoom level
          if (
            this.textWrapperState === '*' ||
            this.mediaWrapperState === '*' ||
            this.logoWrapperState === '*' ||
            this.elementWrapperState === '*'
          ) {
            this.zoomLevel *= 0.9;
          }

          // Calculate viewBox dimensions
          let viewBoxWidth = containerWidth / this.zoomLevel;
          let viewBoxHeight = containerHeight / this.zoomLevel;

          // Center the template
          let x = (templateWidth - viewBoxWidth) / 2;
          let y = (templateHeight - viewBoxHeight) / 2;

          if (isDesktop) {
            const verticalShift = (viewBoxHeight - containerHeight) * 0.1; // Adjust this factor as needed
            y += verticalShift;
          }

          // Apply vertical shift if any state is active
          if (
            this.textWrapperState === '*' ||
            this.mediaWrapperState === '*' ||
            this.logoWrapperState === '*' ||
            this.elementWrapperState === '*'
          ) {
            const verticalShift = 150; // Adjust this value as needed
            y += verticalShift;
            console.log('Slide popup active verticalShift:', verticalShift);
            console.log('y after slide popup shift:', y);
          }

          svgElement.setAttribute(
            'viewBox',
            `${x} ${y} ${viewBoxWidth} ${viewBoxHeight}`
          );
        }
      }
    }
  }

  private updateHeartUrl() {
    if (!this.favoriteTemplate.includes(this.templateId)) {
      this.heartUrl = 'assets/images/prospect/icon/heart.svg';
    } else {
      this.heartUrl = 'assets/images/prospect/icon/heart-mark.svg';
    }
  }

  loadSVG(svgContent: string) {
    if (!svgContent) {
      console.error('SVG content is empty or null.');
      return;
    }
    try {
      this.draw.clear();
      const loadedSVG = this.draw.svg(svgContent);
      if (!loadedSVG) {
        console.error('Failed to load SVG content');
        return;
      }
      this.layers = [];

      const idCounter = {
        text: {},
        tspan: {},
        image: 0,
        rect: 0,
        circle: 0,
        background: 0,
      };
      this.draw.find('*').forEach((element: SVGElement, index: number) => {
        this.syncLayerIds(element, idCounter);
        if (element.type == 'text') {
          this.normalizeCoordinates(element);
        }
        this.layers.unshift(element);
      });
      this.filterLayer();
      this.layers.forEach((layer, index) => {
        this.enableInteraction(layer);
      });
      this.saveToHistory();
    } catch (error) {
      console.error('Error loading SVG:', error);
    }
  }

  saveToHistory() {
    const elementsSnapshot = this.draw
      .children()
      .filter((child) => child.type !== 'defs')
      .map((child) => this.cloneWithSameId(child));

    const defsSnapshot = this.draw
      .defs()
      .children()
      .map((def) => this.cloneWithSameId(def));

    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    this.history.push({ elements: elementsSnapshot, defs: defsSnapshot });
    this.currentIndex = this.history.length - 1;
  }

  private cloneWithSameId(element: SVGElement): SVGElement {
    const clone = element.clone();
    const originalId = element.attr('id');
    if (originalId) {
      clone.attr('id', originalId);
    }
    if (element.children && element.children().length > 0) {
      element.children().forEach((child, index) => {
        const clonedChild = this.cloneWithSameId(child);
        clone.children()[index] = clonedChild;
      });
    }

    return clone;
  }

  restoreFromHistory() {
    this.draw.clear();
    this.layers = [];

    const { elements: elementsSnapshot, defs: defsSnapshot } =
      this.history[this.currentIndex];

    const defs = this.draw.defs();
    defsSnapshot.forEach((def: SVGElement) => {
      def.addTo(defs);
    });

    elementsSnapshot.forEach((element: SVGElement, index: number) => {
      const restoredElement = element.addTo(this.draw);
      this.processRestoredElement(restoredElement, index);
    });

    this.filterLayer();
    this.layers.forEach((layer, index) => {
      this.enableInteraction(layer);
    });
  }

  private processRestoredElement(element: SVGElement, index: number) {
    if (element.children) {
      element
        .children()
        .forEach((child) => this.processRestoredElement(child, index));
    }
    const idCounter = {
      text: {},
      tspan: {},
      image: 0,
      rect: 0,
      circle: 0,
      background: 0,
    };
    this.syncLayerIds(element, idCounter);
    this.layers.unshift(element);
  }

  private syncLayerIds(element: SVGElement, idCounter: any) {
    if (
      !['desc', 'filter', 'g', 'pattern', 'defs', 'svg', 'clipPath'].includes(
        element.type
      )
    ) {
      if (element.type === 'text') {
        const tspan = element.find('tspan')[0]; //.first();
        element.css({ fontWeight: '400' });
        if (tspan) {
          const textContent = tspan.node.textContent.replaceAll(/[\s|/]/g, '');
          if (!idCounter.text[textContent]) {
            idCounter.text[textContent] = 1;
          } else {
            idCounter.text[textContent]++;
          }
          const count = idCounter.text[textContent];
          const newTextId =
            count === 1 ? `${textContent}` : `${textContent} ${count}`;
          element.id(this.convertToValidId(newTextId));
        }
      } else if (element.type === 'tspan') {
        const tspanContent = element.node.textContent.replaceAll(/[\s|/]/g, '');
        element.parent().css({ fontWeight: '400' });
        element.css({ fontWeight: '400' });
        if (!idCounter.tspan[tspanContent]) {
          idCounter.tspan[tspanContent] = 1;
        } else {
          idCounter.tspan[tspanContent]++;
        }
        const count = idCounter.tspan[tspanContent];
        const newTextId =
          count === 1 ? `${tspanContent}Tspan` : `${tspanContent}Tspan${count}`;
        element.id(this.convertToValidId(newTextId));
      } else if (element.type === 'image') {
        const width = parseFloat(element.attr('width'));
        const height = parseFloat(element.attr('height'));
        if (
          width == parseInt(this.template.width.toString()) ||
          height == parseInt(this.template.height.toString())
        ) {
          idCounter.background++;
          const count = idCounter.background;
          const newId = count === 1 ? 'Background' : `Background${count}`;
          element.id(newId);
        } else {
          idCounter.image++;
          const count = idCounter.image;
          const newId = count === 1 ? 'Image' : `Image${count}`;
          element.id(newId);
        }
      } else if (element.type === 'rect') {
        idCounter.rect++;
        const count = idCounter.rect;
        const fill = element.attr('fill') || 'none';
        const newId = count === 1 ? `Rect_${count}` : `Rect${count}_${count}`;
        element.id(newId);
      } else if (element.type === 'circle') {
        idCounter.circle++;
        const count = idCounter.circle;
        const fill = element.attr('fill') || 'none';
        const newId =
          count === 1 ? `Circle_${count}` : `Circle${count}_${count}`;
        element.id(newId);
      } else {
        element.id(`Default${Math.random().toString(36).substr(2, 9)}`);
      }
    }
  }

  private filterLayer() {
    this.layers = this.layers.filter(
      (layer) =>
        ![
          'feGaussianBlur',
          'feOffset',
          'feComposite',
          'feFlood',
          'use',
          'desc',
          'style',
          'filter',
          'g',
          'pattern',
          'defs',
          'H3',
          'DIV',
          'svg',
          'clipPath',
        ].includes(layer.type)
    );
  }

  attachTouchEvents() {
    const svgElement = this.svgContainer.nativeElement;
    const touchEventHandler = (event) => {
      switch (event.type) {
        case 'touchstart':
          this.onTouchStart(event);
          break;
        case 'touchmove':
          this.onTouchMove(event);
          break;
      }
    };

    svgElement.addEventListener('touchstart', touchEventHandler);
    svgElement.addEventListener('touchmove', touchEventHandler);
  }

  enableInteraction(element: SVGElement | any) {
    console.log(element, 'any element');
    if (!element) {
      console.warn('Element is not an instance of SVG.Element:', element);
      return;
    }

    let oldBoxWidth = 0;
    const resizeOptions =
      element.type === 'rect'
        ? { preserveAspectRatio: false, aroundCenter: false }
        : { preserveAspectRatio: true, aroundCenter: true };

    element
      .draggable()
      .resize(resizeOptions)
      .on('beforedrag', (event: any) => {
        //this.logEvent('BeforeDrag', event);
      })
      .on('resize', (event: any) => {
        if (['image', 'path', 'rect'].includes(element.type)) {
          if (event.detail.eventType == 'rot') {
            this.logEvent('element resize', event.detail);
          }

          element.move(
            this.originalLayerTranslateX,
            this.originalLayerTranslateY
          );
        }
        if (['text', 'tspan'].includes(element.type)) {
          if (event.detail.eventType == 'rot') {
            return;
          }
          if (event.detail.box?.width > oldBoxWidth) {
            this.textStyle.fontSize = parseFloat(this.textStyle.fontSize) + 10;
          }
          if (event.detail.box?.width < oldBoxWidth) {
            this.textStyle.fontSize = parseFloat(this.textStyle.fontSize) - 10;
          }
          oldBoxWidth = event.detail.box?.width;

          this.updateTspans(this.selectedElement, (tspan) => {
            tspan.attr({ 'font-size': this.textStyle.fontSize });
          });

          if (event.detail.originalBox) {
            const currentTransform = element.transform();

            const scaleX = event.detail.originalBox
              ? event.detail.box.width / event.detail.originalBox.width
              : 1;

            const scaleY = event.detail.originalBox
              ? event.detail.box.height / event.detail.originalBox.height
              : 1;
            const translateX = currentTransform.translateX;
            const translateY = currentTransform.translateY;

            const newTransform = `matrix(${scaleX}, ${currentTransform.b}, ${currentTransform.c}, ${scaleY}, ${translateX}, ${translateY})`;

            element.attr({ transform: newTransform });
          }
        }
        this.saveToHistory();
      })
      .on('dblclick', (event) => {
        this.isDoubleTap = true;
        const { centerX, centerY } = this.setPositionCenter(element);
        this.tapPosition = {
          x: centerX,
          y: centerY,
        };
        this.selectElement(element);
        event.stopPropagation();
      })
      .on('dragstart', (event) => {
        this.isDragging = true;
        this.selectElement(element);
      })
      .on('dragmove', (event: any) => {
        // ignoring first dragmove event to prevent false firing on touchstart event
        const timeStampDiff = event.timeStamp - this.dragMoveTimeStamp;
        this.dragMoveTimeStamp = event.timeStamp;
        if (timeStampDiff > 300) {
          return;
        }

        this.isElementMoved = true;

        if (['tspan'].includes(element.type)) {
          const textLayer = element.parent() as Text;
          textLayer.move(element.bbox().x, element.bbox().y);

          this.updateTspans(
            this.selectedElement,
            (tspan) => {
              tspan.x(event.detail.box.x);
            },
            true
          );

          const borderElement = this.draw.findOne(
            `#${this.convertToValidId(element.id())}-border`
          );
          if (borderElement) {
            const borderLayer = borderElement as SVGElement;
            borderLayer.move(
              element.bbox().x - this.textBorderSidePadding,
              element.bbox().y
            );
          }
        }
      })
      .on('dragend', (event: any) => {
        event.preventDefault();
        // ignoring first dragend event to prevent false firing on touchstart event
        if (event.timeStamp - this.dragMoveTimeStamp > 500) {
          return;
        }

        if (this.isDragging) {
          console.log('Drag end');
          this.isDragging = false;
          if (this.isElementMoved) {
            // this.deselectElement();
            this.saveToHistory();
          }
          this.isElementMoved = false;
        }
      })
      .on('touchstart', (event) => {
        event.stopPropagation();
        this.onTouchStart(event, element);
        event.preventDefault();
      });
  }

  selectElement(element: any, index = -1): void {
    // ignoring attempt to select an element if this element is already selected now,
    // this resolves the double border issue on iOS because TouchStart event fires simultaneously with dragstart event
    if (
      //!this.isDoubleTap &&
      this.selectedElement &&
      (this.selectedElement.id() == element.id() ||
        `${this.selectedElement.id()}Tspan` == element.id())
    ) {
      return;
    }

    if (this.cropMode) {
      this.toggleCropMode();
      this.deselectElement();
    }

    this.deselectElement();
    this.resetLayerFunctionality();
    this.selectedElements.push(element);
    this.selectedIndex = index;
    this.selectedElement = element;

    const selectedObject = {
      createHandle: (group, p, index, pointArr) => {
        group
          .circle(25)
          .css({ stroke: '#fff', fill: '#fff' })
          .draggable()
          .resize();
      },
      updateHandle: (group, p, index, pointArr) => {
        const updatedX = p[0] + this.svgTranslateX;
        const updatedY = p[1] + this.svgTranslateY;
        pointArr[index] = [updatedX, updatedY];
        group.center(updatedX, updatedY);
        const updatedPoints = pointArr
          .map((point) => point.join(','))
          .join(' ');
        document
          .querySelector('polygon')
          ?.setAttribute('points', updatedPoints);
      },
      createRot: (group: any) => {
        const rotateGroup = group.group();
        rotateGroup
          .circle(55)
          .css({ strokeWidth: '2px', stroke: '#fff', fill: '#fff' });
        rotateGroup
          .text('\u21bb')
          .font({ size: 74, family: 'Arial', anchor: 'middle', fill: '#000' })
          .move(6, -20);
      },
      updateRot: (group, rotPoint) => {
        const updatedX = rotPoint[0] + this.svgTranslateX;
        const updatedY = rotPoint[1] + this.svgTranslateY - 50;
        group.center(updatedX, updatedY);
      },
    };

    if (!element) return;

    const { type, node } = element;
    const isTextOrTspan = type === 'text' || type === 'tspan';

    const currentTransform = element.transform();
    const parent = element.parent();

    const isNotClipPathOrPattern =
      !parent || !['clipPath', 'pattern'].includes(parent.type);

    if (isTextOrTspan) {
      this.selectedElement =
        type === 'text'
          ? element
          : this.layers.find(
              (layer) => layer.node.id === node.id.replace('Tspan', '')
            );
      this.selectedTextElement =
        type === 'text'
          ? this.layers.find((layer) => layer.node.id === `${node.id}Tspan`)
          : element;

      this.originalLayerTranslateX = currentTransform?.translateX || 0;
      this.originalLayerTranslateY = currentTransform?.translateY || 0;
      console.log(type, this.isDoubleTap);

      const className = this.selectedElement?.attr('class');
      const elm = className
        ? (document.getElementsByClassName(className)[0] as HTMLElement)
        : null;

      const computedStyle = elm ? window.getComputedStyle(elm) : null;
      if (computedStyle) {
        this.textStyle.fontSize = computedStyle.fontSize.replace('px', '');
        this.textStyle.font = computedStyle.fontFamily;
      } else if (this.selectedElement) {
        this.textStyle.fontSize = this.selectedElement.attr('font-size');
        this.textStyle.font = this.selectedElement.attr('font-family');
      }

      if (this.selectedElement) {
        console.log('Selected Element:', this.selectedElement);
        this.selectedElement.select(selectedObject);
      } else {
        console.error('selectedElement is not defined');
      }

      this.openTextFnBar();
      this.onCloseMediatFnBar();
      this.closeTextToolArea();
      this.closeMediaToolArea();
      this.mediaFnBarState = false;

      this.rescaleSelectHandles();
    } else if (
      ['image', 'rect', 'path'].includes(type) &&
      isNotClipPathOrPattern
    ) {
      this.imageContainer = element;
      this.selectedElement = element;
      this.selectedElement.select(selectedObject);
      this.originalLayerTranslateX = currentTransform?.translateX || 0;
      this.originalLayerTranslateY = currentTransform?.translateY || 0;
      //this.normalizeCoordinates(this.selectedElement);
      // if (
      //   (element.type === 'rect' ||
      //     element.type === 'image' ||
      //     element.type === 'path') &&
      //   this.isDoubleTap
      // ) {
      //   const fileIP = this.fileInput.nativeElement;
      //   fileIP.click();
      //   // this.selectElement(element);
      //   return;
      // }
      this.onCloseTextFnBar();
      this.closeTextToolArea();
      this.openMediaFnBar();
      this.closeMediaToolArea();
      this.textFnBarState = false;
      this.rescaleSelectHandles();
    }
  }

  deselectElement(): void {
    if (this.selectedElement) {
      this.selectedElement?.select(false);
    }
    this.selectedElements.forEach((element) => {
      if (element && element.type !== 'feColorMatrix') {
        element?.select(false);
      }
    });
    // this.draw.find('*').forEach((element) => {
    //   if (element && element.type !== 'feColorMatrix') {
    //     element?.select(false);
    //   }
    // });

    this.draw.find(`#CropRect`).forEach((element) => {
      element?.remove();
    });

    this.selectedElement = null;
    this.selectedTextElement = null;
    this.imageContainer = null;
    this.rectImage = null;
    this.rectImageInDefs = null;
    this.selectedIndex = -1;
    this.cropMode = false;
    this.textEditor.nativeElement.style.display = 'none';
    this.resetToolStates();
    this.textFnBarState = false;
    this.mediaFnBarState = false;
    this.mainFnBarState = true;
    this.textWrapperState = 'void';
    this.mediaWrapperState = 'void';
    this.logoWrapperState = 'void';
    this.elementWrapperState = 'void';
    // this.adjustViewBox();
    // this.originalNextSibling = null;
    // this.originalParentNode = null;
  }

  deleteElement() {
    if (this.selectedElement) {
      const layerId = this.selectedElement.node.id;
      this.layers = this.layers.filter((layer) => layer.node.id !== layerId);
      const deleteId = this.selectedElement.id();
      this.draw.find(`#${deleteId}`).forEach((element) => {
        element?.remove();
      });

      this.selectedElement?.select(false);
      this.selectedElement?.remove();
      this.selectedElement = null;
      this.selectedTextElement?.remove();
      this.selectedTextElement = null;

      const layers = document.querySelectorAll('.layer');
      layers.forEach((layer) => {
        const span = layer.querySelector('.layer-name');
        if (span && span.textContent.trim() === layerId) {
          layer.remove();
        }
      });

      this.onCloseMediatFnBar();
      this.onCloseTextFnBar();
      this.mainFnBarState = true;
      this.deselectElement();
      this.saveToHistory();
    }
  }

  editContent() {
    this.enableTextEditing();
  }

  enableTextEditing() {
    if (!this.selectedElement) {
      console.error('selectedElement is not defined');
      return;
    }

    const childTspans = this.selectedElement
      .children('tspan')
      .map((tspan) => tspan.node?.innerHTML);
    const tspanString = childTspans.join('\n');

    //const bbox = this.selectedElement.bbox(); // Get the bounding box of the selected element
    const editor = this.textEditor.nativeElement;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const editorWidth = 200;
    const editorHeight = 50;

    let x = this.tapPosition.x - editorWidth / 2;
    let y = this.tapPosition.y + 10;

    if (x < 0) x = 0;
    if (x + editorWidth > viewportWidth) x = viewportWidth - editorWidth;
    if (y + editorHeight > viewportHeight) y = viewportHeight - editorHeight;

    editor.style.left = `calc(50% - ${editorWidth / 2}px)`; //`${x}px`;
    editor.style.top = '50%'; //`${y}px`;
    editor.style.width = `${editorWidth}px`;
    editor.style.height = `${editorHeight}px`;
    editor.style.fontSize = '16px';
    editor.style.fontFamily = 'Rajdhani';
    // editor.style.fontFamily = this.selectedElement.attr('font-family');
    editor.style.color = '#ffffff';
    editor.style.backgroundColor = 'rgba(0, 0, 0, .5)';
    editor.style.border = '1px solid #fff';
    editor.style.padding = '0';
    editor.style.overflow = 'hidden';
    // editor.style.position = 'absolute'; // Ensure it's positioned absolutely
    editor.style.display = 'block';

    // Set the value of the editor to the existing text or a placeholder
    editor.value = tspanString || 'Your Text Box';
    editor.focus();

    // Update text content on input change
    editor.oninput = () => this.updateTextContent();
  }

  stripGenderFromSport(sport: string): string {
    return sport.replace(/(mens|womens)$/i, '').trim();
  }

  duplicateSelectedElement(): void {
    if (this.selectedElement) {
      const random = Math.random().toString(36).substr(2, 9);
      const id =
        `Clone${this.convertToValidId(this.selectedElement.node.id)}` + random;

      const clonedElement = this.selectedElement.clone().dmove(30, 30);
      clonedElement.id(id);
      const firstTransformedG = this.draw.findOne('g[transform]') as G;
      const group =
        firstTransformedG?.group() ??
        (this.selectedElement.parent('g') as G).group();
      // group.attr(
      //   'transform',
      //   `translate(${this.svgTranslateX} ${this.svgTranslateY})`
      // );

      group.add(clonedElement);

      if (clonedElement.type === 'text') {
        // if the cloned element is <text> we need to enable interactions for the child <tspan>
        const tspan = clonedElement.tspan(this.selectedTextElement.text());
        tspan.id(`${id}Tspan`);
        this.enableInteraction(clonedElement);
        this.enableInteraction(tspan);
        this.layers.unshift(tspan);
      } else if (clonedElement.type !== 'tspan') {
        this.enableInteraction(clonedElement);
      }

      this.layers.unshift(clonedElement);
      clonedElement.front();

      const svgs = this.draw.find('svg');
      if (svgs.length > 1) {
        const secondSvg = svgs[1];
        const gElements = secondSvg.find('g');
        if (gElements.length > 1) {
          gElements[1].add(clonedElement);
          console.log(
            'Cloned element added to second <g> element in second SVG'
          );
        } else {
          console.error('Second <g> element not found within the second SVG');
        }
      } else {
        console.error('Second SVG element not found');
      }

      this.selectedIndex = 0;
      this.selectElement(clonedElement);
      this.saveToHistory();
    }
  }

  openShadowTool() {
    this.closeTextToolArea();
    this.textWrapperState = '*';
    this.defaultLabel = '';

    this.currentAnglePercentage =
      (this.textStyle.angle / this.maxValue.angle) * 100;
    this.currentDistancePercentage =
      (this.textStyle.distance / this.maxValue.distance) * 100;
    this.currentBlurPercentage =
      (this.textStyle.blur / this.maxValue.blur) * 100;

    this.textToolsState.changeShadowState = true;
    this.adjustViewBox();
  }

  addShadowToSelectedElement(): void {
    this.currentAnglePercentage =
      (this.textStyle.angle / this.maxValue.angle) * 100;
    this.currentDistancePercentage =
      (this.textStyle.distance / this.maxValue.distance) * 100;
    this.currentBlurPercentage =
      (this.textStyle.blur / this.maxValue.blur) * 100;

    if (
      this.currentAnglePercentage == 0 &&
      this.textStyle.distance == 0 &&
      this.textStyle.blur == 0
    ) {
      this.selectedElement.unfilter();
    } else {
      this.selectedElement.filterWith((add: any) => {
        add.element('feDropShadow').attr({
          dx: this.textStyle.angle,
          dy: this.textStyle.distance,
          stdDeviation: this.textStyle.blur,
          'flood-color': this.textStyle.shadowColor,
        });
      });
    }
  }

  updateShadow() {
    this.addShadowToSelectedElement();
  }

  updateTextContent() {
    const textLines = this.textEditor.nativeElement.value.split('\n');

    // removing last text line if it's empty
    if (textLines[textLines.length - 1].trim() == '') {
      textLines.slice(0, -1);
    }

    // setting whitespace into the first <tspan> if input is empty
    if (!textLines || textLines.length == 0) {
      this.selectedTextElement.text(' ');
    }

    // ID of <text> is first 20 chars of the first line of the text
    const textId = this.convertToValidId(textLines[0].slice(0, 20));

    // updating the first <tspan> only if its content actually changed
    if (textLines[0] != this.selectedTextElement.text()) {
      this.selectedTextElement.text(textLines[0]);
      this.selectedTextElement.id(`${textId}Tspan`);
      this.selectedElement.id(textId);
    }

    // check if the <text> was already multi-line
    const isMultiLineAlreaady = this.selectedElement.children().length > 1;

    // calling newLine() function only if the <text> was single-line
    // this will help to minimize issues with some fonts if they are assigned via CSS classes
    if (textLines.length > 1 && !isMultiLineAlreaady) {
      (this.selectedTextElement as Tspan).newLine();
    }

    // removing all <tspan>s within the selected <text> except the very first one
    this.updateTspans(
      this.selectedElement,
      (tspan) => {
        tspan.remove();
      },
      true
    );

    // adding new lines to <text>
    for (let i = 1; i < textLines.length; i++) {
      let tspan = this.draw.text('').tspan(textLines[i]).newLine();
      tspan.id(`${textId}Tspan${i}`);
      tspan.dy('1.15em'); // todo: this should correspond to the current line spacing of the <text>
      tspan.x(this.selectedTextElement.x());
      tspan.attr('font-family', this.selectedTextElement.attr('font-family'));
      tspan.attr('font-size', this.selectedTextElement.attr('font-size'));
      tspan.addTo(this.selectedElement);
    }
  }

  markFavorite() {
    const isFavorited = this.favoriteTemplate.includes(this.templateId);
    const heartUrlPath = 'assets/images/prospect/icon/';
    const heartIcons = {
      default: `${heartUrlPath}heart.svg`,
      marked: `${heartUrlPath}heart-mark.svg`,
    };

    if (isFavorited) {
      this.favoriteTemplate = this.favoriteTemplate.filter(
        (id) => id !== this.templateId
      );
      this.heartUrl = heartIcons.default;
      this.countTemplateFavorite--;
    } else {
      this.favoriteTemplate.push(this.templateId);
      this.heartUrl = heartIcons.marked;
      this.countTemplateFavorite++;
    }
    const updatedTemplateIndex = this.category.templates.findIndex(
      (template) => template.id === this.templateId
    );
    this.category.templates[updatedTemplateIndex] = {
      ...this.template,
      favorite: this.countTemplateFavorite,
    };

    this._auth.updateUserData(this.user.id, {
      favoriteTemplate: this.favoriteTemplate,
    });
    this.prospectService.markAsFavorited(this.categoryId, this.category);
  }

  async scanQRCode() {
    this.isShowQRCode = !this.isShowQRCode;

    if (this.isShowQRCode) {
      const url = `${window.location.protocol}//${window.location.host}/prospect-profile/${this.user.unicode}`;
      const imagePreview = this.user.profileImg
        ? await this.processImage(this.user.profileImg, 100, 100)
        : null;

      const logoImage = imagePreview || '/assets/images/logo/logo.png';
      const qrcode = new QrCodeWithLogo({
        content: url,
        width: this.template.width,
        nodeQrCodeOptions: {},
        cornersOptions: {},
        dotsOptions: {},
        logo: {
          src: logoImage,
        },
      });

      try {
        const image = await qrcode.getImage();
        const imgElement = document.getElementById('image') as HTMLImageElement;
        imgElement.src = image.src;

        const svgContent = document.getElementById('svgContent')?.outerHTML;
        this.removeViewBox(svgContent, imgElement.src);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    }
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

  async removeViewBox(svgContent: string, src: string) {
    if (!svgContent) {
      console.error('SVG content is empty or null.');
      return;
    }

    const parser = new DOMParser();
    const svgDocParsed = parser.parseFromString(svgContent, 'text/html');
    const parsedHTML = svgDocParsed;
    const target = parsedHTML.querySelector('svg');
    target?.removeAttribute('viewBox');
    parsedHTML.documentElement.removeAttribute('viewBox');

    const zoomElements = parsedHTML.querySelectorAll('.zoom');
    zoomElements.forEach((element) => element.remove());
    await this.printQRCode(parsedHTML.documentElement.outerHTML, src);
  }

  async printQRCode(svgContent: string, imageUrl: string): Promise<void> {
    if (!svgContent) {
      console.error('SVG content is empty or null.');
      return;
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const printWindow = window.open('', '', 'width=1980,height=1080');
        if (!printWindow) {
          reject('Failed to open print window.');
          return;
        }
        printWindow.document.write(
          '<html><head><title>NXT1 Sports</title></head><body>'
        );
        printWindow.document.write(
          `<div style="width: ${this.template.width}; margin: auto; page-break-after: always; overflow: hidden;">`
        );
        printWindow.document.write(svgContent);
        printWindow.document.write('</div>');
        printWindow.document.write(
          '<div style="display: flex; justify-content: center;">'
        );
        printWindow.document.write(
          `<img src="${imageUrl}" style="width: ${this.template.width};">`
        );
        printWindow.document.write('</div>');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        // printWindow.close();
        resolve();
      }, 500);
    });
  }

  async editGraphicName() {
    const editNameDialogRef = await this._matDialog.open(
      EditNameDialogComponent,
      {
        autoFocus: false,
        data: {
          title: 'Name Your Graphic',
          isShowLogo: true,
          firstButtonText: 'Done',
          firstButtonColor: '#CCFF00',
          firstButtonBorder: '1px solid #fff',
          graphicName: this.graphicName,
        },
      }
    );
    const result = await firstValueFrom(editNameDialogRef.afterClosed());
    if (!result) {
      return;
    }
    this.graphicName = result;
  }

  convertSvgToPng(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.deselectElement();

      const drawForSave = this.draw.size(
        this.template.width,
        this.template.height
      );
      const parser = new DOMParser();
      const serializer = new XMLSerializer();

      const svgDocForSave = drawForSave.node;
      const svgOriginalContentForSave =
        serializer.serializeToString(svgDocForSave);
      const svgDocParsedForSave = parser.parseFromString(
        svgOriginalContentForSave,
        'image/svg+xml'
      );
      const svgElementForSave = svgDocParsedForSave.documentElement;

      svgElementForSave.removeAttribute('viewBox');

      let fontFaces = this.getAllFontFaces(svgOriginalContentForSave).map(
        (ff: string) => {
          return {
            originalFontFace: ff,
            embeddedFontFace: null,
          };
        }
      );

      this.draw.size('100%', '100%');

      let svgString = serializer.serializeToString(svgElementForSave);

      const cssClassFontRegex = new RegExp(
        `\\.([\\w,-]+)\\s*\\{[^}]*font-family:\\s?([^;]+)['"]?;?`,
        'gmi'
      );
      const cssClassFonts = [];
      let cssClassFontRegexMatch;

      while (
        (cssClassFontRegexMatch = cssClassFontRegex.exec(svgString)) !== null
      ) {
        const fontFamilyRule = cssClassFontRegexMatch[2];

        // one rule may contain more than 1 font family, e.g.: "font-family: AgencyFB-Bold, Agency FB;"
        const fontFamilies = fontFamilyRule
          .split(',')
          .map((ff) => ff.trim().replaceAll('"'));

        fontFamilies.forEach((ff) => {
          if (!cssClassFonts.find((ccf) => ccf == ff?.toLowerCase())) {
            // adding a font family to the list of unique font families
            cssClassFonts.push(ff?.toLowerCase());
          }
        });
      }

      this.embedFonts(fontFaces, (fontFamily: string) => {
        // assuming that if the font is used in a custom CSS class, we need it,
        // i.e. assuming this CSS class is being used in SVG without verifying that
        if (cssClassFonts.find((ccf) => ccf == fontFamily?.toLowerCase())) {
          return true;
        }

        const regEx = new RegExp(
          `(font-family=['"](${fontFamily})['"])`,
          'gmi'
        );
        const matches = svgString.match(regEx);
        return matches && matches.length > 1;
      }).then((fontFacesMappings: any[]) => {
        let svgContentWithOutViewBoxForSave =
          serializer.serializeToString(svgElementForSave);

        for (let fontFacesMapping of fontFacesMappings) {
          if (fontFacesMapping.isUsed) {
            svgContentWithOutViewBoxForSave =
              svgContentWithOutViewBoxForSave.replace(
                fontFacesMapping.originalFontFace,
                fontFacesMapping.embeddedFontFace
              );
          } else {
            // removing unused font family
            svgContentWithOutViewBoxForSave =
              svgContentWithOutViewBoxForSave.replaceAll(
                fontFacesMapping.originalFontFace,
                ''
              );
          }
        }

        // removing other pieces of CSS that may cause issues
        svgContentWithOutViewBoxForSave =
          svgContentWithOutViewBoxForSave.replaceAll(
            /font-weight:\s*bold(er)*\s*;*|font-weight:\s*[56789]00\s*;*/gmi, ''); // FIX of extrabolding text

        const svgBlob = new Blob([svgContentWithOutViewBoxForSave], {
          type: 'image/svg+xml;charset=utf-8',
        });

        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
          setTimeout(() => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas['textRendering'] = 'geometricPrecision';
            canvas['imageSmoothingEnabled'] = true;
            canvas['imageSmoothingQuality'] = 'high';
            const scaleFactor = 1.0;
            canvas.width = this.template.width * scaleFactor;
            canvas.height = this.template.height * scaleFactor;
            ctx.drawImage(
              img,
              0,
              0,
              this.template.width,
              this.template.height,
              0,
              0,
              canvas.width,
              canvas.height
            );

            canvas.toBlob((blob) => {
              URL.revokeObjectURL(url);

              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Error converting SVG to PNG'));
              }
            }, 'image/png');
          }, 2000);
        };

        img.onerror = (error) => {
          URL.revokeObjectURL(url);
          reject(error);
        };
        img.src = url;
      });
    });
  }

  download() {
    if (this.isDownloading) {
      return;
    }

    this.isDownloading = true;

    const downloadPngBlob = (blob: Blob) => {
      const pngUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const name = this.graphicName ?? new Date().getTime();
      a.href = pngUrl;
      a.download = `${name}.png`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(pngUrl);
      this.isDownloading = false;
    };

    // the commented out code below can be used for performance optimization, but it only downloads the last saved version of graphics,
    // in another words it ignores all pending changes
    /*
    if (this.initialPNG) {
      downloadPngBlob(this.initialPNG);
      return;
    } */

    this.convertSvgToPng()
      .then((blob) => {
        downloadPngBlob(blob);
      })
      .catch((error) => {
        console.error('Error downloading image:', error);
        this.isDownloading = false;
      });
  }

  async socialShare() {
    if (this.isSharing) {
      return;
    }

    this.isSharing = true;

    if (this.firstTapShare) {
      const sharedDialogRef = this._matDialog.open(ConfirmDialogComponent, {
        autoFocus: false,
        data: {
          title: '',
          isShowLogo: true,
          isShowButton: false,
          htmlContent: this.shareTemplate.nativeElement.innerHTML,
        },
      });

      const result = await firstValueFrom(sharedDialogRef.afterClosed());

      if (result) {
        this.firstTapShare = false;
        this.isSharing = false;
        this.socialShare();
      } else {
        this.isSharing = false;
      }

      return;
    }

    this.convertSvgToPng()
      .then((blob) => {
        const file = new File(
          [blob],
          this.graphicName ? this.graphicName : `${new Date().getTime()}.png`,
          { type: 'image/png' }
        );

        const shareData = {
          title: 'Check out my NXT 1 Graphic! nxt1sports.com',
          files: [file],
        };

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator
            .share(shareData)
            .then(() => {
              console.log('Content shared successfully');
              this.isSharing = false;
            })
            .catch((error) => {
              console.error('Error sharing content', error);
              this.isSharing = false;
            });
        } else {
          const graphicLink = this.copyLink();
          const urlShareData = {
            title: 'Check out my NXT 1 Graphic! https://nxt1sports.com',
            text: 'Check out my NXT 1 Graphic! https://nxt1sports.com',
            url: `${graphicLink}`,
          };
          if (navigator.share) {
            navigator
              .share(urlShareData)
              .then(() => {
                console.log('Content shared successfully');
                this.isSharing = false;
              })
              .catch((error) => {
                console.error('Error sharing content', error);
                this.isSharing = false;
              });
          } else {
            alert('Web Share API is not supported in your browser.');
            this.isSharing = false;
          }
        }
      })
      .catch((error) => {
        console.error('Error sharing image:', error);
        this.isSharing = false;
      });
  }

  copyLink(): string {
    const emailPrefix = this.user.email.split('@')[0];
    const hostname = window.location.hostname;
    const port = window.location.port;
    const baseUrl = port ? `${hostname}:${port}` : hostname;
    const fallbackGraphicName = `NXT1-graphic-${new Date().getTime()}`;
    return `/athlete/${emailPrefix}/${this.user.lastName}/${
      this.graphicName || fallbackGraphicName
    }`;
  }

  toggleTextAlign() {
    if (this.selectedElement) {
      const bbox = this.selectedElement.bbox();
      const containerWidth = this.svgContainer.nativeElement.clientWidth;
      const currentAlign = this.selectedElement.attr('text-anchor');
      let newAlign, newX;

      switch (currentAlign) {
        case 'start':
          newAlign = 'middle';
          newX = containerWidth / 2;
          this.alignmentIcon = 'assets/images/prospect/3x/Middle-Aligned.png';
          break;
        case 'middle':
          newAlign = 'end';
          newX = containerWidth;
          this.alignmentIcon = 'assets/images/prospect/3x/Right-Aligned.png';
          break;
        default:
          newAlign = 'start';
          newX = 0;
          this.alignmentIcon = 'assets/images/prospect/3x/Left-aligned.png';
      }

      this.selectedElement.attr({ 'text-anchor': newAlign, x: newX });
    }
  }

  openTextFnBar() {
    this.closeTextToolArea();
    this.textWrapperState = '*';
    this.defaultLabel = 'Default Text Style';
    this.textToolsState.addTextBoxState = true;
  }

  addTextBox(
    fontSize: number = 100,
    fill: string = '#000',
    strokeWidth: number = 0
  ) {
    const firstTransformedG = (this.draw.findOne('g[transform]') ??
      this.draw.findOne('g')) as G;
    const textBox = firstTransformedG.text('Your Text Box');

    const { centerX, centerY } = this.setPositionCenter(textBox);
    textBox.move(centerX, centerY);

    this.textStyle = {
      font: this.textStyle.font || 'Rajdhani',
      fontSize: this.textStyle.fontSize || 16,
      fill: this.textStyle.fill || '#fff',
      borderType: this.textStyle.borderType || 'none',
      borderWidth: this.textStyle.borderWidth || 0,
      borderColor: this.textStyle.borderColor || '#000',
      content: this.textStyle.content || 'Your Text Box',
      lineSpacing: this.textStyle.lineSpacing || 0,
      letterSpacing: this.textStyle.letterSpacing || 0,
      opacity: this.textStyle.opacity || 1,
      angle: this.textStyle.angle || 0,
      distance: this.textStyle.distance || 0,
      shadowColor: this.textStyle.shadowColor || '',
      blur: this.textStyle.blur || 0,
    };

    textBox.attr({
      'font-size': fontSize,
      fill: fill,
      stroke: '#fff',
      'stroke-width': strokeWidth,
      'font-family': this.textStyle.font,
    });

    const tspan = textBox.tspan(this.textStyle.content);
    tspan.id('YourTextBoxTspan');
    textBox.id('YourTextBox');
    textBox.draggable();
    this.layers.unshift(textBox);
    this.layers.unshift(tspan);
    textBox.front();
    tspan.front();

    const svgs = this.draw.find('svg');
    if (svgs.length > 1) {
      const secondSvg = svgs[1];
      const gElements = secondSvg.find('g');
      if (gElements.length > 1) {
        if (textBox && tspan) {
          gElements[1].add(textBox);
          console.log('TextBox and Tspan added to the second <g> element');
        } else {
          console.error('textBox or tspan is not defined');
        }
      } else {
        console.error('Second <g> element not found within the second SVG');
      }
    } else {
      console.error('Second SVG element not found');
    }

    this.textWrapperState = 'void';
    this.textToolsState.addTextBoxState = false;

    this.textFnBarState = true;
    this.mainFnBarState = false;

    this.selectElement(textBox);
    this.enableInteraction(textBox);
    this.enableInteraction(tspan);

    this.saveToHistory();
  }

  handleCloseClick() {
    this.onCloseTextFnBar();
    this.onCloseMediatFnBar();
    this.deselectElement();
  }

  onCloseTextFnBar() {
    this.textFnBarState = false;
    this.mediaFnBarState = false;
    this.mainFnBarState = true;
  }

  onCloseMediatFnBar() {
    this.mediaFnBarState = false;
    this.mainFnBarState = true;
  }

  handleCloseBarClick() {
    this.textFnBarState = false;
    this.mediaFnBarState = false;
    this.mainFnBarState = true;
    this.textWrapperState = 'void';
    this.mediaWrapperState = 'void';
    this.logoWrapperState = 'void';
    this.elementWrapperState = 'void';
    this.deselectElement();
    this.adjustViewBox();

    // Reset all tool states
    this.resetToolStates();
  }

  resetToolStates() {
    this.textToolsState = {
      addTextBoxState: false,
      changeFontState: false,
      changeFontSizeState: false,
      changeColorState: false,
      changeBorderState: false,
      changeSpacingState: false,
      changeOpacityState: false,
      changeShadowState: false,
    };

    this.mediaToolsState = {
      flipState: 0,
      changeOpacityState: false,
      changeBorderState: false,
      changeFilterState: false,
      changeColorState: false,
    };
  }

  closeTextToolArea() {
    if (this.textWrapperState === '*') {
      this.textFnBarState = true;
      this.mainFnBarState = false;
      this.textWrapperState = 'void';
      // this.adjustViewBox();
      for (const key in this.textToolsState) {
        if (this.textToolsState.hasOwnProperty(key)) {
          this.textToolsState[key] = false;
        }
      }
    }
  }

  closeElementToolArea() {
    if (this.elementWrapperState === '*') {
      this.elementFnBarState = true;
      this.mainFnBarState = true;
      this.elementWrapperState = 'void';
      for (const key in this.textToolsState) {
        if (this.textToolsState.hasOwnProperty(key)) {
          this.textToolsState[key] = false;
        }
      }
    }
  }

  closeMediaToolArea() {
    if (this.mediaWrapperState === '*') {
      this.mediaFnBarState = true;
      this.mainFnBarState = false;
      this.mediaWrapperState = 'void';
      this.adjustViewBox();
      for (const key in this.mediaToolsState) {
        if (this.mediaToolsState.hasOwnProperty(key)) {
          this.mediaToolsState[key] = false;
        }
      }
    }
  }

  closeLogoToolArea() {
    if (this.logoWrapperState === '*') {
      this.mediaFnBarState = false;
      this.mainFnBarState = true;
      this.logoWrapperState = 'void';
      this.adjustViewBox();
    }
  }

  sortFonts() {
    this.fonts.sort((a, b) => a.localeCompare(b));
  }

  chooseFont(font: string) {
    this.textStyle.font = font;
    this.selectedElement?.attr({ 'font-family': font });
    this.updateTspans(this.selectedElement, (tspan) => {
      tspan.attr({ 'font-family': font });
    });
  }

  openFontTool() {
    this.closeTextToolArea();
    this.sortFonts();
    this.textWrapperState = '*';
    this.defaultLabel = 'Current Font';
    this.textToolsState.changeFontState = true;
    this.adjustViewBox();
  }

  openFontSizeTool() {
    this.closeTextToolArea();
    this.textWrapperState = '*';
    this.defaultLabel = 'Font Size';
    this.currentPercentage =
      (this.textStyle.fontSize / this.maxValue.fontSize) * 100;
    this.textToolsState.changeFontSizeState = true;
    this.adjustViewBox();
  }

  changeFontSize() {
    this.currentPercentage =
      (this.textStyle.fontSize / this.maxValue.fontSize) * 100;

    this.updateTspans(this.selectedElement, (tspan) => {
      tspan.attr({ 'font-size': this.textStyle.fontSize });
    });

    this.selectedElement.attr({ 'font-size': this.textStyle.fontSize });
  }

  openFontColorTool() {
    this.closeTextToolArea();
    this.textWrapperState = '*';
    this.defaultLabel = 'Color';
    this.textToolsState.changeColorState = true;
    this.adjustViewBox();
  }

  changeColor(event: Event) {
    //changeColor(color: string | null) {
    const input = event.target as HTMLInputElement;
    this.textStyle.fill = input.value;
    this.updateTspans(this.selectedElement, (tspan) => {
      tspan.attr({ fill: this.textStyle.fill });
    });
  }

  changeImageColor(event: Event) {
    //changeImageColor(color: string | null) {
    const colorPicker = event.target as HTMLInputElement;
    const color = colorPicker.value;

    if (
      this.selectedElement &&
      typeof this.selectedElement.attr === 'function'
    ) {
      if (['path'].includes(this.selectedElement.type)) {
        this.selectedElement.fill(color);
        this.selectedElement.attr('style', `fill: ${color};`);
      } else {
        // Convert hex color to RGB
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);

        // equation to bring the final color closer to the selected color
        // y = 0.000004 * x^3 + 0.0029 * x^2 - 0.0147 * x + 0.0021

        const adjust = (v: number) =>
          Math.ceil(
            v * v * v * 0.000004 + v * v * 0.0029 - v * 0.0147 + 0.0021
          ) / 255;
        const r1 = adjust(r);
        const g1 = adjust(g);
        const b1 = adjust(b);

        this.selectedElement.filterWith((add: any) => {
          add.colorMatrix('matrix', [
            0,
            0,
            0,
            0,
            r1,
            0,
            0,
            0,
            0,
            g1,
            0,
            0,
            0,
            0,
            b1,
            0,
            0,
            0,
            1,
            0,
          ]);
        });
      }
    } else {
      console.error('selectedElement is not a valid SVG.js object');
    }

    this.saveToHistory();
  }

  addColorFilter(event: Event) {
    const colorPicker = event.target as HTMLInputElement;
    const color = colorPicker.value;

    // Convert hex color to RGB
    const r = parseInt(color.slice(1, 3), 16) / 255;
    const g = parseInt(color.slice(3, 5), 16) / 255;
    const b = parseInt(color.slice(5, 7), 16) / 255;

    if (
      this.selectedElement &&
      typeof this.selectedElement.attr === 'function'
    ) {
      this.selectedElement.filterWith((add: any) => {
        add.colorMatrix('matrix', [
          r,
          0,
          0,
          0,
          0,
          0,
          g,
          0,
          0,
          0,
          0,
          0,
          b,
          0,
          0,
          0,
          0,
          0,
          1,
          0,
        ]);
      });
    } else {
      console.error('selectedElement is not a valid SVG.js object');
    }
  }

  openBorderTool() {
    this.closeTextToolArea();
    this.textWrapperState = '*';
    this.defaultLabel = '';
    this.currentPercentage = 0;
    this.textToolsState.changeBorderState = true;
    this.adjustViewBox();
  }

  changeBorderType(type: string) {
    this.textStyle.borderType = type;
    if (type === 'none') {
      this.textStyle.borderType = 'none';
      this.textStyle.borderWidth = 0;
    }
    this.addBorderToText();
  }

  removeElementById(elementId) {
    const oldRect = this.draw.findOne(`#${elementId}`);
    if (oldRect) {
      oldRect.remove();
    }
  }
  addBorderToText() {
    // removing old rectangular border if any
    this.removeElementById(this.selectedTextElement.id() + '-border');

    if (this.textStyle.borderWidth > 0) {
      this.textStyle.borderType = 'solid';
    }
    this.currentPercentage =
      (this.textStyle.borderWidth / this.maxValue.borderWidth) * 100;

    this.updateTspans(this.selectedElement, (tspan) => {
      tspan.attr({
        stroke: this.textStyle.borderColor,
        'stroke-width': this.textStyle.borderWidth,
      });
    });
  }

  updateIcons() {
    const boldIcon = document.querySelector(
      '.text-fn-bar .child:nth-child(10) img'
    );
    const italicIcon = document.querySelector(
      '.text-fn-bar .child:nth-child(11) img'
    );
    const underlineIcon = document.querySelector(
      '.text-fn-bar .child:nth-child(12) img'
    );

    // Update bold icon
    if (boldIcon) {
      boldIcon.setAttribute(
        'src',
        this.selectedTextElement.attr('font-weight') === 'bold'
          ? '/assets/images/prospect/3x/Bold-green.png'
          : '/assets/images/prospect/3x/Bold3x.png'
      );
    }

    // Update italic icon
    if (italicIcon) {
      italicIcon.setAttribute(
        'src',
        this.selectedTextElement.attr('font-style') === 'italic'
          ? '/assets/images/prospect/3x/Italic-green.png'
          : '/assets/images/prospect/3x/Italic3x.png'
      );
    }

    // Update underline icon
    if (underlineIcon) {
      underlineIcon.setAttribute(
        'src',
        this.selectedTextElement.attr('text-decoration') === 'underline'
          ? '/assets/images/prospect/3x/Underline-green.png'
          : '/assets/images/prospect/3x/Underline3x.png'
      );
    }
  }

  toggleBold() {
    const currentFontWeight = this.selectedTextElement.attr('font-weight');
    const newFontWeight = currentFontWeight === 'bold' ? 'normal' : 'bold';

    this.updateTspans(this.selectedElement, (tspan) => {
      tspan.attr('font-weight', newFontWeight);
    });

    console.log(this.selectedTextElement.attr('font-weight'));
    this.updateIcons();
  }

  toggleItalic() {
    const currentFontStyle = this.selectedTextElement.attr('font-style');
    const newFontStyle = currentFontStyle === 'italic' ? 'normal' : 'italic';

    this.updateTspans(this.selectedElement, (tspan) => {
      tspan.attr('font-style', newFontStyle);
    });

    console.log(this.selectedTextElement.attr('font-style'));
    this.updateIcons();
  }

  toggleUnderline() {
    const currentTextDecoration =
      this.selectedTextElement.attr('text-decoration');
    const newTextDecoration =
      currentTextDecoration === 'underline' ? 'none' : 'underline';

    this.updateTspans(this.selectedElement, (tspan) => {
      tspan.attr('text-decoration', newTextDecoration);
    });

    this.updateIcons();
  }

  changeLetterSpacing() {
    this.currentLetterSpacingPercentage =
      (this.textStyle.letterSpacing / this.maxValue.letterSpacing) * 100;

    this.updateTspans(this.selectedElement, (tspan) => {
      tspan.attr('letter-spacing', this.textStyle.letterSpacing);
    });
  }

  changeLineSpacing() {
    this.currentLineSpacingPercentage =
      (this.textStyle.lineSpacing / this.maxValue.lineSpacing) * 100;

    this.selectedElement.leading(this.textStyle.lineSpacing);
  }

  openSpacingTool() {
    this.closeTextToolArea();

    this.textWrapperState = '*';
    this.defaultLabel = '';
    this.textToolsState.changeSpacingState = true;
    this.currentLetterSpacingPercentage =
      (this.textStyle.letterSpacing / this.maxValue.letterSpacing) * 100;
    this.currentLineSpacingPercentage =
      (this.textStyle.lineSpacing / this.maxValue.lineSpacing) * 100;
    this.adjustViewBox();
  }

  openOpacityTool() {
    this.currentPercentage =
      (this.textStyle.opacity / this.maxValue.opacity) * 100;
    this.closeTextToolArea();
    this.textWrapperState = '*';
    // this.mediaWrapperState = '*';
    this.defaultLabel = '';
    this.textToolsState.changeOpacityState = true;
    const currentOpacity = this.selectedTextElement.opacity();
    this.textStyle.opacity = currentOpacity;
    this.adjustViewBox();
  }

  changeOpacity() {
    this.currentPercentage =
      (this.textStyle.opacity / this.maxValue.opacity) * 100;

    this.updateTspans(this.selectedElement, (tspan) => {
      tspan.opacity(this.textStyle.opacity);
    });
  }
  openMediaFnBar() {
    this.closeTextToolArea();
    this.closeMediaToolArea();
    this.mediaFnBarState = true;
    this.mainFnBarState = false;
  }
  onFileSelected(event: Event) {
    this.closeTextToolArea();
    this.closeMediaToolArea();
    this.mediaFnBarState = true;
    this.mainFnBarState = false;
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64String = reader.result as string;
      this.updateImageInSvg(base64String);
    };
    reader.readAsDataURL(file);
    this.isDoubleTap = false;
  }

  updateImageInSvg(base64String) {
    if (!this.imageContainer) {
      this.addImageToSvg(base64String);
    } else {
      if (this.selectedElement.type === 'image') {
        this.imageContainer.load(base64String);

        this.saveToHistory();
        return;
      }

      const handleElement = (type: 'rect' | 'path') => {
        // const fillAttr = type === 'rect' ? 'fill' : 'style';
        const fillAttr = 'class';
        const className = this.selectedElement.attr(fillAttr);
        const fillValue = this.originalStyle.match(
          new RegExp(`\\.${className}\\{[^}]*fill:([^;]+);`)
        )?.[1];
        // console.log(fillValue);
        if (fillValue === 'none') {
          const id = this.selectedElement.id();
          const image: any = this.draw
            .find(`#${id}`)
            .filter((el) => el.type === 'image')[0];
          image.load(base64String);
        } else {
          let patternId = fillValue.match(/url\(#(.*?)\)/)?.[1];
          if (patternId) {
            const pattern = this.draw.findOne(`#${patternId}`);
            const image: any = pattern.find('image');
            if (image) {
              image.load(base64String);
            }
          }
        }

        this.saveToHistory();
      };
      if (['rect', 'path'].includes(this.selectedElement.type)) {
        handleElement(this.selectedElement.type as 'rect' | 'path');
      }
    }
  }

  addImageToSvg(imageUrl: string, isCircleClipMask: boolean = false): svgImage {
    let firstTransformedG = this.draw.findOne('g[transform]') as G;
    let group: G;

    if (firstTransformedG) {
      group = firstTransformedG.group();
    } else {
      group = this.draw.group();
    }

    group.unclip();

    // Create clipPath
    const clipPath = this.draw.clip();
    const clipRect = this.draw.rect(550, 700);
    clipPath.add(clipRect);

    // Create image
    const image = this.draw.image(imageUrl).size(550, 700);

    // Add image to group
    group.add(image);

    // Create border for group
    const border = this.draw
      .rect(550, 700)
      .fill('none')
      .stroke({ color: 'none', width: 0 });
    group.add(border);

    const viewBox = this.draw.viewbox();
    const x = (viewBox.width - 550) / 2 + viewBox.x;
    const y = (viewBox.height - 700) / 2 + viewBox.y;
    group.move(x, y);

    clipRect.move(0, 0);
    border.move(0, 0);

    const random = Math.random().toString(36).substr(2, 9);

    const circle = this.draw.circle(image.bbox().width).fill('#fff');
    const circleClip = this.draw.clip();
    circleClip.add(circle);
    circleClip.id('ImageCircle' + random);

    let refreshCircleClipPath = null;

    if (isCircleClipMask) {
      refreshCircleClipPath = () => {
        const bbox = image.bbox();
        circle
          .center(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2)
          .size(bbox.width);
        circleClip.add(circle);
        circleClip.move(bbox.x, bbox.y);
      };

      circleClip.id('ImageCircle' + random);
      image.clipWith(circleClip);
      refreshCircleClipPath();
    }

    group
      .draggable()
      .resize({ preserveAspectRatio: true, aroundCenter: true })
      .on('dragmove', () => {
        const bbox = image.bbox();

        clipRect.move(bbox.x, bbox.y);

        refreshCircleClipPath && refreshCircleClipPath();

        border.move(bbox.x, bbox.y);
        this.isElementMoved = true;
      })
      .on('dragend', (event: any) => {
        if (this.isElementMoved) {
          // this.deselectElement();
          this.saveToHistory();
        }
        this.isElementMoved = false;
      })
      .on('resize', () => {
        this.logEvent('group.resize');
        const bbox = border.bbox();
        clipRect.move(bbox.x, bbox.y).size(bbox.width, bbox.height);
        border.move(bbox.x, bbox.y).size(bbox.width, bbox.height);
        refreshCircleClipPath && refreshCircleClipPath();
        this.saveToHistory();
      });

    image
      .draggable()
      .resize({ preserveAspectRatio: true, aroundCenter: true })
      .on('dragmove', () => {
        const bbox = image.bbox();
        clipRect.move(bbox.x, bbox.y);
        clipRect.move(bbox.x, bbox.y);
        border
          .move(bbox.x, bbox.y)
          .size(bbox.width, bbox.height)
          .transform(image.transform());

        refreshCircleClipPath && refreshCircleClipPath();

        this.isElementMoved = true;
      })
      .on('dragend', (event: any) => {
        if (this.isElementMoved) {
          // this.deselectElement();
          this.saveToHistory();
        }
        this.isElementMoved = false;
      })
      .on('resize', () => {
        this.logEvent('image.resize');

        const bbox = image.bbox();
        clipRect.move(bbox.x, bbox.y).size(bbox.width, bbox.height);
        border
          .move(bbox.x, bbox.y)
          .size(bbox.width, bbox.height)
          .transform(image.transform());

        refreshCircleClipPath && refreshCircleClipPath();

        this.saveToHistory();
      });

    border.id('Image' + random);
    image.id('Image' + random);
    clipPath.id('Image' + random);

    const svgs = this.draw.find('svg');
    if (svgs.length > 1) {
      const secondSvg = svgs[1];
      const gElements = secondSvg.find('g');
      if (gElements.length > 1) {
        gElements[1].add(group);
        this.layers.unshift(group);
        group.front();
      } else {
        console.error('Second <g> element not found within the second SVG');
      }
    } else {
      console.error('Second SVG element not found');
    }

    this.rectImage = border;
    this.rectImageInDefs = clipRect;

    this.enableInteraction(image);
    this.selectElement(image);

    image.front();

    this.saveToHistory();

    return image;
  }

  toggleCropMode() {
    this.cropMode = !this.cropMode;
    if (this.cropMode) {
      const group = this.draw.group();
      const currentTransform = this.selectedElement.transform();
      const x =
        currentTransform.translateX +
        this.svgTranslateX +
        this.selectedElement.bbox().x;
      const y =
        currentTransform.translateY +
        this.svgTranslateY +
        this.selectedElement.bbox().y;

      this.cropRect = this.draw
        .rect(
          this.selectedElement.bbox().width,
          this.selectedElement.bbox().height
        )
        .id('CropRect')
        .translate(x, y)
        .stroke({ color: '#ffffff', width: 20 }) // Increase stroke width
        .fill('none')
        .resize()
        .on('resize', () => {
          const { x, y, width, height } = this.cropRect.bbox();
          this.cropRect.move(x, y).size(width, height);
        })
        .on('dragmove', () => {
          this.updateCroppedAreasOpacity();
        });

      group.add(this.cropRect);

      const size = 45;
      const halfSize = size / 2;
      const selectedObject = {
        createHandle: (group, p, index, pointArr, handleName) => {
          group
            .polygon([
              [-halfSize, -halfSize],
              [halfSize, -halfSize],
              [halfSize, halfSize],
              [-halfSize, halfSize],
            ])
            .css({ strokeWidth: '30px', stroke: '#fff', fill: '#fff' });
          group.draggable().resize();
        },
        updateHandle: (group, p, index, pointArr, handleName) => {
          const updatedX = p[0];
          const updatedY = p[1];
          pointArr[index] = [updatedX, updatedY];
          group.center(updatedX, updatedY);
          const updatedPoints = pointArr
            .map((point) => point.join(','))
            .join(' ');
          const polygon = document.querySelector('polygon');
          polygon.setAttribute('points', updatedPoints);
        },
      };

      this.cropRect.select(selectedObject);
      this.selectedElement.select(false);
    } else if (this.cropRect) {
      this.cropRect.select(false);
      this.cropRect.remove();
    }
  }

  updateCroppedAreasOpacity() {
    const { x, y, width, height } = this.cropRect.bbox();
    const elements = this.draw.children();

    elements.forEach((element) => {
      if (element !== this.cropRect) {
        const bbox = element.bbox();

        if (
          bbox.x + bbox.width > x &&
          bbox.x < x + width &&
          bbox.y + bbox.height > y &&
          bbox.y < y + height
        ) {
          element.opacity(1); // Fully visible within crop rectangle
        } else {
          element.opacity(0); // Lower opacity outside crop rectangle
        }
      }
    });
  }

  applyCrop() {
    if (this.cropRect) {
      const { x, y, width, height } = this.cropRect.bbox();
      const clipPath = this.draw.clip().rect(width, height).translate(x, y);

      const croppedImg = this.selectedElement
        .resize()
        .clipWith(clipPath)
        .on('dragmove', (event) => {
          clipPath.move(croppedImg.bbox().x, croppedImg.bbox().y);
        })
        .on('resize', (event) => {
          clipPath.size(croppedImg.bbox().width, croppedImg.bbox().height);
        });

      this.selectedElement = croppedImg;

      this.toggleCropMode();
      this.deselectElement();
      this.saveToHistory();
    }
  }

  updateImageBorder() {
    this.selectedElement.attr({
      style: `
      stroke: ${this.imageStyle.borderColor};
      stroke-width: ${this.imageStyle.borderWidth};
      stroke-dasharray: ${this.imageStyle.strokeDashX}, ${this.imageStyle.strokeDashY};
      rx: ${this.imageStyle.borderRadius}px;
      ry: ${this.imageStyle.borderRadius}px;`,
    });
    this.currentBorderWeightPercentage =
      (this.imageStyle.borderWidth / this.maxValue.borderWidth) * 100;
    this.currentBorderRadiusPercentage =
      (this.imageStyle.borderRadius / this.maxValue.borderRadius) * 100;

    this.rectImage?.attr({
      rx: this.imageStyle.borderRadius,
      ry: this.imageStyle.borderRadius,
    });
    this.rectImageInDefs?.attr({
      rx: this.imageStyle.borderRadius,
      ry: this.imageStyle.borderRadius,
    });
  }

  openOpacityImageTool() {
    this.currentPercentage = 100;
    this.closeMediaToolArea();
    this.mediaWrapperState = '*';
    this.textWrapperState = '*';
    this.mediaToolsState.changeOpacityState = true;
    this.adjustViewBox();
  }

  changeLayerPosition() {
    console.log(this.currentAction);

    if (this.selectedElement) {
      const parentElement =
        this.selectedElement.type === 'tspan'
          ? this.selectedElement.parent()
          : this.selectedElement;
      let siblings = parentElement.parent().children();
      let currentIndex = siblings.indexOf(parentElement);

      console.log('Selected Element:', this.selectedElement);
      console.log('Parent Element:', parentElement);
      console.log('Siblings:', siblings);
      console.log('Current Index:', currentIndex);

      switch (this.currentAction) {
        case 'bringForward':
          if (currentIndex < siblings.length - 1) {
            parentElement.forward();
            this.currentAction = 'bringForward';
            this.currentActionText = 'Forward';
          } else {
            this.currentAction = 'bringToFront';
            this.currentActionText = 'To Front';
          }
          break;
        case 'sendToBack':
          parentElement.back();
          this.currentAction = 'bringForward';
          this.currentActionText = 'Forward';
          break;
        case 'sendBackward':
          if (currentIndex > 0) {
            parentElement.backward();
            this.currentAction = 'sendBackward';
            this.currentActionText = 'Backward';
          } else {
            this.currentAction = 'bringToFront';
            this.currentActionText = 'To Front';
          }
          break;
        case 'bringToFront':
          parentElement.front();
          this.currentAction = 'sendBackward';
          this.currentActionText = 'Backward';
          break;
      }

      // Force re-evaluation of siblings and current index
      siblings = parentElement.parent().children();
      currentIndex = siblings.indexOf(parentElement);

      console.log('Updated Siblings:', siblings);
      console.log('Updated Current Index:', currentIndex);

      this.saveToHistory();
    }
  }

  resetLayerFunctionality() {
    this.currentAction = 'bringForward';
    this.currentActionText = 'Move Layer';
  }

  changeOpacityImage() {
    this.currentPercentage =
      (this.imageStyle.opacity / this.maxValue.opacity) * 100;
    this.imageContainer.opacity(this.imageStyle.opacity);
  }

  openCropImageTool() {
    this.toggleCropMode();
  }

  openShadowImageTool() {
    const filter: any = this.draw.filter();
    filter.attr({
      x: '-20%',
      y: '-20%',
      width: '140%',
      height: '140%',
    });

    filter.element('feDropShadow').attr({
      dx: 5,
      dy: 5,
      stdDeviation: 3,
      'flood-color': 'rgba(0,0,0,0.5)',
    });

    this.selectedElement.filterWith(filter);
    this.adjustViewBox();
  }

  openFilterTool() {
    this.closeMediaToolArea();
    this.mediaWrapperState = '*';
    this.textWrapperState = '*';
    this.mediaToolsState.changeFilterState = true;
    this.adjustViewBox();
  }

  openElementFnBar() {
    this.closeTextToolArea();
    this.elementWrapperState = '*';
    this.defaultLabel = '';
    this.textToolsState.addTextBoxState = true;
  }

  closeElementsToolArea() {
    if (this.textWrapperState === '*') {
      this.textFnBarState = true;
      this.mainFnBarState = false;
      this.textWrapperState = 'void';
      for (const key in this.textToolsState) {
        if (this.textToolsState.hasOwnProperty(key)) {
          this.textToolsState[key] = false;
        }
      }
    }
  }

  openLogoFnBar() {
    this.closeMediaToolArea();
    this.logoWrapperState = '*';
    this.adjustViewBox();
    this.mediaWrapperState = '*';
    this.textWrapperState = 'void';
  }

  async useTemplate() {
    try {
      let credit;

      // If the template requires credits and the user does not have enough or has no credits
      if (
        this.user.lastActivatedPlan !== 'subscription' &&
        this.template.credit > 0 &&
        (this.user['featureCredits'] < this.template.credit ||
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
        credit = this.template.credit;
      }

      // Only show confirmation dialog if credit is 1 or more
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
          this.template.credit > 0 &&
          this.user['featureCredits'] >= this.template.credit &&
          this.user.lastActivatedPlan !== 'subscription'
        ) {
          this.user['featureCredits'] -= this.template.credit;
        }
      }

      // Proceed with loading the template
      this._matDialog.closeAll();
      this._matDialog.open(ConfirmDialogComponent, {
        autoFocus: false,
        data: {
          title: '',
          isShowLogo: true,
          isShowButton: false,
          htmlContent: this.loadingTemplate.nativeElement.innerHTML,
        },
      });

      const order =
        this.ownTemplates.length > 0 ? this.ownTemplates.length - 1 : 0;
      const data = {
        id: this.templateId,
        categoryId: this.categoryId,
        order: order,
        name: '',
        downloadURL: this.template.svg,
        previewImage: this.template.thumbnail,
        url: this.template.thumbnail,
        type: 'graphic',
        width: this.template.width,
        height: this.template.height,
        qrCode: this.template.qrCode,
      };
      this.ownTemplates.push(data);
      this.availableTemplate.push(this.templateId);
      this.ownTemplates.forEach((item, i) => {
        item.order = i;
      });
      await this._auth.updateUserData(this.user.id, {
        featureCredits: this.user['featureCredits'] || 0,
        availableTemplate: this.availableTemplate,
        ownTemplates: this.ownTemplates,
      });

      this.prospectService
        .fetchSVGContent(this.template.svg)
        .pipe(
          tap((svgContent) => {
            this.handleSVGContent(svgContent);
            const gElement =
              this.svgContainer.nativeElement.querySelector('g[transform]');
            if (gElement) {
              const transformValue = gElement.getAttribute('transform');
              const match = transformValue.match(/translate\(([^)]+)\)/);
              const values = match[1].split(' ');
              this.svgTranslateX = parseFloat(values[0]) || 0;
              this.svgTranslateY = parseFloat(values[1]) || 0;
            } else {
              this.svgTranslateX = 0;
              this.svgTranslateY = 0;
            }
            this._matDialog.closeAll();
            setTimeout(() => {
              this.showSuccess = false;
            }, 1500);
          })
        )
        .subscribe({
          error: (err) => {
            console.error('Error fetching SVG content:', err);
            this._matDialog.closeAll();
            // Handle the error appropriately, e.g., show an error message to the user
          },
        });
    } catch (error) {
      console.error('Error in useTemplate method:', error);
    }
  }

  toggleState() {
    this.state = !this.state;

    this.adjustViewBox();
  }
  async onLogout(event: boolean) {
    await this._auth.SignOut();
    this._router.navigate(['/']);
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

  onContactUs(event: boolean) {
    this._router.navigate(['settings/contact-us']);
  }

  async onBack() {
    if (this.redirectBackUrl && this.redirectBackUrl == 'media-pro/media') {
      this.redirectBackUrl = '';
      this._router.navigate(['/media-pro/media'], {
        state: { activeTab2: '2' },
      });
      return;
    }
    if (this.history.length <= 1) {
      this._router.navigate(['/media-pro/graphics-pro']);
      return;
    }
    if (!this.isSaved) {
      const confirmBackDialogRef = await this._matDialog.open(
        ConfirmDialogComponent,
        {
          autoFocus: false,
          data: {
            title: 'You Have Made Changes That Haven’t Been Saved.',
            isShowLogo: true,
            message: `Are You Sure You Want To Leave?`,
            firstButtonText: 'Cancel',
            secondButtonText: 'Leave',
            firstButtonColor: '#CCFF00',
            secondButtonColor: '#FF0303',
            firstButtonBorder: '1px solid #fff',
            secondButtonBorder: '1px solid #fff',
          },
        }
      );

      const result = await firstValueFrom(confirmBackDialogRef.afterClosed());
      if (result) {
        return;
      }
      this._router.navigate(['/media-pro/media'], {
        state: { activeTab2: '2' },
      });
    }

    this._router.navigate(['/media-pro/media'], { state: { activeTab2: '2' } });

    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Control') {
      this.isCtrlPressed = true;
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Control') {
      this.isCtrlPressed = false;
    }
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    const targetElement = event.target as HTMLElement;
    if (targetElement.closest('.zoomable')) {
      event.preventDefault();
      if (event.ctrlKey || this.isCtrlPressed) {
        const scaleAmount = event.deltaY < 0 ? 1.1 : 0.9;

        const svgRect = this.svgContainer.nativeElement.getBoundingClientRect();
        const mouseX = event.clientX - svgRect.left;
        const mouseY = event.clientY - svgRect.top;

        this.zoomAtPoint(mouseX, mouseY, scaleAmount);
      }
    }
  }

  zoomAtPoint(x: number, y: number, scale: number) {
    const svgRect = this.svgContainer.nativeElement.getBoundingClientRect();
    const viewBox = this.draw.viewbox();

    // Calculate new zoom levels
    let newZoomLevel = this.zoomLevel * scale;
    console.log('newZoomLevel:', newZoomLevel);

    const actualScale = newZoomLevel / this.zoomLevel;

    // Calculate mouse/touch position in viewBox coordinates
    const viewBoxX = (x / svgRect.width) * viewBox.width + viewBox.x;
    const viewBoxY = (y / svgRect.height) * viewBox.height + viewBox.y;

    // Calculate new viewBox
    const newWidth = viewBox.width / actualScale;
    const newHeight = viewBox.height / actualScale;
    const newX = viewBoxX - (x / svgRect.width) * newWidth;
    const newY = viewBoxY - (y / svgRect.height) * newHeight;

    // Update zoomLevel
    this.zoomLevel = newZoomLevel;

    // Apply new viewBox
    this.draw.viewbox(newX, newY, newWidth, newHeight);

    // Save initial viewBox settings if not already saved
    if (this.initialViewBox === null) {
      this.initialViewBox = {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      };
    }

    if (this.zoomLevel <= 0.89) {
      // Adjust this threshold as needed
      // Reset to initial viewBox position
      if (this.initialViewBox) {
        this.draw.viewbox(
          this.initialViewBox.x,
          this.initialViewBox.y,
          this.initialViewBox.width,
          this.initialViewBox.height
        );
        this.zoomLevel = 1; // Reset zoomLevel to default or desired level
      }
    } else {
      this.draw.viewbox(newX, newY, newWidth, newHeight);
    }

    // Update viewBox variables
    this.viewBoxX = newX;
    this.viewBoxY = newY;

    this.rescaleSelectHandles();
  }
  rescaleSelectHandles(): void {
    // todo: check why initial zoom level is wrong and has to be adjusted
    const zoomLevel = this.zoomLevel < 0.89 ? 0.89 : this.zoomLevel;
    const circleDiameter = 25.0 / zoomLevel;
    const strokeWidth = Math.ceil(circleDiameter);
    const defaultBorderWidth = 12; // 12px

    // circle handles
    let circles = this.draw.find('.svg_select_handle').map((h) => h as Circle);

    circles.forEach((c: Circle) => {
      c.radius(circleDiameter / 2)
        .attr({ 'stroke-width': strokeWidth })
        .filterWith((add) => {
          add.offset(2, 2).gaussianBlur(3, 3).attr({ result: 'offset-blur' });
          add.blend(add.$source, 'offset-blur', 'normal');
        });
    });

    // green rectangle
    let rect = this.draw.findOne('.svg_select_shape') as Polygon;
    rect?.attr({ 'stroke-width': defaultBorderWidth / zoomLevel });
  }

  async onDoubleTap(element: SVGElement): Promise<void> {
    if (!element) {
      return;
    }
    console.log('Double tap detected!', element?.type);
    this.isDoubleTap = true;
    if (['tspan', 'text'].includes(element.type)) {
      this.selectElement(element);
      this.enableTextEditing();
    }
    // if (
    //   element.type === 'rect' ||
    //   element.type === 'image' ||
    //   element.type === 'path'
    // ) {
    //   const fileIP = this.fileInput.nativeElement;
    //   fileIP.click();
    //   this.selectElement(element);
    // }
  }

  onTouchStart(event: TouchEvent | any, element?: SVGElement) {
    console.log('Touch Start');
    event.stopPropagation();
    const touch = event.touches[0];
    const currentTime = new Date().getTime();

    if (event.touches.length === 1) {
      this.isSingleTouch = true;

      const tapLength = currentTime - this.lastTap;
      const distance = Math.sqrt(
        Math.pow(touch.clientX - this.tapPosition.x, 2) +
          Math.pow(touch.clientY - this.tapPosition.y, 2)
      );

      if (tapLength < this.doubleTapDelay && tapLength > 0 && distance < 50) {
        this.onDoubleTap(element);
        this.lastTap = 0;
      } else {
        this.lastTap = currentTime;
        this.tapPosition = { x: touch.clientX, y: touch.clientY };
        if (element) {
          this.selectElement(element);
        }
      }
      this.startDistance = null;
      this.isPanning = false;
    } else if (event.touches.length === 2) {
      this.isSingleTouch = false;
      this.deselectElement();
      this.isPanning = true;
      this.selectedElement = null;
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      this.startDistance = this.getDistance(touch1, touch2);
      const svgRect = this.svgContainer.nativeElement.getBoundingClientRect();
      this.centerX = (touch1.clientX + touch2.clientX) / 2 - svgRect.left;
      this.centerY = (touch1.clientY + touch2.clientY) / 2 - svgRect.top;
    }
  }

  onTouchMove(event: TouchEvent) {
    if (event.touches.length === 2 && this.isPanning) {
      console.log('Touch Move');
      event.stopPropagation();
      event.preventDefault();
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const currentDistance = this.getDistance(touch1, touch2);
      let scale = currentDistance / this.startDistance;
      scale =
        this.lastZoomLevel +
        (scale - this.lastZoomLevel) * this.zoomSmoothingFactor;
      this.lastZoomLevel = scale;
      const svgRect = this.svgContainer.nativeElement.getBoundingClientRect();
      const newCenterX = (touch1.clientX + touch2.clientX) / 2 - svgRect.left;
      const newCenterY = (touch1.clientY + touch2.clientY) / 2 - svgRect.top;
      this.zoomAtPoint(newCenterX, newCenterY, scale);
      this.startDistance = currentDistance;
      this.centerX = newCenterX;
      this.centerY = newCenterY;
    }
  }

  onTouchEnd(event: TouchEvent, element?: SVGElement) {
    event.stopPropagation();
    event.preventDefault();
    console.log('Touch End');
    if (event.touches.length < 2) {
      this.isPanning = false;
      this.startDistance = null;
    }
  }

  setupKeyboardShortcuts() {
    if (this.keyboardShortcutsInitialized) {
      return;
    }

    const shortcuts = {
      Control: {
        z: () => {
          this.undo();
        },
        y: () => {
          console.log('Redo');
          this.redo();
        },
        c: () => this.copySelectedElement(),
        v: () => this.pasteCopiedElement(),
        d: () => this.duplicateSelectedElement(),
      },
      Meta: {
        z: () => this.undo(),
        y: () => this.redo(),
        c: () => this.copySelectedElement(),
        v: () => this.pasteCopiedElement(),
        d: () => this.duplicateSelectedElement(),
      },
      None: {
        Delete: () => this.deleteElement(),
        // Backspace: () => this.deleteElement(),
      },
    };

    document.addEventListener('keydown', (event: KeyboardEvent) => {
      let modifier = 'None';
      if (event.ctrlKey) modifier = 'Control';
      else if (event.metaKey) modifier = 'Meta';

      const shortcutHandler = shortcuts[modifier];
      if (shortcutHandler && shortcutHandler[event.key]) {
        event.preventDefault();
        shortcutHandler[event.key]();
      }
    });

    this.keyboardShortcutsInitialized = true;
  }

  undo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.restoreFromHistory();
    }
  }

  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      this.restoreFromHistory();
    }
  }

  copySelectedElement() {
    if (this.selectedElement) {
      console.log('Copied element:', this.selectedElement);
      const clonedElement = this.selectedElement.clone();
      this.copiedElement = clonedElement;
    }
  }

  pasteCopiedElement() {
    this.duplicateSelectedElement();
  }

  addEventToNewElement(element: SVGElement) {
    element
      .draggable()
      .resize({ preserveAspectRatio: true, aroundCenter: true })
      .on('dragmove', (event) => {
        console.log('Dragging element:', event);
        this.isElementMoved = true;
      })
      .on('dragend', (event: any) => {
        if (this.isElementMoved) {
          // this.deselectElement();
          this.saveToHistory();
        }
        this.selectedElements.forEach((layer) => {
          layer.draggable(false);
        });
        this.isElementMoved = false;
      })
      .on('touchstart', (event) => {
        event.stopPropagation();
        this.onTouchStart(event, element);
        event.preventDefault();
      })
      .on('resize', () => {
        this.saveToHistory();
      });
  }

  getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  resetZoom(): void {
    this.zoomLevel = 1;
    this.lastZoomLevel = 1;
    // Reset viewBox to initial state
    const templateWidth = parseFloat(this.template.width.toString());
    const templateHeight = parseFloat(this.template.height.toString());
    this.viewBoxX = 0;
    this.viewBoxY = 0;
    this.draw.viewbox(0, 0, templateWidth, templateHeight);
  }

  getAllFontFaces(svgString: string): string[] {
    return svgString.match(/@font-face {([^}]+)}/g) ?? [];
  }

  embedFonts(fontFaces, isFontFamilyUsedFunc): Promise<any> {
    let fontEmbedPromises = [];

    for (let ff of fontFaces) {
      // getting URL of the font used in the SVG by analyzing @font-face from the styles
      const fontUrls = ff.originalFontFace.match(/url\(([^)]+)\)/g);

      if (!fontUrls || fontUrls.length == 0) {
        // skipping @font-face CSS rule if the src is missing or the format is not supported
        continue;
      }

      const fontFamilyRules =
        ff.originalFontFace.match(/font-family:([^;]+)/gim); // global multiline case-insensitive search

      const fontFamilyRule =
        fontFamilyRules && fontFamilyRules.length > 0
          ? fontFamilyRules[0]
          : null;

      if (!fontFamilyRule) {
        // skipping @font-face CSS rule if the font-family rule is missing
        continue;
      }

      ff.fontFamily = fontFamilyRule
        .replace(/font-family/gi, '')
        .replaceAll('"', '')
        .replaceAll(':', '')
        .trim();

      if (isFontFamilyUsedFunc(ff.fontFamily)) {
        // getting a clean and valid URL of the font file and downloading it
        const fontUrl = fontUrls[0]
          .substring(4, fontUrls[0].length - 1)
          .replaceAll('&amp;', '&');

        fontEmbedPromises.push(
          fetch(fontUrl)
            .then((resp) => resp.blob())
            .then((blob) => {
              let promise = new Promise((resolve, reject) => {
                let fileReader = new FileReader();
                fileReader.onload = (e) => resolve(fileReader.result);
                fileReader.onerror = reject;
                fileReader.readAsDataURL(blob);
              }).then((dataUrl: string) => {
                // replacing the URL of the font file in the CSS rule with the data URL (embedding the font into CSS)
                ff.embeddedFontFace = ff.originalFontFace.replace(
                  fontUrls[0],
                  `url(${dataUrl})`
                );
                ff.isUsed = true;

                return ff;
              });

              return promise;
            })
        );
      } else {
        // no need to download the font if it is not being used
        fontEmbedPromises.push(
          new Promise((resolve, reject) => {
            ff.isUsed = false;
            resolve(ff);

            return ff;
          })
        );
      }
    }

    return Promise.all(fontEmbedPromises);
  }

  async save(): Promise<any> {
    this.deselectElement();
    this.notiContent = 'SAVING...';
    this.showSuccess = true;
    this.isSaved = true;

    const drawForSave = this.draw.size(
      this.template.width,
      this.template.height
    );
    const svgDocForSave = drawForSave.node;

    const serializer = new XMLSerializer();
    const parser = new DOMParser();

    // Serialize SVG documents
    const svgOriginalContentForSave =
      serializer.serializeToString(svgDocForSave);

    const svgDocParsedForSave = parser.parseFromString(
      svgOriginalContentForSave,
      'image/svg+xml'
    );

    const svgElementForSave = svgDocParsedForSave.documentElement;

    this.convertSvgToPng()
      .then(async (pngBlob) => {
        try {
          svgElementForSave.removeAttribute('viewBox');
          const svgContentWithOutViewBoxForSave =
            serializer.serializeToString(svgElementForSave);
          this.draw.size('100%', '100%');

          // Create PNG from SVG
          const svgBlob = new Blob([svgContentWithOutViewBoxForSave], {
            type: 'image/svg+xml',
          });

          // const img = new Image();
          // img.src = pngUrl;

          // Upload the blob to storage
          const svgStorageRef = this.storage.ref(
            `UserTemplates/${this.user.email}_${Date.now()}.svg`
          );
          const pngStorageRef = this.storage.ref(
            `UserTemplates/${this.user.email}_${Date.now()}.png`
          );
          const svgSnapshot = await svgStorageRef.put(svgBlob);
          const pngSnapshot = await pngStorageRef.put(pngBlob);

          const svgDownloadURL = await svgSnapshot.ref.getDownloadURL();
          const pngDownloadURL = await pngSnapshot.ref.getDownloadURL();

          this.initialPNG = pngBlob;

          this.isSaved = true;

          const data = {
            id: this.templateId,
            categoryId: this.categoryId,
            order: this.ownTemplates.length > 0 ? this.ownTemplates.length : 0,
            name: this.graphicName || '',
            url: svgDownloadURL,
            pngUrl: pngDownloadURL,
            type: 'graphic',
            width: this.template.width,
            height: this.template.height,
            qrCode: this.template.qrCode,
          };

          // Update template in ownTemplates
          const index = this.ownTemplates.findIndex(
            (template) => template.id === this.templateId
          );
          if (index === -1) {
            this.ownTemplates.push(data);
          } else {
            this.ownTemplates[index] = data;
          }
          this.ownTemplates.forEach((item, i) => {
            item.order = i;
          });

          await this._auth.updateUserData(this.user.id, {
            ownTemplates: this.ownTemplates,
          });
          this.isSaved = true;
          this.adjustViewBox();
        } catch (error) {
          console.error(error);
          this.notiContent = 'Failed to save the template';
          this.showSuccess = false;
        } finally {
          this.notiContent = 'Saved Under My Media';
          this.isSaved = true;
          setTimeout(() => {
            this.showSuccess = false;
            this.isSaved = true;
          }, 1500);
        }
      })
      .catch((error) => {
        console.error('Error downloading PNG image:', error);
        this.isDownloading = false;
      });
  }

  async removeBg() {
    this.loading$.next(true);
    const linkRx = /<image\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/;
    const url = this.selectedElement.node.outerHTML
      .replace('xlink:', '')
      .match(linkRx)[2];
    fetch(url).then(async (res) => {
      const blob = await res.blob();
      const formData = new FormData();
      formData.append('size', 'auto');
      formData.append('image_file', blob);

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: { 'X-Api-Key': environment.removeBgKey },
        body: formData,
      });

      if (response.ok) {
        const res = await response.arrayBuffer();
        const buffer = Buffer.from(res);
        const base64String =
          'data:image/png;base64,' + buffer.toString('base64');
        this.closeTextToolArea();
        this.closeMediaToolArea();
        this.mediaFnBarState = true;
        this.mainFnBarState = false;
        this.updateImageInSvg(base64String);
        this.loading$.next(false);
      } else {
        this.loading$.next(false);
        console.error(
          'Error removing bg',
          `${response?.status}: ${response?.statusText}`
        );
      }
    });
  }

  updateTspans(
    textElement: Text,
    updateTspanFunc,
    skipFirst: boolean = false
  ): void {
    if (!textElement) {
      return;
    }

    const tspans = textElement.children().filter((e) => e.type == 'tspan');
    for (let i = skipFirst ? 1 : 0; i < tspans.length; i++) {
      updateTspanFunc(tspans[i]);
    }
  }

  normalizeCoordinates(element: any): void {
    if (!element) {
      return;
    }

    this.logElementPosition(element, 'Before normalizing coordinates');

    // text
    if (['text', 'tspan'].includes(element.type)) {
      // getting <text> element
      let text = element.type == 'text' ? element : element.parent('text');

      const tspans: any[] = [...text.children('tspan')];
      const originalTspanX = Number(tspans[0].attr('x') ?? 0);
      const originalTspanY = Number(tspans[0].attr('y') ?? 0);

      // getting parent <g> element
      let g = text.parent();
      const gTransform = g?.transform();
      const isGTransformed =
        g.type == 'g' &&
        !!gTransform &&
        g.children().length <= 2 &&
        g.attr('transform')?.replaceAll(' ', '') != 'matrix(1,0,0,1,0,0)';

      if (isGTransformed) {
        g.attr('transform', null);
      }

      const currentTransform = text.transform();
      const textX = Number(text.attr('x') ?? 0);
      const textY = Number(text.attr('y') ?? 0);
      const textTranslateX = currentTransform?.translateX ?? 0;
      const textTranslateY = currentTransform?.translateY ?? 0;

      text.attr({
        x: 0,
        y: 0,
      });

      const newTransform = {
        rotate: currentTransform.rotate,
        translateX: 0,
        translateY: 0,
        //translateX: currentTransform.rotate > 0 ? textTranslateX : 0,
        //translateY: currentTransform.rotate > 0 ? textTranslateY : 0,
        scaleX: currentTransform.scaleX,
        scaleY: currentTransform.scaleY,
      };

      text.untransform();
      text.transform(newTransform);

      tspans[0].attr({
        x:
          textX +
          (currentTransform.rotate > 0 ? 0 : textTranslateX) +
          originalTspanX +
          (isGTransformed ? gTransform.translateX : 0),
        y:
          textY +
          (currentTransform.rotate > 0 ? 0 : textTranslateY) +
          originalTspanY +
          (isGTransformed ? gTransform.translateY : 0),
        transform: null,
      });

      for (let i = 1; i < tspans.length; i++) {
        tspans[i].attr({
          x: tspans[0].attr('x'),
          y: null,
        });
      }
    }

    // images
    if (['rect', 'image', 'path'].includes(element.type)) {
      const rectCurrentTransform = element.transform();
      const originalRectX = element.x() ?? 0;
      const originalRectY = element.y() ?? 0;

      const newX = (rectCurrentTransform.translateX ?? 0) + originalRectX;
      const newY = (rectCurrentTransform.translateY ?? 0) + originalRectY;

      const rectNewTransform = {
        rotate: rectCurrentTransform.rotate,
        translateX: newX,
        translateY: newY,
        //translateX: currentTransform.rotate > 0 ? textTranslateX : 0,
        //translateY: currentTransform.rotate > 0 ? textTranslateY : 0,
        scaleX: rectCurrentTransform.scaleX,
        scaleY: rectCurrentTransform.scaleY,
        // cx: element.cx(),
        // cy: element.cy()
      };

      element.untransform();

      // element.attr({ x: null, y: null });
      element.transform(rectNewTransform, true);

      //element.move(newX, newY);

      element.attr({
        'data-x': newX,
        'data-y': newY,
      });
      // this.originalLayerTranslateX = rectNewTransform.translateX;
      // this.originalLayerTranslateY = rectNewTransform.translateY;
    }

    //this.logElementPosition(element, 'After normalizing coordinates');
  }

  convertToValidId(text: string): string {
    // since ID of SVG element cannot start with a number, we need to add a letter as the first character
    if (/^\d/.test(text)) {
      text = 't' + text;
    }

    // removing all characters that are neighter letters, no numbers, in particular this used to get rid of quotes in IDs
    return text.replaceAll(/[^\p{L}\d]+/gu, '');
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    this.svgContainer = null;

    if (this.touchStartSubscription) {
      this.touchStartSubscription.unsubscribe();
    }
  }

  logElementPosition(element: any, comment: string = ''): void {
    if (!this.isElementPositionLoggingEnabled) {
      return;
    }

    const transform = element.transform();
    console.log(
      `Element: ID='${element.id()}', Type=${element.type}. ${comment}.`
    );

    console.log(`(x, y) = (${element.attr('x')}, ${element.attr('y')})`);
    console.log(`transform='${element.attr('transform')}'`);
    if (transform) {
      console.log(`rotate=${transform.rotate}`);
      console.log(
        `translateX=${transform.translateX}, translateY=${transform.translateY}`
      );
      console.log(`center x=${element.cx()}, center y=${element.cy()}`);
      // console.log(`scaleX=${transform.scaleX}, scaleY=${transform.scaleY}`);
      console.log(`--`);
    }
  }

  logEvent(comment: string, eventDetails: any = null): void {
    if (!this.isEventLoggingEnabled) {
      return;
    }

    console.log(comment, eventDetails);
    console.log('--');
  }
}
