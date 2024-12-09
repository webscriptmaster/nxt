import { TEMPLATES } from './../../../shared/const';
import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  EventEmitter,
  Output,
  ChangeDetectorRef,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-email-template',
  templateUrl: './email-template.component.html',
  styleUrls: ['./email-template.component.scss'],
})
export class EmailTemplateComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  TEMPLATES = TEMPLATES;
  @Input() type: TEMPLATES;
  @Input() user: User | null;
  @Input() field: string;
  @Input() defaultTemplate: string | null;
  @Input() template: string | null = null;

  @ViewChild('message', { static: true }) message: ElementRef;

  @Output() save = new EventEmitter<any>();

  subject: string | null = null;
  prospectSheet = false;
  showProspectSheet = false;
  edit: boolean = false;
  constructor(private _cdr: ChangeDetectorRef, private _auth: AuthService) {}

  ngOnInit() {
    window.addEventListener('keyup', this.onEsc.bind(this));
    if (this.user) {
      const templateField = this.convertToCamelCase(this.field);
      if (templateField && this.user.hasOwnProperty(templateField)) {
        this.template = this.getValueByMostSimilarKey(templateField, this.user);
        this.template = this.template.replaceAll(
          '${secondarySportAthleticInfo.highlight_link}',
          `<a style="color: #2cbeff; word-break: break-word;" target="_blank" class="tracking" href="${window.location.protocol}//${window.location.host}/prospect-profile/${this.user.unicode}">${window.location.protocol}//${window.location.host}/prospect-profile/${this.user.unicode}</a></p>`
        );
        console.log(this.template);
      }
    }
  }

  ngAfterViewInit() {
    if (this.user) {
      this.subject =
        this.user.generalEmailTemplate &&
        this.user.generalEmailTemplate['subject']
          ? this.user.generalEmailTemplate['subject']
          : `${this.user?.firstName} ${
              this.user?.lastName
            } | ${this._formatPositions(this.user?.primarySportPositions)} | ${
              this.user?.classOf
            }`;
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('keyup', this.onEsc.bind(this));
  }

  resetTemplate() {
    this.template = this.defaultTemplate;
    this.user as any;
    const templateField = this.convertToCamelCase(this.field);
    if (this.user && this.user.hasOwnProperty(templateField)) {
      delete this.user[templateField];
      if (this.user) {
        console.log(this.user);
        this._auth.updateUserData(this.user.id, { [templateField]: null });
      }
    }
  }

  getValueByMostSimilarKey(mostSimilarKey: string | null, object: any): any {
    if (mostSimilarKey && object.hasOwnProperty(mostSimilarKey)) {
      console.log(object[mostSimilarKey].template);
      return object[mostSimilarKey].template;
    }
    return null;
  }

  editTemplate() {
    this.edit = true;
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

  onSave() {
    const ownEmailTemplate = {
      type: this.type,
      subject: this.subject,
      template: this.template,
      prospectSheet: this.prospectSheet,
    };
    ownEmailTemplate.template = ownEmailTemplate.template.replace(
      /<a.*?>(.*?)<\/a>/g,
      '${secondarySportAthleticInfo.highlight_link}'
    );
    this.save.emit(ownEmailTemplate);
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
}
