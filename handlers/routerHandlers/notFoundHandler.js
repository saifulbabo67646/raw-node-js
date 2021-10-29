/*
 * Title: Handle Request and Response
 * Description: Handle Request and response from here
 * Author: Saiful Islam
 * Date: 10/22/2021
 *
 */

// module scaffolding
const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
    callback(404, {
        message: 'Requested Url not found'
    })
}

module.exports = handler