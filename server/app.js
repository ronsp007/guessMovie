//declaration for mongodb modules 
const MongoClient = require("mongodb").MongoClient;

const dbHostname = "127.0.0.1";
const dbPort = 27017;
const dbServerUrl = "mongodb://" + dbHostname + ":" + dbPort + "";

const dbClient = new MongoClient(dbServerUrl);


// declaration and loading (inclusion) of various modules
const http = require("node:http");      // Node.js standard library for handling client/server server features
const fs = require("node:fs");      //needed for loading in pictures

// initialization of server properties
const hostname = "127.0.0.1";
const port = 3000;
const serverUrl = "http://" + hostname + ":" + port + "";


const server = http.createServer((req,res) => {

    //saves the request url in an array: pathcomponents
    const requestUrl = new URL(serverUrl + req.url);
    const pathComponents = requestUrl.pathname.split("/");
    console.log(pathComponents);

    if(req.method == "GET"){

        switch(pathComponents[1]){
            case "test": //test to se what can be fetched from database
                test(res,"Pollyanna"); 
            break;
            case "pictureGame":
                //routingPictureGame(res);
                randomMovies(res, 10, null);
            break
            default:
                sendRespons(res,200,"text/plain", "No specific request made");
        }

    }else if(req.method == "OPTIONS"){

        sendRespons(res,200, null,null); 

    }else if(req.method == "POST") { //Used for result documentation and leaderboard

        //insert code

    }else {
          sendResponse(res,200,"text/plain", "Unrecognized request");
    }

});

server.listen(port, hostname, () => {
    console.log("The server is running an listening at: " + serverUrl);
});

//standardfunction for sending respons to client
function sendRespons(res, statusCode, contentType, data){

    res.statusCode = statusCode;

    if (contentType != null) res.setHeader("Content-Type", contentType);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");

    if(data != null) res.end(data);
    else res.end();

}


//test function for communication with database
async function test(res, search){

    await dbClient.connect();
    const db = dbClient.db("tnm121-project");
    const  dbCollection = db.collection("imdb");

    const filterQuery = {name: search};
    const findResult = await dbCollection.find(filterQuery).toArray();
    console.log(findResult);
    const findResultString = JSON.stringify(findResult);

    sendRespons(res,200,"application/json",findResultString);
    await dbClient.close();

}


//Asks database for 10 random entry titles(ever one uniqe)
//Imports the 10 correspondning pictures. 
//For each of the main 10 movies, 5 other random movie names (which are different from the main movie) needs to be includeed, these will be the answer options
async function routingPictureGame(res) {
    const tenMovieQuestion = await randomMovies(10, null);

}

//asks database for numr amount for randomized movies that are distinct from check. 
async function randomMovies(res, numr, check) {

    if(check != null){ //if no paremeter is inclueded
        
        await dbClient.connect();
        const db = dbClient.db("tnm121-project");
        const  dbCollection = db.collection("imdb");

        const findResult = await dbCollection.aggregate([{$sample: {size: numr}}]).toArray();
        console.log(findResult);
        const resultJson = {Questions: findResult};
        const findResultString = JSON.stringify(resultJson);

        sendRespons(res,200,"application/json",findResultString);
        await dbClient.close();
        
    }else{
        console.log("Not yet implemented");
    }

}