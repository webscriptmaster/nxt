import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VideoImageComponent } from './video-image.component';

const routes: Routes = [
  {
    path: '',
    component: VideoImageComponent,
    data: {page: 'VideosImages'},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class routing {}
