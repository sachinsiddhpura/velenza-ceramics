var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Cschema = new Schema({
    imagePath: {
        type: String,
        required: false
    },
    name: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Custom', Cschema);