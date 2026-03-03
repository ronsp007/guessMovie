//declaration for mongodb modules 
const MongoClient = require("mongodb").MongoClient;

const dbHostname = "127.0.0.1";
const dbPort = 27017;
const dbServerUrl = "mongodb://" + dbHostname + ":" + dbPort + "";

const dbClient = new MongoClient(dbServerUrl);


// declaration and loading (inclusion) of various modules
const http = require("node:http");      // Node.js standard library for handling client/server server features
const fs = require("node:fs");      //needed for loading in pictures
const path = require("node:path");
const { send } = require("node:process");
const { json } = require("node:stream/consumers");

// initialization of server properties
const hostname = "127.0.0.1";
const port = 3000;
const serverUrl = "http://" + hostname + ":" + port + "";

/**************** STANDARD SERVER CREATION AND RESPONS MANAGMENT *****************/

const server = http.createServer((req,res) => {

    //saves the request url in an array: pathcomponents
    const requestUrl = new URL(serverUrl + req.url);
    const pathComponents = requestUrl.pathname.split("/");
    console.log(pathComponents);

    if(req.method == "GET"){

        switch(pathComponents[1]){

            case "test": //test to se what can be fetched from database
                //test(res,"Pollyanna"); 
                //randomMovies(pathComponents[2],null);
                //routingPictureGame(res,10,6);
                uploadingScore(kollar);
            break;
            case "pictureGame":
                routingPictureGame(res, 10, pathComponents[2]);
                
            break
            case "leaderboard":
                const difficulty = pathComponents[2];
                routingScore(res, difficulty);
            break;
            default:
                sendRespons(res,200,"text/plain", "No specific request made");
        }

    }else if(req.method == "OPTIONS"){

        sendRespons(res,200, null,null); 

    }else if(req.method == "POST") { //Used for result documentation and leaderboard

        switch(pathComponents[1]){
            case "score":
                
                const bodyChunks = [];
                
                req.on("error", (err) => {
                    console.log("An error occured when reading the Post message body.");
                    sendRespons(res,500,null,null);
                })
                req.on("data", (chunk) => {
                    bodyChunks.push(chunk);
                })
                req.on("end", () =>{
                    //Buffer.concat() takes an array of Buffer objekt and concatenates
                    //them into a singel Buffer objekt. (Incoming HTTP request bodies are handled as Buffer objekt(works with raw binary data))
                    const messageBody = Buffer.concat(bodyChunks).toString(); //compses message as a string

                    uploading_score(messageBody);
                })

            break;
            default:
                sendResponse(res, 400, "text/plain", "A HTTP POST method has been sent to the server, but no specific API endpoint could be determined.");
        }

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


/******************** FUNCTIONS  ***********************/


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

//Asks database for numr random entry titles(every one distinct)
//Imports the numr correspondning pictures. 
//For each of the main numr movies, diff other random movie names (which are different from the main movie) needs to be includeed: these will be the answer options
async function routingPictureGame(res, numr, diff) {
    
    const resultToClient = {
        QuestionMovie: null,
        answerOptionsForQuestions: null, 
        QuestionPicture: null,
    };


    const tenMovieQuestion = await randomMovies(numr, null);
    resultToClient.QuestionMovie = tenMovieQuestion;
    console.log("Movie for question loaded.")

    let imagePaths = [];

    for(let i = 0; i < numr; i++){
        const imageFilePath = "./media/" + resultToClient.QuestionMovie[i].normalized_id + ".png";
        imagePaths.push(imageFilePath);
        
    }
    resultToClient.QuestionPicture = imagePaths;
    console.log("Images to movies loaded.")

    let answerOptions = []; //empty array that will store the answer options for each movie
    for(let i = 0; i < numr; i++){
        const fiveMovies = await randomMovies(diff, resultToClient.QuestionMovie[i]);
        answerOptions.push(fiveMovies);
    }
    resultToClient.answerOptionsForQuestions = answerOptions;


   

    const stringToClient = JSON.stringify(resultToClient);
    sendRespons(res, 200, "application/json", stringToClient);

}


//asks database for numr amount of randomized movies that are distinct from check. 
async function randomMovies(numr, check) {

    await dbClient.connect();
    const db = dbClient.db("tnm121-project");
    const  dbCollection = db.collection("imdb");
    const amountOfMovies = parseInt(numr);
    

    if(check == null){ //if no perimiter is inclueded

        const sampelFilter = [
            {$match: {photo: 1}},
            {$sample: {size: amountOfMovies}}
            ];
        
        const findResult = await dbCollection.aggregate(sampelFilter).toArray();
        console.log(findResult);

        await dbClient.close();
        return findResult
        
    }else{

        const sampelFilter = [
            {$match: {normalized_id: {$ne: check.normalized_id}}}, //sets witch entry we want to exclude
            {$sample: {size: amountOfMovies-1}}, //sets how many entries we want
            {$project: {
                _id: 0,
                name: 1,
            }}
        ];

        const findResult = await dbCollection.aggregate(sampelFilter).toArray();
        
        await dbClient.close();
        return findResult; 
    }

}

async function uploadingScore(dataFromClient) {

    const scoreJsonData = JSON.parse(dataFromClient);

    await dbClient.connect();
    const db = dbClient.db("tnm121-project");


    const dbCollection = db.collection("leaderboard_" + scoreJsonData.difficulty); //if there isn't one, one is created
    
    const insertResult = await dbCollection.insertOne(dataFromClient);

    console.log("Uploaded to database: " + insertResult);

    await dbClient.close();
    
}
//A test. The POST HTTP message's body should have the following structure. 
const kollar = {
    name: "Ronja",
    score: 1,
    difficulty: "easy"
}

//gets the results(maximum of 10) from the specified difficulty level and sends it to the client 
async function routingScore(res, diff){
    await dbClient.connect();
    const db = dbClient.db("tnm121-project");
    const  dbCollection = db.collection("leaderboard_" + diff);

    const filterQuery = {};
    const sortQuery = {score: -1}; //sorts in decending order highest->lowest
    const findResult = await dbCollection.find(filterQuery).sort(sortQuery).limit(10).toArray();
    
    if(findResult.length > 0) {
        const resultToClient = JSON.stringify(findResult);
        sendRespons(res, 200, "application/json", resultToClient);

    }else{
        sendRespons(res, 406, null, null);
    }
    await dbClient.close();


}