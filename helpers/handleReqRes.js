/*
 * Title: Handle Request and Response
 * Description: Handle Request and response from here
 * Author: Saiful Islam
 * Date: 10/22/2021
 *
 */

// dependencies
const url = require('url');
const  {StringDecoder} = require('string_decoder');
const routes = require('../routes');
const {notFoundHandler} = require('../handlers/routerHandlers/notFoundHandler');
const utilities = require('./utilities');

// app object - module scaffolding
const handler = {};

//
handler.handleReqRes = (req, res) => {
    // request handling
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase()
    const queryStringObj = parsedUrl.query;
    const headerObj = req.headers;

    const requestProperties = {
        parsedUrl,
        path,
        trimmedPath,
        method,
        queryStringObj,
        headerObj
    };

    const decoder = new StringDecoder('utf-8');
    let realData = '';

    const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;


    req.on('data', (buffer) => {
        realData += decoder.write(buffer)
    })

    req.on('end', () => {
        realData += decoder.end()

        requestProperties.body = utilities.parseJSON(realData)
        // console.log(realData)
         // response handling
         chosenHandler(requestProperties, (statusCode, payload) => {
            statusCode = typeof(statusCode) === 'number' ? statusCode : 500;
            payload = typeof(payload) === 'object' ? payload : {};
    
            const payloadString = JSON.stringify(payload)
    
            // return the final response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
        })
        // res.end('Hello World')
    })

    // response handling
    // res.end('Hello World')
}

// export 
module.exports = handler