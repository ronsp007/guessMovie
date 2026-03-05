
const serverUrl = "http://127.0.0.1:3000";
let gameScore = 0; 
let gameInfo = [];
let playerName = "";
let selectedMovie = null;
let questionCounter = 0;


//runs when the website is loaded.
document.addEventListener("DOMContentLoaded", function(){

    displayWelcome();
    
});


//Will display the relevant html obejct for the first site
function displayWelcome() { //This we dont need.......i think :)

}

//Will display the relevant html object for the game site
function displayGameView() {
   document.querySelector(".frontpage").style.display = "none"; 
   document.querySelector(".main-page").style.display ="block";
    
}



//takes in the given values for name and game diffuculty (set to 6 options in the beginning) 
async function startGame(difficulty) {
    gameScore = 0; //sets the score to 0 at the start of the game
    const playerName = document.getElementById("entry_name").value; //this is from the input element in the middle of the screen 
    console.log(playerName);
    //document.querySelector("#submit-container").style.display ="block";
    
    
    //potential for difficulty input 

    const response = await fetch(serverUrl + "/" + "pictureGame" + "/" + difficulty,  { //requesting the 10 random pictures from server
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
        gameInfo = await response.json();
        console.log(gameInfo);
        answerbuttons() //Function that will display the actual game, not yet created.
        gameRound();
    }

}

async function gameRound() {
    const startBox = document.getElementById("start-box");  // Code to display error message on the webpage
    startBox.innerHTML = "";
    answerbuttons();

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

    }



}


//takes the value from the button pressed and depending on that increases the score. 
function submittQuestion() {
    console.log("button is pressed");
    const gameDiv = document.getElementById("game-display");

    if (selectedMovie == gameInfo.QuestionMovie[questionCounter].name) {
        gameScore++;
         gameDiv.style.borderColor = "green";

    }else{
        gameDiv.style.borderColor = "red";
    }

    const title = document.createElement("p")
        title.textContent = "Right answer: " + gameInfo.QuestionMovie[questionCounter].name;

        const titleDiv = document.createElement("div");
        titleDiv.appendChild(title);
        gameDiv.appendChild(titleDiv);
        title.style.font = "Serif";
        title.style.fontSize = "150%";
        title.style.color = "white";
       
        const nextQuestion = document.createElement("button");
        nextQuestion.textContent = "Next question";
        titleDiv.appendChild(nextQuestion);
        nextQuestion.addEventListener("click", function (){
            questionCounter++;
            console.log(questionCounter);
            gameDiv.style.borderColor = "white";
            titleDiv.innerHTML = " ";
            gameRound();
        });
       
}

function gameWindow() {
    
}


async function requestLeaderboard(){
    ;
}


//Funktion for the answerbuttons 
function answerbuttons(){  
   
    const container = document.getElementById("answer-buttons-display"); //Conect the right div
    container.innerHTML = ""; //Emty buttons evry time 

    const corectAnswerName = gameInfo.QuestionMovie[questionCounter].name;
    const corectAnswer = gameInfo.QuestionMovie[questionCounter]
    const wrongAnswer =  gameInfo.answerOptionsForQuestions[questionCounter];

    const allAnswer = [corectAnswer].concat(wrongAnswer); //Conect corect answer whit wrong answer

    allAnswer.sort(() => Math.random() - 0.5); //"shufell" the order (the corect answar apers in a radom order)

    //loop thro all answers that depens on the difuculd level (3,6 or 9)
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