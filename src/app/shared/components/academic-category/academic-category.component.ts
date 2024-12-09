import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { User } from 'src/app/models/user';
import { SportService } from '../../sport.service';

@Component({
  selector: 'app-academic-category',
  templateUrl: './academic-category.component.html',
  styleUrls: ['./academic-category.component.scss']
})
export class AcademicCategoryComponent implements OnChanges, OnDestroy {

  form: FormGroup;
  @Input() userData: User | null;
  @Input() edit = false;
  ACADEMIC_CATEGORY: any = null;
  _unsubscribeAll = new Subject<void>();

  constructor(private _sportService: SportService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (
      (changes['sport'] || changes['userData']) && this.userData
    ) {
      this._sportService
        .getAcademicCategorySettings$()
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((res) => {
          if (this.userData) {
            res.forEach((item: any) => {
            if (item.label === 'Act') {
                item.label = item.label.toUpperCase();
              }
            });
            this.ACADEMIC_CATEGORY = res;
            this._setData(
              this.ACADEMIC_CATEGORY,
              this.userData,
            );
          }
        });
    }
  }

  private _setData(
    academicCategory: any,
    userData: User,
  ) {
    const form_fields = academicCategory;
    const formControls = form_fields.reduce((acc: any, val: any) => {
      let value = null;
      if (userData.academicInfo) {
        value = userData.academicInfo[val.field];
      }
      acc[val.field] = new FormControl(value);
      return acc;
    }, {});

    this.form = new FormGroup(formControls);
  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
