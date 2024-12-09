import { RouterModule } from '@angular/router';
import { MainFooterComponent } from './footer/footer.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [MainFooterComponent],
  exports: [MainFooterComponent],
})
export class CoreModule {}
