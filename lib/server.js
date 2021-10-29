/*
 * Title: server Library
 * Description: server related
 * Author: Saiful Islam
 * Date: 10/22/2021
 *
 */

// this comment is do from web vs code let's see how it works

// Dependency
const http = require('http');

const {handleReqRes} = require('../helpers/handleReqRes')

//app object - module scaffolding
const server = {};

//configuration 
server.config = {
    port: 3000,
}

// create server 
server.createServer = () => {
    const newServer = http.createServer(server.handleReqRes)
    newServer.listen(server.config.port, () => {
        console.log(`listening on port ${server.config.port}`)
    })
}

// handle request response
server.handleReqRes = handleReqRes;

// start server
server.init = () => {
    server.createServer()
};

// export 
module.exports = server;