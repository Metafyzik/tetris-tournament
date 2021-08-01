/**
 * MODAL
 */
var modal = document.getElementById("myModal");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
	modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
}
/**
 * BUTTONS
 */
function pauseGame() {
	velocityX = 0;
	velocityY = 0;
}

function startGame() {
	if (gameIsRunning == false) { // start new game
		gameIsRunning = true;
		velocityY = 1;
		gameLoop();
		generateNewBlock(); // generate first block of the game
	} else { // stop pause of the game
		velocityY = 1;
	}
}

function goScores() {
	location.href = '/rankings/';
}
/**
 * COMMUNICATION WITH SERVER
 */
// show input for name, button to send
function showEnterName() { 

var x = document.getElementById("entry"); // #! rename
	if (x.style.display === "block") {
		x.style.display = "none";
	} else {
		x.style.display = "block";
	}
}

// sending data 
function sendFunction () {
	const input = document.getElementById("content").value; //  getting content from input

	if (input != '') { //  empty name is not allowed
		const toSend = {
		score: title.textContent, 
		playerName: input
	}

	const jsonString = JSON.stringify(toSend);
	const xhr = new XMLHttpRequest();      

	xhr.open("POST", "/" ); //#! the adress
	xhr.setRequestHeader("Content-Type","application/json");
	xhr.send(jsonString);

	showEnterName(); // hide entry input, after sending
	restartGame();
	}

}

// emptying the grid ("restarting") without new entry	
function sendNothing () {
	showEnterName();
	restartGame();
}

function restartGame(){
	lifeBlockX = [];
	lifeBlockY = [];
	deadBlocks = [];
	score = 0;
	drawStuff();
	title.innerHTML = score;
}

// listeners
document.addEventListener("keydown", keyPush);
// canvas
const canvas = document.querySelector("canvas");
const title = document.querySelector("h1");
const ctx = canvas.getContext("2d");

let fps = 1; 
const tileSize = 25;
const tileCountX = canvas.width / tileSize;
const tileCountY = canvas.height / tileSize;

let score = 0;

// type of blocks 
const Ix = [0+75,25+75,50+75,75+75]; // #! check
const Iy = [-25,-25,-25,-25];

const Jx = [0+75,0+75,25+75,50+75];
const Jy = [-50,-25,-25,-25];

const Ox = [100,125,100,125]; // #! rotation behaviour
const Oy = [-50, -50, -25, -25,];

const Lx = [0+125,0+125,-25+125,-50+125]; // #! check
const Ly = [-50,-25,-25,-25];

const Tx = [100,100,125,75]; // #! check
const Ty = [-50,-25,-25,-25,];

const Zx = [-25+100,0+100,0+100,25+100];
const Zy = [-50,-25,-50,-25];

const Sx = [-25+100,0+100,0+100,25+100];
const Sy = [-25,-25,-50,-50];

const tertronimoX =  [Tx, Ix, Lx, Zx, Sx, Jx, Ox ]  
const tertronimoY = [Ty, Iy, Ly, Zy, Sy, Jy, Oy ]                

// player

let lifeBlockX = [];
let lifeBlockY = [];

let deadBlocks = []; // dead block

let colorBlock; 

let velocityX = 0;
let velocityY = 0;

drawStuff(); // so that drawn grid appears
let gameIsRunning = false;

// main loop
function gameLoop() {
	if (gameIsRunning) {
		downwardMovement ();
		drawStuff();
		gameOver();
		setTimeout(gameLoop, 1000 / fps);
	}
}
/**
 * GENERATE NEW BLOCK
 */
function generateNewBlock(){
	// emptying
	lifeBlockX = []; 
	lifeBlockY = [];

	let randomBlock = Math.floor(Math.random() * tertronimoX.length) // choose random type of block 
	lifeBlockX = [...tertronimoX[randomBlock]];
	lifeBlockY = [...tertronimoY[randomBlock]];

	genRandColor (); // give block random color
}

