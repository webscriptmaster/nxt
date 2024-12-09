import { CollegeLibraryComponent } from './containers/college-library/college-library.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: CollegeLibraryComponent,
    data: { page: 'CollegeLibrary' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class routing {}
