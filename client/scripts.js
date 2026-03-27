
const serverUrl = "http://127.0.0.1:3000";

//The standard game information
const defaultGame = "yearGame";
const defaultDifficulty = "normal";
const amountOfQuestion = 10; //standard amount of questions
let instructions = []; //this will depend on the languge selected is decided when the webpage is loaded


//Stores the infromation for a game, required when fetching approprate data and 
//is used during one game round.
let gameInfo = [];
let gameScore = 0; 
let questionCounter = 0;
let playerName = "";
let gameDifficulty = defaultDifficulty;
let selectedMovie = null;
let gameType = defaultGame; // sets the default game

/*this could for optimization also be used in the comunication with the server since the same information is now manually
being writen on the server side. */
let gameParameters = { //This decides what information should be displayed for the different game types. 
    yearGame: {
        answer: "year", 
        questionBase: "name",
        optionBase: "year",
        pictureBefore: true,
        pictureAfter: false, 
    },
    descriptionGame:{
        answer: "name",
        questionBase: "description",
        optionBase: "name",
        pictureBefore: false,
        pictureAfter: true, 
    },
    directorGame:{
        answer: "director",
        questionBase: "name",
        optionBase: "director",
        pictureBefore: true,
        pictureAfter: false, 
    },
    actorsGame:{
        answer: "name",
        questionBase: "star",
        optionBase: "name",
        pictureBefore: false,
        pictureAfter: true, 
    }
};


//runs when the website is loaded and sets up all the functionaly and information needed at start.
document.addEventListener("DOMContentLoaded", function(){

    createGameSelectionButtons(); 
    requestLeaderboard("normal");
    getInstructions();
    
    createLeaderboardButtons();
    
});

//changes html document based on selected language
function language(lang) {
    if (lang == "eng") {
        window.location.href = "index.html";
    } else if (lang == "swe") {
        window.location.href = "index_Swe.html";
    }
}

//displays the relevant html object for the game site
function displayGameView() {
   document.querySelector(".frontpage").style.display = "none"; 
   document.querySelector(".main-page").style.display ="block";
   writeInstructions("start");
    
}

//adds radiobutton like functionality to the game choosing buttons
function createGameSelectionButtons(){
    
    const buttons = document.getElementsByName("gameChooser");
    console.log("Buttons struckture: " + buttons);

    Array.from(buttons).forEach(button => { //makes sure the nodeList works as an Array so that forEach works
        if(button.id == gameType){ //shows the standard game as selected choosen
            button.classList.add("selected");
        }

        button.addEventListener("click", () => {

            //removes the "selected" property from all gameChooser buttons
            buttons.forEach(btn => {btn.classList.remove("selected")});

            //adds selected status for pressed button and sets the gameType based on the button
            button.classList.add("selected");
            gameType = button.id;
            
            //makes the leaderboard change depending on the game choosen
            const leaderboardButton = document.getElementById(gameDifficulty);
            leaderboardButton.click();
        });
    });
}

//adds radiobutton like functionality to the leaderboard buttons
function createLeaderboardButtons(){
    const buttons = document.getElementsByName("leaderboard-chooser");

    Array.from(buttons).forEach(button => { //makes sure the nodeList works as an Array so that forEach works
        if(button.id == gameDifficulty){ //shows the standard difficulty at start
            button.classList.add("selected");
        }
        button.addEventListener("click", () => {

            //removes the selected property from all other leaderboard buttons
            buttons.forEach(btn => {btn.classList.remove("selected")});

            //adds selected status for pressed button and shows the leaderboard for corresponding id which represent difficuly level
            button.classList.add("selected");
            console.log("current leaderbord: " + button.id);
            requestLeaderboard(button.id);
        });
    });
}

//requests instruction for the games based on current website language
async function getInstructions(){
     //checks which language version is being used
    const htmlUsed = window.location.pathname.split("/").pop();
    let lang = null;
    if(htmlUsed == "index.html"){
        lang = "eng";
    }else{
        lang = "sv";
    }

    const response = await fetch(serverUrl + "/instructions/" + lang,  { 
        method : "GET",
        headers: {
            "Content-Type": "application/json",
        },
        body: null,
    }); 

    if (response.ok) {
        response.json().then((jsonBody) => {

            instructions = jsonBody; 
        });

    } else {
        console.log("Instruction request failed");
    }
}

