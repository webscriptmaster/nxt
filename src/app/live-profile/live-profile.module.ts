import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './live-profile.routing';
import { CoreModule } from '../core/core.module';
import { LottieModule } from 'ngx-lottie';
import { SidenavModule } from '../sidenav/sidenav.module';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { LiveProfileComponent } from './live-profile.component';
import { MediaPreviewComponent } from '../shared/dialogs/media-preview/media-preview.component';

@NgModule({
  declarations: [LiveProfileComponent, MediaPreviewComponent],
  imports: [
    CommonModule,
    routing,
    CoreModule,
    LottieModule,
    SidenavModule,
    CommonModule,
    FormsModule,
    SharedModule,
  ],
})
export class LiveProfileModule {}
