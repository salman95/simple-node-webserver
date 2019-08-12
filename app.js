'use strict';
const http = require('http');
const url = require('url');
const fs = require('fs');

const PORT = 3000;

let fileaccess = filepath => {
    return new Promise((resolve, reject) => {
        fs.access(filepath, fs.F_OK, error => {
            if(!error) {
                resolve(filepath);
            }
            else {
                reject(error);
            }
        })
    });
}

let streamfile = filepath => {
    return new Promise((resolve, reject) => {
        //creates a stream pointing to a file path
        let filestream = fs.createReadStream(filepath);

        filestream.on('open', () => {
            resolve(filestream);
        });
        filestream.on('error', error => {
            reject(error);
        });
    });
};

let webserver = (req, res) => {
    //if the route requested is '/', then load index.htm
    //or else, load the requested file(s)

    //extracts path name from the request url on the browser
    let baseURI = url.parse(req.url);
    let filepath = __dirname + (baseURI.pathname === '/' ? '/index.html' : baseURI.pathname);
    fileaccess(filepath)
        .then(streamfile)
        .then(filestream => {
            filestream.pipe(res);
        }).catch(error => {
            res.writeHead(404);
            res.end(JSON.stringify(error));
        });
};

http.createServer(webserver).listen(PORT, () => {
    console.log(`Port listening on ${PORT}`);
});