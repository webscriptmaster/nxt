import {
  AfterViewInit,
  Component,
  ComponentRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { User } from '../models/user';
import {
  BehaviorSubject,
  Observable,
  Subject,
  catchError,
  firstValueFrom,
  forkJoin,
  of,
  takeUntil,
} from 'rxjs';
import { SharedService } from '../shared/shared.service';
import { CreateEmailService } from '../create-email/create-email.service';
import { MatDialog } from '@angular/material/dialog';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ProviderDialogComponent } from '../create-email/dialogs/provider-dialog/provider-dialog.component';
import { environment } from 'src/environments/environment';
import { CollegeLibraryContactsInfoDialogComponent } from '../college-library/dialogs/contacts-info-dialog/contacts-info-dialog.component';
import { ProspectSheetInfoComponent } from '../shared/components/prospect-sheet-info/prospect-sheet-info.component';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { SendEmailDialogComponent } from './dialogs/send-email-dialog/send-email-dialog.component';
import { SaveCampaignDialogComponent } from '../create-email/dialogs/save-campaign-dialog/save-campaign-dialog.component';
import { transformToCollegeSport } from '../shared/utils';

@Component({
  selector: 'app-email-automation',
  templateUrl: './email-automation.component.html',
  styleUrls: ['./email-automation.component.scss'],
})
export class EmailAutomationComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  user$: Observable<User | null>;
  user: User | null;
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  _unsubscribeAll = new Subject<void>();
  step = 0;
  selectedContactMissingMailField: any[] = [];
  process1: number = 0;
  process2: number = 0;
  selectedColleges = {
    recipients: 0,
    coaches: [],
  };
  createEmail = false;
  showCreateEmail = false;
  pendingEmails: any;
  file: File | null;
  @ViewChild('mailRequiredFieldPopup', { static: true, read: TemplateRef })
  mailRequiredFieldPopup: TemplateRef<any>;

  @ViewChild('pdfContainer', { read: ViewContainerRef })
  container: ViewContainerRef;
  componentRef: ComponentRef<ProspectSheetInfoComponent>;

  @Input() isOverlay = false;
  @Output() close = new EventEmitter();
  draftId: any;
  pdf: any;
  campaignsSent: any = [];
  isShowHelp: boolean = false;
  previousUrl: string;
  private randomCode: string;
  private exsistCode: string[] = [];
  private exsistCodeId: string = '';
  private randomCodes: string[] = [];
  private rdCodeForAutomationEmails: string[] = [];
  private;
  collegeSport: string;
  constructor(
    private _router: Router,
    private _auth: AuthService,
    private sharedService: SharedService,
    private storage: AngularFireStorage,
    private _createEmailService: CreateEmailService,
    private _matDialog: MatDialog
  ) {
    this.user$ = this._auth.user$;
  }

  async ngAfterViewInit() {
    const user = (await this._waitUser()) as User;
    const isGmailOrMicrosoftMail =
      user.email.includes('@outlook') ||
      user.email.includes('@hotmail') ||
      user.email.includes('@gmail');
    if (isGmailOrMicrosoftMail) {
      await this.connectEmailFlow();
    }
    if (!localStorage.getItem(`${this.user?.id}_showSendEmailInfoDialog`)) {
      localStorage.setItem(`${this.user?.id}_showSendEmailInfoDialog`, 'true');
      // this.openInfoDialog();
    }
  }

  async ngOnInit(): Promise<void> {
    this._auth.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(async (res) => {
        this.user = res;
        this.campaignsSent = this.user?.campaignsSent?.filter(
          (item) => item.type === 'automation'
        );
        if (!this.user?.isFirstTimeAtCampaign) {
          this.step = 0;
        } else {
          this.step = 1;
        }
        if (!(this.user?.appSport && this.user.appSport === 'secondary')) {
          this.collegeSport = transformToCollegeSport(this.user?.primarySport!);
        } else {
          this.collegeSport = transformToCollegeSport(
            this.user?.secondarySport!
          );
        }
      });
    this.sharedService.emails$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: any) => {
        if (res.coaches.length !== 0) {
          this.step = 1;
          this.selectedColleges.coaches = res.coaches;
          this.selectedColleges.recipients = res.recipients;
          if (this.selectedColleges.coaches.length > 0) {
            this.process1 = 1;
          }
        }
      });

    this.sharedService.emailGolbal$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: any) => {
        this.pendingEmails = res;
        this.randomCodes = this.extractParamsFromArray(this.pendingEmails);
        if (!!this.pendingEmails[0]?.body) {
          this.process2 = 1;
        } else {
          this.process2 = 0;
        }
      });
    this.sharedService
      .getUnicodes()
      .subscribe((res: { id: string; codes: string[] }) => {
        this.exsistCode = res[0].codes ?? [];
        this.exsistCodeId = res[0].id;
      });
  }

  extractParamsFromArray(
    emails: { subject: string; body: string }[]
  ): string[] {
    const regex = /href="[^"]+\/(\d+)"[^>]*>/;
    const extractedParams: string[] = [];

    emails.forEach((email) => {
      const match = email.body.match(regex);

      if (match && match[1]) {
        extractedParams.push(match[1]);
      }
    });

    return extractedParams;
  }

  openInfoDialog() {
    const dialogRef = this._matDialog.open(
      CollegeLibraryContactsInfoDialogComponent,
      {
        disableClose: true,
        data: {
          user: this.user,
        },
      }
    );
  }

  async handleEmailAutomationRoute(url: string) {
    const dialogRef = this._matDialog.open(SaveCampaignDialogComponent, {
      disableClose: true,
    });
    const result = await firstValueFrom(dialogRef.afterClosed());
    if (!result) {
      this.sharedService.setSelectedCollegeFn([]);
      this.sharedService.setCoachEmails({
        recipients: 0,
        coaches: [],
      });
      this.sharedService.setEmailGlobalFn([]);
    } else {
      this._router.navigate([`${url}`]);
    }
  }

  showHelp(event: any, status: boolean) {
    event?.stopPropagation();
    if (status) {
      this.isShowHelp = !this.isShowHelp;
      return;
    }
    this.isShowHelp = status;
  }

  goToStep2() {
    this.step = 1;
    if (this.user) {
      this._auth.updateUserData(this.user.id, { isFirstTimeAtCampaign: true });
    }
  }

  private generateImageName(email: string): string {
    const name = email.split('@')[0];
    const timestamp = new Date().getTime();
    return `${name}${timestamp}`;
  }
  async createAndUploadPixelImage(email: string): Promise<void> {
    const canvas = await this.createPixelImage();
    const imageName = this.generateImageName(email);
    const base64Image = this.canvasToBase64(canvas);
    const downloadURL = await this.uploadImage(base64Image, imageName);
    return downloadURL;
  }

  private async uploadImage(base64Image: string, image: string): Promise<any> {
    const blob = this.base64ToBlob(base64Image);
    const storageRef = this.storage.ref(`ReadEmailImages/${image}`);
    const snapshot = await storageRef.put(blob);
    const downloadURL = await snapshot.ref.getDownloadURL();
    return downloadURL;
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

  private async createPixelImage(): Promise<HTMLCanvasElement> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = '#000000';
        context.fillRect(0, 0, 1, 1);
      }
      resolve(canvas);
    });
  }

  canvasToBase64(canvas: HTMLCanvasElement): string {
    return canvas.toDataURL();
  }

  async generateEmails(coach: any, pendingEmail: any, randomCode: any) {
    const url = await this.createAndUploadPixelImage(coach.email);
    let code = randomCode;
    let rdCode = this.generateUniqueUnicode();
    if (!randomCode) {
      while (this.exsistCode.includes(rdCode)) {
        rdCode = this.generateUniqueUnicode();
      }
      this.exsistCode.push(rdCode);
      this.randomCodes.push(rdCode);
      this.rdCodeForAutomationEmails.push(rdCode);
      code = rdCode;
    }

    const pixelTrackingUrl = `${environment.apiURL}/gmail/track-email-open?code=${code}`;
    const emailObject = {
      email: coach.email,
      firstName: coach.firstName,
      lastName: coach.lastName,
      template: `
        <html>
          <body>
            ${pendingEmail.body}
            <img src="${pixelTrackingUrl}" width="1" height="1" />
          </body>
        </html>
      `,

      subject: pendingEmail.subject,
      to: coach.email,
      from: this.user?.connectedEmail,
      fromName: this.user?.firstName + ' ' + this.user?.lastName,
      replyTo: this.user?.connectedEmail,
      pixelTrackingUrl: url,
    };
    return emailObject;
  }

  async sendEmail() {
    const dialogRef = this._matDialog.open(SendEmailDialogComponent, {
      disableClose: true,
    });

    const emailListPromise = this.createEmailsInBackground();

    const result = await firstValueFrom(dialogRef.afterClosed());

    if (!result) {
      return;
    }

    const emailList = await emailListPromise;

    if (
      (this.user?.connectedGmailToken || this.user?.connectedMicrosoftToken) &&
      this.user?.connectedEmail
    ) {
      this.selectedContactMissingMailField = emailList.filter((data: any) => {
        return !data.subject || !data.template;
      });

      if (this.selectedContactMissingMailField.length > 0) {
        this._matDialog.open(this.mailRequiredFieldPopup, {
          hasBackdrop: true,
          closeOnNavigation: true,
        });
        return;
      }

      if (this.isOverlay) {
        this.close.emit(true);
        this._createEmailService.setSentEmailResponse();
      } else {
        this._createEmailService.setSentEmailResponse();
      }

      if (this.draftId) {
        this._createEmailService.deleteDraft(this.user?.id, this.draftId);
      }

      const contactsToSend = emailList;
      if (contactsToSend.length) {
        const from = {
          name: `${this.user?.firstName} ${this.user?.lastName}`,
          address: this.user?.connectedEmail,
        };

        const data: any = {
          contacts: contactsToSend.map((contact: any) => {
            let html = contact.template;
            return {
              from,
              to: {
                address: contact.email,
              },
              subject: contact.subject,
              html,
              pixelUrl: contact.pixelTrackingUrl,
              prospectSheet: contact.prospectSheet,
              pdfName: `${this.user?.firstName} ${this.user?.lastName}-Prospect Sheet.pdf`,
            };
          }),
          token:
            this.user?.connectedGmailToken ||
            this.user?.connectedMicrosoftToken,
        };

        localStorage.removeItem('contacts');

        if (
          this.user?.connectedGmailToken ||
          this.user?.connectedMicrosoftToken
        ) {
          const provider = this.user?.connectedGmailToken
            ? 'gmail'
            : 'microsoft';
          this._createEmailService
            .sendMessage(data, provider)
            .pipe(
              catchError((err) => {
                console.log(err);
                return of(null);
              })
            )
            .subscribe((res: any) => {
              if (res) {
                res['selectedContacts'] = emailList;
                if (this.file) {
                  res['file'] = this.file;
                }
                this._createEmailService.sentEmailResults$.next(res);
              }
              this.updateUserFb(emailList);
              this.loading$.next(false);
            });
        }
      } else {
        this.loading$.next(false);
      }
    } else {
      this.connectEmailFlow();
    }
  }

  private async createEmailsInBackground() {
    const emailList: any[] = [];
    for (const [index, coach] of this.selectedColleges.coaches.entries()) {
      const emailObjects = await this.generateEmails(
        coach,
        this.pendingEmails[index],
        this.randomCodes[index]
      );
      emailList.push(emailObjects);
    }
    return emailList;
  }

  onCampaignDetail(item: any) {
    this._router.navigate(['email-automation/campaign-sent'], {
      state: { data: item },
    });
  }

  updateUserFb(emailList: any[]) {
    if (this.user) {
      const allSent = this.user.campaignsSent || [];
      const campaignSent =
        this.user.campaignsSent?.filter((item) => item.type === 'automation') ||
        [];
      const count = campaignSent.length || 0;
      let sentColleges: any[] = [];
      this.sharedService.selectedCollege$.subscribe((res: any) => {
        sentColleges = res;
      });
      const coaches = this.selectedColleges.coaches;
      const coachesWithReadStatus = coaches.map((coach: any, index: number) => {
        return {
          url: emailList[index].pixelTrackingUrl,
          coach: coach.email,
          collegeId: coach.college._id,
          isOpen: false,
          isClick: false,
          unicode: this.randomCodes[index] || '',
        };
      });
      if (this.user && this.user?.activityTracking) {
        const fbSentEmailsData: any = coaches.map(
          (coach: any, index: number) => {
            const currentCoach = coach.college.contacts.find(
              (item: any) => item.email === coach.email
            );
            const data = {
              coachName: coach.firstName + ' ' + coach.lastName,
              collegeId: coach.college._id,
              collegeName: coach.college.name,
              coachEmail: emailList[index].email,
              date: new Date(),
              message: 'received your email',
              url: emailList[index].pixelTrackingUrl,
              name: emailList[index].fromName,
              sport: this.collegeSport,
              logoUrl: coach.college.logoUrl || '',
              twitter: currentCoach.twitter,
              position: currentCoach.position,
              type: 'automation',
              division:
                coach.college['sportInfo'][this.collegeSport].division || '',
              conference:
                coach.college['sportInfo'][this.collegeSport].conference || '',
              conferenceLogo:
                coach.college['sportInfo'][this.collegeSport] || '',
              userId: this.user?.id,
              unicode: this.randomCodes[index] || '',
            };
            return this.sharedService.addSentEmail(data);
          }
        );

        forkJoin(fbSentEmailsData).subscribe(
          (results) => {
            console.log('All emails have been sent successfully', results);
          },
          (error) => {
            console.error('An error occurred while sending emails', error);
          }
        );
      }

      const newData = {
        name: `Campaign ${count + 1}`,
        date: new Date().toLocaleDateString(),
        sentColleges: sentColleges,
        type: 'automation',
        numberOfSentEmail: this.selectedColleges.coaches.length,
        readCoachesList: coachesWithReadStatus,
      };
      this.user.campaignsSent = allSent.concat(newData);
      this._auth.updateUserData(this.user?.id, this.user);
      this.sharedService.setSelectedCollegeFn([]);
      this.sharedService.setCoachEmails({ recipients: 0, coaches: [] });
      this.sharedService.setEmailGlobalFn([]);
      this.selectedColleges = {
        recipients: 0,
        coaches: [],
      };
      this.step = 1;
      this.process1 = 0;
      this.process2 = 0;
    }
  }

  generateUniqueUnicode(): string {
    let randomNum = Math.floor(Math.random() * 100000000);
    return randomNum.toString().padStart(8, '0');
  }

  async connectEmailFlow() {
    const user = (await this._waitUser()) as User;
    if (!user.connectedGmailToken && !user.connectedMicrosoftToken) {
      const provider = await this.openProviderDialog();
      const url = await this._createEmailService.getConnectURL(
        user.id,
        provider
      );
      return this._openLink(url!);
    } else {
      localStorage.removeItem('contacts');
      return null;
    }
  }

  private _openLink(url: string | null) {
    return new Promise((res, rej) => {
      setTimeout(() => {
        if (url) {
          const link = document.createElement('a');
          link.target = '_blank';
          link.href = url;
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

  openProviderDialog(): Promise<any> {
    const dialogRef = this._matDialog.open(ProviderDialogComponent, {
      disableClose: false,
    });

    return firstValueFrom(dialogRef.afterClosed());
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

  public handleCloseMailRequiredFieldPopup(): void {
    this._matDialog.closeAll();
  }

  onClose() {
    this.showCreateEmail = false;
    setTimeout(() => {
      this._checkSentEmailResult();
      this.createEmail = false;
    }, 300);
  }

  createTemplateEmail() {
    if (this.selectedColleges.coaches.length > 0) {
      this._createEmailService.setSelectedContacts(
        this.selectedColleges.coaches
      );
      this.createEmail = true;
      setTimeout(() => {
        this.showCreateEmail = true;
      }, 100);
      return;
    }
    this._router.navigate(['/college-library'], {
      queryParams: { type: 'automate' },
    });
  }

  private async _checkSentEmailResult() {
    const response = await firstValueFrom(
      this._createEmailService.sentEmailRespose$
    );

    if (response) {
      this._createEmailService.clearSentEmailResponse();
    }
  }

  chooseCollege() {
    this._router.navigate(['/college-library'], {
      queryParams: { type: 'automate' },
    });
  }

  onHome(event: boolean) {
    this._router.navigate(['/home']);
  }

  onHelp() {
    const url = `https://nxt1sports.com/faqs`;
    this.openLink(url);
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

  async onLogout(event: boolean) {
    await this._auth.SignOut();
    this._router.navigate(['/']);
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
    this._router.navigate(['home']);
  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
