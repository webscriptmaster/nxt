import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  AfterViewInit,
  EventEmitter,
  Output,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { CreateEmailService } from 'src/app/create-email/create-email.service';

@Component({
  selector: 'app-drafts-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss'],
})
export class DraftsTemplateComponent implements OnInit, AfterViewInit {
  @Input() draft: any;
  @Input() editMode = false;
  @Output() selectDraft = new EventEmitter<any>();

  @ViewChild('template') template: ElementRef;
  @ViewChild('container') container: ElementRef;
  @ViewChild('card') card: ElementRef;

  constructor(
    private _createEmailService: CreateEmailService,
    private _auth: AuthService
  ) {}

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.setTemplate();
  }

  setTemplate() {
    if (this.draft.templates[0].template) {
      if (window.innerWidth < 1200) {
        this.template.nativeElement.innerHTML = this.draft.templates[0].template
          .replace('font-size: 15px', 'font-size: 13px')
          .replace('color: #000', 'color: #BFBFBF');
      } else {
        this.template.nativeElement.innerHTML = this.draft.templates[0].template
          .replace('font-size: 15px', 'font-size: 14px; font-weight: 600')
          .replace('color: #000', 'color: #BFBFBF');
      }
    } else {
      this.template.nativeElement.innerHTML = 'Body';
    }
  }

  onSelectDraft(id: string) {
    this.selectDraft.emit(
      this.draft.templates.map((t: any) => {
        return {
          ...t,
          draftId: id,
        };
      })
    );
  }

  async onDelete(id: string) {
    const user = await firstValueFrom(this._auth.user$);
    this.container.nativeElement.classList.add('removed');
    setTimeout(() => {
      this.card.nativeElement.classList.add('removed');
      setTimeout(() => {
        this._createEmailService.deleteDraft(user?.id, id);
      }, 150)
    }, 400)
    
  }
}
