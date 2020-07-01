import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { IssueDescriptionComponent } from './issue-description/issue-description.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { RouterModule, Routes } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from './../shared/shared.module'

// https://www.syncfusion.com/kb/9864/how-to-get-started-easily-with-syncfusion-angular-7-rich-text-editor
import { RichTextEditorAllModule } from '@syncfusion/ej2-angular-richtexteditor';
import { SearchPipe } from './../shared/search.pipe';



@NgModule({
  declarations: [DashboardComponent, IssueDescriptionComponent],
  imports: [
    CommonModule,
    FormsModule,
    BrowserModule,
    NgxPaginationModule,
    RouterModule,
    RichTextEditorAllModule,
    SharedModule
  
  ]
})
export class IssueModule { }
