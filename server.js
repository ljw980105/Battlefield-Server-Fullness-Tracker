var express = require('express'),
    app = express(),
    port = process.env.PORT || 4200,
    mongoose = require('mongoose'),
    _2 = require('./DeviceID'),
    DeviceID = mongoose.model('DeviceID'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    use_https = require('https');

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

use_https.createServer(ssl_creds, app).listen(port, function () {
    console.log('HTTPS server up on *:4200');
});
