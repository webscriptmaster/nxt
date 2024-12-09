import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject, filter, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user';
import { PurchaseDialogComponent } from 'src/app/shared/dialogs';

@Component({
  selector: 'app-not-enough-dialogs',
  templateUrl: './not-enough-dialogs.component.html',
  styleUrls: ['./not-enough-dialogs.component.scss']
})
export class NotEnoughDialogsComponent implements OnInit {

  user: User | null = null;
  _unsubscribeALL: Subject<void> = new Subject();
  constructor(
    public dialogRef: MatDialogRef<NotEnoughDialogsComponent>,
    private dialog: MatDialog,
    private _auth: AuthService
  ) {

  }

  ngOnInit(): void {
    this._auth.user$
      .pipe(
        filter((user) => user !== null),
        takeUntil(this._unsubscribeALL)
      )
      .subscribe(async (user: any) => {
        this.user = user;
      });
  }

  openPurchaseDialog(): void {
    this.dialog.open(PurchaseDialogComponent, {
      autoFocus: false,
      data: {
        user: this.user,
      },
    });
    this.dialogRef.close();
  }
  close(): void {
    this.dialogRef.close();
  }
}
