import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProspectProfileComponent } from './prospect-profile.component';
import { TemplateComponent } from './components/template/template.component';
import { PublicLinkComponent } from './components/public-link/public-link.component';
import { ProfileComponent } from './components/profile/profile.component';

const routes: Routes = [
  {
    path: 'profiles-pro',
    component: ProspectProfileComponent,
    data: { page: 'ProspectProfile', activeTab: 0 },
  },
  {
    path: 'mixtapes-pro',
    component: ProspectProfileComponent,
    data: { page: 'ProspectProfile', activeTab: 1 },
  },
  {
    path: 'graphics-pro',
    component: ProspectProfileComponent,
    data: { page: 'ProspectProfile', activeTab: 2 },
  },
  {
    path: 'media',
    component: ProspectProfileComponent,
    data: { page: 'ProspectProfile', activeTab: 3 },
  },
  {
    path: 'graphics-pro/template/:categoryId/:templateId',
    component: TemplateComponent,
    data: { page: 'ProspectProfileTemplate' },
  },
  {
    path: 'profiles-pro/:userId/:categoryId/:profileId',
    component: ProfileComponent,
    data: { page: 'Profile' },
  },
  {
    // path: ':graphicName',
    path: 'graphics-pro/:userName/:graphicName/:email',
    component: PublicLinkComponent,
    data: { page: 'PublicLink' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class routing {}
