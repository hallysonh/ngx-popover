import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxPopoverModule } from '@hallysonh/ngx-popover';

import { AppComponent } from './app.component';

@NgModule({
  imports: [BrowserModule, NgxPopoverModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
