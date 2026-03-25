

const serverUrl = "http://127.0.0.1:3000";

let gameScore = 0; 
let gameInfo = [];
let playerName = "";
let gameDifficulty = "normal";
let selectedMovie = null;
let questionCounter = 0;
let gameType = "yearGame"; // sets the default game
const amountOfQuestion = 10; //standard amount of questions

let gameParameters = { //answer and questionBase are the same, it's whats being asked of the user
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


//runs when the website is loaded.
document.addEventListener("DOMContentLoaded", function(){

    createGameSelectionButtons(); 
    requestLeaderboard("normal");
    writeInstructions("start");
    createLederboardButtons();
    
});

//changes html document based on selected language
function language(lang) {
    if (lang == "eng") {
        window.location.href = "index.html";
    } else if (lang == "swe") {
        window.location.href = "index_Swe.html";
    }
}

//adds radiobutton like functionality to the game choosing buttons
function createGameSelectionButtons(){
    
    const buttons = document.getElementsByName("gameChooser");

    buttons.forEach(button => {
        if(button.id == gameType){ //shows the standard game is choosen
            button.classList.add("selected");
        }

        button.addEventListener("click", () => {

            //removes the selected property from all gameChooser buttons
            buttons.forEach(btn => {btn.classList.remove("selected")});

            //adds selected status for pressed button and sets the game based on the button
            button.classList.add("selected");
            gameType = button.id;

        })
    });
}

function createLederboardButtons(){
    const buttons = document.getElementsByName("leaderboard-chooser");

    buttons.forEach(button => {
        if(button.id == gameDifficulty){ //shows the standard difficulty at start
            button.classList.add("selected");
        }
        button.addEventListener("click", () => {

            //removes the selected property from all other leaderboard buttons
            buttons.forEach(btn => {btn.classList.remove("selected")});

            //adds selected status for pressed button and sets the game based on the button
            button.classList.add("selected");
            console.log("current leaderbord: " + button.id);
            requestLeaderboard(button.id);

        })
    });
}

//Will display the relevant html object for the game site
function displayGameView() {
   document.querySelector(".frontpage").style.display = "none"; 
   document.querySelector(".main-page").style.display ="block";
    
}

async function writeInstructions(infoType) {
    const instuctionList = document.getElementById("instructions-list");
    instuctionList.innerHTML = ""; //makes sure the list i empty before we write

    const response = await fetch(serverUrl + "/instructions",  { 
        method : "GET",
        headers: {
            "Content-Type": "application/json",
        },
        body: null,
    }); 

    if (response.ok) {

        response.json().then((jsonBody) => {

            //checks which language version
            const htmlUsed = window.location.pathname.split("/").pop();
            let lang = null;
            if(htmlUsed == "index.html"){
                lang = "eng";
            }else{
                lang = "sv";
            }

            //checks whether the start instuctions or specifik game instructions should be written
            if(infoType == "start"){
                for(let i = 0; i < jsonBody[lang].start.length; i++){
                    const listItem = document.createElement("li");
                    listItem.textContent = jsonBody[lang].start[i];
                    instuctionList.appendChild(listItem);
                }
            }else{
                const listItem = document.createElement("li");
                //writes specifik info depending on game
                listItem.textContent = jsonBody[lang][gameType];
                instuctionList.appendChild(listItem);

                //writes out genereic info for the games
                for(let i = 0; i < jsonBody[lang].standard.length; i++){
                    const listItem = document.createElement("li");
                    listItem.textContent = jsonBody[lang].standard[i];
                    instuctionList.appendChild(listItem);
                }
            }
        });

    } else {
        console.log("Instruction request failed");
    }

}


//takes in the given values for name and game diffuculty
async function startGame(difficulty) {

    //Hides intro box
    const startBox = document.getElementById("start-box");  
    const gameChooser = document.getElementById("game-chooser-container");
    const infoDisplay = document.getElementById("info-display");
    const restartButton = document.getElementById("restart-game");
    
    restartButton.style.display = "block";
    infoDisplay.style.display = "block";
    gameChooser.style.display = "none";
    startBox.style.display = "none";


    //resets and adds game information 
    gameScore = 0; //sets the score to 0 at the start of the game
    questionCounter = 0; //starts the counter at 0

    gameDifficulty = difficulty; 
    playerName = document.getElementById("entry_name").value; //this is from the input element in the middle of the screen 
    
    await writeInstructions();

    //gameType is already choosen depending on button pressed down. 
    console.log("Name: " + playerName + ", Game Difficulty: " + gameDifficulty + ", Game Type: " + gameType);
    
    //requesting amountOfQuestion random movies from the server, what info depends on gameType and difficulty
    const response = await fetch(serverUrl + "/" + gameType + "/" + difficulty,  { 
        method : "GET",
        headers: {
            "Content-Type": "application/json",
        },
        body: null,
    }); 


    if (!response.ok) {
        // Code to display error message on the webpage
        console.log("Response not okay");
        const textDiv = document.getElementById("text-display");
        const gameText = document.getElementById("game-text-display");
        textDiv.style.display = "block";
        gameText.textContent = "Error in loading server";

    } else {
        gameInfo = await response.json(); //saves the info of the current game as in a global variable. 
        console.log(gameInfo); //check

        gameRound();
    }

}

async function displayMoviePoster()
{

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
            console.log("image ok")
            image.style.display = "inline";
        });

    } else {
        console.log("Image request failed");
    }
}

