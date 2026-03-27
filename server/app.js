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

//starts server listening and connects to database
startServer();

/**************** STANDARD SERVER CREATION AND API REQUEST MANAGMENT *****************/

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
                gameParameters.questionBase = "star"; //star is the field name for actors in the database
                gameParameters.optionBase = "name"; 

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
                
                const normalized_id = pathComponents[2];
                routingImages(res, normalized_id); 
                
            break;

            case "instructions": //gets the instructions and sends them if found

                const language = pathComponents[2];
                routingInstructions(res,language);
                
            break;

            default:
                sendResponse(res, 400, "text/plain", "A HTTP GET method has been sent to the server, but no specific API endpoint could be determined.");
            
        }

    }else if(req.method == "OPTIONS"){

        sendResponse(res,204, null,null); 

    }else if(req.method == "POST") { //Used for game result and leaderboard
       

        switch(pathComponents[1]){
            case "score":
    
                const bodyChunks = [];
                //handels Post message body 
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
                   

                    uploadingScore(res, messageBody);
                })

            break;
            default:
                sendResponse(res, 400, "text/plain", "A HTTP POST method has been sent to the server, but no specific API endpoint could be determined.");
        }

    }else {
        sendResponse(res, 400, "text/plain", "Unrecognized request");
    }

});





async function startServer() {
    try{
        await dbClient.connect();
        console.log("Connected to database");
        server.listen(port, hostname, () => {
            console.log("The server is running an listening at: " + serverUrl);
        });
    
    }catch(error){
        console.log("Failed to connect to database. Error: ", error); 
    }
}


/******************** FUNCTIONS  ***********************/

//standardfunction for sending respons to client
function sendResponse(res, statusCode, contentType, data){

    res.statusCode = statusCode;

    if (contentType != null) res.setHeader("Content-Type", contentType);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");

    if(data != null) res.end(data);
    else res.end();

}

//Requests a single movie based on the name. Used as a test function for communication with database
async function singleMovie(res, search){

    //await dbClient.connect();
    const db = dbClient.db("tnm121-project");
    const  dbCollection = db.collection("imdb");

    const filterQuery = {name: search};

    try{
        const findResult = await dbCollection.find(filterQuery).toArray();
        const findResultString = JSON.stringify(findResult);

        sendResponse(res,200,"application/json",findResultString);
  
    }catch(error){
        sendResponse(res, 500, "text/plain", "Failed connect to database");
    }
    
    //await dbClient.close();

}

function routingInstructions(res, language){
    const filePath = "./resources/instructions.json";

    fs.readFile(filePath, (err, data) => { //data becomes a string
        if(err){
            sendResponse(res, 404, "text/plain", "Instructions not found");
        }else{
            
            const jsonData = JSON.parse(data);
            const specificData = jsonData[language];
            const dataToClient = JSON.stringify(specificData);
            
            sendResponse(res, 200, "application/json", dataToClient);
        }
    });
}

