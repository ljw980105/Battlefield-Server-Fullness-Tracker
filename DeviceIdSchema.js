'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DeviceIDSchema = new Schema({
    id: String
});

module.exports = mongoose.model('DeviceID', DeviceIDSchema);
