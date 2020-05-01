import PushNotifications from 'node-pushnotifications';
var fs = require('fs');
var use_https = require('https');
var express = require("express");
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var _ = require('./DeviceIdSchema');
var DeviceID = mongoose.model('DeviceID');

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const config = JSON.parse(fs.readFileSync("config.json"));

const settings = {
    apn: {
        token: {
            key: config.apns_cert_path,
            keyId: config.key_id,
            teamId: config.team_id,
        },
        production: false // true for APN production environment, false for APN sandbox environment,
    }
}

var ssl_creds = {
    key: fs.readFileSync(config.key_path),
    cert: fs.readFileSync(config.cert_path),
    ca: fs.readFileSync(config.CA_path)
};

const push = new PushNotifications(settings);
mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
mongoose.connect('mongodb://localhost:27017/');

app.post('/api/is_analytics_duplicated', (req, res) => {
    var device = new DeviceID(req.body);
    DeviceID.findOne({
        id: device.id
    }, (err, device) => {
        res.send({
            success: device !== null,
            message: err ? err.message : "Success"
        });
    });
});

app.post('/api/add_device_id', (req, res) => {
    var new_device = new DeviceID(req.body);
    DeviceID.insertMany(new_device, (err, _) => {
        res.send({
            success: !err,
            message: err ? err.message : "Success"
        });
    });
});


use_https.createServer(ssl_creds, app).listen(4200, function () {
    console.log('HTTPS server up on *:4200');
});

