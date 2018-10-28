
require('dotenv').config() 
const MongoClient = require('mongodb').MongoClient;
var Promise = require('bluebird')

//getting mongo varaibles from .env file
// Connection URL
const url = process.env.DB_URL
const dbName = process.env.DB_COLLECTION_NAME


// Use connect method to connect to the server
function getConnection() {
	
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {

            if (err) { 
            	console.log(err)
            	reject(err) 
            }

            resolve(client)
        })
    });
}


module.exports = { getConnection: getConnection }