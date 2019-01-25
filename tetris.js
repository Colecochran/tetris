const canvas = document.getElementById('tetris'); // creates canvas width and height from set numbers in the index
const context = canvas.getContext('2d'); // sets context to be drawing

const canvas2 = document.getElementById('background'); // creates canvas width and height from set numbers in the index
const context2 = canvas2.getContext('2d'); // sets context to be drawing


context.scale(20, 20); // sets scale

function arenaSweep(){ // line clearing
	let rowCount = 1; // sets row count to = 1
	outer: for (let y = arena.length - 1; y > 0; --y){ 
		for (let x = 0; x < arena[y].length; ++x){
			if (arena[y][x] ===0){
				continue outer; // goes to code below
			}						
		}						
		
		const row = arena.splice(y, 1)[0].fill(0); //deletes row
		arena.unshift(row);
		++y;

		player.score += rowCount * 10; // sets score to equal the number of row deleted and multiplying it by 10
		rowCount *= 2; //multiplying row count by 2
	}
}

function collide(arena, player){ //collision function
	const [m ,o] = [player.matrix, player.pos]; // creates variable from player position and array
	for (let y = 0; y < m.length; y++){
		for (let x =0; x < m[y].length; x++){ // checks for collision 
			if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x +o.x]) !==0){
				return true;
			}
		}
	}
	return false;
}

function createMatrix(w, h){ // creates matrix for storing placed objects
	const matrix = [];
	while(h--){
		matrix.push(new Array(w).fill(0));
	}
	return matrix; 
}

const arena = createMatrix(12, 24); // defines arena martix size (change 24 to adjust canvas floor)

function createPiece(type){  //receives type (ex T or L) and creates piece according to type received
	if (type === 'T'){
		return [
			[0,0,0],
			[1,1,1], // making the "T" shape using arrays
			[0,1,0],
		];
	} else if(type ==='O'){
		return [
			[2,2],
			[2,2], // making the square shape using arrays
		];
	} else if(type ==='L'){
		return [
			[0,3,0],
			[0,3,0], // making the "L" shape using arrays
			[0,3,3],
		];	
	} else if(type ==='S'){
		return [
			[0,0,0],
			[0,4,4], // making the "S" shape using arrays
			[4,4,0],
		];	
	} else if(type ==='Z'){
		return [
			[0,0,0],
			[5,5,0], // making the "Z" shape using arrays
			[0,5,5],
		];	
	} else if(type ==='J'){
		return [
			[0,6,0],
			[0,6,0], // making the "J" shape using arrays
			[6,6,0],
		];	
	}
	else if(type ==='I'){
		return [
			[0,7,0,0],
			[0,7,0,0], // making the "I" shape using arrays
			[0,7,0,0],
			[0,7,0,0],
		];	
	}
}

var status = 1; // game status
const run = 1; // game run
const pause = 2; // game pause


function draw() {
	if (status == 1){ // if status == 1(run) run code
		context.fillStyle = '#456'; // setting color to black
		context.fillRect(0, 0, canvas.width, canvas.height); // drawing background
		
		drawMatrix(arena,{x: 0, y:0}); // creates matrix
		drawMatrix(player.matrix, player.pos); // draws pieces
	} 
}

function drawMatrix(matrix, offset){ // draws objects
	matrix.forEach((row, y) => {
		row.forEach((value, x) =>{
			if (value !== 0) {
				context.fillStyle = colors[value];// sets piece color
				context.fillRect(x + offset.x, y + offset.y, 1, 1); // draws pieces
			}
		});
	});
}

function merge(arena, player){ 
	player.matrix.forEach((row, y) =>{
		row.forEach((value,x) =>{
			if (value !==0){
				arena[y + player.pos.y][x + player.pos.x] = value;
			}
		})
	})
}

function playerDrop(){ // moves pieces down
	if (status == 1){ // if status = run
		player.pos.y++; // moves pieces down
		if (collide(arena, player)) { // stops movement
			player.pos.y--; // moves piece up 
			merge(arena, player); // runs merge function
			playerReset(); // runs player resest function
			arenaSweep(); // check if line is full
			updateScore(); // updates score
		}
		dropCounter = 0;// sets drop counter = to 0
	} else {

	}
}

