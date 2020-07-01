import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer/footer.component';
import { SearchPipe } from './search.pipe';


@NgModule({
  declarations: [FooterComponent, SearchPipe],
  imports: [
    CommonModule
  ],
  exports:[
    FooterComponent,SearchPipe
  ]
})
export class SharedModule { }
