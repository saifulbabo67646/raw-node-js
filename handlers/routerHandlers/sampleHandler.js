/*
 * Title: Handle Request and Response
 * Description: Handle Request and response from here
 * Author: Saiful Islam
 * Date: 10/22/2021
 *
 */

// module scaffolding
const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
    callback(200, {
        message: 'This is a sample Message'
    })
}

module.exports = handler