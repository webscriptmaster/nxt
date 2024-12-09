import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {MatExpansionModule} from '@angular/material/expansion';

@NgModule({
  imports: [MatDialogModule, MatIconModule, MatExpansionModule],
  exports: [MatDialogModule, MatIconModule, MatExpansionModule],
})
export class MaterialModule {}
