
const serverUrl = "http://127.0.0.1:3000";
const gameScore = 0; 


//runs when the website is loaded.
document.addEventListener("DOMContentLoaded", function(){

    displayWelcome();
    
});






//Will display the relevant html obejct for the first site
function displayWelcome() {

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
