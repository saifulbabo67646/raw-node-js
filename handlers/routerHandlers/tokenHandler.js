/*
 * Title: token handler
 * Description: token handler from here
 * Author: Saiful Islam
 * Date: 10/22/2021
 *
 */

//dependencies
const data = require("../../lib/data");
const { hash } = require("../../helpers/utilities");
const { parseJSON } = require("../../helpers/utilities");
const { createRandomString } = require("../../helpers/utilities");

// module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._tokens[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
  // callback(200, {
  //     message: 'This is a user Message'
  // })
};

handler._tokens = {};

handler._tokens.post = (requestProperties, callback) => {
  const phone =
    typeof requestProperties.body.phone === "string" &&
    requestProperties.body.phone.trim().length > 0
      ? requestProperties.body.phone
      : false;

  const password =
    typeof requestProperties.body.password === "string" &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;

  if (phone && password) {
    data.read("users", phone, (err, uData) => {
      let userData = { ...parseJSON(uData) };
      if (!err) {
        const hashedPassword = hash(password);
        if (hashedPassword === userData.password) {
          const tokenId = createRandomString(20);
          const expires = Date.now() + 60 * 60 * 1000;
          const tokenObj = {
            phone,
            id: tokenId,
            expires,
          };
          // store to db
          data.create("tokens", tokenId, tokenObj, (err2) => {
            if (!err2) {
              callback(200, tokenObj);
            } else {
              callback(500, {
                error: "Internal Server Error",
              });
            }
          });
        } else {
          callback(400, {
            error: "Invalid password",
          });
        }
      } else {
        callback(404, {
          error: "Not Found this user",
        });
      }
    });
  } else {
    callback(400, {
      error: "Wrong Credential",
    });
  }
};

handler._tokens.get = (requestProperties, callback) => {
  //check the token is valid
  const id =
    typeof requestProperties.queryStringObj.id === "string" &&
    requestProperties.queryStringObj.id.trim().length >= 20
      ? requestProperties.queryStringObj.id
      : false;
  if (id) {
    // lookup the token
    data.read("tokens", id, (err, tokenData) => {
      const token = { ...parseJSON(tokenData) };
      if (!err && token) {
        callback(200, token);
      } else {
        callback(404, {
          error: "Requested id not found",
        });
      }
    });
  } else {
    callback(404, {
      error: "Requested id not found",
    });
  }
};

handler._tokens.put = (requestProperties, callback) => {
  //check the token is valid
  const id =
    typeof requestProperties.body.id === "string" &&
    requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : false;

  const extend =
    typeof requestProperties.body.extend === "boolean" &&
    requestProperties.body.extend === true
      ? true
      : false;

  if (id && extend) {
    data.read("tokens", id, (err, tokenData) => {
      const tokenObj = { ...parseJSON(tokenData) };
      if (!err) {
        if (tokenObj.expires > Date.now()) {
          tokenObj.expires = Date.now() + 60 * 60 * 1000;
          // store the updated token
          data.update("tokens", id, tokenObj, (err2) => {
            if (!err2) {
              callback(200, tokenObj);
            } else {
              callback(500, {
                error: "There was a server Error",
              });
            }
          });
        } else {
          callback(400, {
            error: "Token already expired",
          });
        }
      } else {
        callback(400, {
          error: "Token already expired",
        });
      }
    });
  } else {
    callback(400, {
      error: "There was a problem in your request",
    });
  }
};

handler._tokens.delete = (requestProperties, callback) => {
  //check the token is valid
  const id =
    typeof requestProperties.queryStringObj.id === "string" &&
    requestProperties.queryStringObj.id.trim().length === 20
      ? requestProperties.queryStringObj.id
      : false;

  if (id) {
    // lookup the user
    data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        data.delete("tokens", id, (err2) => {
          if (!err2) {
            callback(200, {
              message: "Token was successfully deleted!",
            });
          } else {
            callback(500, {
              error: "There have a server error",
            });
          }
        });
      } else {
        callback(500, {
          error: "There was a server side error!",
        });
      }
    });
  } else {
    callback(400, {
      error: "There was a problem in your request",
    });
  }
};

handler._tokens.verify = (id, phone, callback) => {
    data.read('tokens', id, (err, tData) => {
        let tokenData = {...parseJSON(tData)}
        if(!err && tokenData){
            if(tokenData.phone === phone && tokenData.expires > Date.now()){
                callback(true)
            }else{
                callback(false)
            }
        }else {
            callback(false)
        }
    })
}

module.exports = handler;
