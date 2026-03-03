
const serverUrl = "http://127.0.0.1:3000";
let gameScore = 0; 
let gameInfo = [];
let playerName = "";


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
    const playerName = document.getElementById("player_name").value; //this is from the input element in the middle of the screen 
    console.log(playerName);
    
    //potential for difficulty input 

    const response = await fetch(serverUrl + "/game/" + "pictureGame" + "/" + difficulty,  { //requesting the 10 random pictures from server
        method : "GET",
        headers: {
            "Content-Type": "application/json",
        },
        body: null,
    }); 

    if (!response.ok) {
        console.log("Response not okay");
        const startBox = getElementById("start-box");  // Code to display error message on the webpage
        startBox.innerHTML = "";
        const message = document.createElement(p);
        message.textContent = "Error in loading server";
        startBox.appendChild(message);

    } else {
        gameInfo = await response.json();
        playGame() //Function that will display the actual game, not yet created.
    }

}


//takes the value from the button pressed and depending on that increases the score. 
function submittQuestion() {
    ;
}


async function requestLeaderboard(){
    ;
}

function answerbuttons(number){
    const container = document.getElementById("aswer-buttons-display"); //Conect the right div
    container.innerHTML = " "; //Emty buttons evry time 

    for(i = 0; i<number; ++i){

    const className = document.createElement("label"); 
    className.classList.add("movie-name-radio"); 

    const button = document.createElement("input"); 
    button.type = "radio"; 
    button.name = "" //Måsrte länka namnet till documenten för att få in det
    button.value = //Ska skriva 

    className.appendChild(button); 
    
    }
    
  


}