async function gameRound() {
    const gameContent = document.getElementById("game-content");  
    answerbuttons(); //Display the answer option buttons
    selectedMovie = null;

    

    if(gameParameters[gameType].pictureBefore == true){ //depending on the game the movie poster is shown with the question
        await displayMoviePoster();
    }else{
        const moviePoster = document.getElementById("movie-picture");
        moviePoster.style.display = "none";
    }
    
    console.log(gameParameters[gameType].questionBase);

    const questionText = document.getElementById("movie-question");
    questionText.innerHTML = "";
    const questionContent = gameInfo.QuestionMovie[questionCounter][gameParameters[gameType].questionBase];

    const questionArray = Array.isArray(questionContent)
        ? questionContent //if questionContent already is an array assing the same value
        : questionContent.split(","); //if questionContent isn't an array slit the string turning it into an array

    if(questionArray.length > 1){ //If there is more than one name/item that needs to be written out
        const lastCheck = questionArray.length - 1; 

        for(let i = 0; i < questionArray.length; i++){
            if(i != lastCheck){
                questionText.textContent += questionArray[i] + ",  ";
            }else{
                questionText.textContent += questionArray[i];
            } 
        }
        
    }else{
        questionText.textContent = questionContent;
    }
    
    questionText.style.display = "inline-block";
    questionText.style.visibility = "visible";
    gameContent.style.display = "block"; //display question

}


//Takes the value from the button pressed and depending on that increases the score. 
function submitQuestion() {
    if (selectedMovie != null){ //Will only run if a answerOption button is pressed
        const gameDiv = document.getElementById("game-display");
        const nextButton = document.getElementById("next-question-container");
        nextButton.style.display = "flex";
        
        console.log("Correct answer: " + gameInfo.QuestionMovie[questionCounter][gameParameters[gameType].answer])

        //Depending on answer: add score and give positive indikator or give negative indikator
    
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
        const textDisplayDiv = document.getElementById("text-display");
        const text = document.getElementById("game-text-display");
        text.textContent = "Answer:  " + gameInfo.QuestionMovie[questionCounter][gameParameters[gameType].answer];

        if(gameParameters[gameType].pictureAfter){ //depending on the game the movie poster is shown with the answer
            displayMoviePoster();

            const gameContent = document.getElementById("movie-question");  
            gameContent.style.display = "none";
        }

        
        textDisplayDiv.style.visibility = "visible";
    
    
    }
    
}


function nextQuestion(){
    const gameDiv = document.getElementById("game-display");
    const textDisplayDiv = document.getElementById("text-display");
    const nextButton = document.getElementById("next-question-container");

    questionCounter++;

     if (questionCounter < amountOfQuestion)
            {
            console.log("Question number:" + (questionCounter+1));

            gameDiv.style.borderColor = "white";

            textDisplayDiv.style.visibility = "hidden";
            nextButton.style.display = "none";

            gameRound();
            
        }else if (questionCounter == amountOfQuestion)
        {
            console.log("End of game"); 
            gameDiv.style.borderColor = "white";
            nextButton.style.display = "none";
            textDisplayDiv.style.visibility = "hidden";
            endOfGame();
        }
}


async function endOfGame(){ //kolla över så att saker som ska göras i css och html inte görs här
    const gameDiv = document.getElementById("game-content");
    const buttonBox = document.getElementById("answer-buttons-display"); 
    const submitButton = document.getElementById("submit-container"); 
    submitButton.style.display = "none";
    gameDiv.style.display = "none";
    buttonBox.innerHTML = "";
    
    const endTextDisplayDiv = document.getElementById("end-game");
    console.log(gameScore)

    const resultText = document.getElementById("score-display");
    resultText.textContent = gameScore;

    endTextDisplayDiv.style.display = "block";

    uploadScore(); //upload the playerinfo and score to the database

}

