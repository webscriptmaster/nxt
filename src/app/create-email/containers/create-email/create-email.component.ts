import { SendEmailDialogComponent } from './../../dialogs/send-email-dialog/send-email-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateEmailService } from './../../create-email.service';
import { MatDialog } from '@angular/material/dialog';
import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  Input,
  EventEmitter,
  Output,
  TemplateRef,
} from '@angular/core';
import {
  Observable,
  BehaviorSubject,
  Subject,
  takeUntil,
  catchError,
  of,
  firstValueFrom,
  forkJoin,
} from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user';
import { CollegeLibraryContactsInfoDialogComponent } from 'src/app/college-library/dialogs';
import { TEMPLATES } from 'src/app/shared/const';

import { ComponentRef, ViewChild, ViewContainerRef } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { SelectRecipientsDialogComponent } from '../../dialogs';
import { ProspectSheetInfoComponent } from 'src/app/shared/components';
import { ProviderDialogComponent } from '../../dialogs/provider-dialog/provider-dialog.component';
import { TemplateService } from 'src/app/shared/template.service';
import { SharedService } from 'src/app/shared/shared.service';
import { SaveCampaignDialogComponent } from '../../dialogs/save-campaign-dialog/save-campaign-dialog.component';
import { environment } from 'src/environments/environment';
import { transformToCollegeSport } from 'src/app/shared/utils';

