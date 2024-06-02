import { Injectable } from '@angular/core';
import { SigninService } from './signin.service';
import { Subject ,  Observable } from 'rxjs';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketService {  
 
  private url = window.location.origin;
  //constructor receives IO object and SignInService to check for authentication token
  constructor(private signInService: SigninService, private socket: Socket) { }
 

  connect (){             //add the jwt token to the options 
    this.socket.ioSocket.io.opts.query = { token: this.signInService.token.token}
  	this.socket.connect();
    console.log('Websocket connected with token', this.signInService.token.token);
  }

  disconnect(){
  	 this.socket.disconnect();
  }

  // sends a new event with name EventName and data Data
  sendEvent (EventName:any,Data:any){
  						 // newUser:username' is the name of the event in the server. 	
  		this.socket.emit(EventName, Data);
  }

   // configures an observable to emit a value every time we receive a event with name
  getEvent(Eventname: any){
  	 let observable = new Observable (observer =>{
  	 	this.socket.on(Eventname, (data:any) => {
  	 		observer.next(data);
  	 	});
  	 })
  	 return observable;
  }

}
