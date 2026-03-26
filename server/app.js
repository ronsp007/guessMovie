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
        
        /*****Set up****/
        let gameParameters = {
            answer: null,
            questionBase: null,
            optionBase: null,
            searchParameter: "photo",
            amountOfQuestion: 10, //set the standard to all the games to have 10 questions
            difficulty: 5,
        };

        //determines how many option questions need to be sent
        if(pathComponents[2] == "easy"){
            gameParameters.difficulty = 2;
        }else if (pathComponents[2] == "normal"){ 
            gameParameters.difficulty = 5;
        }else if(pathComponents[2] == "hard"){
            gameParameters.difficulty = 8; 
        }
        /**************/

        switch(pathComponents[1]){
            
            case"movie": //test to get a single movie from the imdb database
                singleMovie(res,pathComponents[2]); 
            break;

            case "yearGame":
                gameParameters.questionBase = "year";
                gameParameters.optionBase = "year";

                routingGame(res, gameParameters);
            break

            case "descriptionGame":
                gameParameters.questionBase = "description";
                gameParameters.optionBase = "name";

                routingGame(res, gameParameters);
            break;

            case "actorsGame":
                gameParameters.questionBase = "star"; //star is the key for actors in the database
                gameParameters.optionBase = "name"; //still name of movie

                routingGame(res, gameParameters);
            break;

            case "directorGame":
                gameParameters.questionBase = "director";
                gameParameters.optionBase = "director";

                routingGame(res, gameParameters);
            break;

            case "leaderboard":

                const gameType = pathComponents[2];
                const difficulty = pathComponents[3];
                routingScore(res, gameType, difficulty);

            break;

            case "picture":
                
                routingImages(res, pathComponents[2]); //pathcomponents[2] = normalized_id
                
            break;

            case "instructions":
                const filePath = "./resources/instructions.json";

                fs.readFile(filePath, "utf-8", (err, data) => { //data becomes a string
                    if(err){
                        sendResponse(res, 404, "text/plain", "Instructions not found");
                    }else{
                        sendResponse(res, 200, "application/json", data);
                    }
                });
                
            break;

            default:
                sendResponse(res,200,"text/plain", "No specific request made");
            
        }

    }else if(req.method == "OPTIONS"){

        sendResponse(res,200, null,null); 

    }else if(req.method == "POST") { //Used for game result and leaderboard
       

        switch(pathComponents[1]){
            case "score":
    
                const bodyChunks = [];
                
                req.on("error", (err) => {
                    console.log("An error occured when reading the Post message body.");
                    sendResponse(res,500,null,null);
                })
                req.on("data", (chunk) => {
                    bodyChunks.push(chunk);
                })
                req.on("end", () =>{
                    //Buffer.concat() takes an array of Buffer objekt and concatenates
                    //them into a singel Buffer objekt. (Incoming HTTP request bodies are handled as Buffer objekt(works with raw binary data))
                    const messageBody = Buffer.concat(bodyChunks).toString(); //composes message as a string

                    uploadingScore(messageBody);
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
function sendResponse(res, statusCode, contentType, data){

    res.statusCode = statusCode;

    if (contentType != null) res.setHeader("Content-Type", contentType);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");

    if(data != null) res.end(data);
    else res.end();

}


/******************** FUNCTIONS  ***********************/

//test function for communication with database
async function singleMovie(res, search){

    await dbClient.connect();
    const db = dbClient.db("tnm121-project");
    const  dbCollection = db.collection("imdb");

    const filterQuery = {name: search};
    const findResult = await dbCollection.find(filterQuery).toArray();
    
    const findResultString = JSON.stringify(findResult);

    sendResponse(res,200,"application/json",findResultString);
    await dbClient.close();

}

async function routingGame(res, gameParameters){
    
    const resultToClient = { //composes the data for one entire game(exluding images) 
        QuestionMovie: null,
        answerOptionsForQuestion: [], 
    };
    
    await dbClient.connect();
    const db = dbClient.db("tnm121-project");
    const dbCollection = db.collection("imdb");
    const amountOfMovies = parseInt(gameParameters.amountOfQuestion);
    const amountOfQuestions = parseInt(gameParameters.difficulty);

    const sampelFilterQuestion = [
        {$match: {[gameParameters.searchParameter]: 1}}, //we only want entries that have pictures
        {$sample: {size: amountOfMovies}}, //sets how many entries we want
        {$project: {
            normalized_id: 1, //always inclued the normalized_id since it's the same between different data groups(images)
            name: 1,
            [gameParameters.questionBase]: 1,
        }}
    ];
   
  
    //movies that are used for the questions are found and stored. 
    resultToClient.QuestionMovie = await dbCollection.aggregate(sampelFilterQuestion).toArray();
    

    for(let i = 0; i < resultToClient.QuestionMovie.length; i++){
        
        const sampelFilterOptions = [
            {$match: {//excludes the real answer from the options answers so there are no dublicates
                normalized_id: {$ne: resultToClient.QuestionMovie[i].normalized_id}, //included to explicitly remove the correct answer
                [gameParameters.optionBase]: {$ne: resultToClient.QuestionMovie[i][gameParameters.optionBase]},
            }}, 

            //group is used to ensure we don't get the same values for the option questions, for example year
            //reference for how templet literals `$ ` works: https://www.freecodecamp.org/news/what-does-the-dollar-sign-mean-in-javascript/#:~:text=Using%20the%20%24%20in%20Template%20Literals&text=They%20allow%20you%20to%20embed,expressions%20dynamically%20in%20template%20literals.
            //info on how group works: https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/
            {$group: {
                _id: `$${gameParameters.optionBase}`,
            }}, 

            {$sample: {size: amountOfQuestions}}, //how many answer options there are is dependent on difficulty
            {$project: { //include the following variable name
                [gameParameters.optionBase]: "$_id",
            }}
        ];

        const optionData = await dbCollection.aggregate(sampelFilterOptions).toArray();
        resultToClient.answerOptionsForQuestion.push(optionData);
    }

    await dbClient.close();
    const stringToClient = JSON.stringify(resultToClient);
    sendResponse(res, 200, "application/json", stringToClient);

}






//Asks database for numr random entry titles(every one distinct)
//Imports the numr of correspondning pictures. 
//For each of the main numr movies, numrAnswerOptions other random movie names (which are different from the main movie) needs to be includeed: these will be the answer options
async function routingPictureGame(res, amount, numrAnswerOptions) {
    
    const resultToClient = {
        QuestionMovie: null,
        answerOptionsForQuestion: null, 
    };

    const MovieQuestion = await randomMovies(amount, null); //fetches the data that will be used for the questions
    resultToClient.QuestionMovie = MovieQuestion;

    let answerOptions = []; //empty array that will store the answer options for each movie
    for(let i = 0; i < amount; i++){
        const optionData = await randomMovies(numrAnswerOptions, resultToClient.QuestionMovie[i]);//fetches the data that will be used for the answer options
        answerOptions.push(optionData);
    }
    resultToClient.answerOptionsForQuestion = answerOptions;

    const stringToClient = JSON.stringify(resultToClient);
    sendResponse(res, 200, "application/json", stringToClient);

}
//asks database for numr amount of randomized movies that are distinct from check. 
async function randomMovies(numr, exclude) {

    const sampelFilter = [
        {$match: {photo: 1}},
        {$sample: {size: amountOfMovies}},
        {$project: {
            _id: 0,
            name: 1,
        }}
        ];
    
    const findResult = await dbCollection.aggregate(sampelFilter).toArray();
    //console.log(findResult);

    await dbClient.close();
    return findResult

}
async function randomAnswerOptions(numr, exclude) {
    await dbClient.connect();
    const db = dbClient.db("tnm121-project");
    const  dbCollection = db.collection("imdb");
    const amountOfMovies = parseInt(numr);

    const sampelFilter = [
            {$match: {normalized_id: {$ne: exclude.normalized_id}}}, //sets which entry we want to exclude
            {$sample: {size: amountOfMovies-1}}, //sets how many entries we want
            {$project: { //only include the following data
                _id: 0,
                name: 1,
            }}
        ];
    const findResult = await dbCollection.aggregate(sampelFilter).toArray();
        
    await dbClient.close();
    return findResult; 
}

//sends image to client based on the normalized id
function routingImages(res, id) {

    const imageFilePath = "./media/" + id + ".png";

    fs.readFile(imageFilePath, (err, data) => {
        if (err) {
            sendResponse(res, 404, "text/plain", "Image not found");
        } else {
            sendResponse(res, 200, "image/png", data);
        }
    });

}

//uploads score to database
async function uploadingScore(dataFromClient) {

    const scoreJsonData = JSON.parse(dataFromClient); //Converts the string into an objekt
  
    const collectionName =  "leaderboard_" + scoreJsonData.gameType;    

    await dbClient.connect();
    const db = dbClient.db("tnm121-project");
    const dbCollection = db.collection(collectionName); //if there isn't one, one is created
    
    const insertResult = await dbCollection.insertOne(scoreJsonData);
    console.log("Uploaded to database: " + insertResult);

    await dbClient.close();
    
}

//gets the results(maximum of 10) from the specified difficulty level and sends it to the client 
async function routingScore(res, type, diff){
    await dbClient.connect();
    const db = dbClient.db("tnm121-project");
    const  dbCollection = db.collection("leaderboard_" + type); //searches in the database for the requested game.

    const filterQuery = {
        difficulty: diff //only find the ones with the relevant difficulty
    };
    const sortQuery = {score: -1}; //sorts in decending order highest->lowest
    const findResult = await dbCollection.find(filterQuery).sort(sortQuery).limit(10).toArray();
    
    if(findResult.length > 0) {
        const resultToClient = JSON.stringify(findResult);
        sendResponse(res, 200, "application/json", resultToClient);

    }else { //if no resulst are found
        sendResponse(res, 404, null, null);
    }
    await dbClient.close();
}