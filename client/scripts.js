
const serverUrl = "http://127.0.0.1:3000";
let gameScore = 0; 
let gameInfo = [];
let playerName = "";
let selectedMovie = null;
let questionCounter = 0;


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
    gameScore = 0; //sets the score to 0 at the start of the game
    questionCounter = 0; //starts the counter at 0
    const playerName = document.getElementById("entry_name").value; //this is from the input element in the middle of the screen 
    console.log(playerName);
    //document.querySelector("#submit-container").style.display ="block";
    
    //requesting the 10 random pictures(movies) from the server
    const response = await fetch(serverUrl + "/" + "pictureGame" + "/" + difficulty,  { 
        method : "GET",
        headers: {
            "Content-Type": "application/json",
        },
        body: null,
    }); 


    if (!response.ok) {
        console.log("Response not okay");
        const message = document.createElement(p);
        const startBox = document.getElementById("start-box");  // Code to display error message on the webpage
        startBox.innerHTML = "";
        message.textContent = "Error in loading server";
        startBox.appendChild(message);

    } else {
        gameInfo = await response.json(); //saves the info of the current game as in a global variable. 
        console.log(gameInfo); //check

        //answerbuttons() 
        gameRound();
    }

}

async function gameRound() {
    const startBox = document.getElementById("start-box");  // Code to display error message on the webpage
    startBox.innerHTML = "";
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
            console.log(blobBody);
            const pictureDiv = document.createElement("div");
            const image = document.createElement("img");
            image.src = URL.createObjectURL(blobBody);
            console.log(image.src);
            image.style.width = "60%";
            image.style.objectFit = "cover";

            pictureDiv.appendChild(image);
            startBox.appendChild(pictureDiv);
        });

    } else {
        console.log("Image request whent bad");
    }

}


//takes the value from the button pressed and depending on that increases the score. 
function submittQuestion() {
    //console.log("button is pressed");
    const gameDiv = document.getElementById("game-display");
    const nextButton = document.getElementById("nQContainer");
    nextButton.style.display = "flex";

    if (selectedMovie == gameInfo.QuestionMovie[questionCounter].name) {
        gameScore++;
         gameDiv.style.borderColor = "green";

    }else{
        gameDiv.style.borderColor = "red";
    }

    /*
    const title = document.createElement("p")
    title.textContent = "Right answer: " + gameInfo.QuestionMovie[questionCounter].name;

    const titleDiv = document.createElement("div");
    titleDiv.appendChild(title);
    gameDiv.appendChild(titleDiv);
    title.style.font = "Serif";
    title.style.fontSize = "150%";
    title.style.color = "white";
    */

    //Display correct answer: 

    const textDisplayDiv = document.getElementById("textDisplay");
    const textDiv = document.getElementById("gameTextDisplay");
    textDiv.textContent = gameInfo.QuestionMovie[questionCounter].name;
    textDisplayDiv.style.display = "block";

    

    //"Next question" button:
    /*
    const gameBox = document.getElementById("game-display");

    const nextQuestion = document.createElement("button");
    nextQuestion.textContent = "Next question";
    gameBox.appendChild(nextQuestion);
    */
}


function nextQuestion(){
    const gameDiv = document.getElementById("game-display");
    const textDisplayDiv = document.getElementById("textDisplay");
    const myButton = document.getElementById("nQContainer");

    questionCounter++;

     if (questionCounter < 9)
            {
            console.log("Question number:" + questionCounter);

            gameDiv.style.borderColor = "white";

            textDisplayDiv.style.display = "none";

            myButton.style.display = "none";

            gameRound();
        }else if (questionCounter == 10)
        {
            console.log("End of game"); 
            myButton.style.display = "none";
            endOfGame();
        }
}


async function endOfGame(){

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

}


async function requestLeaderboard(){
    ;
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

            selectedMovie = buttons.textContent; //so we now wich button is selected

            console.log("Select Movie:", selectedMovie); //TA BORT SEN KOLLA BA SÅ DE FUNKAR
        });
    

        container.appendChild(buttons);

    }


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


}