import { ProviderDialogComponent } from './provider-dialog/provider-dialog.component';
import { SelectRecipientsDialogComponent } from './select-recipients-dialog/select-recipients-dialog.component';
import { SendEmailDialogComponent } from './send-email-dialog/send-email-dialog.component';
import { VerifiedAppDialogComponent } from './verified-app-dialog/verified-app-dialog.component';
import { GmailImportantNoteComponent } from "./gmail-important-note/gmail-important-note.component";

export const dialogs = [SendEmailDialogComponent, SelectRecipientsDialogComponent, ProviderDialogComponent, VerifiedAppDialogComponent, GmailImportantNoteComponent];

export * from './send-email-dialog/send-email-dialog.component';
export * from  './select-recipients-dialog/select-recipients-dialog.component';
export * from './provider-dialog/provider-dialog.component';
export * from  './verified-app-dialog/verified-app-dialog.component';
export * from  './gmail-important-note/gmail-important-note.component';
