import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../socket.service';
import { AuctionService } from '../auction.service';
import { SigninService } from '../signin.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {Item} from '../item';
import {Chat} from '../chat';
import {User} from '../user';
import {Marker} from '../marker';


@Component({
  selector: 'app-auction',
  templateUrl: './auction.component.html',
  styleUrls: ['./auction.component.css']
})
export class AuctionComponent implements OnInit {
  items: Item[]; //array of items to store the items.
  users: User[];
  displayedColumns: string[] //Array of Strings with the table column names
  message: string; // message string
  destination : string; //string with the destination of the current message to send. 
  ChatMessage: string; // message string: string; // message string
  showBid: boolean;  //boolean to control if the show bid form is placed in the DOM
  showMessage: boolean; //boolean to control if the send message form is placed in the DOM
  selectedItem!: Item; //Selected Item
  bidForm! : FormGroup; //FormGroup for the biding
  userName!: string;
  errorMessage: string; //string to store error messages received in the interaction with the api
  mapOptions: google.maps.MapOptions;
  markers: Marker[]; //array to store the markers for the looged users posistions.
  centerLat: number;
  centerLong: number;
  showSubmit: boolean;
  showRemove: boolean;
  showCancel: boolean;
  showBuyNow: boolean;
  soldHistory: string[];
  chats: Chat[]; //array for storing chat messages
  counter: number;

  constructor( private formBuilder: FormBuilder, private router: Router, private socketservice: SocketService, private auctionservice: AuctionService,
   private signinservice: SigninService) {
    this.items = [];
    this.users = [];
    this.soldHistory = [];
    this.chats = [];
    this.counter = 0;
    this.message = "";
    this.destination ="";
    this.ChatMessage = "";
    this.showBid = false;
    this.showMessage = false;
    this.userName = this.signinservice.token.username;
    this.errorMessage = "";
    this.displayedColumns = ['description', 'currentbid', 'buynow', 'remainingtime', 'wininguser', 'owner'];
    this.centerLat = this.signinservice.latitude != null ? this.signinservice.latitude : 38.640026;
    this.centerLong = this.signinservice.longitude != null ? this.signinservice.longitude : -9.155379;
    this.markers = [];
    this.showRemove = false;
    this.showCancel = false;
    this.showBuyNow = false;
    this.showSubmit = false;
    this.mapOptions = {
      center: { lat: this.centerLat, lng: this.centerLong },
      zoom: 10
    };
  }

ngOnInit(): void {
  	 this.message= "Hello " + this.userName + "! Welcome to the SAR auction site.";

  	 //create bid form
  	 this.bidForm = this.formBuilder.group({
      bid: ['', Validators.compose([Validators.required,Validators.pattern("^[0-9]*$")])]
  	 });

     //Get the sold items from the server and place them in the soldHistory array when the page is loaded
      this.auctionservice.getSoldItems()
        .subscribe({
          next: result => {
            let receiveddata = Array.isArray(result) ? result : [result];
            receiveddata.forEach(item => {
              this.soldHistory.push("O " + item.description + " foi vendido por " + item.currentbid + " ao utilizador " + item.wininguser + "!");
            });
          }
        });
          
          
        



  	 // Get initial item data from the server api using http call in the auctionservice
     this.auctionservice.getItems()
        .subscribe({next: result => {
          let receiveddata = result as Item[]; // cast the received data as an array of items (must be sent like that from server)
            this.items = receiveddata;
            console.log ("getItems Auction Component -> received the following items: ", receiveddata);
        },
        error: error => this.errorMessage = <any>error });

     // Get initial list of logged in users for googleMaps using http call in the auctionservice
      this.auctionservice.getUsers()
        .subscribe({
          next: result => {
          let receiveddata = result as User[]; // cast the received data as an array of users (must be sent like that from server)
            this.users = receiveddata;
            console.log("getUsers Auction Component -> received the following users: ", receiveddata);
          // do the rest of the needed processing here
        },
        error: error => this.errorMessage = <any>error });

  //subscribe to the incoming websocket events

  //example how to subscribe to the server side regularly (each second) items:update event
      const updateItemsSubscription = this.socketservice.getEvent("update:item")
                      .subscribe(
                        data =>{
                          let receiveddata = data as Item;
                            if (this.items){
                              this.items.forEach(item => {
                                if (item.description == receiveddata.description){
                                  item.currentbid = receiveddata.currentbid;
                                  item.wininguser = receiveddata.wininguser;
                                }
                              });
                            }
                        }
                      );

  //example how to subscribe to the server side regularly (each second) unsold:items event  
      const unsoldItemsSubscription = this.socketservice.getEvent("unsold:items")
                      .subscribe(
                        data =>{
                          let receiveddata = data as Item[];
                            if (this.items){
                              this.items = receiveddata;
                            }
                        }
                      );                  

  //example how to subscribe to the server side regularly (each second) sold:item event
       const soldItemsSubscription = this.socketservice.getEvent("sold:items")
       .subscribe({
        next: result => {
          let receiveddata = Array.isArray(result) ? result : [result];
          receiveddata.forEach(item => {
            this.soldHistory.push("O "+ item.description + " foi vendido por " + item.currentbid + " ao utilizador " + item.wininguser + "!");
            
          });
        }
      });
         
      //remove item event that calls the removeItem function when the event is received from the server
      const removeItemSubscription = this.socketservice.getEvent("remove:item")
      .subscribe(data => {
        let receiveddata = data as Item;
        this.auctionservice.removeItem(receiveddata)
          .subscribe({
            next: result => {
              console.log("Item removed successfully.");
            },
            error: error => this.errorMessage = <any>error
          });
      });


      
      
          
          
            
          
      

             

  //subscribe to the new user logged in event that must be sent from the server when a client logs in 
        const newUserSubscription = this.socketservice.getEvent("userLoggedIn:username")
        .subscribe(data => {
          let receiveddata = data as User;
          if (this.users) {
            this.users.push(receiveddata);
          }
        });
  
  //subscribe to the user logged out event that must be sent from the server when a client logs out and remove the user from the users array
        const userLoggedOutSubscription = this.socketservice.getEvent("userLoggedOut:username")
        .subscribe(data => {
          let receiveddata = data as User;
          if (this.users) {
            this.users = this.users.filter(user => user.username != receiveddata.username);
          }
        });


  
  //subscribe to a receive:message event to receive message events sent by the server 
        const receiveMessageSubscription = this.socketservice.getEvent("new:message")
        .subscribe(data => {
          this.showMessage = true;
          let receiveddata = data as Chat;
          this.chats.push(receiveddata);
        });



    
  //subscription to any other events must be performed here inside the ngOnInit function

  }

