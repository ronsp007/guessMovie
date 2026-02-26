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
                randomMovies(res,pathComponents[2],null);
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


/******************** FUNCTION  ***********************/


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


// so instead of doing this we can manipulated the database and run a code seperatly that:
// checks if the movie in the database has a picture
// adds a tag to the movies that don't have a picture
// When serching for the random movies exclude movies with said tag
async function checkImageAndReplace(movie){
    
    let test = null; 
    let imageData = null; 
    const limit = 100; 
    let n = 0;

    while(test == null && n < limit){

        const imageFilePath = "./media" + movie.normalized_id + ".png";

        try{

            imageData = await fs.readFile(imageFilePath);
            test = 1;
            return imageData;

        }catch(err){
            n++; 
            console.log(movie + " does not have picture");
            const newMovie = await randomMovies(1, movie);
            movie = newMovie[0];

        }

    }
    if(n == 100){
        throw new Error("Error fetching data");
    }else{
        return imageData;
    }
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


    let imagePaths = [];

    for(let i = 0; i < numr; i++){
        //this will be replaced
        const imageData = await checkImageAndReplace(QuestionMovie[i]);
        imagePaths.push(imageData);

    }
    resultToClient.QuestionPicture = imagePaths;

    let answerOptions = []; //empty array that will store the answer options for each movie
    for(let i = 0; i < numr; i++){
        const fiveMovies = await randomMovies(diff, QuestionMovie[i]);
        answerOptions.push(fiveMovies);
    }
    resultToClient.answerOptionsForQuestions = answerOptions;


   

    const stringToClient = JSON.stringify(resultToClient);
    sendRespons(res, 200, "application/json", stringToClient);

}


//asks database for numr amount of randomized movies that are distinct from check. 
async function randomMovies(res, numr, check) {

    await dbClient.connect();
    const db = dbClient.db("tnm121-project");
    const  dbCollection = db.collection("imdb");
    const amountOfMovies = parseInt(numr);
    

    if(check == null){ //if no perimiter is inclueded

        const sampelFilter = [{$sample: {size: amountOfMovies}}];
        const findResult = await dbCollection.aggregate(sampelFilter).toArray();
        console.log(findResult);
        
        //Singel test (TO BE REMOVED)
        const findResultString = JSON.stringify(findResult);
        sendRespons(res,200,"application/json",findResultString);
        //

        await dbClient.close();
        //return findResult
        
    }else{
        const sampelFilter = [
            {$sample: {size: numr}}, //sets how many entries we want
            {$match: {normalized_id: {$ne: check.normalized_id}}} //sets witch entry we want to exclude
        ];

        const findResult = await dbCollection.aggregate(sampelFilter).toArray();
        
        await dbClient.close();
        return findResult; 
    }

}