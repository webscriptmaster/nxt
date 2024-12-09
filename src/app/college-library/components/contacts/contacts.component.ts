import { CollegeLibraryContactsInfoDialogComponent } from './../../dialogs/contacts-info-dialog/contacts-info-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { firstValueFrom, forkJoin, Subject, takeUntil } from 'rxjs';
import { ProviderDialogComponent } from 'src/app/create-email/dialogs/provider-dialog/provider-dialog.component';
import { User } from 'src/app/models/user';
import { CreateEmailService } from 'src/app/create-email/create-email.service';
import { AuthService } from 'src/app/auth/auth.service';
import { TemplateService } from 'src/app/shared/template.service';
import { SharedService } from 'src/app/shared/shared.service';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-college-card-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
})
export class CollegeCardContactsComponent implements OnInit, OnDestroy {
  @Input() contacts: any;
  @Output() toggleContact = new EventEmitter();
  @Input() selectedContacts: any;
  @Input() college: any;
  @Input() collegeSport: any;

  _unsubscribeAll = new Subject<void>();
  typeTemplate: string = '';
  currentEmailUser = '';
  isShowAddEmailTemplate = false;
  showConnectEmail = false;
  ObjectKeys = Object.keys;
  user: User | null | any = null;
  draftId: any;
  file: File | null;
  listTemplate: any[];
  data: any;

  constructor(
    private _matDialog: MatDialog,
    private _auth: AuthService,
    private _createEmailService: CreateEmailService,
    private templateService: TemplateService,
    private dialog: MatDialog,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this._auth.user$.subscribe((res) => {
      this.user = res;
      if (
        this.user &&
        !this.user.connectedGmailToken &&
        !this.user.connectedMicrosoftToken
      ) {
        this.isShowAddEmailTemplate = true;
        this.showConnectEmail = false;
        if (
          this.user.email &&
          (this.user.email.includes('@gmail') ||
            this.user.email.includes('@hotmail') ||
            this.user.email.includes('@outlook'))
        ) {
          this.showConnectEmail = true;
          this.isShowAddEmailTemplate = false;
        }
      } else {
        this.showConnectEmail = false;
        this.isShowAddEmailTemplate = false;
      }
    });
    this.contacts.forEach((element: any) => {
      element.isSelected = false;
    });
    this.getAllTemplatesEmail();
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

  onInfoDialog() {
    const dialogRef = this._matDialog.open(
      CollegeLibraryContactsInfoDialogComponent,
      {
        disableClose: true,
      }
    );
  }

  onToggleContact(
    email: string,
    firstName: string,
    lastName: string,
    id: string
  ) {
    const typeTemplate = this.typeTemplate;
    this.toggleContact.emit({ email, firstName, lastName, id, typeTemplate });
    this.typeTemplate = '';
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

  async addEmailTemplate(contact: any, selectedTemplate: any) {
    const objectKey = this.convertToCamelCase(selectedTemplate.name);
    this._createEmailService.selectedContacts$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res) => {
        this.selectedContacts = res;
        if (res) {
          this.typeTemplate = selectedTemplate.name;

          if (
            this.user &&
            !this.user.connectedGmailToken &&
            !this.user.connectedMicrosoftToken
          ) {
            if (this.selectedContacts.length > 1) {
              this.selectedContacts = [this.selectedContacts.pop()];
            }
            if (this.user && this.user.hasOwnProperty(objectKey)) {
              const tempTemplate = this.user[objectKey];
              if (
                !(
                  this.user?.completeAddSport &&
                  this.user.appSport === 'secondary'
                )
              ) {
                contact.subject =
                  tempTemplate && tempTemplate['subject']
                    ? tempTemplate['subject']
                    : `${this.user?.firstName} ${
                        this.user?.lastName
                      } | ${this._formatPositions(
                        this.user?.primarySportPositions
                      )} | ${this.user?.classOf}`;
              } else {
                contact.subject =
                  tempTemplate && tempTemplate['subject']
                    ? tempTemplate['subject']
                    : `${this.user?.firstName} ${
                        this.user?.lastName
                      } | ${this._formatPositions(
                        this.user?.secondarySportPositions
                      )} | ${this.user?.classOf}`;
              }
              contact.body = this.removeTagsAndReplaceBreak(
                this.replaceDynamicValues(selectedTemplate.content, contact)
              );
              contact.prospect = true;
              contact.link = true;
            } else {
              if (
                !(
                  this.user?.completeAddSport &&
                  this.user.appSport === 'secondary'
                )
              ) {
                contact.subject =
                  selectedTemplate && selectedTemplate['subject']
                    ? selectedTemplate['subject']
                    : `${this.user?.firstName} ${
                        this.user?.lastName
                      } | ${this._formatPositions(
                        this.user?.primarySportPositions
                      )} | ${this.user?.classOf}`;
              } else {
                contact.subject =
                  selectedTemplate && selectedTemplate['subject']
                    ? selectedTemplate['subject']
                    : `${this.user?.firstName} ${
                        this.user?.lastName
                      } | ${this._formatPositions(
                        this.user?.secondarySportPositions
                      )} | ${this.user?.classOf}`;
              }
              contact.body = this.removeTagsAndReplaceBreak(
                this.replaceDynamicValues(
                  selectedTemplate.content,
                  this.selectedContacts[0]
                )
              );
              contact.prospect = true;
              contact.link = true;
            }
          }
        }
      });
    this.openMail(contact);
    if (this.user && this.user?.activityTracking) {
      setTimeout(() => {
        this.completeSendMail(contact);
      }, 2000);
    }
  }