   logout(){
    //call the logout function in the signInService to clear the token in the browser
    this.signinservice.logout();  // Tem que estar em primeiro para ser apagado o token e nao permitir mais reconnects pelo socket
  	//perform any needed logout logic here
  	this.socketservice.disconnect();
    //navigate back to the log in page
    this.router.navigate(['/signin']);
  }

  //function called when an item is selected in the view
  onRowClicked(item: Item){
  	console.log("Selected item = ", item);
  	this.selectedItem = item;
  	this.showBid = true; // makes the bid form appear
    
    if (!item.owner.localeCompare(this.userName)) {
      this.showCancel = false;
      this.showSubmit = false;
      this.showRemove = true;
      this.showBuyNow = false;
      this.showMessage = false;
    }
    else {
      this.showSubmit = true;
      this.showRemove = false;
      this.showCancel = true;
      this.showBuyNow = true;
      this.destination = this.selectedItem.owner;
      this.showMessage = true;
    }
  }

  //function called when a received message is selected. 
  onMessageSender(ClickedChat: Chat) {
    
    //destination is now the sender of the selected received message.
    this.destination = ClickedChat.sender; 
    this.showMessage = true; // makes the send message form appear. 


  }

  // function called when the submit bid button is pressed
   submit(){
  	console.log("submitted bid = ", this.bidForm.value.bid);
  	//send an event using the websocket for this use the socketservice
    this.socketservice.sendEvent('send:bid', {description: this.selectedItem.description, bid: this.bidForm.value.bid});

  }
  //function called when the user presses the send message button
  sendMessage(){
    
    this.showMessage = true;
    //see my own message sent in the chat window 
    this.chats.push({sender: this.userName, receiver: this.destination, message: this.ChatMessage});
    
    

    this.socketservice.sendEvent('send:message', {sender: this.userName, receiver: this.destination, message: this.ChatMessage});
    console.log("Message  = ", this.ChatMessage);
  }

  //function called when the cancel bid button is pressed.
   cancelBid(){
   	this.bidForm.reset(); //clears bid value
   }

   //function called when the buy now button is pressed.

   buyNow(){
   	this.bidForm.setValue({              /// sets the field value to the buy now value of the selected item
   		bid: this.selectedItem.buynow
   	});
   	this.message= this.userName + " please press the Submit Bid button to procced with the Buy now order.";
   }
//function called when the remove item button is pressed.
  removeItem() {
  //use an HTTP call to the API to remove an item using the auction service.
  this.auctionservice.removeItem(this.selectedItem)
    .subscribe({
      next: result => {
        console.log("Item removed successfully.");
      },
      error: error => this.errorMessage = <any>error
    });
   }

}
