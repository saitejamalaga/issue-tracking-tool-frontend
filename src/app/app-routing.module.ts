import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterComponent } from './user/register/register.component';
import { LoginComponent } from './user/login/login.component';
import { DashboardComponent } from './issue/dashboard/dashboard.component';
import { IssueDescriptionComponent } from './issue/issue-description/issue-description.component';


const routes: Routes = [

  {path :'login',component:LoginComponent},
  {path :'register',component:RegisterComponent},
  { path: 'dashboard', component: DashboardComponent },
  { path: 'issue', component: IssueDescriptionComponent },
  { path: 'issue/:issueId', component: IssueDescriptionComponent },

  {path : '', redirectTo:'login',pathMatch:'full'}


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