  async completeSendMail(contact: any) {
    const confirmDeleteDialogRef = await this.dialog.open(
      ConfirmDialogComponent,
      {
        autoFocus: false,
        data: {
          title: 'Complete Questionnaire',
          message: 'Did You Email This College Coach?',
          info: 'Tracking Enabled',
          firstButtonText: 'Yes',
          secondButtonText: 'No',
          firstButtonColor: '#CCFF00',
          secondButtonColor: '#FF0303',
          firstButtonBorder: '1px solid #fff',
          secondButtonBorder: '1px solid #fff',
        },
      }
    );
    const result = await firstValueFrom(confirmDeleteDialogRef.afterClosed());
    if (!result) {
      return;
    }
    this.updateFbData(contact);
  }

  updateFbData(contact: any) {
    const campaignSent =
      this.user.campaignsSent?.filter(
        (item: any) => item.type !== 'automation'
      ) || [];
    const count = campaignSent.length || 0;
    const coachesWithReadStatus = [
      {
        url: null,
        coach: contact.email,
        collegeId: this.selectedContacts[0].college._id,
        isOpen: false,
        isClick: false,
      },
    ];

    const data = {
      coachName: contact.firstName + ' ' + contact.lastName,
      collegeId: this.college._id,
      collegeName: this.college.name,
      coachEmail: contact.email,
      date: new Date(),
      message: 'received your email',
      logoUrl: this.college.logoUrl,
      name: this.user.firstName + ' ' + this.user.lastName,
      sport: this.collegeSport,
      twitter: contact.twitter,
      position: contact.position,
      type: 'non-connected',
      division: this.college['sportInfo'][this.collegeSport].division,
      conference: this.college['sportInfo'][this.collegeSport].conference,
      conferenceLogo: this.college['sportInfo'][this.collegeSport],
      userId: this.user?.id,
    };
    this.sharedService.addSentEmail(data);
    // }

    const newData = {
      name: `Library ${count + 1}`,
      date: new Date().toLocaleDateString(),
      sentColleges: [this.college._id],
      type: 'non-connected',
      numberOfSentEmail: 1,
      readCoachesList: coachesWithReadStatus,
    };
    this.user.campaignsSent = campaignSent.concat(newData);
    this._auth.updateUserData(this.user?.id, this.user);
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

      str = str.replaceAll(
        '${secondarySportAthleticInfo.highlight_link}',
        `<a style="color: #2cbeff; word-break: break-word;" class="tracking" href="${window.location.protocol}//${window.location.host}/prospect-profile/${this.user.unicode}">${window.location.protocol}//${window.location.host}/prospect-profile/${this.user.unicode}</a></p>`
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

  removeTagsAndReplaceBreak(htmlString: string): string {
    const replacedBreak = htmlString.replace(/<br>/g, '%0D%0A');
    const withoutTags = replacedBreak.replace(/<[^>]*>/g, '');
    return withoutTags;
  }

  openMail(contact: any) {
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = `mailto:${contact.email}?subject=${contact.subject}&body=${contact.body}`;
      link.style.textDecoration = 'none';
      link.style.color = 'black';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      link.remove();
    }, 0);
  }

  async connectEmailFlow() {
    if (!this.isShowAddEmailTemplate && this.showConnectEmail) {
      const provider = await this.openProviderDialog();
      const url = await this._createEmailService.getConnectURL(
        this.user?.id ?? '',
        provider
      );
      return this._openLink(url!);
    } else {
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

  public handleMenuOpen(menu: any): void {
    const menuElement = document.querySelector(`#${menu.panelId}`);
    if (!menuElement) {
      return;
    }
    setTimeout(() => {
      const parent = menuElement.closest(
        '.cdk-overlay-connected-position-bounding-box'
      ) as HTMLElement;
      if (!parent) {
        return;
      }
      const { x } = parent.getBoundingClientRect();
      if (x === 0) {
        parent.style.left = `-68px`;
        return;
      }
      parent.style.left = `${x + 10}px`;
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
