'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BattlefieldServerSchema = new Schema({
    id: String,
    name: String,
    game: String
});

module.exports = mongoose.model('BattlefieldServer', BattlefieldServerSchema);
