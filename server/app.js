const MongoClient = require("mongodb").MongoClient;

const dbHostname = "127.0.0.1";
const dbPort = 27017;
const dbServerUrl = "mongodb://" + dbHostname + ":" + dbPort + "";

const dbClient = new MongoClient(dbServerUrl);

// declaration and loading (inclusion) of various modules
const http = require("node:http");      // Node.js standard library for handling client/server server features

// initialization of server properties
const hostname = "127.0.0.1";
const port = 3000;
const serverUrl = "http://" + hostname + ":" + port + "";