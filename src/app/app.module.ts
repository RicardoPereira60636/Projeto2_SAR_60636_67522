import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule} from '@angular/common/http';
//import Routing module
import { AppRoutingModule } from './app-routing.module';
//import SocketIoModule 
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MaterialModule}  from './material/material.module'
//import Google maps Module 
import { GoogleMapsModule } from '@angular/google-maps'
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms'; // import the FormsModule
import { MatListModule } from '@angular/material/list';

import { AuctionComponent } from './auction/auction.component';
import { InsertitemComponent } from './insertitem/insertitem.component';
import { RegisterComponent } from './register/register.component';
import { SigninComponent } from './signin/signin.component';
import { AuthGuard } from './auth.guard';
import {SocketService} from './socket.service';
import {SigninService} from './signin.service';
import {AuctionService} from './auction.service';
import {RegisterService} from './register.service';
import {InsertitemService} from './insertitem.service';

                             //the socket cannot start at bootstrap since the jwt token is still not available
//const config: SocketIoConfig = { url: 'https://localhost:3000', options: {autoConnect : false} };
const config: SocketIoConfig = { url: window.location.origin, options: {autoConnect : false} };


@NgModule({
  declarations: [
    AppComponent,
    AuctionComponent,
    InsertitemComponent,
    RegisterComponent,
    SigninComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    MatListModule,
    MaterialModule,
    SocketIoModule.forRoot(config),
    GoogleMapsModule
  ],
  providers: [
     SigninService,
     SocketService,
     AuctionService,
     RegisterService,
     InsertitemService,
     AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
