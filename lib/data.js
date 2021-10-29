// dependencies
const fs = require('fs');
const path = require('path')


const lib = {};

// base directory of the data folder
lib.basedir = path.join(__dirname, '/../.data/');

// write data to file
lib.create = (dir, file, data, callback) => {
    // open file for writing
    fs.open(`${lib.basedir + dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
        if(!err && fileDescriptor) {
            // convert data to string
            const stringData = JSON.stringify(data);

            // write data to file and then close it
            fs.writeFile(fileDescriptor, stringData, (err2) => {
                if(!err2) {
                    fs.close(fileDescriptor, (err3) => {
                        if(!err3) {
                            callback(false)
                        } else {
                            callback('Error closing the new file')
                        }
                    })
                }else {
                    callback('Error Writing to new file')
                }
            })
        } else {
            callback('Couldnt create new file, it may already exist');
        }
    })
}

// read data from file
lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.basedir + dir}/${file}.json`, 'utf8', (err, data) => {
        callback(err, data)
    })
}

// update data to file
lib.update = (dir, file, data, callback) => {
    fs.open(`${lib.basedir + dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
        if(!err && fileDescriptor) {
        const stringData = JSON.stringify(data)

        // truncate file
        fs.ftruncate(fileDescriptor, (err2) => {
            if(!err2) {
                // write the file and close it
                fs.writeFile(fileDescriptor, stringData, (err3) => {
                    if(!err3) {
                        //close the file
                        fs.close(fileDescriptor, (err4) => {
                            if(!err4) {
                                callback(false)
                            }else {
                                callback('Error closing file')
                            }
                        })
                    }else {
                        callback('Error Writing to file')
                    }
                })
            }else {
                callback('Error truncating file')
            }
        })
        } else {
            callback('Error Happening from Updating')
        }
    })
}

// delete data to file
lib.delete = (dir, file, callback) => {
    // unlink file 
    fs.unlink(`${lib.basedir + dir}/${file}.json`, (err) => {
        if(!err) {
            callback(false)
        }else {
            callback('Error in File Deletion')
        }
    })
}

// list all the items in a directory
lib.list = (dir, callback) => {
    fs.readdir(`${lib.basedir + dir}/`, (err, fileName) =>{
        if(!err && fileName && fileName.length > 0) {
            let trimmedFileNames = [];
            fileName.forEach(file => {
                trimmedFileNames.push(file.replace('.json', ''));
            });
            callback(false, trimmedFileNames);
        } else {
            callback('Error Reading Directory')
        }
    })
}

// exports module
module.exports = lib;