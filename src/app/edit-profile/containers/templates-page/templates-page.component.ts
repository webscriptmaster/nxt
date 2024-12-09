import { AuthService } from 'src/app/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user';
import { TemplateService } from 'src/app/shared/template.service';

@Component({
  selector: 'app-edit-profile-templates',
  templateUrl: './templates-page.component.html',
  styleUrls: ['./templates-page.component.scss'],
})
export class EditProfileTemplatesPageComponent implements OnInit {
  user$: Observable<User | null>;
  listTemplate: any[] = [];
  constructor(
    private _router: Router,
    private _auth: AuthService,
    private templateService: TemplateService) {}

  ngOnInit() {
    this.user$ = this._auth.user$;
    this.getAllTemplates()
  }

  getAllTemplates() {
    this.templateService.getAllTemplates().subscribe((res) => {
      res = res.filter((template: any) => {return template.name !== '' && template.content !== ''});
      this.listTemplate = Object.entries(res.reduce((acc, template) => {
        const category = template.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(template);
        return acc;
      }, {})).map(([category, templates]) => ({ category, templates }));
    });
  }

  onBack() {
    this._router.navigate(['/home']);
  }

  onGeneralTemplate() {
    this._router.navigate(['/edit-profile/general-template']);
  }
  onGoToTemplate(template: any) {
   this.templateService.changeTemplate(template);
   this._router.navigate(['/edit-profile/dynamic-template']); 
  }
  onPersonalTemplate() {
    this._router.navigate(['/edit-profile/personal-template']);
  }
  onOwnTemplate() {
    this._router.navigate(['/edit-profile/own-template']);
  }
  onSocialTemplate() {
    this._router.navigate(['/edit-profile/social-template']);
  }

  onHelp() {
    const url = `https://nxt1sports.com/faqs?block=3`;
    this.openLink(url);
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
}
