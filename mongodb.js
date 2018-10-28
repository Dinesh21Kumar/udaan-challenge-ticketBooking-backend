// Retrieve
var MongoClient = require('mongodb').MongoClient
var mongoConn = require('./dbconn.js')
require('dotenv').config() 

//get collection name and db name from .env file
var collection = process.env.DB_COLLECTION_NAME
var dbs = process.env.DB_NAME


//find in a collection 
function find(obj) {
    return new Promise(function(resolve, reject) {
        mongoConn.getConnection()
            .then(function(client) {
                const db = client.db(dbs);
                const col = db.collection(collection);
                col.find(obj).toArray(function(err, docs) {
                    if (err) {
                        console.log(err);
                        reject(err)
                    }
                    //console.log(docs)
                    resolve(docs)

                });

            }).catch(function(err) {
                console.log(err)
                reject(err)

            })
    })
}

//inserts in  a collection
function insert(obj) {

    return new Promise(function(resolve, reject) {

        mongoConn.getConnection()
            .then(function(client) {
                const db = client.db(dbs);
                const col = db.collection(collection);
                col.insertOne(obj, function(err, result) {
                    if (err) { reject(err) }
                    resolve(result)
                })

            })
            .catch(function(err) {
                console.log(err)
                reject(err)
            })
    })
}

//update in a collection
function update(filterObj, updateObj) {
    return new Promise(function(resolve, reject) {
        mongoConn.getConnection()
            .then(function(client) {
                const db = client.db(dbs);
                const col = db.collection(collection);
                col.updateOne(filterObj, updateObj, { upsert: true }, function(err, result) {
                    if (err) { reject(err) }
                    resolve(result)
                })

            })
            .catch(function(err) {
                console.log(err)
                reject(err)

            })

    })

}


//making the functions to be used outside
module.exports = {insert:insert,find:find,update:update}