/**
 * GENERATE Random color of block #! 
 */
function genRandColor () {
	let r = Math.floor(Math.random() * 255)
	let g = Math.floor(Math.random() * 255)
	let b = Math.floor(Math.random() * 255)

	colorBlock = `rgb( ${r} , ${g} , ${b} )`;
}


function downwardMovement () {
	moveYcoordinate();
	collision();
}

function moveYcoordinate() {

	for (let i=0;i<lifeBlockY.length; i++) { // #! perpetual falling of life block
		lifeBlockY[i] = lifeBlockY[i] + tileSize*velocityY; 
	}
}

function collision() {

//#! Can collisons with blocks and collision to bottom be put together

// hit dead blocks -> add to dead blocks -> generate new life block
deadBlocks.forEach((deadBlock) => {
	for (let i=0;i<lifeBlockY.length; i++) {
		if (deadBlock.x === lifeBlockX[i] && deadBlock.y  == lifeBlockY[i] ) {
			for (let i=0;i<lifeBlockY.length; i++) {
				//lifeBlockY[i] = lifeBlockY[i] - tileSize ; #!
				deadBlocks.push({ x: lifeBlockX[i], y: lifeBlockY[i]-tileSize, color:colorBlock}); // add to dead blocks
				

			}
			fullRow();
			generateNewBlock();
			break	
		}
	}
}); 

// hit bottom -> add to dead blocks -> generate new life block
for (let i=0;i<lifeBlockY.length; i++) {

	if (lifeBlockY[i] > canvas.height - tileSize) {
		for (let i=0;i<lifeBlockY.length; i++) {
		//lifeBlockY[i] = lifeBlockY[i] - tileSize ;
		deadBlocks.push({ x: lifeBlockX[i], y: lifeBlockY[i]-tileSize, color:colorBlock}); // add to dead blocks
		
								
		}
		fullRow(); //! TESTING TAKEN FORM LOOP
		generateNewBlock();
		
		break
	}
}	
}

/**
 * CHECKING FUNCTIONS
 */

// check for full row
function fullRow() {
let rowToRemove; 
let columsInRow; 

for (row = 0; row <= canvas.height; row = row + tileSize) { // go throw each row #! inefficiency dont have to go trough every row, only the highest (resp. lowest) y in Deadblocks

	columsInRow = 0;
	
	deadBlocks.forEach((deadBlocks) => { 
		if (deadBlocks.y === row) {
			columsInRow = columsInRow + 1;
		}

	});

	if (columsInRow  == canvas.width/tileSize) { // full row is found
		
		rowToRemove = row; // which row to remove
		console.log ("rowToRemove =", row)	

		deadBlocks = deadBlocks.filter(function(deadBlocks){
			return deadBlocks.y != rowToRemove	});

		adjustRows(deadBlocks,rowToRemove);

		title.textContent = ++score; // add score
		fps = changeSpeed(score); // speed up based on score

	}    
}

}

// adjust row blocks
function adjustRows(deadBlocks,rowToRemove) {
	for (i = 0; i< deadBlocks.length; i ++){
		if (deadBlocks[i].y <= rowToRemove) {
			deadBlocks[i].y = deadBlocks[i].y + tileSize
		} 
	}
}

/**
 * DRAW EVERYTHING #!  "deadBlocks" and "lifeBlocks" draw separately?
 */
function drawStuff() {
	// background
	rectangle("rgb(12,20,31)", 0, 0, canvas.width, canvas.height);

	// grid
	drawGrid();

	// draw deadBlocks 
	deadBlocks.forEach((block) => {
		rectangle(block.color, block.x, block.y, tileSize, tileSize);
	})

	// draw life blocks
	for (let i=0;i<lifeBlockY.length; i++) {
		rectangle(colorBlock, lifeBlockX[i], lifeBlockY[i], tileSize, tileSize);
	}
}

// draw blocks
function rectangle (color, x, y, width, height) {
	ctx.fillStyle = color;
	ctx.fillRect(x, y, width, height);
	ctx.strokeRect(x,y,width,height);
	}


