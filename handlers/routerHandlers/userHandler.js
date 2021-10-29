/*
 * Title: user handler
 * Description: user handler from here
 * Author: Saiful Islam
 * Date: 10/22/2021
 *
 */

//dependencies
const data = require("../../lib/data");
const { hash } = require("../../helpers/utilities");
const { parseJSON } = require("../../helpers/utilities");
const tokenHandler = require("./tokenHandler");

// module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._users[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
  // callback(200, {
  //     message: 'This is a user Message'
  // })
};

handler._users = {};

handler._users.post = (requestProperties, callback) => {
  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;

  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;

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

  const tosAgreement =
    typeof requestProperties.body.tosAgreement === "boolean"
      ? requestProperties.body.tosAgreement
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    // make sure that the user doesn't already exists
    data.read("users", phone, (err1, user) => {
      if (err1) {
        let userObject = {
          firstName,
          lastName,
          phone,
          password: hash(password),
          tosAgreement,
        };
        // store the user to db
        data.create("users", phone, userObject, (err2) => {
          if (!err2) {
            callback(200, {
              message: "User was created successfully",
            });
          } else {
            callback(500, { error: "could not create user!" });
          }
        });
      } else {
        callback(400, {
          error: "User already exist",
        });
      }
    });
  } else {
    callback(400, {
      error: "You have a problem in your request",
    });
  }
};

handler._users.get = (requestProperties, callback) => {
  //check the phone number is valid
  const phone =
    typeof requestProperties.queryStringObj.phone === "string" &&
    requestProperties.queryStringObj.phone.trim().length > 0
      ? requestProperties.queryStringObj.phone
      : false;

  // authorization by token
  tokenHandler._tokens.verify(
    requestProperties.headerObj.token,
    phone,
    (token) => {
      if (token) {
        if (phone) {
          // lookup the user
          data.read("users", phone, (err, u) => {
            const user = { ...parseJSON(u) };
            if (!err && user) {
              delete user.password;
              callback(200, user);
            } else {
              callback(404, {
                error: "Requested User not found",
              });
            }
          });
        } else {
          callback(404, {
            error: "Requested User not found",
          });
        }
      } else {
        callback(403, {
          error: "Authorization fail!",
        });
      }
    }
  );
};


handler._users.put = (requestProperties, callback) => {
  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;

  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;

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

  // authorization by token
  tokenHandler._tokens.verify(
    requestProperties.headerObj.token,
    phone,
    (token) => {
      if (token) {
        if (phone) {
          if (firstName || lastName || password) {
            // lookup the user
            data.read("users", phone, (err, uData) => {
              const userData = { ...parseJSON(uData) };
              if (!err && userData) {
                // updata the data
                if (firstName) {
                  userData.firstName = firstName;
                }
                if (lastName) {
                  userData.lastName = lastName;
                }
                if (password) {
                  userData.password = hash(password);
                }
                // store to database
                data.update("users", phone, userData, (err2) => {
                  if (!err2) {
                    callback(200, {
                      message: "The user Updated successfully",
                    });
                  } else {
                    callback(400, {
                      error: "The user not update",
                    });
                  }
                });
              } else {
                callback(400, {
                  error: "Please provide valid phone number",
                });
              }
            });
          } else {
            callback(400, {
              error: "Please provide valid phone number",
            });
          }
        } else {
          callback(400, {
            error: "Please provide valid phone number",
          });
        }
      } else {
        callback(403, {
          error: "Authorization Fail!",
        });
      }
    }
  );
};

handler._users.delete = (requestProperties, callback) => {
  //check the phone number is valid
  const phone =
    typeof requestProperties.queryStringObj.phone === "string" &&
    requestProperties.queryStringObj.phone.trim().length > 0
      ? requestProperties.queryStringObj.phone
      : false;
  // authorization by token
  tokenHandler._tokens.verify(
    requestProperties.headerObj.token,
    phone,
    (token) => {
      if (token) {
        if (phone) {
          // lookup the user
          data.read("users", phone, (err, user) => {
            if (!err && user) {
              data.delete("users", phone, (err2) => {
                if (!err2) {
                  callback(200, {
                    message: "User was successfully deleted!",
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
      } else {
        callback(403, {
          error: "Authorization Fail",
        });
      }
    }
  );
};

module.exports = handler;
