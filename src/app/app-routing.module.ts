import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuctionComponent } from './auction/auction.component';
import { InsertitemComponent } from './insertitem/insertitem.component';
import { RegisterComponent } from './register/register.component';
import { SigninComponent } from './signin/signin.component';
import { AuthGuard } from './auth.guard';

// Define the routes
const routes: Routes = [
  {
    path: '',
    redirectTo: 'signin',
    pathMatch: 'full'
  },
  {
    path: 'signin',
    component: SigninComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'insertitem',
    component: InsertitemComponent, 
    canActivate: [AuthGuard]         //can only route here after sucessfull login
  },
  {
    path: 'auction',
    component: AuctionComponent,
    canActivate: [AuthGuard]        //can only route here after sucessfull login
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  providers: [AuthGuard],
  exports: [RouterModule]
})
export class AppRoutingModule { }
