import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { CroppImageDialogComponent } from './cropp-image-dialog/cropp-image-dialog.component';
import { DeleteDialogComponent } from './delete-dialog/delete-dialog.component';
import { EditNameDialogComponent } from './edit-name-dialog/edit-name-dialog.component';
import { HearAboutDialogComponent } from './hear-about-dialog/hear-about-dialog.component';
import { PaymentDialogComponent } from './payment-dialog/payment-dialog.component';
import { PurchaseDialogComponent } from './purchase-dialog/purchase-dialog.component';
import { UploadDialogComponent } from './upload-dialog/upload-dialog.component';
export const dialogs = [
  CroppImageDialogComponent,
  PaymentDialogComponent,
  HearAboutDialogComponent,
  PurchaseDialogComponent,
  ConfirmDialogComponent,
  DeleteDialogComponent,
  UploadDialogComponent,
  EditNameDialogComponent
];

export * from './cropp-image-dialog/cropp-image-dialog.component';
export * from './payment-dialog/payment-dialog.component';
export * from './hear-about-dialog/hear-about-dialog.component';
export * from './purchase-dialog/purchase-dialog.component';
export * from './confirm-dialog/confirm-dialog.component';
export * from './delete-dialog/delete-dialog.component';
export * from './upload-dialog/upload-dialog.component';
export * from './edit-name-dialog/edit-name-dialog.component';