async function routingGame(res, gameParameters){
    
    const resultToClient = { //composes the data for one entire game(exluding images) 
        QuestionMovie: null,
        answerOptionsForQuestion: [], 
    };
    
    //await dbClient.connect();
    const db = dbClient.db("tnm121-project");
    const dbCollection = db.collection("imdb");
    const amountOfMovies = parseInt(gameParameters.amountOfQuestion);
    const amountOfQuestions = parseInt(gameParameters.difficulty);

    //filter for the information we want 
    const sampleFilterQuestion = [
        {$match: {[gameParameters.searchParameter]: 1}}, //we only want entries that have pictures
        {$sample: {size: amountOfMovies}}, //sets how many entries we want
        {$project: { //what field should be inclued
            normalized_id: 1, //always inclued the normalized_id since it's the same between different data groups(images)
            name: 1,
            [gameParameters.questionBase]: 1,
        }}
    ];
   
    //movies that are used for the questions are found and stored. 
    try{
        resultToClient.QuestionMovie = await dbCollection.aggregate(sampleFilterQuestion).toArray();

    } catch(error){
        sendResponse(res, 500, "text/plain", "Failed connect to database");
        //await dbClient.close();
        return;
    }
    

    for(let i = 0; i < resultToClient.QuestionMovie.length; i++){
        
        const sampleFilterQuestion = [
            {$match: {//excludes the real answer from the options answers so there are no duplicates
                normalized_id: {$ne: resultToClient.QuestionMovie[i].normalized_id}, //included to explicitly remove the correct answer
                    //removes all entries that has the same value in the field corresponding to the answer
                [gameParameters.optionBase]: {$ne: resultToClient.QuestionMovie[i][gameParameters.optionBase]},
            }}, 

            //group is used to ensure we don't get the same values for the option questions, for example year
            //reference for how templet literals `$ ` works: https://www.freecodecamp.org/news/what-does-the-dollar-sign-mean-in-javascript/#:~:text=Using%20the%20%24%20in%20Template%20Literals&text=They%20allow%20you%20to%20embed,expressions%20dynamically%20in%20template%20literals.
            //info on how group works: https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/
            {$group: {
                _id: `$${gameParameters.optionBase}`,
            }}, 

            {$sample: {size: amountOfQuestions}}, //how many answer options there are is dependent on difficulty
            {$project: { //what field should be inclued
                [gameParameters.optionBase]: "$_id",
            }}
        ];

        //connect to the database
        try{
            const optionData = await dbCollection.aggregate(sampleFilterQuestion).toArray();
            resultToClient.answerOptionsForQuestion.push(optionData);

        }catch(error){
            sendResponse(res, 500, "text/plain", "Failed connect to database");
            //await dbClient.close();
            return;
        }
        
        
    }
    
    const stringToClient = JSON.stringify(resultToClient);
    sendResponse(res, 200, "application/json", stringToClient);
    //await dbClient.close();

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
async function uploadingScore(res, dataFromClient) {

    const scoreJsonData = JSON.parse(dataFromClient); //Converts the string into an objekt

    if(scoreJsonData.name == null || scoreJsonData.score == null){ //makes sure that the data is correct 
        sendResponse(res,400,"text/plain","Unvaild data");
    }else{
         const collectionName =  "leaderboard_" + scoreJsonData.gameType;    

        //await dbClient.connect();
        const db = dbClient.db("tnm121-project");
        const dbCollection = db.collection(collectionName); //if there isn't one, one is created
        
        try{
            const insertResult = await dbCollection.insertOne(scoreJsonData);
            console.log("Uploaded to database: " + insertResult.insertedId);

            sendResponse(res, 200, "text/plain", "Score saved"); //sends a response to the client knows if the save was sucsessfull
        }catch(error){
            sendResponse(res, 500, "text/plain", "Failed to save score");
        }
        
        //await dbClient.close();
    }
    
}

//gets the results(maximum of 10) from the specified game type and difficulty level and sends it to the client 
async function routingScore(res, type, diff){
    //await dbClient.connect();
    const db = dbClient.db("tnm121-project");
    const  dbCollection = db.collection("leaderboard_" + type); //searches in the database for the requested game.

    const filterQuery = {
        difficulty: diff //only find the ones with the relevant difficulty
    };
    const sortQuery = {score: -1}; //sorts in decending order highest->lowest

    try{
        const findResult = await dbCollection.find(filterQuery).sort(sortQuery).limit(10).toArray();

        if(findResult.length > 0) {
            const resultToClient = JSON.stringify(findResult);
            sendResponse(res, 200, "application/json", resultToClient);

        }else { //if no resulst are found
            sendResponse(res, 204, null, null); //sends message No content
        }
        
    }catch(error){
        sendResponse(res, 500, "text/plain", "Failed connect to database");
    }

    //await dbClient.close();

}