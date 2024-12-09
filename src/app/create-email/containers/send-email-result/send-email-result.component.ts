import { Component, OnInit } from '@angular/core';
import { CreateEmailService } from '../../create-email.service';

@Component({
  selector: 'app-send-email-result',
  templateUrl: './send-email-result.component.html',
  styleUrls: ['./send-email-result.component.scss'],
})
export class SendEmailResultComponent implements OnInit {
  showSuccess = false;
  showError = false;
  showCreateEmail = false;
  successfullyCount: null | number;
  unsuccessfullyCount: null | number;

  constructor(private _createEmail: CreateEmailService) {
    this._createEmail.sentEmailResults$.subscribe((res: any) => {
      const results = res.results;
      if (results.length) {
        this.successfullyCount = results.filter(
          (result: any) => result.success
        ).length;

        if (results.some((result: any) => !result.success)) {
          const errors = results
            .filter((result: any) => !result.success)
            .map((res: any) => res.to);

          this.unsuccessfullyCount = errors.length;

          let errorData = res.selectedContacts.filter((contact: any) => {
            return errors.includes(contact.email);
          });

          if (res.file) {
            errorData = errorData.map((data: any) => {
              return { ...data, file: res.file };
            });
          }

          this._createEmail.selectedContacts$.next(errorData);

          this.onShowError();
        } else {
          this.onShowSuccess();
        }
      }
    });
  }

  ngOnInit() {}

  onShowSuccess() {
    this.showSuccess = true;
    setTimeout(() => {
      this.showSuccess = false;
    }, 3000);
  }

  onShowError() {
    this.showError = true;
  }

  onTryAgain() {
    this.showCreateEmail = true;
    this.showError = false;
  }

  onIgnore() {
    this.showError = false;
  }

  onClose() {
    this.showCreateEmail = false;
  }
}
