var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: String,
    email: String,
    username: String,
    password: String,
    islogged: Boolean,
    latitude: Number,
    longitude: Number
    //createdAt: { type: Date, 'default': Date.now } //stores date of record creation
});

module.exports = mongoose.model('user', UserSchema);
