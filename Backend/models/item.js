var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ItemSchema = new Schema({
    description: String,
    currentbid: Number,
    remainingtime: Number,
    buynow: Number,
    wininguser: String,
    sold: Boolean,
    owner: String,
    id:Number
    //createdAt: { type: Date, 'default': Date.now } //stores date of record creation
});

module.exports = mongoose.model('item', ItemSchema);
