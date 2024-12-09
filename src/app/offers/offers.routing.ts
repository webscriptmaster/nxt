import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import * as fromContainers from './containers';

const routes: Routes = [
  {
    path: '',
    component: fromContainers.OffersLogComponent,
    data: { page: 'OffersLog' },
  },
  {
    path: 'add-offers',
    component: fromContainers.OffersComponent,
    data: { page: 'Offers' },
  },
  {
    path: 'congratulations',
    component: fromContainers.OffersCongratulationsComponent,
    data: { page: 'OffersCongratulations' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class routing {}