//Gets the  instructions/rules for the requested game
function writeInstructions(infoType) {
    const instuctionList = document.getElementById("instructions-list");
    instuctionList.innerHTML = ""; //makes sure the list i empty before we write

    //checks whether the start instuctions or aspecific game instructions should be written
    if(infoType == "start"){//writes out start/generall instructions
        for(let i = 0; i < instructions.start.length; i++){
            const listItem = document.createElement("li");
            listItem.textContent = instructions.start[i];
            instuctionList.appendChild(listItem);
        }
    }else{
        const listItem = document.createElement("li");
        //writes specifik info depending on game
        listItem.textContent = instructions[gameType];
        instuctionList.appendChild(listItem);

        //writes out genereic info(webpage layout and functionality) for the games
        for(let i = 0; i < instructions.standard.length; i++){
            const listItem = document.createElement("li");
            listItem.textContent = instructions.standard[i];
            instuctionList.appendChild(listItem);
        }
    }
}

//sets up, saves and request all relavant information for the given gameType and difficulty
async function startGame(difficulty) {

    gameDifficulty = difficulty; //dependend on which difficulty button is pressed

    ////Shows and hides the relevant information for a game round
    const startBox = document.getElementById("start-box");  
    const gameChooser = document.getElementById("game-chooser-container");
    const infoDisplay = document.getElementById("info-display");
    const restartButton = document.getElementById("restart-game");
    
    restartButton.style.display = "block";
    infoDisplay.style.display = "block";
    gameChooser.style.display = "none";
    startBox.style.display = "none";


    //Saves playername
    playerName = document.getElementById("entry_name").value.trim(); //this is from the input element in the middle of the screen 
    if(playerName == ""){ //Handels if the user does not input a name
        playerName = "Anonymous";
    }

    //changes the leaderboard to chosen (and now relevant) difficulty
    const leaderboardButton = document.getElementById(difficulty);
    leaderboardButton.click();

    //writes out the instruction for selected game, which is already choosen depending on button pressed down. 
    writeInstructions();
    
    //Check
    console.log("Name: " + playerName + ", Game Difficulty: " + gameDifficulty + ", Game Type: " + gameType + "/" + amountOfQuestion);
    
    //requesting amountOfQuestion random movies from the server, what info depends on gameType and difficulty
    const response = await fetch(serverUrl + "/" + gameType + "/" + difficulty,  { 
        method : "GET",
        headers: {
            "Content-Type": "application/json",
        },
        body: null,
    }); 

    if (!response.ok) {
        //Displays error message on the webpage incase of request error
        console.log("Response not okay");
        const textDiv = document.getElementById("text-display");
        const gameText = document.getElementById("game-text-display");
        gameText.textContent = "Server error";
        textDiv.style.visibility = "visible";

    } else {
        gameInfo = await response.json(); //saves the info of the current game as in a global variable. 
        //console.log(gameInfo); //check

        gameRound(); //starts a round
    }

}

//Handels a single round of questioning
async function gameRound() {
    const gameContent = document.getElementById("game-content");  
    answerbuttons(); //Displays the answer option buttons
    selectedMovie = null; //makes sure the selectedMovie is empty at the beginning

    //depending on the game the movie poster is shown with the question
    if(gameParameters[gameType].pictureBefore == true){ 
        await displayMoviePoster();
    }else{
        //else we don't want to show the element with the question
        const moviePoster = document.getElementById("movie-picture");
        moviePoster.style.display = "none";
    }
    
    const questionText = document.getElementById("movie-question");
    questionText.innerHTML = ""; //makes sure nothing else is already written in the text container

    const questionContent = gameInfo.QuestionMovie[questionCounter][gameParameters[gameType].questionBase];

    //handles that the question conent is varied between game types
    const questionArray = Array.isArray(questionContent)
        ? questionContent //if questionContent already is an array assing the same value
        : questionContent.split(","); //if questionContent isn't an array slit the string turning it into an array

    if(questionArray.length > 1){ //If there is more than one name/item that needs to be written out
        const lastWordIndex = questionArray.length - 1; 

        for(let i = 0; i < questionArray.length; i++){
            if(i != lastWordIndex){ //This to make it appear cleaner on the website
                questionText.textContent += questionArray[i] + ",  ";
            }else{
                questionText.textContent += questionArray[i];
            } 
        }

    }else{
        questionText.textContent = questionContent;
    }
    
    //displays question
    questionText.style.visibility = "visible";
    gameContent.style.display = "block"; 

}

