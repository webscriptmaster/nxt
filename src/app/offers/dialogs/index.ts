import { DeleteOfferDialogComponent } from './delete-offer-dialog/delete-offer-dialog.component';
import { ShareOffersDialog } from './share-offers-dialog/share-offers-dialogcomponent';
import { SubmitOfferDialogComponent } from './submit-offer-dialog/submit-offer-dialog.component';

export const dialogs = [
  SubmitOfferDialogComponent,
  ShareOffersDialog,
  DeleteOfferDialogComponent,
];

export * from './submit-offer-dialog/submit-offer-dialog.component';
export * from './share-offers-dialog/share-offers-dialogcomponent';
export * from './delete-offer-dialog/delete-offer-dialog.component';
