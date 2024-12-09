import { FormGroup, FormControl, Validators } from '@angular/forms';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { combineLatest, Subject, BehaviorSubject, takeUntil } from 'rxjs';
import { User } from 'src/app/models/user';
import { SportService } from 'src/app/shared/sport.service';

@Component({
  selector: 'app-shared-athletic-info-component',
  templateUrl: './athletic-info.component.html',
  styleUrls: ['./athletic-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedAthleticInfoComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() sport: string | null;
  @Input() userData: User | null;
  @Input() edit = false;
  @Input() isSecondarySport = false;

  feetControl = new FormControl(null as number | null, []);
  heightControl = new FormControl(null as number | string | null, []);
  inchesControl = new FormControl(null as number | null, []);
  form: FormGroup;
  selectedHeight: any = null;
  listHeight = [
    { value: 1, label: "4'8" },
    { value: 2, label: "4'9" },
    { value: 3, label: "4'10" },
    { value: 4, label: "4'11" },
    { value: 5, label: "5'0" },
    { value: 6, label: "5'1" },
    { value: 7, label: "5'2" },
    { value: 8, label: "5'3" },
    { value: 9, label: "5'4" },
    { value: 10, label: "5'5" },
    { value: 11, label: "5'6" },
    { value: 12, label: "5'7" },
    { value: 13, label: "5'8" },
    { value: 14, label: "5'9" },
    { value: 15, label: "5'10" },
    { value: 16, label: "5'11" },
    { value: 17, label: "6'0" },
    { value: 18, label: "6'1" },
    { value: 19, label: "6'2" },
    { value: 20, label: "6'3" },
    { value: 21, label: "6'4" },
    { value: 22, label: "6'5" },
    { value: 23, label: "6'6" },
    { value: 24, label: "6'7" },
    { value: 25, label: "6'8" },
    { value: 26, label: "6'9" },
    { value: 27, label: "6'10" },
    { value: 28, label: "6'11" },
    { value: 29, label: "7'0" },
    { value: 30, label: "7'1" },
    { value: 31, label: "7'2" },
    { value: 32, label: "7'3" },
    { value: 33, label: "7'4" },
    { value: 34, label: "7'5" },
    { value: 35, label: "7'6" },
    { value: 36, label: "7'7" },
  ];

  ATHLETIC_INFO: any = null;

  _unsubscribeAll = new Subject<void>();

  constructor(
    private _sportService: SportService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {}

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      (changes['sport'] || changes['userData']) &&
      this.sport &&
      this.userData
    ) {
      this._sportService
        .getSportsSettings$()
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((res) => {
          if (this.sport && this.userData) {
            this.ATHLETIC_INFO = Object.keys(res).reduce((acc, val) => {
              acc[val] = res[val].athleticInfo;
              return acc;
            }, {} as any);

            this._setData(
              this.sport,
              this.ATHLETIC_INFO,
              this.userData,
              this.isSecondarySport
            );
          }
        });
    }
  }

  selectHeight(event: any): void {
    this.selectedHeight = event;
    const feet$ = new BehaviorSubject<number | null>(null);
    const inches$ = new BehaviorSubject<number | null>(null);
    const { feet, inches } = this.parseHeight(this.selectedHeight.label);
    this.heightControl.setValue(event.label);
    this.feetControl.setValue(feet);
    feet$.next(feet);
    this.inchesControl.setValue(inches);
    inches$.next(inches);
  }

  parseHeight(input: string | number): { feet: number; inches: number } {
    const [feetStr, inchesStr] = input.toString().split("'");
    const feet = parseInt(feetStr);
    const inches = Math.round(parseInt(inchesStr));
    return { feet, inches };
  }

  convertToFeet(inches: number): string {
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}`;
  }

  removeElement(data: any, fieldToRemove: string): void {
    data = data.filter((item: any) => item.field !== fieldToRemove);
    return data;
  }

  private _setData(
    sport: string,
    atleticInfo: any,
    userData: User,
    isSecondarySport: boolean
  ) {
    const feet$ = new BehaviorSubject<number | null>(null);
    const inches$ = new BehaviorSubject<number | null>(null);
    const form_fields = atleticInfo[sport];
    // form_fields = this.removeElement(form_fields, "highlight_link");
    // console.log(form_fields);

    const formControls = form_fields.reduce((acc: any, val: any) => {
      let value = null;
      if (val.field == 'height') {
        if (
          userData &&
          userData.primarySportAthleticInfo &&
          userData.primarySportAthleticInfo[val.field]
        ) {
          const currentHeight = this.convertToFeet(
            parseInt(userData.primarySportAthleticInfo[val.field].toString())
          );
          const heightIndex = this.listHeight.findIndex((el) => {
            return el.label == currentHeight;
          });
          this.selectedHeight = this.listHeight[heightIndex];
          const feet = Math.trunc(
            +userData.primarySportAthleticInfo[val.field] / 12
          );
          const inches = +userData.primarySportAthleticInfo[val.field] % 12;
          this.feetControl.setValue(feet);
          feet$.next(feet);
          this.inchesControl.setValue(inches);
          inches$.next(inches);
          // this.cd.detectChanges();
        }
      } else {
        if (!isSecondarySport) {
          if (
            userData &&
            userData.primarySportAthleticInfo &&
            userData.primarySportAthleticInfo[val.field]
          ) {
            value = userData.primarySportAthleticInfo[val.field];
          }
        } else {
          if (
            userData &&
            userData.secondarySportAthleticInfo &&
            userData.secondarySportAthleticInfo[val.field]
          ) {
            value = userData.secondarySportAthleticInfo[val.field];
          }
        }
      }

      let validators: any[] = [];
      if (val.required) {
        // validators = [Validators.required];
      }
      if (val.field === 'highlight_link') {
        validators = [
          ...validators,
          Validators.pattern(
            '^(http(s)?://)?((w){3}.)?((youtu(be|.be))|hudl)?(.com)?/.+'
          ),
        ];
      }

      acc[val.field] = new FormControl(value, validators);
      return acc;
    }, {});

    this.form = new FormGroup(formControls);
    this.feetControl.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: any) => feet$.next(res));
    this.inchesControl.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res) => inches$.next(res));

    combineLatest([feet$, inches$])
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res) => {
        const feet = res[0];
        const inches = res[1];
        let height = 0;
        if (inches) {
          height += inches;
        }
        if (feet) {
          height += feet * 12;
        }

        if (height) {
          this.form.controls['height'].setValue(height);
          this.form.updateValueAndValidity();
        }
      });
  }
}