//Gets the image from the server, sets the img src to the current movie and displays it
async function displayMoviePoster()
{
    //The URL for the current movie
    console.log("Image URL: " + gameInfo.QuestionMovie[questionCounter].normalized_id);

    const response = await fetch(serverUrl + "/" + "picture" + "/" + gameInfo.QuestionMovie[questionCounter].normalized_id,  { //requesting the 10 random pictures from server
        method : "GET",
        headers: {
            "Content-Type": "image/png",
        },
        body: null,
    }); 

    if (response.ok) {

        response.blob().then((blobBody) => {
            const image = document.getElementById("movie-picture");
            image.src = URL.createObjectURL(blobBody);
            image.style.display = "inline";
        });

    } else {
        console.log("Image request failed");
    }
}

//Takes the value from the button pressed and depending on right/wrong increases the score and changes border color. 
function submitQuestion() {

    if (selectedMovie != null){ //Will only run if a answerOption button has been pressed during the current run
        const gameDiv = document.getElementById("game-display");
        const nextButton = document.getElementById("next-question-container");
        nextButton.style.display = "flex";
        
        console.log("Correct answer: " + gameInfo.QuestionMovie[questionCounter][gameParameters[gameType].answer])

        //Depending on answer: increse score and give positive indikator or give negative indikator
        if (selectedMovie == gameInfo.QuestionMovie[questionCounter][gameParameters[gameType].answer]) { 
            gameScore++;
            gameDiv.style.borderColor = "green";
        }else {
            gameDiv.style.borderColor = "red";
        }
   
        //Hide sumbit button
        const submitButton = document.getElementById("submit-container");
        submitButton.style.display = "none"; 

        //Display correct answer: 
        const text = document.getElementById("game-text-display");
        text.textContent = "Answer:  " + gameInfo.QuestionMovie[questionCounter][gameParameters[gameType].answer];
        const textDisplayDiv = document.getElementById("text-display");
        textDisplayDiv.style.visibility = "visible";

        //depending on the game the movie poster is shown with the answer
        if(gameParameters[gameType].pictureAfter){ 
            displayMoviePoster();

            const gameContent = document.getElementById("movie-question");  
            gameContent.style.visibility = "hidden";
        }
    }
}

//Resets the answer display to prepares for next round(or game end)
// increses the question counter and checks if the game is over or its time for the next question
function nextQuestion(){
    const gameDiv = document.getElementById("game-display");
    const textDisplayDiv = document.getElementById("text-display");
    const nextButton = document.getElementById("next-question-container");

    questionCounter++;
    
    gameDiv.style.borderColor = "white";
    textDisplayDiv.style.visibility = "hidden";
    nextButton.style.display = "none";

    if (questionCounter < amountOfQuestion){

        console.log("Question number:" + (questionCounter+1)); //+1 is added since it starts at 0 (to work with the arrays)

        gameRound();
        
    }else if (questionCounter == amountOfQuestion){

        console.log("End of game"); 
      
        endOfGame();
    }
}


//Brings back the start game container and resets everything
function newGame(){

    //resets everthing to it's standard values
    gameScore = 0; 
    questionCounter = 0; 
    gameDifficulty = defaultDifficulty;


    //hides and display the correct info/elements for start screen
    const textDisplayDiv = document.getElementById("text-display");
    const movieQuestionText = document.getElementById("movie-question"); 
    const gameChooser = document.getElementById("game-chooser-container");
    const startBox = document.getElementById("start-box");

    textDisplayDiv.style.visibility = "hidden";
    movieQuestionText.style.visibility = "hidden";
    gameChooser.style.display = "block";
    startBox.style.display = "block";

    document.querySelectorAll(".game-running").forEach(element => {
        element.style.display = "none";
    });

    writeInstructions("start");
    
}

