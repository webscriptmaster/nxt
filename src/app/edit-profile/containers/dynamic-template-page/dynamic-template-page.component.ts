import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, BehaviorSubject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user';
import { TEMPLATES } from 'src/app/shared/const';
import { TemplateService } from 'src/app/shared/template.service';

@Component({
  selector: 'app-dynamic-template-page',
  templateUrl: './dynamic-template-page.component.html',
  styleUrls: ['./dynamic-template-page.component.scss'],
})
export class DynamicTemplatePageComponent implements OnInit, OnDestroy {
  _unsubscribeAll = new Subject<void>();
  TEMPLATES = TEMPLATES;
  type = TEMPLATES.GENERAL;
  currentTemplate: any;
  template = '';
  userData: User | null = null;

  saved$ = new BehaviorSubject(false);

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _auth: AuthService,
    private templateService: TemplateService
  ) {
    this._route.data.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
      this.type = data['type'];
    });
    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
      this.userData = res;
    });
  }

  ngOnInit() {
    this.templateService.currentTemplate$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: any) => {
        this.currentTemplate = res;
        if (this.userData) {
          let str = this.currentTemplate.content;
          str = this.replaceDynamicValues(str);
          this.currentTemplate.content = str;
          this.template = str;
        }
        this.type = res.type;
      });
  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  replaceDynamicValues<T>(template: string): string {
    let str = template;
    if (this.userData) {
      str = str.replaceAll(
        '${userFirstName}',
        this.userData.firstName ? this.userData.firstName : '(First Name)'
      );
      str = str.replaceAll(
        '${userLastName}',
        this.userData.lastName ? this.userData.lastName : '(Last Name)'
      );
      str = str.replaceAll(
        '${userEmail}',
        this.userData.email ? this.userData.email : '(Email)'
      );
      str = str.replaceAll(
        '${userPhone}',
        this.userData.phoneNumber ? this.userData.phoneNumber : '(Phone Number)'
      );
      str = str.replaceAll(
        '${userSport}',
        this.userData.primarySport ? this.userData.primarySport : '(Sport)'
      );
      str = str.replaceAll(
        '${coachFirstName}',
        this.userData.secondarySportCoachFirstName
          ? this.userData.secondarySportCoachFirstName
          : '(Coach First Name)'
      );
      str = str.replaceAll(
        '${coachLastName}',
        this.userData.secondarySportCoachLastName
          ? this.userData.secondarySportCoachLastName
          : '(Coach Last Name)'
      );
      str = str.replaceAll('${collegeName}', '(College Name)');
      str = str.replaceAll('${collegeCoachLastName}', '(Coach Name)');
      str = str.replaceAll(
        '${secondaryHighSchool}',
        this.userData.secondaryHighSchool
          ? this.userData.secondaryHighSchool
          : '(High School)'
      );
      str = str.replaceAll(
        '${highSchool}',
        this.userData.highSchool ? this.userData.highSchool : '(High School)'
      );
      str = str.replaceAll(
        '${club}',
        this.userData.club ? this.userData.club : '(Club)'
      );
      str = str.replaceAll(
        '${classOf}',
        this.userData.classOf ? this.userData.classOf.toString() : '(Class Of)'
      );
      str = str.replaceAll(
        '${city}',
        this.userData.city ? this.userData.city : '(City)'
      );
      str = str.replaceAll(
        '${state}',
        this.userData.state ? this.userData.state : '(State)'
      );
      str = str.replaceAll(
        '${primarySportAthleticInfo.height}',
        this.userData && this.userData.primarySportAthleticInfo
          ? this.convertToFeet(
              this.userData.primarySportAthleticInfo['height'] as number
            ).toString()
          : '(Height)'
      );
      str = str.replaceAll(
        '${primarySportAthleticInfo.weight}',
        this.userData && this.userData.primarySportAthleticInfo
          ? this.userData.primarySportAthleticInfo['weight']?.toString()
          : '(Weight)'
      );
      str = str.replaceAll(
        '${academicInfo.gpa}',
        this.userData && this.userData.academicInfo['gpa']
          ? this.userData.academicInfo['gpa'].toString()
          : '(GPA)'
      );

      str = str.replace(
        '${secondarySportAthleticInfo.highlight_link}',
        `<a style="color: #2cbeff; word-break: break-word;" target="_blank" class="tracking" href="${window.location.protocol}//${window.location.host}/prospect-profile/${this.userData.unicode}">${window.location.protocol}//${window.location.host}/prospect-profile/${this.userData.unicode}</a>`
      );
      str = str.replaceAll(
        '${primarySportPositions}',
        this.userData && this.userData.primarySportPositions
          ? this.userData.primarySportPositions.toString()
          : '(Primary Sport Positions)'
      );
      str = str.replaceAll(
        '${secondarySportPositions}',
        this.userData && this.userData.secondarySportPositions
          ? this.userData.secondarySportPositions.toString()
          : '(Secondary Sport Positions)'
      );
    }
    return str;
  }

  convertToFeet(inches: number): string {
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}`;
  }

  onBack() {
    this._router.navigate(['/edit-profile/templates']);
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

  convertToCamelCase(input: string): string {
    const words = input.split(/[\s_]+/);
    const camelCaseWords = words.map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
    return camelCaseWords.join('');
  }

  onSave(result: any) {
    if (this.userData) {
      if (
        !(
          this.userData.completeAddSport &&
          this.userData.appSport === 'secondary'
        )
      ) {
        if (this.type === TEMPLATES.GENERAL) {
          this._auth.updateUserData(this.userData.id, {
            generalEmailTemplate: {
              template: result.template,
              subject: result.subject,
              prospectSheet: result.prospectSheet,
            },
          });
        }
        if (this.type === TEMPLATES.PERSONAL) {
          this._auth.updateUserData(this.userData.id, {
            personalEmailTemplate: {
              template: result.template,
              subject: result.subject,
              prospectSheet: result.prospectSheet,
            },
          });
        }
        if (this.type === TEMPLATES.OWN) {
          this._auth.updateUserData(this.userData.id, {
            ownEmailTemplate: {
              template: result.template,
              subject: result.subject,
              prospectSheet: result.prospectSheet,
            },
          });
        }
        if (this.type !== TEMPLATES.SOCIAL) {
          const key = this.convertToCamelCase(this.currentTemplate.name);
          const temp: any = {};
          temp[key] = {
            template: result.template,
            subject: result.subject,
            prospectSheet: result.prospectSheet,
          };
          console.log(temp);

          this._auth.updateUserData(this.userData.id, temp);
        }
      } else {
        if (this.type === TEMPLATES.GENERAL) {
          this._auth.updateUserData(this.userData.id, {
            secondarySportGeneralEmailTemplate: {
              template: result.template,
              subject: result.subject,
              prospectSheet: result.prospectSheet,
            },
          });
        }
        if (this.type === TEMPLATES.PERSONAL) {
          this._auth.updateUserData(this.userData.id, {
            secondarySportPersonalEmailTemplate: {
              template: result.template,
              subject: result.subject,
              prospectSheet: result.prospectSheet,
            },
          });
        }
        if (this.type === TEMPLATES.OWN) {
          this._auth.updateUserData(this.userData.id, {
            secondarySportOwnEmailTemplate: {
              template: result.template,
              subject: result.subject,
              prospectSheet: result.prospectSheet,
            },
          });
        }
        if (this.type !== TEMPLATES.SOCIAL) {
          const key = this.convertToCamelCase(this.currentTemplate.name);
          const temp: any = {};
          temp[key] = {
            template: result.template,
            subject: result.subject,
            prospectSheet: result.prospectSheet,
          };
          console.log(temp);

          this._auth.updateUserData(this.userData.id, temp);
        }
      }
      this.saved$.next(true);
      setTimeout(() => {
        this.saved$.next(false);
      }, 1500);
    }
  }
}