//Brings back the start game container
function newGame(){
    /*
    const gameDiv = document.getElementById("game-content");
    const submitButton = document.getElementById("submit-container"); 
    const buttonBox = document.getElementById("answer-buttons-display"); 
   
    const textEndDisplayDiv = document.getElementById("end-game");
    */
    const startBox = document.getElementById("start-box");
    const gameChooser = document.getElementById("game-chooser-container");
    const textDisplayDiv = document.getElementById("text-display");
    const restartButton = document.getElementById("restart-game");
    const movieQuestionText = document.getElementById("movie-question"); 
    movieQuestionText.style.visibility = "hidden";

    document.querySelectorAll(".game-running").forEach(element => {
        element.style.display = "none";
    });

    restartButton.style.display = "none";
    textDisplayDiv.style.visibility = "hidden";
    gameChooser.style.display = "block";
    startBox.style.display = "block";
    
}

//Displays the answer option buttons for the relevant question
function answerbuttons(){  
   
    const container = document.getElementById("answer-buttons-display"); //Connect the right div
    container.innerHTML = ""; //Empty buttons every time 
    container.style.display = "grid";

    //const corectAnswerName = gameInfo.QuestionMovie[questionCounter].name;
    const corectAnswer = gameInfo.QuestionMovie[questionCounter];
    const wrongAnswer =  gameInfo.answerOptionsForQuestion[questionCounter];

    const allAnswer = [corectAnswer].concat(wrongAnswer); //Connect correct answer with the wrong into one single array
    console.log("Option Answers: ", allAnswer
    )

    allAnswer.sort(() => Math.random() - 0.5); //Shuffel the order (so that correct answer appears in a random order)

    //loop thru all answers that depends on the difficulty level (3,6 or 9)
    for(let i = 0; i < allAnswer.length;  ++i){ 

        const buttons = document.createElement("button"); 
        buttons.classList.add("movie-name-buttons"); 
        buttons.classList.add("button-standard"); 
        buttons.textContent = allAnswer[i][gameParameters[gameType].optionBase];
        

        //Do the buttons so they work ass radio buttons
        buttons.addEventListener("click", ()=> { 
            const allButtons = document.querySelectorAll(".movie-name-buttons"); 
            allButtons.forEach(button => button.classList.remove("selected")); //deselect all buttons 

            buttons.classList.add("selected"); //select the preest button

            selectedMovie = buttons.textContent; //so we now which button is selected
            console.log("Selected answer:" + selectedMovie)

        });
    

        container.appendChild(buttons);

    }

    const submitButton = document.getElementById("submit-container");
    submitButton.style.display = "flex";

    /////////////////////////////////////////////Gör om //////////////////////////////////////////////////////////
    /*
    const submitButton = document.createElement("button");
    submitButton.textContent = "Submit";
    submitButton.style.position = "center";
    submitButton.addEventListener("click", function (){
        submittQuestion();
    });
    submitButton.style.gridColumn = "2";
    submitButton.style.fontSize = "100%";
    submitButton.style.margin = "5%";
    submitButton.style.font = "Serif";
    container.appendChild(submitButton);
    */

}

async function uploadScore() {

    const scoreData = {
        name: playerName,
        gameType: gameType,
        score: gameScore,
        difficulty: gameDifficulty
    };

    console.log(scoreData);

    const response = await fetch(serverUrl + "/" + "score",  { 
        method : "Post",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(scoreData)
    }); 

    ///////////////show this in the browser//////////////////////////////
    if(response.ok){
        console.log("Game saved");
    }else {
        console.log("Failed to save game info to database");
    }
}

async function requestLeaderboard(difficulty){ //requests the 10 players with the higest score

    const response = await fetch(serverUrl + "/" + "leaderboard/" + gameType + "/" + difficulty,  { 
        method : "GET",
        headers: {
            "Content-Type": "application/json",
        },
        body: null,
    }); 

    if(response.ok){

        response.json().then((jsonBody) => {
            console.log(jsonBody);

            const tabel = document.getElementById("leaderboard-text");
            //potentially empties the list exept the headers 
            while(tabel.rows.length > 1){
                tabel.deleteRow(1);
            }

            //writes out the new list(is ordered on the server side)
            for(let i = 0; i < jsonBody.length; i++) {
                const tabelRow = document.createElement("tr");
               
                const tabelContentName = document.createElement("td");
                if(jsonBody[i].name == ""){
                    tabelContentName.textContent = "Anonymous";
                }else{
                    tabelContentName.textContent = jsonBody[i].name;
                }
                tabelRow.appendChild(tabelContentName);

                const tabelContentScore = document.createElement("td");
                tabelContentScore.textContent = jsonBody[i].score;
                tabelRow.appendChild(tabelContentScore);
                
                tabel.appendChild(tabelRow);
            }
        });

    }else{
        //empties list if there is no leaderboard
        const tabel = document.getElementById("leaderboard-text"); 
        while(tabel.rows.length > 1){
            tabel.deleteRow(1);
        }
        console.log("Failed to request leaderbord from server.")
    }

}
