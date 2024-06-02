/**
 * api code file
 */
const express = require('express');
const jwt = require('jsonwebtoken');
const item = require('../models/item.js');
const user = require('../models/user.js');
const secret = 'this is the secret secret secret 12356'; // same secret as in socket.js used here to sign the authentication token
//get the file with the socket api code
const socket = require('./socket.js');

/*
 * POST User sign in. User Sign in POST is treated here
 */
exports.Authenticate =  (req, res) =>  {
  console.log('Authenticate -> Received Authentication POST');
  user.findOne({$and:[{username: req.body.username}, {password: req.body.password}]})
    .then(User => {
      if (User != null){ //user exists update to is logged = true and send token response
        user.updateOne({username: req.body.username}, {$set: {islogged: true, latitude: req.body.latitude, longitude: req.body.longitude}})
          .then(result => {
            if (result) {
              var token = jwt.sign(req.body, secret);
              res.json({username: req.body.username, token: token});  
              console.log('Authenticate -> Received Authentication POST');
            }})
          .catch(err => {
            // Handle the error here. For example, you might want to send an error code response to the client.
          });      
      }
       else {  
        res.status(401).send('An error occurred while trying to login.');
        }
    })
    .catch(err => {
      //there was an error in the database
      //send  a 5*** status using res.status   
    }); 
    
};

/*
 * POST User registration. User registration POST is treated here
 */
exports.NewUser =  (req, res) => {
  console.log("NewUser -> received form submission new user");
  console.log(req.body);

// check if username already exists
//If it still does not exist
//create a new user
//database create example
user.findOne({$or: [{name: req.body.name}, {email: req.body.email}]})
          .then(existingUser => {
          // existingUser is the user that was found, or null if no user was found
            if (existingUser != null){ //user exists  
              res.status(401).send('User already exists');
              console.log("User already exists.");
            }
            else {
            //user does not exist
            user.create({ name : req.body.name, email : req.body.email, username: req.body.username, password: req.body.password, 
              islogged: false, latitude: 0,longitude: 0})
            .then(newUser => {
              //created a new user here is how to send a JSON object with the user to the client
               res.json({
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                password: newUser.password,
                latitude: newUser.latitude,
                longitude: newUser.longitude
              }); 
                console.log("NewUser -> DB Inserted.");
                //sends back a client user Type object (does not have the isLogged field) corresponding to the logged in user
            })  
          }})
          .catch(err => {
          //database error occurred
          res.status(500).send('An error occurred while trying to find the item.');
          });

  //reply with the created user in a JSON object (for now is filled with dummy values
   /* res.json({
    name: "somename",
    email: "some@somemail.com",
    username: "someusername",
    password: "somepassword",
    latitude: 19.09,
    longitude: 34
   }); */
};

/*
 * POST Item creation. Item creation POST is treated here
 */
exports.NewItem =  (req, res) => {
  console.log("NewItem -> received form submission new item");
	console.log(req.body);
//check if item already exists using the description field if not create item;
     item.findOne({description: req.body.description})
           .then(existingItem => {
            // existingItem is the item that was found, or null if no item was found
            if (existingItem != null){ //item exists
              res.status(401).send('Item already exists');
              console.log("Item already exists.");
            }
            else {
                //item does not exist
                item.create({description: req.body.description, currentbid: req.body.currentbid, remainingtime: req.body.remainingtime, 
                  buynow: req.body.buynow, wininguser: '', sold: false, owner: req.body.owner})
                .then(newItem => {
                  res.json({
                    description: newItem.description,
                    currentbid: newItem.currentbid,
                    remainingtime: newItem.remainingtime,
                    buynow: newItem.buynow,
                    wininguser: newItem.wininguser,
                    sold: newItem.sold,
                    owner: newItem.owner,
                    });
                    console.log("NewItem -> DB Inserted.");
                })  
            }})
          .catch(err => {
            console.error('An error occurred:', err);
            // Handle the error here. For example, you might want to send a response to the client.
              res.status(500).send('An error occurred while trying to find the item.');
          });
  
};

//Get items sold
exports.SoldItem = (req, res) => {
  //use find to get all sold items in ths database and send back to client
  item.find({sold: true})
  .then(item_list => {
    res.json(item_list);
  })
  .catch(err => {
    console.error('An error occurred:', err);
    // Handle the error here. For example, you might want to send a response to the client.
    res.status(500).send('An error occurred while trying to get the items.');
  })};


/*
 * POST Item removal. Item removal POST is treated here
 */
exports.RemoveItem =  (req, res) => {
  console.log("RemoveItem -> received form submission remove item");
  console.log(req.body);
  //check if item already exists using the description field if it exists delete it;
  //database remove example
  item.deleteMany({description : req.body.description})
    .then(() => {
    // The item was successfully removed
    console.log('Item removed');
    })
    .catch(err => {
      console.error('An error occurred:', err);
      // Handle the error here. For example, you might want to send a response to the client.
      res.status(500).send('An error occurred while trying to remove the item.');
    });
};
/*
GET to obtain all active items in the database
*/
exports.GetItems = (req, res) => {

  let Items = null;
  //res.json(Items); //send array of existing active items in JSON notation
  Items = item.find({sold: false}).
  then(item_list => {
    res.json(item_list);
  }).catch(err => {
    console.error('An error occurred:', err);
    // Handle the error here. For example, you might want to send a response to the client.
    res.status(500).send('An error occurred while trying to get the items.');
  });

  console.log ("received get Items call responded with: ", Items);

}

exports.GetUsers = (req, res) => {
  //use find to get all islogged: true users in ths database and send back to client
  user.find({islogged: true}).then(user_list => {
    res.json(user_list);
  }).catch(err => {
    console.error('An error occurred:', err);
    // Handle the error here. For example, you might want to send a response to the client.
    res.status(500).send('An error occurred while trying to get the users.');
  });
  
}