//Displays the answer option buttons for the current question
function answerbuttons(){  
   
    const container = document.getElementById("answer-buttons-display"); //Connect the right div
    container.innerHTML = ""; //Empty buttons every time 
    container.style.display = "grid";

    const correctAnswer = gameInfo.QuestionMovie[questionCounter];
    const wrongAnswer =  gameInfo.answerOptionsForQuestion[questionCounter];

    const allAnswer = [correctAnswer].concat(wrongAnswer); //Connect correct answer with the wrong into one single array
    allAnswer.sort(() => Math.random() - 0.5); //Shuffel the order (so that correct answer appears in a random order)

    //loop thru all answers and created buttons for them
    //the amount effectivly depends on the difficulty level (3,6 or 9)
    for(let i = 0; i < allAnswer.length;  ++i){ 

        //create button
        const buttons = document.createElement("button"); 
        buttons.classList.add("movie-name-buttons"); 
        buttons.classList.add("button-standard"); 
        buttons.textContent = allAnswer[i][gameParameters[gameType].optionBase];
        
        //Add radio button funktionlity to the buttons and functionality for pressing them
        buttons.addEventListener("click", ()=> { 
            //deselect all buttons 
            const allButtons = document.querySelectorAll(".movie-name-buttons"); 
            allButtons.forEach(button => button.classList.remove("selected")); 

            //select the pressed button
            buttons.classList.add("selected"); 

            //saves which button is selected
            selectedMovie = buttons.textContent;
        });
    
        container.appendChild(buttons); //adds the button to the existing container
    }

    //Displays the submit button
    const submitButton = document.getElementById("submit-container");
    submitButton.style.display = "flex";

}

//Hides game information and shows game score 
function endOfGame(){ 

    const gameDiv = document.getElementById("game-content");
    const buttonBox = document.getElementById("answer-buttons-display"); 
    const submitButton = document.getElementById("submit-container"); 
    submitButton.style.display = "none";
    gameDiv.style.display = "none";
    buttonBox.innerHTML = "";
    
    const endTextDisplayDiv = document.getElementById("end-game");
    const resultText = document.getElementById("score-display");
   
    resultText.textContent = gameScore;
    endTextDisplayDiv.style.display = "block"; //new game button is shown with the div

    uploadScore(resultText); //upload the playerinfo and score to the database

}

//sends the player and score information to be save in the database
async function uploadScore(textDisplay) {

    //composes the leaderboard information to be sent
    const scoreData = {
        name: playerName,
        gameType: gameType,
        score: gameScore,
        difficulty: gameDifficulty
    };

    //send the info to the server 
    const response = await fetch(serverUrl + "/" + "score",  { 
        method : "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(scoreData)
    }); 
    
    //gives indication if the score was saved or not
    if(response.ok){
        textDisplay.innerHTML += "<br><br>Score saved";
    }else {
        textDisplay.innerHTML += "<br><br>Failed to save score";
    }
}

//requests the 10 players with the higest score
//depending on the currect selected game and the given difficulty(which is dependent on the button pressed, not the difficulty of the current game)
async function requestLeaderboard(difficulty){ 

    const response = await fetch(serverUrl + "/" + "leaderboard/" + gameType + "/" + difficulty,  { 
        method : "GET",
        headers: {
            "Content-Type": "application/json",
        },
        body: null,
    }); 

    const table = document.getElementById("leaderboard-text");
    //potentially empties the list exept the headers 
    while(table.rows.length > 1){
        table.deleteRow(1);
    }

    
    if(response.status == 200){//If we get a positive response with data

        const responeFromServer = await response.json();

        //writes out the new list(which is ordered on the server side)
        for(let i = 0; i < responeFromServer.length; i++) {
            const tabelRow = document.createElement("tr");

            const tabelContentName = document.createElement("td");
            tabelContentName.textContent = responeFromServer[i].name;
            tabelRow.appendChild(tabelContentName);

            const tabelContentScore = document.createElement("td");
            tabelContentScore.textContent = responeFromServer[i].score;

            tabelRow.appendChild(tabelContentScore);
            table.appendChild(tabelRow);
        }
        

    }else if (response.status == 204){ //the server return a 204 (no content) status message
        console.log("requested leaderbord is empty");
        //the leaderbord is left empty

    }else{//in case of server connection error show it to the client
        console.log("failed to connect to server");
        table.textContent = "Failed to load leaderboard"; 
    }

}
