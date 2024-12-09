import { AuthService } from 'src/app/auth/auth.service';
import {
  Subject,
  switchMap,
  takeUntil,
  firstValueFrom,
  BehaviorSubject,
} from 'rxjs';
import {
  Component,
  OnInit,
  OnDestroy,
  ComponentRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/models/user';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ProspectSheetInfoComponent } from 'src/app/shared/components';
import { PLANS } from 'src/app/shared/const';

@Component({
  selector: 'app-prospect-sheet-preview',
  templateUrl: './prospect-sheet-preview.component.html',
  styleUrls: ['./prospect-sheet-preview.component.scss'],
})
export class ProspectSheetPreviewComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<void> = new Subject();
  userId: string;
  user: User | null = null;
  loading = true;
  own = false;

  loadingPdf$ = new BehaviorSubject(false);

  pdfDoc: any;

  pdf: any;
  @ViewChild('pdfContainer', { read: ViewContainerRef })
  container: ViewContainerRef;
  componentRef: ComponentRef<ProspectSheetInfoComponent>;
  navigator = navigator;

  PLANS = PLANS;
  showTrialMessage = false;
  canCloseTrialMessage = false;

  constructor(
    private _route: ActivatedRoute,
    private _auth: AuthService,
    private _router: Router
  ) {
    this._route.queryParams
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((params) => {
        this.own = params['own'];
      });

    this._route.params
      .pipe(
        takeUntil(this._unsubscribeAll),
        switchMap((params) => {
          return this._auth.getUserById(params['id']);
        })
      )
      .subscribe(async (user) => {
        this.loading = false;
        this.user = user;
      });
  }

  getUser(id: string) {
    return new Promise((resolve, reject) => {
      resolve(id);
    });
  }

  onBack() {
    if (this.own) {
      this._router.navigate(['home']);
    } else {
      history.back();
    }
  }

  onEditProfile() {
    this._router.navigate(['edit-profile']);
  }

  ngOnInit() {}

  async ngAfterViewInit() {
    await this._waitUser();
    const pdfBlob: Blob = (await this.generatePDF()) as Blob;
    this.pdf = new File(
      [pdfBlob],
      `${this.user?.firstName} ${this.user?.lastName}-Prospect Sheet.pdf`,
      { type: 'application/pdf' }
    );
  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  private _waitUser() {
    return new Promise((res, rej) => {
      const waitUserInterval = setInterval(() => {
        if (this.user) {
          clearInterval(waitUserInterval);
          res(this.user);
        }
      }, 100);
    });
  }

  private _waitPdf() {
    return new Promise((res, rej) => {
      const waitPdfInterval = setInterval(() => {
        if (this.pdf) {
          clearInterval(waitPdfInterval);
          res(this.pdf);
        }
      }, 100);
    });
  }

  generatePDF() {
    return new Promise((res, rej) => {
      if (this.user) {
        // Create a div element to hold the component
        const div = document.createElement('div');
        div.style.width = '595px';
        div.style.backgroundColor = '#fff';
        document.body.appendChild(div);

        // Create an instance of the component
        this.componentRef = this.container.createComponent(
          ProspectSheetInfoComponent
        );
        this.componentRef.instance.user = this.user;
        this.componentRef.instance.forPDF = true;

        // Attach the component to the div element
        div.appendChild(this.componentRef.location.nativeElement);

        setTimeout(() => {
          html2canvas(div, { useCORS: true, allowTaint: true }).then(
            (canvas) => {
              // Generate the PDF
              const doc = new jsPDF('p', 'pt', [595.28, 841.89]);
              const imgData = canvas.toDataURL('image/png');

              const imgProps = doc.getImageProperties(imgData);
              let pdfHeight = doc.internal.pageSize.getHeight();
              let pdfWidth = (imgProps.width * pdfHeight) / imgProps.height;

              if (pdfWidth > 595) {
                pdfWidth = doc.internal.pageSize.getWidth();
                pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
              }

              doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
              this.pdfDoc = doc;
              // doc.save(
              //   `${this.user?.firstName} ${this.user?.lastName}-Prospect Sheet.pdf`
              // );

              // Destroy the component instance
              this.componentRef.destroy();

              // Remove the div element
              document.body.removeChild(div);
              // doc.save(
              //   `${this.user?.firstName} ${this.user?.lastName}-Prospect Sheet.pdf`
              // );
              res(doc.output('blob'));
            }
          );
        }, 1500);
      } else {
        res(null);
      }
    });
  }

  async onShare() {
    if (!this.user) {
      return;
    }
    if (this.user.lastActivatedPlan === PLANS.TRIAL) {
      this.showTrialMessage = true;
      this.canCloseTrialMessage = false;
      setTimeout(() => {
        this.canCloseTrialMessage = true;
      }, 150)
      return;
    }
    if (!this.pdf) {
      this.loadingPdf$.next(true);
      await this._waitPdf();
      this.loadingPdf$.next(false);
    }
    const files = [this.pdf];
    if (navigator.canShare({ files })) await navigator.share({ files });
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

  onDownload() {
    if (!this.user) {
      return;
    }
    if (this.user.lastActivatedPlan === PLANS.TRIAL) {
      this.showTrialMessage = true;
      this.canCloseTrialMessage = false;
      setTimeout(() => {
        this.canCloseTrialMessage = true;
      }, 150)
      return;
    }
    if (this.pdfDoc) {
      this.pdfDoc.save(
        `${this.user?.firstName} ${this.user?.lastName}-Prospect Sheet.pdf`
      );
    }
  }

  closeTrialTooltip() {
    if (!this.user) {
      return;
    }
    if (this.user.lastActivatedPlan === PLANS.TRIAL) {
      if (this.canCloseTrialMessage) {
        this.showTrialMessage = false;
        this.canCloseTrialMessage = false;
      }
    }
  }
}