// draw grid
function rectangleCanvas (color, x, y, width, height) {
	ctx.fillStyle = color;
	ctx.fillRect(x, y, width, height);
	
}

// GAME OVER #! change speed based on score			
function gameOver() {

	for (i=0; i < deadBlocks.length; i++) {
		if (deadBlocks[i].y < 0) {

			title.innerHTML = `${score}  GAME OVER `;
			gameIsRunning = false;

			showEnterName();
			break
		}
			
	}
}	

// after every 10 points fps++
function changeSpeed (score) {
	speed = Math.floor(score/10)+1
	return speed
} 

// ROTATION FUNCTIONALITY

// ArrowUp rotating life block
function rotationHandling () {

	let previousState = [[...lifeBlockX],[...lifeBlockY]];
	let pointsRotation = [lifeBlockX[1],lifeBlockY[1]];

	toBase(pointsRotation); 
	changeCoordinates();
	toBack(pointsRotation);
	beyondBoarders (); 
	intoBlock ();
	rotationImpossible(previousState); 
}

function toBase(pointsRotation) {

	for (let i =0; i < lifeBlockX.length; i++) {

		lifeBlockX[i] = lifeBlockX[i] - pointsRotation[0];
		lifeBlockY[i] = (lifeBlockY[i] - pointsRotation[1])* (-1);
		
	}

}

function changeCoordinates () {
	for (let i =0; i < lifeBlockX.length; i++) {
		
		if (lifeBlockX[i] === 0 ) {  // A
			let helpVar = lifeBlockX[i];

			lifeBlockX[i] = lifeBlockY[i];
			lifeBlockY[i]= helpVar;
		} else if (lifeBlockY[i] === 0 ) { // B
			let helpVar = lifeBlockY[i];

			lifeBlockY[i]= lifeBlockX[i] * (-1);
			lifeBlockX[i]= helpVar;
			
		// C,E	
		} else if ( (lifeBlockX[i] > 0 && lifeBlockY[i] > 0) || (lifeBlockX[i] < 0 && lifeBlockY[i] < 0) ) {  //#! is condition correct

			lifeBlockY[i] = lifeBlockY[i] * (-1);

		} else { // D,E
			lifeBlockX[i] = lifeBlockX[i] * (-1);

		} 
	
	}

}			

function toBack (pointsRotation) {
	for (let i =0; i < lifeBlockX.length; i++) {

		lifeBlockX[i] = lifeBlockX[i] + pointsRotation[0];
		lifeBlockY[i] = (lifeBlockY[i]*(-1)) + pointsRotation[1];
		
	}

}

// check if block is not rotated into another block
function intoBlock () {
	
	for (let i =0; i < lifeBlockX.length; i++) {

		deadBlocks.forEach((deadBlocks) => {
			if (lifeBlockX[i] == deadBlocks.x && lifeBlockY[i] == deadBlocks.y) { // rotation cause that y coordinate is smaller than boarder
				

				if ( Math.max(...lifeBlockX) > deadBlocks.x) { // adjust postion of block to left or right
					for (let j =0; j < lifeBlockX.length; j++) {
						lifeBlockX[j] = lifeBlockX[j] + tileSize;

					}
				} else {
					for (let j =0; j < lifeBlockX.length; j++) {
							lifeBlockX[j] = lifeBlockX[j] - tileSize;	
					}
				}			

				}
		}) 
	}		
}

// check if block is not rotated beyond boarders if so adjust
function beyondBoarders () {
	for (let i =0; i < lifeBlockX.length; i++) {

		if (lifeBlockX[i]<0) { // rotation cause that y coordinate is smaller than boarder

			let correction = lifeBlockX[i]
			//console.log("correction",correction)
			for (let j =0; j < lifeBlockX.length; j++) {

				lifeBlockX[j] = lifeBlockX[j] + (correction * (-1));
			}
		} 

		if (lifeBlockX[i]>= canvas.width) { // rotation cause that y coordinate is bigger than boarder
			let correction = lifeBlockX[i]
			//console.log("correction",correction)
			for (let j =0; j < lifeBlockX.length; j++) {
				
				lifeBlockX[j] = lifeBlockX[j] + ((correction - canvas.width + tileSize) * (-1));
			}
			//console.log("lifeBlockX",lifeBlockX)	
		} 
		
	}	
		
}

