/*
 * Title: utilites
 * Description: utilites from here
 * Author: Saiful Islam
 * Date: 10/22/2021
 *
 */
// dependencies
const crypto = require('crypto');

// module scaffolding
const utilities = {};

utilities.parseJSON = (jsonString) => {
    let output;

    try{
        output = JSON.parse(jsonString)
    }catch {
        output = {}
    }

    return output;
}

// hash string
utilities.hash = (str) =>{
    if(typeof(str) === 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', 'password').update(str).digest('hex');
        return hash
    }else {
        return false
    }
}

// random string 
utilities.createRandomString = (strlength) => {
    let length = strlength;
    length = typeof(strlength) === 'number' && strlength > 0 ? strlength : false;

    if(length) {
        let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
        let output = '';
        for( let i = 1; i <= length; i+=1){
            let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
            output += randomCharacter
        }
        return output
    }
    return null
}

module.exports = utilities