
const serverUrl = "http://127.0.0.1:3000";
const gameScore = 0; 


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
async function startGame() {
    gameScore = 0; //sets the score to 0 at the start of the game
    const playerName = document.getElementById("player_name").value; //this is from the input element in the middle of the screen 
    
    //potential for difficulty input 

    const response = await fetch(serverUrl + "/game/" + "pictureGame",  { //requesting the 10 random pictures from server
        method : "GET",
        headers: {
            
        }
    }); 
}


//takes the value from the button pressed and depending on that increases the score. 
function submittQuestion() {
    ;
}


async function requestLeaderboard(){
    ;
}


//Funktion for the answerbuttons 
function answerbuttons(arrayNameMovie){  //Number is dificuld level, arrayNameMovie is the name of the movies
   
    const container = document.getElementById("answer-buttons-display"); //Conect the right div
    container.innerHTML = ""; //Emty buttons evry time 

    const corectAnswer = arrayNameMovie.QuestionMovie[0].name;
    let selectedMovie = null; 

    for(let i = 0; i < arrayNameMovie.answerOptionsForQuestions[0].length;  ++i){ //lookps throw how many bottons 

        const buttons = document.createElement("button"); 
        buttons.classList.add("movie-name-buttons"); 
        buttons.textContent = arrayNameMovie.answerOptionsForQuestions[0][i].name;

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
}