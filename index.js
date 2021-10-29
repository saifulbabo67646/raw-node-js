/*
 * Title: project inistia
 * Description: A RESTFul API to monitor up or down time of user defined links
 * Author: Saiful Islam
 * Date: 10/22/2021
 *
 */

// this comment is do from web vs code let's see how it works

// Dependency
const server = require('./lib/server');
const worker = require('./lib/worker');

//app object - module scaffolding
const app = {};

// 
app.init = () => {
    // start the server 
    server.init()
    // start the worker
    worker.init()
};

app.init();

// export the server
module.exports = app;