var express = require('express'),
    app = express(),
    port = process.env.PORT || 4200,
    mongoose = require('mongoose'),
    _ = require('./BattlefieldServer'),
    _2 = require('./DeviceID'),
    BattlefieldServer = mongoose.model('BattlefieldServer'),
    DeviceID = mongoose.model('DeviceID'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    use_https = require('https'),
    PushNotifications = require('node-pushnotifications');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://localhost:27017/`);

const config = JSON.parse(fs.readFileSync("config.json"));

var ssl_creds = {
    key: fs.readFileSync(config.key_path),
    cert: fs.readFileSync(config.cert_path),
    ca: fs.readFileSync(config.CA_path)
};

app.post('/api/is_device_duplicated', (req, res) => {
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
    var device = new DeviceID(req.body);
    DeviceID.insertMany(device, (err, _) => {
        res.send({
            success: !err,
            message: err ? err.message : "Success"
        });
    });
});

app.post('/api/is_server_duplicated', (req, res) => {
    let server = new BattlefieldServer(req.body);
    BattlefieldServer.findOne({
        id: server.id
    }, (err, server) => {
        res.send({
            success: server !== null,
            message: err ? err.message : "Success"
        });
    });
});


app.post('/api/add_server', (req, res) => {
    var server = new BattlefieldServer(req.body);
    BattlefieldServer.insertMany(server, (err, _) => {
        res.send({
            success: !err,
            message: err ? err.message : "Success"
        });
    });
});

const settings = {
    apn: {
        token: {
            key: config.apns_key, // optionally: fs.readFileSync('./certs/key.p8')
            keyId: config.apns_keyId,
            teamId: config.apns_teamId
        },
        production: false // true for APN production environment, false for APN sandbox environment,
    }
}

const push = new PushNotifications(settings);

app.get('/api/push', (req, res) => {
    BattlefieldServer.find({}, (err, servers) => {
        if (servers.length > 0) {
            DeviceID.find({}, (err, ids) => {
                var new_ids = ids.map(id => id.id);
                let data = {
                    body: "hello",
                    topic: config.apns_topic
                };
                push.send(new_ids, data, (err, result) => {
                    if (err) {
                        res.send(err);
                    } else {
                        res.json(result);
                    }
                });
            })
        }
    })
});

use_https.createServer(ssl_creds, app).listen(port, function () {
    console.log('HTTPS server up on *:4200');
});
