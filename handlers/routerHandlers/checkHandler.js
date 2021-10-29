/*
 * Title: check handler
 * Description: check handler from here
 * Author: Saiful Islam
 * Date: 10/22/2021
 *
 */

//dependencies
const data = require("../../lib/data");
const { hash, createRandomString } = require("../../helpers/utilities");
const { parseJSON } = require("../../helpers/utilities");
const tokenHandler = require("./tokenHandler");

// module scaffolding
const handler = {};

const maxChecks = 5;

handler.checkHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._check[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
  // callback(200, {
  //     message: 'This is a user Message'
  // })
};

handler._check = {};

handler._check.post = (requestProperties, callback) => {
    // validae inputs
    let protocol = typeof(requestProperties.body.protocol) === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 
    ? requestProperties.body.protocol : false;

    let url = typeof(requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 0 
    ? requestProperties.body.url : false;

    let method = typeof(requestProperties.body.method) === 'string' && ['get', 'post', 'put', 'delete'].indexOf(requestProperties.body.method) > -1 
    ? requestProperties.body.method : false;

    let successCode = typeof(requestProperties.body.successCode) === 'object' && requestProperties.body.successCode instanceof Array 
    ? requestProperties.body.successCode : false;

    let timeoutSeconds = typeof(requestProperties.body.timeoutSeconds) === 'number' && requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <= 5
    ? requestProperties.body.timeoutSeconds : false;

    if(protocol && url && method && successCode && timeoutSeconds){
        const token = typeof requestProperties.headerObj.token === 'string' ? requestProperties.headerObj.token : false;

        // lookup the user phone by reading the token
        data.read('tokens', token, (err1, tokenData) => {
            if(!err1 && tokenData){
                let userPhone = parseJSON(tokenData).phone;
                // lookup the user data by phone
                data.read('users', userPhone, (err2, userData) => {
                    if(!err2 && userData){
                        tokenHandler._tokens.verify(token, userPhone, (isTokenValid) => {
                            if(isTokenValid){
                                let userObject = parseJSON(userData)
                                // we are doing this for checking that is user already check 5 link?
                                let userChecks = typeof(userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : [];

                                if(userChecks.length < maxChecks){
                                    let checkId = createRandomString(20);
                                    let checkObj = {
                                        id: checkId,
                                        phone: userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCode,
                                        timeoutSeconds
                                    }
                                    // save the object
                                    data.create('checks', checkId, checkObj, (err3) =>{
                                        if(!err3){
                                            // add checks if to the users object
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);

                                            // save the new user data
                                            data.update('users', userPhone, userObject, (err4) =>{
                                                if(!err4){
                                                    // return the data about new check
                                                    callback(200, checkObj)
                                                }else{
                                                    callback(500, {
                                                        error: 'Server ERror'
                                                    })
                                                }
                                            })
                                        }else{
                                            callback(500, {
                                                error: 'Internal Server Error'
                                            })
                                        }
                                    })
                                }else{
                                    callback(401, {
                                        error: 'Users already reached max checks limit'
                                    })
                                }
                            }else{
                                callback(403, {
                                    error: 'Authentication Error'
                                })
                            }
                        })
                    }else {
                        callback(404, {
                            error: 'User Not Found'
                        })
                    }
                })
            }else{
                callback(403, {
                    error: 'Authentication fail!'
                })        
            }
        })
    }else {
        callback(400, {
            error: 'You have a problem in your request'
        })
    }
};

handler._check.get = (requestProperties, callback) => {
  //check the check id is valid
  const id =
    typeof requestProperties.queryStringObj.id === "string" &&
    requestProperties.queryStringObj.id.trim().length > 0
      ? requestProperties.queryStringObj.id
      : false;
    const token = typeof requestProperties.headerObj.token === 'string' ? requestProperties.headerObj.token : false; 

    if(id){
        // read data 
        data.read('checks', id, (err, checkData) =>{
            
            // check authentication
            if(!err && checkData){
                tokenHandler._tokens.verify(token, parseJSON(checkData).phone, (isTokenValid) => {
                    if(isTokenValid){
                        // return checkdata
                        callback(200, parseJSON(checkData))
                    }else{
                        callback(403, {
                            error: 'Authentication Fail!'
                        })
                    }
                })
            }else{
                callback(403, {
                    error: 'Please provide a valid id!'
                })        
            }
        })
    }else{
        callback(400, {
            error: 'Please provide a valid id'
        })
    }
};


handler._check.put = (requestProperties, callback) => {
    let id = typeof(requestProperties.body.id) === 'string' && requestProperties.body.id.trim().length === 20 
    ? requestProperties.body.id : false;

    // validae inputs
    let protocol = typeof(requestProperties.body.protocol) === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 
    ? requestProperties.body.protocol : false;

    let url = typeof(requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 0 
    ? requestProperties.body.url : false;

    let method = typeof(requestProperties.body.method) === 'string' && ['get', 'post', 'put', 'delete'].indexOf(requestProperties.body.method) > -1 
    ? requestProperties.body.method : false;

    let successCode = typeof(requestProperties.body.successCode) === 'object' && requestProperties.body.successCode instanceof Array 
    ? requestProperties.body.successCode : false;

    let timeoutSeconds = typeof(requestProperties.body.timeoutSeconds) === 'number' && requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <= 5
    ? requestProperties.body.timeoutSeconds : false;

    if(id){
        if(protocol || url || method || successCode || timeoutSeconds){
            data.read('checks', id, (err1, checkData) =>{
                if(!err1 && checkData){
                    let checkObj = parseJSON(checkData);
                    const token = typeof requestProperties.headerObj.token === 'string' ? requestProperties.headerObj.token : false; 

                    tokenHandler._tokens.verify(token, checkObj.phone, (isValidToken) => {
                        if(isValidToken){
                            if(protocol) {
                                checkObj.protocol = protocol
                            }
                            if(url) {
                                checkObj.url = url;
                            }
                            if(method){
                                checkObj.method = method;
                            }
                            if(successCode){
                                checkObj.successCode = successCode
                            }
                            if(timeoutSeconds){
                                checkObj.timeoutSeconds = timeoutSeconds;
                            }
                            // save to db
                            data.update('checks', id, checkObj, (err2) => {
                                if(!err2){
                                    callback(200, checkObj)
                                }else{
                                    callback(500, {
                                        error: 'There was a server side error'
                                    })
                                }
                            })
                        }else{
                            callback(403,{
                                error: 'Authentication Fail!'
                            })
                        }
                    })
                }else{
                    callback(500, {
                        error: 'There was a problem in the server side'
                    })
                }
            })
        }else {
            callback(400, {
                error: 'You must provide at least one field in your request'
            })
        }
    }else{
        callback(400, {
            error: 'Your Request have problem!'
        })
    }

};

handler._check.delete = (requestProperties, callback) => {
  //check the check id is valid
  const id =
    typeof requestProperties.queryStringObj.id === "string" &&
    requestProperties.queryStringObj.id.trim().length > 0
      ? requestProperties.queryStringObj.id
      : false;
    const token = typeof requestProperties.headerObj.token === 'string' ? requestProperties.headerObj.token : false; 

    if(id){
        // read data 
        data.read('checks', id, (err, checkData) =>{
            
            // check authentication
            if(!err && checkData){
                tokenHandler._tokens.verify(token, parseJSON(checkData).phone, (isTokenValid) => {
                    if(isTokenValid){
                        // delete the check data
                        data.delete('checks', id, (err2) => {
                            if(!err2){
                                data.read('users', parseJSON(checkData).phone, (err3, userData) => {
                                    let userObj = parseJSON(userData);
                                    if(!err3 && userData){
                                        let userChecks = typeof(userObj.checks) === 'object' && userObj.checks instanceof Array ? userObj.checks : [];

                                        // remove the deleted check id from user's list of checks
                                        let checkPosition = userChecks.indexOf(id);
                                        if(checkPosition > -1){
                                            userChecks.splice(checkPosition, 1);
                                            // update the user data
                                            userObj.checks = userChecks;
                                            data.update('users', userObj.phone, userObj, (err4) => {
                                                if(!err4){
                                                    callback(200, {
                                                        message: 'check deleted'
                                                    })
                                                }else{
                                                    callback(500, {
                                                        error: 'Server error'
                                                    })
                                                }
                                            })
                                        }else{
                                            callback(500, {
                                                error: 'The check id that you are trying to remove is not found in user'
                                            })
                                        }
                                    }else{
                                        callback(500, {
                                            error: 'There was a server error!'
                                        })
                                    }
                                })
                            }else{
                                callback(500, {
                                    error: 'There was a server side error'
                                })
                            }
                        })
                    }else{
                        callback(403, {
                            error: 'Authentication Fail!'
                        })
                    }
                })
            }else{
                callback(403, {
                    error: 'Please provide a valid id!'
                })        
            }
        })
    }else{
        callback(400, {
            error: 'Please provide a valid id'
        })
    }
};

module.exports = handler;
