/*
 * Title: Handle Routes
 * Description: Handle Routes from here
 * Author: Saiful Islam
 * Date: 10/22/2021
 *
 */
// dependencies
const {sampleHandler} = require('./handlers/routerHandlers/sampleHandler')
const {userHandler} = require('./handlers/routerHandlers/userHandler');
const {tokenHandler} = require('./handlers/routerHandlers/tokenHandler');
const {checkHandler} = require('./handlers/routerHandlers/checkHandler');


const routes = {
    'sample': sampleHandler,
    'user': userHandler,
    'token': tokenHandler,
    'check': checkHandler,
}

module.exports = routes;