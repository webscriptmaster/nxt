import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LottieModule } from 'ngx-lottie';
import { routing } from './prospect-profile.routing';
import { ProspectProfileComponent } from './prospect-profile.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { CoreModule } from '../core/core.module';
import { SidenavModule } from '../sidenav/sidenav.module';
import { ProspectComponent } from './components/prospect/prospect.component';
import { CardsComponent } from './components/cards/cards.component';
import { MyMediaComponent } from './components/my-media/my-media.component';
import { VideoImageModule } from '../video-image/video-image.module';
import { TemplateComponent } from './components/template/template.component';
import { PublicLinkComponent } from './components/public-link/public-link.component';
import { LazyLoadImageDirective } from '../shared/directives/lazy-load-image.directive';
import { ProspectCardComponent } from './components/prospect-card/prospect-card.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ColorPickerModule } from 'ngx-color-picker';

@NgModule({
  declarations: [
    ProspectProfileComponent,
    ProspectComponent,
    CardsComponent,
    MyMediaComponent,
    TemplateComponent,
    PublicLinkComponent,
    LazyLoadImageDirective,
    ProspectCardComponent,
    ProfileComponent,
  ],
  imports: [
    routing,
    CoreModule,
    LottieModule,
    SidenavModule,
    CommonModule,
    FormsModule,
    SharedModule,
    VideoImageModule,
    ColorPickerModule,
  ],
})
export class ProspectProfileModule {}