function playerMove(dir){
	player.pos.x += dir; // player moves according to number reseved by key code
	if (collide(arena, player)){ // checks collision
		player.pos.x -= dir; //moves piece back
	}
}

function playerReset(){ // new player
	const pieces = 'ILJOTSZ'; // creats object names
	player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]); // takes random piece
	player.pos.y = 0; // objects y = 0
	player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0); // takes player piece and moves so it doen't get stuck
	
	if (collide(arena, player)){ // check collision
		arena.forEach(row => row.fill(0));
		player.score = 0; // player score = 0
		updateScore(); // updates score
		status = menu; // sets status = to menu
	}
}

function playerRotate(dir){ // object rotation
	const pos = player.pos.x; // pos = player x
	rotate(player.matrix, dir); // runs rotate function
	let offset = 1; // rotation offset
	while (collide(arena, player)){ // check for boundery collison
		player.pos.x += offset;  // adds player x to offset
		offset = - (offset +(offset > 0? 1 : -1));
		if (offset > player.matrix[0].length){
			rotate(player.matrix, -dir); // calls rotation function
			player.pos.x = pos; // player x = pos
			return;
		}
	}
}

function rotate(matrix, dir){ // rotate function
	for (let y = 0; y < matrix.length; ++y){
		for (let x = 0; x < y; ++x){
			[ 
				matrix[x][y], // pre rotation 
				matrix[y][x],
			]=[
			matrix[y][x], // post rotation
			matrix[x][y],
			];
		}
	}
	
	if (dir > 0){ // rotate in oppisite direction
		matrix.forEach(row => row.reverse());
	} else {
		matrix.reverse(); 
	}
	
}

let dropCounter = 0; // creates drop counter variable
let dropInterval = 1000; // creates drop interval variable

let lastTime = 0; // creates last time variable

function update(time = 0){ // update function
	const deltaTime = time - lastTime; // delta time = time - last time
	lastTime = time; // last time = time
	
	dropCounter += deltaTime; // drop counter + delta time
	if (dropCounter> dropInterval){ // if drop counter > drop interval run player drop function
		playerDrop(); // runs player drop function
	}
	draw(); // runs draw function	
	requestAnimationFrame(update); 
}

function updateScore(){ // update score function
	document.getElementById('score').innerText = player.score; //set player score = to the score variable from index file
}


const colors = [ // objects color
	null,
	'blueviolet', // T
	'yellow', // O
	'orange', // L
	'lawngreen', // S
	'red', // Z
	'blue', // J
	'cyan', // I
]

const player = { // creats player variable
	pos: {x: 0, y: 0},
	matrix: null,
	score: 0,
}

document.addEventListener('keydown', event => { 
	if (event.keyCode == 37){ // moves object left by pressing the left arrow
		playerMove(-1); 
	}
	
	if (event.keyCode == 65){ // moves object left by pressing the "A"
		if(status == run){
			playerMove(-1);
		}
	}
	
	if (event.keyCode == 39){ // moves object right by pressing the right arrow
		if(status == run){
			playerMove(1);
		}
	}
	
	if (event.keyCode == 68){ // moves object right by pressing the "D"
		if(status == run){
			playerMove(1);
		}
	}
	
	if (event.keyCode == 40){ // moves object down by pressing the down arrow
		if(status == run){
			playerDrop();
		}
	}
	
	if (event.keyCode == 83){ // moves object down by pressing the "S"
		if(status == run){
			playerDrop();	
		}	
	}
		
	if (event.keyCode == 87){ // rotates object clockwise
		if(status == run){
			playerRotate(1);
		}	
	}
	if (event.keyCode == 38){ // rotates object clockwise
		if(status == run){
			playerRotate(1);
		}
	}
	if (event.keyCode == 80){ // pauses game with the press of "P"
		if (status == run){
			status = pause;
		} else {
			status = run;
		}
	}
	if (event.keyCode == 82){ // resets game with the press of "R"
		if (status == run){
			playerReset();
			arena.forEach(row => row.fill(0)); // clears canvas of objects
			player.score = 0;
			updateScore();
			draw();
		}
	}
});
playerReset(); // runs playerReset function
updateScore(); //runs updateScore function
update(); //runs update function
