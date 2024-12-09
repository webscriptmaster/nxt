import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { SharedService } from 'src/app/shared/shared.service';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-code',
  templateUrl: './code.component.html',
  styleUrls: ['./code.component.scss']
})
export class CodeComponent implements OnInit, OnDestroy {

  _unsubscribeAll = new Subject<void>();
  code: string;
  codes: Code[];
  
  constructor(
    private sharedService: SharedService,
    private _router: Router,
    private _auth: AuthService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getAllCode();
  }

  public onSubmitCode(): void {
    const partnerCode = this.codes.find(el => el.partnerCode.toLowerCase() === this.code.toLowerCase())
    if (!partnerCode) {
      this.openDialog({
        icon: './assets/images/icons/circleX-black.png',
        iconSize: 16,
        title: 'Invalid code!',
        description: ''
      })
      return;
    }
    const milliseconds = (partnerCode.expireDate as any).nanoseconds / 1e6;
    const exrireDateFromFirebase = new Date((partnerCode.expireDate as any).seconds * 1000 + milliseconds);
    if (partnerCode && exrireDateFromFirebase < new Date()) {
      this.openDialog({
        icon: './assets/images/icons/circleX-black.png',
        iconSize: 16,
        title: 'Expired code!',
        description: ''
      })
      return;
    }

    const dialogRef = this.openDialog({
      icon: './assets/images/icons/circle_arrow.png',
      iconSize: 25,
      title: 'Code Successfull!',
      description: 'One Moment'
    })
    this.sharedService.setPartnerCode(this.code);
    setTimeout(() => {
      dialogRef.close(); 
      this._router.navigate(['/auth/sign-up'])
    }, 1000);
  }

  protected getAllCode(): void {
    this._auth.getAllCodes()
    .pipe(
      takeUntil(this._unsubscribeAll)
    )
    .subscribe(res => {
      this.codes = res;
    });
  }

  openDialog(data: {icon: string, iconSize: number, title: string; description: string}) {
    return this.dialog.open(Dialog, {
      data
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}


@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.html',
  styleUrls: ['./code.component.scss']
})

export class Dialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}

interface Code {
  expireDate: Date,
  id: string;
  partnerCode: string;
  startDate: Date 
}
