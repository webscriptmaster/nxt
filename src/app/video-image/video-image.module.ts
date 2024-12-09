import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoImageComponent } from './video-image.component';
import { routing } from './video-image.routing';
import { SortablejsModule } from 'ngx-sortablejs';
import { SharedModule } from "../shared/shared.module";
import { FormsModule } from '@angular/forms';
import { PreviewComponent } from './preview/preview.component';
import { NgxUploaderModule } from 'ngx-uploader';
import {VgCoreModule} from '@videogular/ngx-videogular/core';
import {VgControlsModule} from '@videogular/ngx-videogular/controls';
import {VgOverlayPlayModule} from '@videogular/ngx-videogular/overlay-play';
import {VgBufferingModule} from '@videogular/ngx-videogular/buffering';


@NgModule({
    declarations: [
        VideoImageComponent,
        PreviewComponent
    ],
    imports: [
        CommonModule,
        routing,
        FormsModule,
        SortablejsModule,
        SharedModule,
        NgxUploaderModule,
        VgCoreModule,
        VgControlsModule,
        VgOverlayPlayModule,
        VgBufferingModule,
    ],
    exports: [
        VideoImageComponent,
        PreviewComponent
    ]
})
export class VideoImageModule { }