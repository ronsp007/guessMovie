
const serverUrl = "http://127.0.0.1:3000";

let gameScore = 0; 
let gameInfo = [];
let playerName = "";
let gameDifficulty = "normal";
let selectedMovie = null;
let questionCounter = 0;
let gameType = "yearGame"; // sets the default game
const amountOfQuestion = 10; //games are set to 10 questions

let gameParameters = { //answer and questionBase are the same, it's whats being asked of the user
    yearGame: {
        answer: "year", 
        questionBase: "photo",
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
        answer: "name",
        questionBase: "director",
        optionBase: "year",
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

    createButtonFunction(); 
    requestLeaderboard();
    
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
function createButtonFunction(){
    
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

//Will display the relevant html object for the game site
function displayGameView() {
   document.querySelector(".frontpage").style.display = "none"; 
   document.querySelector(".main-page").style.display ="block";
    
}

function setGameState(){

}

//takes in the given values for name and game diffuculty
async function startGame(difficulty) {

    //Hides intro box
    const startBox = document.getElementById("start-box");  
    startBox.style.display = "none";


    //resets and adds game information 
    gameScore = 0; //sets the score to 0 at the start of the game
    questionCounter = 0; //starts the counter at 0

    gameDifficulty = difficulty; 
    playerName = document.getElementById("entry_name").value; //this is from the input element in the middle of the screen 


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

async function gameRound() {
    const gameContent = document.getElementById("game-content");  // Code to display error message on the webpage
    answerbuttons(); //Display the answer option buttons

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
            gameContent.style.display = "block";
        });

    } else {
        console.log("Image request went bad");
    }

}


//Takes the value from the button pressed and depending on that increases the score. 
function submitQuestion() {

    const gameDiv = document.getElementById("game-display");
    const nextButton = document.getElementById("next-question-container");
    nextButton.style.display = "flex";

    //Depending on answer: add score and give positive indikator or give negative indikator
    if (selectedMovie == gameInfo.QuestionMovie[questionCounter][gameParameters.questionBase]) { 
        gameScore++;
        gameDiv.style.borderColor = "green";

    }else{
        gameDiv.style.borderColor = "red";
    }

    //Hide sumbit button
    const submitButton = document.getElementById("submit-container");
    submitButton.style.display = "none"; 

    //Display correct answer: 
    const textDisplayDiv = document.getElementById("text-display");
    const textDiv = document.getElementById("game-text-display");
    textDiv.textContent = "The movie " + gameInfo.QuestionMovie[questionCounter].name + " came out in: " + gameInfo.QuestionMovie[questionCounter].year;
    textDisplayDiv.style.display = "block";
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

            textDisplayDiv.style.display = "none";
            nextButton.style.display = "none";

            gameRound();
            
        }else if (questionCounter == amountOfQuestion)
        {
            console.log("End of game"); 
            nextButton.style.display = "none";
            textDisplayDiv.style.display = "none";
            endOfGame();
        }
}


async function endOfGame(){ //kolla över så att saker som ska göras i css och html inte görs här
    const gameDiv = document.getElementById("gameContent");
    const buttonBox = document.getElementById("answer-buttons-display"); 
    gameDiv.innerHTML= "";
    buttonBox.innerHTML = "";
    
    const textDisplayDiv = document.getElementById("end-game");
    console.log(gameScore)

    const resultText = document.createElement("p");
    resultText.textContent = gameScore;

    textDisplayDiv.appendChild(resultText);

    textDisplayDiv.style.display = "block";

    uploadScore(); //upload the playerinfo and score to the database

}

//Brings back the start game container
function newGame(){
    const startBox = document.getElementById("start-box");
    const textDisplayDiv = document.getElementById("end-game");
    textDisplayDiv.style.display = "none";
    startBox.style.display = "block";
}

//Displays the answer option buttons for the relevant question
function answerbuttons(){  
   
    const container = document.getElementById("answer-buttons-display"); //Connect the right div
    container.innerHTML = ""; //Empty buttons every time 

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
        buttons.textContent = allAnswer[i].year;
        

        //Do the buttons so they work ass radio buttons
        buttons.addEventListener("click", ()=> { 
            const allButtons = document.querySelectorAll(".movie-name-buttons"); 
            allButtons.forEach(button => button.classList.remove("selected")); //deselect all buttons 

            buttons.classList.add("selected"); //select the preest button

            selectedMovie = buttons.textContent; //so we now which button is selected
            console.log(selectedMovie)

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

async function requestLeaderboard(){ //requests the 10 players with the higest score

    const response = await fetch(serverUrl + "/" + "leaderboard/" + gameDifficulty,  { 
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
                tabelContentName.textContent = jsonBody[i].name;
                tabelRow.appendChild(tabelContentName);

                const tabelContentScore = document.createElement("td");
                tabelContentScore.textContent = jsonBody[i].score;
                tabelRow.appendChild(tabelContentScore);
                
                tabel.appendChild(tabelRow);
            }
        });

    }else{///////////////show this in the browser//////////////////////////////
        console.log("Failed to request leaderbord from server.")
    }

}
