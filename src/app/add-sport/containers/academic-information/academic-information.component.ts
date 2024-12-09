import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/auth/auth.service';
import { AcademicCategoryComponent } from 'src/app/shared/components';

@Component({
  selector: 'app-add-sport-academic-information',
  templateUrl: './academic-information.component.html',
  styleUrls: ['./academic-information.component.scss'],
})
export class AddSportAcademicInformationComponent implements OnInit, OnDestroy {
  userData: User | null = null;
  sport: string | null = null;

  academicForm: FormGroup;

  _unsubscribeAll = new Subject<void>();
  @ViewChild(AcademicCategoryComponent)
  academicCategoryComponent: AcademicCategoryComponent;
  constructor(private _router: Router, private _auth: AuthService) {}

  ngOnInit() {
    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
      this.userData = res;
      if (this.userData && this.userData.secondarySport) {
        this.sport = this._setSport(this.userData.secondarySport);
        // this.makeAcademicForm(this.userData);
      } else {
        this._router.navigate(['/add-sport/choose-sport']);
      }
    });
  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onBack() {
    this._router.navigate(['/add-sport/coach-info']);
  }

  onContinue() {
    if (this.academicCategoryComponent.form.valid && this.userData) {
      const oldValues = this.userData.academicInfo
        ? this.userData.academicInfo
        : {};
      const newValues = {
        ...oldValues,
        ...this.academicCategoryComponent.form.value,
      };
      this._auth.updateUserData(this.userData.id, { academicInfo: newValues });
      this._router.navigate(['/add-sport/athletic-info']);
    } else {
      this.academicCategoryComponent.form.markAllAsTouched();
    }
  }

  private _setSport(sport: string) {
    const key = sport
      ?.split(' ')
      .filter((w) => w != 'mens' && w != 'womens' && w != '&')
      .join('_');
    return key;
  }
}