@Component({
  selector: 'app-create-email',
  templateUrl: './create-email.component.html',
  styleUrls: ['./create-email.component.scss'],
})
export class CreateEmailComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() isOverlay = false;
  @Output() close = new EventEmitter();

  @ViewChild('pdfContainer', { read: ViewContainerRef })
  container: ViewContainerRef;
  componentRef: ComponentRef<ProspectSheetInfoComponent>;

  @ViewChild('mailRequiredFieldPopup', { static: true, read: TemplateRef })
  mailRequiredFieldPopup: TemplateRef<any>;

  TEMPLATES = TEMPLATES;

  user$: Observable<User | null>;
  selectedContacts: any = [];

  subject: string = '';
  template: string = '';

  contactContextMenu: null | string = null;

  showAddTemplateMenu = false;
  showDraftsMenu = false;

  user: User | null | any = null;
  userLink: string = '';

  activeContact = 0;

  draftId: any;
  pdfData: any;

  pdf: any;

  expand: boolean = false;
  loading$ = new BehaviorSubject(false);

  _unsubscribeAll = new Subject<void>();
  showProspectSheet = false;

  file: File | null;
  fileError = false;

  profileUrl: string = '';
  currentRouter = '';
  listTemplate: any[] = [];
  listEmail: any;
  countCollege: number = 0;
  type: string = '';
  collegeSport: string;
  selectedContactMissingMailField: any[] = [];
  bodyPlaceholder = `Tap the 'plus' button at the top to add your personalized templates directly in the email(s).`;

  private randomCode: string;
  private exsistCode: string[] = [];
  private exsistCodeId: string = '';
  constructor(
    private _auth: AuthService,
    private _matDialog: MatDialog,
    private _createEmailService: CreateEmailService,
    private _router: Router,
    private storage: AngularFireStorage,
    private templateService: TemplateService,
    private sharedService: SharedService
  ) {
    this.user$ = this._auth.user$;

    this._createEmailService.selectedContacts$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res) => {
        if (res.length === 0) {
          this._router.navigate(['/college-library']);
        } else {
          this.selectedContacts = res.map((contact: any) => {
            if (contact.draftId) {
              this.draftId = contact.draftId;
            }
            if (contact.file) {
              this.file = contact.file;
            }

            return {
              ...contact,
              college: {
                id: contact.college.id,
                name: contact.college.name,
                'IPEDS/NCES_ID': contact.college['IPEDS/NCES_ID'],
                logoUrl: contact.college.logoUrl,
                collegeId: contact.college._id,
                college: contact.college,
              },
              subject: contact.subject ? contact.subject : '',
              template: contact.template ? contact.template : '',
              prospectSheet: contact.prospectSheet
                ? contact.prospectSheet
                : false,
              link: contact.link ? contact.link : false,
            };
          });
        }
      });

    this.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe(async (res) => {
      this.user = res;
      this.generateProfileUrl();
      if (
        !(this.user?.completeAddSport && this.user.appSport === 'secondary')
      ) {
        if (!(this.user?.appSport && this.user.appSport === 'secondary')) {
          this.collegeSport = transformToCollegeSport(this.user?.primarySport!);
        } else {
          this.collegeSport = transformToCollegeSport(
            this.user?.secondarySport!
          );
        }
        if (this.user?.primarySportAthleticInfo['highlight_link']) {
          this.userLink = this.user?.primarySportAthleticInfo[
            'highlight_link'
          ] as string;
        }
      } else {
        if (this.user?.secondarySportAthleticInfo['highlight_link']) {
          this.userLink = this.user?.secondarySportAthleticInfo[
            'highlight_link'
          ] as string;
        }
      }
    });
    this.sharedService.emails$.subscribe((res) => {
      this.listEmail = res.coaches;
      this.countCollege = res.recipients;
    });

    this.sharedService
      .getUnicodes()
      .subscribe((res: { id: string; codes: string[] }) => {
        this.exsistCode = res[0].codes ?? [];
        this.exsistCodeId = res[0].id;
      });

    this.currentRouter = this._router.url;
  }

  async ngOnInit() {
    window.addEventListener('keyup', this.onEsc.bind(this));
    this.getAllTemplatesEmail();
    this.sharedService.emailGolbal$.subscribe((res: any) => {
      // res.forEach((item: any, i: number) => {
      //   this.selectedContacts[i].template = item.body;
      //   this.selectedContacts[i].subject = item.subject;
      // });
    });
  }

  public generateProfileUrl() {
    this.profileUrl = `${window.location.protocol}//${window.location.host}/prospect-profile/${this.user.unicode}`;
  }

  expandToEmail() {
    this.expand = !this.expand;
  }

  getAllTemplatesEmail() {
    this.templateService.getAllTemplates().subscribe((res) => {
      res = res.filter((template: any) => {
        return (
          template.name !== '' &&
          template.content !== '' &&
          template.type === 'email'
        );
      });
      this.listTemplate = res;
    });
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
      this.openInfoDialog();
    }
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
      // if (user.connectedGmailToken) {
      //   this._matDialog.open(GmailImportantNoteComponent, {disableClose: true});
      // }
      return null;
    }
  }

  openProviderDialog(): Promise<any> {
    const dialogRef = this._matDialog.open(ProviderDialogComponent, {
      disableClose: false,
    });

    return firstValueFrom(dialogRef.afterClosed());
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

  ngOnDestroy() {
    window.removeEventListener('keyup', this.onEsc.bind(this));
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    this._createEmailService.setSelectedContacts([]);
  }

  openInfoDialog() {
    const dialogRef = this._matDialog.open(
      CollegeLibraryContactsInfoDialogComponent,
      {
        disableClose: true,
      }
    );
  }

  openSelectRecipientsDialog(contact: string) {
    const dialogRef = this._matDialog.open(SelectRecipientsDialogComponent, {
      disableClose: true,
      data: {
        contact,
      },
    });
    return firstValueFrom(dialogRef.afterClosed());
  }

  showContactContextMenu(contact: string) {
    this.contactContextMenu = contact;
  }

  onCopyToClipboard(email: string) {
    navigator.clipboard.writeText(email);
    this.contactContextMenu = null;
  }

  onRemoveContact(index: number) {
    if (this.selectedContacts.length === 1) {
      if (this.isOverlay) {
        this.close.emit(true);
      } else {
        this._router.navigate(['college-library']);
      }
    } else {
      if (this.activeContact == index) {
        this.activeContact = 0;
      }
      this.selectedContacts.splice(index, 1);
      this.contactContextMenu = null;
    }
  }

  onAddTemplate() {
    if (window.innerWidth >= 1200) {
      this.showAddTemplateMenu = !this.showAddTemplateMenu;
    } else {
      this.showAddTemplateMenu = true;
    }
  }

  onCancelTemplate() {
    this.showAddTemplateMenu = false;
    this.showDraftsMenu = false;
  }

  onFileSelected(event: any) {
    this.onRemoveFile();
    const file: File = event.target.files[0];

    if (file) {
      const maxAllowedSize = 5 * 1024 * 1024;
      if (file.size > maxAllowedSize) {
        this.fileError = true;
        setTimeout(() => {
          this.fileError = false;
        }, 10000);
        return;
      }
      this.fileError = false;
      this.file = file;
    }
  }

  onRemoveFile() {
    this.file = null;
  }

  onAddLink() {
    if (this.selectedContacts[this.activeContact]['link']) {
      const container = document.querySelector('.ql-editor');
      let linkTitle;
      let link;

      if (container) {
        const paragraphs = Array.from(container.getElementsByTagName('p'));
        linkTitle = paragraphs.find((element) =>
          element?.textContent?.includes('Link to Film:')
        );
        const links = Array.from(container.getElementsByTagName('a'));
        if (
          !(this.user?.completeAddSport && this.user.appSport === 'secondary')
        ) {
          link = links.find((element) =>
            element?.textContent?.includes(
              `${this.user?.primarySportAthleticInfo['highlight_link']}`
            )
          );
        } else {
          link = links.find((element) =>
            element?.textContent?.includes(
              `${this.user?.secondarySportAthleticInfo['highlight_link']}`
            )
          );
        }
      }

      if (linkTitle) {
        linkTitle.remove();
      }
      if (link) {
        link.parentElement?.nextSibling?.remove();
        link.parentElement?.remove();
      }
      this.selectedContacts[this.activeContact]['link'] = false;
    } else {
      let linkHTML = `<p>Link to Film:</p><p><a style="color: #2cbeff; word-break: break-word;" href="${this.user?.primarySportAthleticInfo['highlight_link']}">${this.user?.primarySportAthleticInfo['highlight_link']}</a></p><p><br></p>`;
      if (this.user?.completeAddSport && this.user.appSport === 'secondary') {
        linkHTML = `<p>Link to Film:</p><p><a style="color: #2cbeff; word-break: break-word;" href="${this.user?.secondarySportAthleticInfo['highlight_link']}">${this.user?.secondarySportAthleticInfo['highlight_link']}</a></p><p><br></p>`;
      }

      const container = document.querySelector('.ql-editor');
      let target;

      if (container) {
        const paragraphs = Array.from(container.getElementsByTagName('p'));
        target = paragraphs.find((element) =>
          element?.textContent?.includes('Look forward to speaking with you.')
        );

        if (target) {
          const insertIndex = container.innerHTML.search(
            /<p>Look forward to speaking with you\./
          );
          container.innerHTML =
            container.innerHTML.slice(0, insertIndex) +
            linkHTML +
            container.innerHTML.slice(insertIndex);
        } else {
          container.innerHTML += linkHTML;
        }
      }

      this.selectedContacts[this.activeContact]['link'] = true;
    }
  }

  onAddProspectSheet() {
    if (this.selectedContacts[this.activeContact]['prospectSheet']) {
      const container = document.querySelector('.ql-editor');
      let profileTitle;
      let profileLink;

      if (container) {
        const paragraphs = Array.from(container.getElementsByTagName('p'));
        profileTitle = paragraphs.find((element) =>
          element?.textContent?.includes('Link to My Prospect Profile:')
        );
        const links = Array.from(container.getElementsByTagName('a'));
        profileLink = links.find((element) => {
          const url = `${window.location.protocol}//${window.location.host}/prospect-profile/${this.user.unicode}`;
          return element?.textContent?.includes(url);
        });
      }

      if (profileTitle) {
        profileTitle.remove();
      }
      if (profileLink) {
        profileLink.parentElement?.nextSibling?.remove();
        profileLink.parentElement?.remove();
      }

      const paragraphs = document.querySelectorAll('p');
      paragraphs.forEach((p: HTMLParagraphElement) => {
        if (!p.innerText.trim() || p.innerHTML.trim() === ' ') {
          p.remove();
        }
      });
      this.selectedContacts[this.activeContact]['prospectSheet'] = false;
    } else {
      let linkHTML = `<p>Link to My Prospect Profile:</p><p><a class="tracking" style="color: #2cbeff; word-break: break-word;" href="${window.location.protocol}//${window.location.host}/prospect-profile/${this.user.unicode}/${this.randomCode}">${window.location.protocol}//${window.location.host}/prospect-profile/${this.user.unicode}</a></p><p><br></p>`;
      const container = document.querySelector('.ql-editor');
      let target;

      if (container) {
        const paragraphs = Array.from(container.getElementsByTagName('p'));
        target = paragraphs.find((element) =>
          element?.textContent?.includes('Look forward to speaking with you.')
        );

        if (target) {
          const insertIndex = container.innerHTML.search(
            /<p>Look forward to speaking with you\./
          );
          container.innerHTML =
            container.innerHTML.slice(0, insertIndex) +
            linkHTML +
            container.innerHTML.slice(insertIndex);
        } else {
          container.innerHTML += linkHTML;
        }
      }

      this.selectedContacts[this.activeContact]['prospectSheet'] = true;
    }
  }

  onRemoveTemplate() {
    this.selectedContacts.forEach((contact: any) => {
      if (this.user) {
        contact['subject'] = '';
        contact['template'] = '';
        contact['prospectSheet'] = false;
        contact['link'] = false;
        contact['selectedTemplate'] = null;
      }
    });
  }

  async setMessageTemplate(template: any) {
    const tempTemplate: any = [];
    let recipient: null | string = null;
    const objectKey = this.convertToCamelCase(template.name);
    if (
      this.selectedContacts.some((contact: any) => contact['template']) &&
      this.selectedContacts.length > 1
    ) {
      if (!this.currentRouter.includes('automation')) {
        const result = await this.openSelectRecipientsDialog(
          this.selectedContacts[this.activeContact]['email']
        );
        if (result !== 'all') {
          recipient = result;
        }
      }
    }
    if (
      this.user &&
      this.user.hasOwnProperty(objectKey) &&
      this.user[objectKey]
    ) {
      console.log(objectKey);

      const selectedTemplate = this.user[objectKey];
      this.selectedContacts.forEach((contact: any) => {
        if (recipient) {
          if (contact.email !== recipient) {
            return;
          }
        }
        if (this.user) {
          if (
            !(this.user?.completeAddSport && this.user.appSport === 'secondary')
          ) {
            contact['subject'] = selectedTemplate['subject']
              ? selectedTemplate['subject']
              : `${this.user?.firstName} ${
                  this.user?.lastName
                } | ${this._formatPositions(
                  this.user?.primarySportPositions
                )} | ${this.user?.classOf}`;
          } else {
            contact['subject'] =
              this.user.secondarySportGeneralEmailTemplate &&
              this.user.secondarySportGeneralEmailTemplate['subject']
                ? this.user.secondarySportGeneralEmailTemplate['subject']
                : `${this.user?.firstName} ${
                    this.user?.lastName
                  } | ${this._formatPositions(
                    this.user?.secondarySportPositions
                  )} | ${this.user?.classOf}`;
          }

          contact['template'] = this.replaceDynamicValues(
            selectedTemplate.template,
            contact
          );
          contact['prospectSheet'] = true;
          contact['link'] = true;
          contact['selectedTemplate'] = template.name;
          tempTemplate.push({
            body: contact['template'],
            subject: contact['subject'],
          });
        }
      });
    } else {
      this.selectedContacts.forEach((contact: any) => {
        if (recipient) {
          if (contact.email !== recipient) {
            return;
          }
        }
        if (this.user) {
          if (
            !(this.user?.completeAddSport && this.user.appSport === 'secondary')
          ) {
            contact['subject'] = template['subject']
              ? template['subject']
              : `${this.user?.firstName} ${
                  this.user?.lastName
                } | ${this._formatPositions(
                  this.user?.primarySportPositions
                )} | ${this.user?.classOf}`;
          } else {
            contact['subject'] =
              this.user.secondarySportGeneralEmailTemplate &&
              this.user.secondarySportGeneralEmailTemplate['subject']
                ? this.user.secondarySportGeneralEmailTemplate['subject']
                : `${this.user?.firstName} ${
                    this.user?.lastName
                  } | ${this._formatPositions(
                    this.user?.secondarySportPositions
                  )} | ${this.user?.classOf}`;
          }

          contact['template'] = this.replaceDynamicValues(
            template.content,
            contact
          );
          contact['prospectSheet'] = true;
          contact['link'] = true;
          contact['selectedTemplate'] = template.name;
          tempTemplate.push({
            body: contact['template'],
            subject: contact['subject'],
          });
        }
      });
    }

    this.sharedService.setEmailGlobalFn(tempTemplate);
  }

  updateAllSubject() {
    const tempTemplate: any = [];
    const currentContact = this.selectedContacts[this.activeContact];
    this.selectedContacts.forEach((contact: any, index: number) => {
      if (this.user) {
        contact['subject'] = currentContact.subject;
        if (tempTemplate[index]) {
          tempTemplate[index].subject = contact['subject'];
        }
        tempTemplate.push({
          body: contact['template'],
          subject: contact['subject'],
        });
      }
    });
    this.sharedService.setEmailGlobalFn(tempTemplate);
  }

  updateAllTemplate() {
    const tempTemplate: any = [];
    const currentContact = this.selectedContacts[this.activeContact];
    const typingTemplate = this.getTextAfterFirstComma(currentContact.template);
    this.selectedContacts.forEach((contact: any, index: number) => {
      if (this.user) {
        contact['template'] = this.changeTextAfterFirstComma(
          this.replaceDynamicValues(contact.template, contact),
          typingTemplate
        );
        if (tempTemplate[index]) {
          tempTemplate[index].body = contact['template'];
        }
        tempTemplate.push({
          body: contact['template'],
          subject: contact['subject'],
        });
      }
    });
    this.sharedService.setEmailGlobalFn(tempTemplate);
  }

  changeTextAfterFirstComma(input: string, newText: string): string {
    const commaIndex = input.indexOf(',');
    if (commaIndex !== -1) {
      return input.substring(0, commaIndex + 1) + newText;
    }
    return newText;
  }

  changeTextBeforeFirstSpace(input: string, newText: string): string {
    const spaceIndex = input.indexOf(' ');
    if (spaceIndex !== -1) {
      return newText + input.substring(spaceIndex);
    }
    return input;
  }

  getTextAfterFirstComma(input: string): string {
    const commaIndex = input.indexOf(',');
    if (commaIndex !== -1) {
      return input.substring(commaIndex + 1).trim();
    }
    return input;
  }

  getTextBeforeFirstSpace(input: string): string {
    const spaceIndex = input.indexOf(' ');
    if (spaceIndex !== -1) {
      return input.substring(0, spaceIndex);
    }
    return input;
  }

  async closeCreateEmail() {
    const dialogRef = this._matDialog.open(SaveCampaignDialogComponent, {
      disableClose: true,
    });
    const result = await firstValueFrom(dialogRef.afterClosed());
    if (!result) {
      this.sharedService.setEmailGlobalFn([]);
    }
    this.close.emit(true);
  }

  convertToCamelCase(input: string): string {
    const words = input.split(/[\s_]+/);
    const camelCaseWords = words.map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
    return camelCaseWords.join('');
  }

  replaceDynamicValues<T>(template: string, contact: any): string {
    let str = template;
    if (this.user) {
      str = str.replaceAll(
        '${userFirstName}',
        this.user.firstName ? this.user.firstName : ''
      );
      str = str.replaceAll(
        '${userLastName}',
        this.user.lastName ? this.user.lastName : ''
      );
      str = str.replaceAll(
        '${userEmail}',
        this.user.email ? this.user.email : ''
      );
      str = str.replaceAll(
        '${userPhone}',
        this.user.phoneNumber ? this.user.phoneNumber : ''
      );
      str = str.replaceAll(
        '${userSport}',
        this.user.primarySport ? this.user.primarySport : ''
      );
      str = str.replaceAll(
        '${coachFirstName}',
        this.user.secondarySportCoachFirstName
          ? this.user.secondarySportCoachFirstName
          : ''
      );
      str = str.replaceAll(
        '${coachLastName}',
        this.user.secondarySportCoachLastName
          ? this.user.secondarySportCoachLastName
          : ''
      );
      str = str.replaceAll('${collegeName}', '(College Name)');
      str = str.replaceAll('${collegeCoachLastName}', '(Coach Name)');
      str = str.replaceAll(
        '${secondaryHighSchool}',
        this.user.secondaryHighSchool ?? this.user.secondaryHighSchool
      );
      str = str.replaceAll(
        '${highSchool}',
        this.user.highSchool ?? this.user.highSchool
      );
      str = str.replaceAll('${club}', this.user.club ? this.user.club : '');
      str = str.replaceAll('${classOf}', this.user.classOf.toString());
      str = str.replaceAll('${city}', this.user.city ?? this.user.city);
      str = str.replaceAll('${state}', this.user.state ?? this.user.state);
      str = str.replaceAll(
        '${primarySportAthleticInfo.height}',
        this.user && this.user.primarySportAthleticInfo
          ? this.convertToFeet(
              this.user.primarySportAthleticInfo['height'] as number
            ).toString()
          : ''
      );
      str = str.replaceAll(
        '${primarySportAthleticInfo.weight}',
        this.user && this.user.primarySportAthleticInfo
          ? this.user.primarySportAthleticInfo['weight']?.toString()
          : ''
      );
      str = str.replaceAll(
        '${academicInfo.gpa}',
        this.user && this.user.academicInfo['gpa']
          ? this.user.academicInfo['gpa'].toString()
          : ''
      );
      this.randomCode = this.generateUniqueUnicode();
      while (this.exsistCode.includes(this.randomCode)) {
        this.randomCode = this.generateUniqueUnicode();
      }
      this.exsistCode.push(this.randomCode);
      this.sharedService.updateUnicode(this.exsistCodeId, {
        codes: this.exsistCode,
      });
      str = str.replaceAll(
        '${secondarySportAthleticInfo.highlight_link}',
        `<a style="color: #2cbeff; word-break: break-word;" class="tracking" href="${window.location.protocol}//${window.location.host}/prospect-profile/${this.user.unicode}/${this.randomCode}">${window.location.protocol}//${window.location.host}/prospect-profile/${this.user.unicode}</a></p>`
      );
      str = str.replaceAll(
        '${primarySportPositions}',
        this.user && this.user.primarySportPositions
          ? this.user.primarySportPositions.toString()
          : ''
      );
      str = str.replaceAll(
        '${secondarySportPositions}',
        this.user && this.user.secondarySportPositions
          ? this.user.secondarySportPositions.toString()
          : ''
      );
    }
    str = str.replaceAll(
      /\(Coach\s+Name\)|\(Coach\)|\([Cc]oach\s*[Nn]ame\)|\(Coach[\s.,:;]*Name\)/g,
      `${contact.lastName}`
    );
    str = str.replaceAll(
      /\(College\s+Name\)|\(CollegeName\)|\([Cc]ollege\s*[Nn]ame\)|\(College[\s.,:;]*Name\)/g,
      `${contact.college.name}`
    );

    return str;
  }

  convertToFeet(inches: number): string {
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}`;
  }

  private _formatPositions(positions: string[]) {
    return positions
      .map((p: string) =>
        p
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      )
      .join('/');
  }

  onBack() {
    localStorage.removeItem('contacts');
    if (
      this.selectedContacts.some((contact: any) => {
        return (
          contact.link ||
          contact.prospectSheet ||
          contact.template ||
          contact.subject
        );
      })
    ) {
      this.showDraftsMenu = true;
    } else {
      if (this.isOverlay) {
        this.showDraftsMenu = false;
        this.close.emit(true);
        return;
      }
      this._router.navigate(['college-library']);
    }
  }

  onDelete() {
    if (this.draftId) {
      this._createEmailService.deleteDraft(this.user?.id, this.draftId);
    }
    if (this.isOverlay) {
      this.showDraftsMenu = false;
      this.close.emit(true);
      return;
    }
    this._router.navigate(['college-library']);
  }

  onSaveDrafts() {
    if (this.draftId) {
      this._createEmailService.updateDraft(
        this.user?.id,
        this.draftId,
        this.selectedContacts
      );
    } else {
      this._createEmailService.saveDrafts(this.user?.id, this.selectedContacts);
    }
    if (this.isOverlay) {
      this.showDraftsMenu = false;
      this.close.emit(true);
      return;
    }
    this._router.navigate(['college-library']);
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

  private generateImageName(email: string): string {
    const name = email.split('@')[0];
    const timestamp = new Date().getTime();
    return `${name}${timestamp}`;
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

  private async uploadImage(base64Image: string, image: string): Promise<any> {
    const blob = this.base64ToBlob(base64Image);
    const storageRef = this.storage.ref(`ReadEmailImages/${image}`);
    const snapshot = await storageRef.put(blob);
    const downloadURL = await snapshot.ref.getDownloadURL();
    return downloadURL;
  }

  canvasToBase64(canvas: HTMLCanvasElement): string {
    return canvas.toDataURL();
  }
  async createAndUploadPixelImage(email: string): Promise<void> {
    const canvas = await this.createPixelImage();
    const imageName = this.generateImageName(email);
    const base64Image = this.canvasToBase64(canvas);
    const downloadURL = await this.uploadImage(base64Image, imageName);
    return downloadURL;
  }

  async onSend() {
    if (
      (this.user?.connectedGmailToken || this.user?.connectedMicrosoftToken) &&
      this.user?.connectedEmail
    ) {
      const loading = await firstValueFrom(this.loading$);
      if (loading) {
        return;
      }
      if (this.selectedContacts.length > 1) {
        const dialogRef = this._matDialog.open(SendEmailDialogComponent, {
          disableClose: true,
        });
        const result = await firstValueFrom(dialogRef.afterClosed());
        if (!result) {
          return;
        }
      }

      this.selectedContactMissingMailField = this.selectedContacts.filter(
        (data: any) => {
          return !data.subject || !data.template;
        }
      );

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
        this._router.navigate(['college-library']);
        this._createEmailService.setSentEmailResponse();
      }

      if (this.draftId) {
        this._createEmailService.deleteDraft(this.user?.id, this.draftId);
      }

      const contactsToSend = this.selectedContacts;

      if (contactsToSend.length) {
        const from = {
          name: `${this.user?.firstName} ${this.user?.lastName}`,
          address: this.user?.connectedEmail,
        };
        let listPixelUrl: any[] = [];
        const contacts = await Promise.all(
          contactsToSend.map(async (contact: any) => {
            const url = await this.createAndUploadPixelImage(contact.email);

            listPixelUrl.push(url);
            const pixelTrackingUrl = `${environment.apiURL}/gmail/track-email-open?code=${this.randomCode}`;
            const template = `
            <html>
              <body>
                ${contact.template}
                <img src="${pixelTrackingUrl}" width="1" height="1" />
              </body>
            </html>
          `;
            const html = template;
            return {
              from,
              to: {
                address: contact.email,
              },
              subject: contact.subject,
              html,
              pixelUrl: pixelTrackingUrl,
              prospectSheet: contact.prospectSheet,
            };
          })
        );

        const data: any = {
          contacts,
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
                res['selectedContacts'] = this.selectedContacts;
                if (this.file) {
                  res['file'] = this.file;
                }
                this._createEmailService.sentEmailResults$.next(res);
                this.updateUserFb(contactsToSend, listPixelUrl);
              }
              this.loading$.next(false);
            });
        }
      } else {
        this.loading$.next(false);
      }
      // this.sharedService.setEmailGlobalFn([]);
    } else {
      this.connectEmailFlow();
    }
  }

  async updateUserFb(emailList: any[], pixelUrl: string[]) {
    if (this.user) {
      const allSent = this.user.campaignsSent || [];
      const notCampaignSent =
        this.user.campaignsSent?.filter(
          (item: any) => item.type !== 'automation'
        ) || [];
      const count = notCampaignSent.length || 0;
      let sentColleges: any[] = [];
      let coachesWithReadStatus: any[] = [];

      if (this.user && this.user?.activityTracking) {
        const fbSentEmailsData: any = emailList.map(
          (coach: any, index: number) => {
            const currentCoach = coach.college.college.contacts.find(
              (contact: any) => contact.email === coach.email
            );
            const data = {
              coachName: currentCoach.firstName + ' ' + currentCoach.lastName,
              collegeId: coach.college.collegeId,
              collegeName: coach.college.name,
              coachEmail: emailList[index].email,
              date: new Date(),
              url: pixelUrl[index],
              message: 'received your email',
              logoUrl: coach.college.college.logoUrl,
              name: this.user.firstName + ' ' + this.user.lastName,
              twitter: currentCoach.twitter,
              position: currentCoach.position,
              type: 'library',
              division:
                coach.college.college['sportInfo'][this.collegeSport]
                  .division || '',
              conference:
                coach.college.college['sportInfo'][this.collegeSport]
                  .conference || '',
              conferenceLogo:
                coach.college.college['sportInfo'][this.collegeSport] || '',
              userId: this.user?.id,
              unicode: this.randomCode,
            };
            return this.sharedService.addSentEmail(data);
          }
        );

        forkJoin(fbSentEmailsData).subscribe(
          (results: string[]) => {
            console.log('All emails have been sent successfully', results);
            coachesWithReadStatus = emailList.map(
              (coach: any, index: number) => {
                sentColleges.push(coach.college.collegeId);
                return {
                  url: pixelUrl[index],
                  coach: coach.email,
                  collegeId: coach.college.collegeId,
                  isOpen: false,
                  isClick: false,
                  unicode: this.randomCode,
                  sentEmailId: results[index],
                };
              }
            );

            const newData = {
              name: `Library ${count + 1}`,
              date: new Date().toLocaleDateString(),
              sentColleges: sentColleges,
              numberOfSentEmail: emailList.length,
              type: 'library',
              readCoachesList: coachesWithReadStatus,
            };
            this.user.campaignsSent = allSent.concat(newData);
            this._auth.updateUserData(this.user?.id, this.user);
          },
          (error) => {
            console.error('An error occurred while sending emails', error);
          }
        );
      }
    }
  }

  generateUniqueUnicode(): string {
    let randomNum = Math.floor(Math.random() * 100000000);

    return randomNum.toString().padStart(8, '0');
  }

  finish() {
    this.close.emit(true);
    this.listEmail = this.listEmail.filter((email: any) => {
      return this.selectedContacts.some(
        (contact: any) => contact.email === email.email
      );
    });
    this.sharedService.setCoachEmails({
      coaches: this.listEmail,
      recipients: this.countCollege,
    });
  }

  onCloseProspectSheet(event: MouseEvent) {
    if (window.innerWidth >= 1280 && this.showProspectSheet) {
      const target = event.target as HTMLElement;
      if (target.classList.contains('prospect-sheet-container')) {
        this.showProspectSheet = false;
      }
    }
  }

  onEsc(event: KeyboardEvent) {
    if (this.showProspectSheet && event.key === 'Escape') {
      this.showProspectSheet = false;
    }
  }

  public handleCloseMailRequiredFieldPopup(): void {
    this._matDialog.closeAll();
  }
}
