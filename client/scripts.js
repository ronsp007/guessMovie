
const serverUrl = "http://127.0.0.1:3000";
let gameScore = 0; 
let gameInfo = [];
let playerName = "";
let gameDifficulty = "";
let selectedMovie = null;
let questionCounter = 0;

function language(lang) {
    if (lang == "eng") {
        window.location.href = "index.html";
    } else if (lang == "swe") {
        window.location.href = "index_Swe.html";
    }
}


//runs when the website is loaded.
document.addEventListener("DOMContentLoaded", function(){

    
});

//Will display the relevant html object for the game site
function displayGameView() {
   document.querySelector(".frontpage").style.display = "none"; 
   document.querySelector(".main-page").style.display ="block";
    
}

//takes in the given values for name and game diffuculty
async function startGame(difficulty) {
    const startBox = document.getElementById("start-box");  // Code to display error message on the webpage
    startBox.style.display = "none";
    gameScore = 0; //sets the score to 0 at the start of the game
    questionCounter = 0; //starts the counter at 0
    gameDifficulty = difficulty; 
    playerName = document.getElementById("entry_name").value; //this is from the input element in the middle of the screen 

    console.log("Name: " + playerName + " Game Difficulty: " + gameDifficulty);
    
    //requesting the 10 random pictures(movies) from the server
    const response = await fetch(serverUrl + "/" + "pictureGame" + "/" + difficulty,  { 
        method : "GET",
        headers: {
            "Content-Type": "application/json",
        },
        body: null,
    }); 


    if (!response.ok) {
        // Code to display error message on the webpage
        console.log("Response not okay");
        const textDiv = document.getElementById("textDisplay");
        const gameText = document.getElementById("gameTextDisplay");
        textDiv.style.display = "block";
        gameText.textContent = "Error in loading server";

    } else {
        gameInfo = await response.json(); //saves the info of the current game as in a global variable. 
        console.log(gameInfo); //check

        //answerbuttons() 
        gameRound();
    }

}

async function gameRound() {
    const gameContent = document.getElementById("gameContent");  // Code to display error message on the webpage
    gameContent.innerHTML = ""; // Maybe problem*
    answerbuttons(); //Display the answer option buttons

    const response = await fetch(serverUrl + "/" + "picture" + "/" + gameInfo.QuestionPicture[questionCounter],  { //requesting the 10 random pictures from server
        method : "GET",
        headers: {
            "Content-Type": "image/png",
        },
        body: null,
    }); 

    if (response.ok) {

        response.blob().then((blobBody) => {
            const pictureDiv = document.createElement("div");

            //göra det på html istället? nej va
            const image = document.createElement("img");
            image.src = URL.createObjectURL(blobBody);
            image.style.width = "60%";
            image.style.objectFit = "cover";

            pictureDiv.appendChild(image);
            startBox.appendChild(pictureDiv);
        });

    } else {
        console.log("Image request went bad");
    }

}


//Takes the value from the button pressed and depending on that increases the score. 
function submitQuestion() {

    const gameDiv = document.getElementById("game-display");
    const nextButton = document.getElementById("nQContainer");
    nextButton.style.display = "flex";

    //Depending on answer: add score and give positive indikator or give negative indikator
    if (selectedMovie == gameInfo.QuestionMovie[questionCounter].name) {
        gameScore++;
        gameDiv.style.borderColor = "green";

    }else{
        gameDiv.style.borderColor = "red";
    }

    //Hide sumbit button
    const submitButton = document.getElementById("submit-container");
    submitButton.style.display = "none"; 

    //Display correct answer: 

    const textDisplayDiv = document.getElementById("textDisplay");
    const textDiv = document.getElementById("gameTextDisplay");
    textDiv.textContent = "Correct answer: " + gameInfo.QuestionMovie[questionCounter].name;
    textDisplayDiv.style.display = "block";
}


function nextQuestion(){
    const gameDiv = document.getElementById("game-display");
    const textDisplayDiv = document.getElementById("textDisplay");
    const nextButton = document.getElementById("nQContainer");

    questionCounter++;

     if (questionCounter < 10)
            {
            console.log("Question number:" + (questionCounter+1));

            gameDiv.style.borderColor = "white";

            textDisplayDiv.style.display = "none";
            nextButton.style.display = "none";

            gameRound();
            
        }else if (questionCounter == 10)
        {
            console.log("End of game"); 
            nextButton.style.display = "none";
            endOfGame();
        }
}


async function endOfGame(){ //kolla över så att saker som ska göras i css och html inte görs här

    const textDisplayDiv = document.getElementById("textDisplay");
    const textDiv = document.getElementById("gameTextDisplay");
    textDiv.textContent = "Congratulations!";

    const resultText = document.createElement("p");
    resultText.textContent = "Your score is: " + gameScore; 
    resultText.style.fontSize = "10ch";
    textDisplayDiv.appendChild(resultText);
    textDisplayDiv.style.display = "block";

    const startBox = document.getElementById("start-box");
    const buttonBox = document.getElementById("answer-buttons-display"); 
    startBox.innerHTML= "";
    buttonBox.innerHTML = "";

    uploadScore(); //upload the playerinfo and score to the database

}



//Displays the answer option buttons for the relevant question
function answerbuttons(){  
   
    const container = document.getElementById("answer-buttons-display"); //Connect the right div
    container.innerHTML = ""; //Empty buttons every time 

    const corectAnswerName = gameInfo.QuestionMovie[questionCounter].name;
    const corectAnswer = gameInfo.QuestionMovie[questionCounter]
    const wrongAnswer =  gameInfo.answerOptionsForQuestions[questionCounter];

    const allAnswer = [corectAnswer].concat(wrongAnswer); //Connect correct answer with the wrong into one single array

    allAnswer.sort(() => Math.random() - 0.5); //Shuffel the order (so that correct answer appears in a random order)

    //loop thru all answers that depends on the difficulty level (3,6 or 9)
    for(let i = 0; i < allAnswer.length;  ++i){ 

        const buttons = document.createElement("button"); 
        buttons.classList.add("movie-name-buttons"); 
        buttons.textContent = allAnswer[i].name;
        

        //Do the buttons so they work ass radio buttons
        buttons.addEventListener("click", ()=> { //Kanek ska ha function() istället för =>
            const allButtons = document.querySelectorAll(".movie-name-buttons"); 
            allButtons.forEach(button => button.classList.remove("selected")); //deselect all buttons 

            buttons.classList.add("selected"); //select the preest button

            selectedMovie = buttons.textContent; //so we now which button is selected

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

            const tabel = document.getElementById("leaderboardText");
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
