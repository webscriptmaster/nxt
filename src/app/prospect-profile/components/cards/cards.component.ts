import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, switchMap } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Category, Template } from 'src/app/models/prospect';
import { User } from 'src/app/models/user';
import { SharedService } from 'src/app/shared/shared.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
})
export class CardsComponent implements OnChanges {
  @Input() isViewAll;
  @Input() listProfile;
  @Output() viewAllFn = new EventEmitter<string>();
  availableTemplate: string[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private _router: Router,
    private _auth: AuthService,
    private location: Location
  ) {
    this._auth.user$
      .pipe(
        switchMap((user: any) => {
          this.availableTemplate = user?.availableTemplate || [];
          return EMPTY;
        })
      )
      .subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes &&
      changes['listProfile'] &&
      changes['listProfile'].currentValue
    ) {
      this.listProfile = changes['listProfile'].currentValue;
      this.listProfile.forEach((element) => {
        if (element?.templates) {
          element.templates = element.templates.filter(
            (template) => !template.hidden
          );
        }
      });
      this.cdr.detectChanges();
    }
  }

  viewAll(index: any): void {
    this.viewAllFn.emit(index);
    this.isViewAll = true;
  }

  goBack() {
    this.isViewAll = false;
    this.viewAllFn.emit('-1');
  }

  viewDetail(category: Category, card: Template): void {
    this._router.navigate([
      `media-pro/graphics-pro/template/${category.documentId}/${card.id}`,
    ]);
    // this.location.replaceState(
    //   `media-pro/graphics-pro/${category.documentId}/${card.id}`
    // );
  }
}
