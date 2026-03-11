


/**************READ THIS***********************/
// First you need to run the terminal with: npm install
// Make sure that the database is updated with all the movie data(runt the data_import script that's found on the course website)
// In the terminal run this scripts: node -\image_check.js
// Check with the numbers that appear in the terminal that everything is correct: correct numbers are writtes as comments in the code
// You can also dubbelcheck in the database that the new value has appeared







const fs = require("node:fs/promises");  // Node.js default 'filesystem'; just here for potential error log writin
const path = require("path");

// MongoDB Driver Module loading, server configuration, and database client initialization
const MongoClient = require("mongodb").MongoClient;
const dbHostname = "127.0.0.1"; 
const dbPort = 27017;
const dbServerUrl = "mongodb://" + dbHostname + ":" + dbPort + "";
const dbClient = new MongoClient(dbServerUrl);

const dbName = "tnm121-project";
const dbCollectionName_imdb = "imdb";


getMovies();


//Sequence thru all the imdb documents: 
//Check if there is a matching foto
//If there is > add {photo: 1}

async function getMovies() {
    console.log("----Begining manipulation----");

    await dbClient.connect();
    const db = dbClient.db(dbName);
    const dbCollection = db.collection(dbCollectionName_imdb);

    const cursor = await dbCollection.find({});

    //checks
    let i = 0;
    let noImage = 0;
    let hasImage = 0;
    let check;

    for await (const movie of cursor){
        
        const FilePath = path.join(__dirname, "..", "server","media");//Info on how this works: https://nodejs.org/api/path.html
        const imageFilePath = FilePath + "/" + movie.normalized_id + ".png";

        try{
            await fs.access(imageFilePath); //Info on how this works: https://nodejs.org/api/fs.html#fspromisesaccesspath-mode
            const filterQuery = {normalized_id: movie.normalized_id}
            const updateResult = await dbCollection.updateOne(filterQuery, {
                $set: {photo: 1}
            });
            hasImage++;
        } catch {
            const filterQuery = {normalized_id: movie.normalized_id}
            const updateResult = await dbCollection.updateOne(filterQuery, {
                $set: {photo: 0}
            });
            noImage++;
        }

        i++;
    }

    console.log("Gone thru: " + i + " documents"); //should be 6053 
    console.log("Number of movies without an image: " + noImage);
    console.log("Number of movies with an image: " + hasImage); //should be 5759

    dbClient.close();
    console.log("----Finished with changes----");

}




//Potential improvemnt: use bulkwrite()? 