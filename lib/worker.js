/*
 * Title: worker Library
 * Description: worker related
 * Author: Saiful Islam
 * Date: 10/22/2021
 *
 */

// this comment is do from web vs code let's see how it works

// Dependency
const url = require('url');
const http = require('http');
const https = require('https');
const { parseJSON } = require('../helpers/utilities');
const data = require('./data');
const { sendTwilioSms } = require('../helpers/notification')

//worker object - module scaffolding
const worker = {};

// perform check
worker.performCheck = (originalData) => {
    // prepare the initial check outcome
    let checkOutCome = {
        error: false,
        responseCode: false,
    };
    // mark the outcome has not been sent yet
    let outcomeSent = false;

    let originalCheckData = originalData
    // parse the hostname and full url from original data
    let parsedUrl = url.parse(originalCheckData.protocol + '://' + originalCheckData.url, true);
    let hostName = parsedUrl.hostname;
    let path = parsedUrl.path;

    // constrack the request
    const requestDetails = {
        protocol: originalCheckData.protocol + ':',
        hostname: hostName,
        method: originalCheckData.method.toUpperCase(),
        path: path,
        timeout: originalCheckData.timeoutSeconds * 1000,
    };

    //user decided protocol
    const protocolToUse = originalCheckData.protocol === 'http' ? http : https;

    let req = protocolToUse.request(requestDetails, (res) => {
        // grab the status of the response
        const status = res.statusCode;
        checkOutCome.responseCode = status;
        // update the check outcome and pass to next process
        if(!outcomeSent){
            worker.processCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true
        }
    });

    // so now we need to listen event and also check the error envent
    req.on('error', (e) =>{
        checkOutCome = {
            error: true,
            value: e,
        };
        // update the check outcome and pass to next process
        if(!outcomeSent){
            worker.processCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true
        }
    })

    req.on('timeout', () => {
        checkOutCome = {
            error: true,
            value: 'timeout',
        };
         // update the check outcome and pass to next process
        if(!outcomeSent){
            worker.processCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true
        }
    })

    //req send 
    req.end();
};

// save check out come to database and send to next process
worker.processCheckOutcome = (originalData, checkOutCome) => {
    let originalCheckData = originalData;
    //check if checkoutcome is up or down
    let state = !checkOutCome.error && checkOutCome.responseCode && originalCheckData.successCode.indexOf(checkOutCome.responseCode) > -1
    ? 'up' : 'down';

    // decide whether we should alert the user or not
    let alertWanted = originalCheckData.lastChecked && originalCheckData.state !== state ? true : false; 

    // update the check data
    originalCheckData.state = state;
    originalCheckData.lastChecked = Date.now();

    // update the check to disk
    data.update('checks', originalCheckData.id, originalCheckData, (err) => {
        if(!err){
            if(alertWanted){
                // send the checkdata to next process
                worker.alertUserToStatusChange(originalCheckData)
            }else{
                console.log('Aleart is not needed as there is no state change!')
            }
            
        }else{
            console.log('Error: Trying to save check data of one of the check');
        }
    })
}

// send notification sms to user if state changes
worker.alertUserToStatusChange = (originalCheckData) => {
    let msg = `Alert: Your Check for ${originalCheckData.method.toUpperCase()} ${originalCheckData.protocol}://${originalCheckData.url} is currently ${originalCheckData.state}`;

    sendTwilioSms(originalCheckData.phone, msg, (err) => {
        if(!err){
            console.log(`User was alerted to a status change via SMS: ${msg}`)
        }else{
            console.log('There was a problem sending sms to one of the user')
        }
    })
}

// validate individual check data
worker.validateCheckData = (CheckData) => {
    let originalCheckData = CheckData;
    if(originalCheckData && originalCheckData.id) {
        originalCheckData.state = typeof(originalCheckData.state) === 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1 
        ? originalCheckData.state : 'down';
        originalCheckData.lastChecked = typeof(originalCheckData.lastChecked) === 'number' && originalCheckData.lastChecked > 0 
        ? originalCheckData.lastChecked : false;

        // pass to the next process
        worker.performCheck(originalCheckData);
    } else {
        console.log('Error: Check was invalid or not properly foramtted!')
    }
}

// lookup all the checks
worker.gatherAllChecks = () => {
    // get all the checks
    data.list('checks', (err1, checks) => {
        if(!err1 && checks && checks.length > 0){
            checks.forEach(check =>{
                // read the checkdata
                data.read('checks', check, (err2, originalCheckData) =>{
                    if(!err && originalCheckData){
                        //pass the data to the check validator
                        worker.validateCheckData(parseJSON(originalCheckData))

                    }else{
                        console.log('Error: reading one of the chekc data')
                    }
                })
            })
        }else {
            console.log('Error: could not find any checks to process')
        }
    })
}

// timer to execute the worker process onece per minute
worker.loop = () => {
    setInterval(() =>{
        worker.gatherAllChecks();
    }, 1000 * 60)
}

// worker init
worker.init = () => {
    console.log('Worker started')
    // execute all the checks
    worker.gatherAllChecks();

    // call the loop so that checks continue
    worker.loop();
};

// export 
module.exports = worker;