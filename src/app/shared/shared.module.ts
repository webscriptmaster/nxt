import { RouterModule } from '@angular/router';
import { MaterialModule } from './material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import * as fromComponents from './components';
import * as fromPipes from './pipes';
import * as fromDialogs from './dialogs';
import * as fromDirectives from './directives';
import { QuillModule } from 'ngx-quill';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    ...fromComponents.components,
    ...fromPipes.pipes,
    ...fromDialogs.dialogs,
    ...fromDirectives.directives
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    MaterialModule,
    RouterModule,
    QuillModule,
  ],
  exports: [...fromComponents.components, ...fromPipes.pipes, ...fromDirectives.directives, MaterialModule],
})
export class SharedModule {}