function rotationImpossible (previousState) {
	//console.log("rotationImpossible () called")
	for (let i =0; i < lifeBlockX.length; i++) {
		// #! based on my assumption is this necessary?
		if (lifeBlockX[i] > (canvas.width - tileSize) || lifeBlockX[i] <0 || lifeBlockY[i] >= canvas.height) { 


			lifeBlockX = previousState[0];
			lifeBlockY = previousState[1];
		}
	}
	
	for (let i =0; i < lifeBlockX.length; i++) {
		deadBlocks.forEach((deadBlocks) => {
			if (lifeBlockX[i] == deadBlocks.x && lifeBlockY[i] == deadBlocks.y) {

				lifeBlockX = previousState[0];
				lifeBlockY = previousState[1];
			}
			
		})
	}	
}

function LeftRightMovement (direction, wallSide) {

	wallCollison (direction, wallSide);
	blockCollision ();

	if (velocityX !== 0) {
		moveXcoordinate (); 
	}
}	

// wall collision !# The problem of this func is that is not only checking collision is determining VelocityX in non collision contexts
function wallCollison (direction, wallSide) {
	velocityX = direction;
	lifeBlockX.forEach((lifeBlockX) => {
		if (wallSide == 0) { //right wall or left wall
		
			if (lifeBlockX <= wallSide) {
					velocityX = 0;						
			}
		} else {
			if (lifeBlockX >= wallSide) {
					velocityX = 0;
			}
		}  								
	})
}

//collision with blocks from side (X coordinate)
function blockCollision () {
	for (i= 0; i < lifeBlockX.length; i++) {
		deadBlocks.forEach((deadBlocks) => {
		if (lifeBlockX[i] + tileSize*velocityX == deadBlocks.x && lifeBlockY[i] == deadBlocks.y) {
				velocityX = 0;	
				//console.log("called blockCollision")							
			}						
		})	
	}
}

// Move X coordinate of life block; #! this function should encompass moving block on x coordinate, but important determination of VelocityX would be hard to find here cause its not here.
function moveXcoordinate () { // #! if velocityX is 0 then running this function is meaningless
	for (let i=0;i<lifeBlockX.length; i++) {
					lifeBlockX[i] = lifeBlockX[i] + tileSize*velocityX;
				}	
}

/**
 * KEYBOARD
 */ // #! toto "true" je rjadna somaryna
function keyPush(event) {
	switch (event.key) {
		case "ArrowLeft":
			if (gameIsRunning == true) {

				LeftRightMovement (-1,0);
				drawStuff();

			}   
			break;
		case "p": // #! stop the game going
			if (gameIsRunning == true) {
				velocityX = 0;
				velocityY = 0;
			}
			break;
		case"ArrowUp": // #! change coordinates of life block
			if (gameIsRunning == true) {
				rotationHandling ();
				drawStuff(); // so that change is immediatly seen

			}
			break;	
		case "ArrowRight":
			if (gameIsRunning == true) {

				LeftRightMovement (1,canvas.width - tileSize);
				drawStuff();
				
			}
			break;
		case "ArrowDown":
			if (gameIsRunning == true) {	
				downwardMovement ();					
				drawStuff();
			}
			break;
	}
}

// grid
function drawGrid() {
	for (let i = 0; i < tileCountX; i++) {
		for (let j = 0; j < tileCountY; j++) {
			rectangleCanvas(
				"rgb(230,255,255)",
				tileSize * i,
				tileSize * j,
				tileSize - 1,
				tileSize - 1
			);
		}
	}
}
