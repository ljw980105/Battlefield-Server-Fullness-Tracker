var https = require("https");

function promisesFromDBObject(server) {
    // const endpoint = `https://battlelog.battlefield.com/${server.game}/servers/getNumPlayersOnServer/pc/${server.id}/`;
    return new Promise((resolve, reject) => {
        var options = {
            host: 'https://battlelog.battlefield.com',
            path: `/${server.game}/servers/getNumPlayersOnServer/pc/${server.id}/`,
            headers: {'user-agent': 'node.js'},
        };

        https.get(options, (response) => {
            let data = '';
            // A chunk of data has been received.
            response.on('data', (chunk) => data += chunk);
            response.on('end', () =>  resolve(data));

        }).on("error", error => reject(error));

    });
}

module.exports = promisesFromDBObject;
