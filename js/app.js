/* List of all the cards */
let symbols = ["anchor", "bicycle", "binoculars", "birthday-cake", "bolt", "bomb", "bus", "cube", "diamond", "fire", "hand-lizard-o", "hotel", "key", "leaf", "lightbulb-o", "paper-plane-o", "puzzle-piece", "wifi"],

	diffucalts = ["Very Hardcore:0.3", "Hardcore:0.6", "Intermediate:1.5", "Beginner:3", "n00b:301"],
	playerDiff = 'new',
	deck = $('.deck'),
	timer = $('.blink'),
	moves = $('.moves'),
	restart = $('.restart'),
	message = $('.message'),
	movesMade = 0,
	curTime = 0,
	currentTimer = 0,
	onHand = [],
	founded = 0,
	inRow = 0,
	lastCard = '',
	second = 0,
	gameText = '',
	started = false,
	timerOn = false,
	stars = 100,
	diffs = '';



/* Shuffle function from http://stackoverflow.com/a/2450976 modified by me */
function shuffle() {
	let tmp = symbols.slice(symbols);
	let array = [];
	for (let i = 0; i < 8; i++) {
		let index = Math.floor(Math.random() * tmp.length);
		let removed = tmp.splice(index, 1);
		array.push(removed[0], removed[0]);
	}

	let currentIndex = array.length,
		temporaryValue, randomIndex;

	while (currentIndex !== 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

function restartGame(dif) {

	movesMade = 0;
	second = 0;
	started = false;
	onHand = [];
	founded = 0;
	inRow = 0;
	stars = 100;
	clearInterval(currentTimer);
	$('.stargolden').css('width', '100%');
	$('.progress .red').css('width', '0px');
	$('.progress').css('display', '');
	timer.html(`Waiting for click`);
	moves.html(0);
	startGame(dif);
}


function startGame(dif, newgame) {
	clearInterval(currentTimer);
	if (dif === '0') {
		diffs = '';
		for (let difficult of diffucalts) {
			difficult = difficult.split(":");
			diffs += `<button id="clickfac" class="diff ${difficult[1]} ripple">${difficult[0]}</button>`;
		}


		let text = `<span class="mobile"><h1>Difficult?</h1></span>
		<span class="desktop"><h1>${(newgame)?"What difficult would you like this time?":
		"What kind of player are you?"}</h1></span><hr><p>
		${diffs}</p>`;

		deck.css('background', `linear-gradient(160deg, #ABD 0%, #89D 100%)`);

		message.html(text);

		if (!newgame) {
			$(".fade-bg").fadeToggle("slow", "linear");
		}


		$('.diff').click(function () {
			playerDiff = $(this).attr('class');
			playerDiff = playerDiff.split(" ");
			dif = playerDiff[1];
			restartGame(dif);

			$(".fade-bg").fadeToggle("slow", "linear");

		});

		return;

	}

	let cards = shuffle();
	let thisDeck = '';

	movesMade = 0;
	curTime = 0;


	deck.empty();
	
	// give out new cards
	for (let i = 0; i < cards.length; i++) {
		thisDeck += `<li class="card"><i class="fa fa-${cards[i]}"></i></li>`;
	}
	deck.append(thisDeck);

	clickCard(dif);


}

// Player clicks on a card.
let clickCard = function (dif) {

	deck.find('.card').bind('click', function () {
		const current = $(this);

		let playTime = dif * 100;
		if (!started) {
			started = true;
			startTime(playTime);
		}


		// checks if the player is clickng the same card.
		if (!current.is('.open')) {
			onHand.push(this.innerHTML);
		}

		// Make the player wait until the opened card are closed.
		if (current.is('.show, .match') || onHand.length > 2) {
			return true;
		}


		current.addClass('open show flip');

		// Is it a match or not
		if (onHand.length > 1) {
			if (onHand[0] === onHand[1]) {
				deck.find('.open').addClass('match flip');

				if (lastCard === "match") {
					inRow = inRow + 1;

				}
				lastCard = "match";
				founded++;
			} else {
				deck.find('.open').not('.match').addClass('nomatch flip close');
				lastCard = 'nomatch';
			}


			movesMade++;


			deck.find('.match').removeClass('show');

			// Wait 0.6s before closing the cards
			setTimeout(function () {
				onHand = [];
				deck.find('.close').removeClass('open show nomatch close ');

			}, 600);
		}

		// Gives out a star rating of 1 star to 3. (1.6 stars)
		const mistakesMade = movesMade - 8;
		if (mistakesMade > 0 && mistakesMade <= 22) {
			stars = (33 - mistakesMade) * 3;
		}
		
		const countStars = stars / 33;

		// Player has found all the cards!
		if (founded === 8) {
			clearInterval(currentTimer);
			timer.html(`<strong>CONGRATZ!</strong>`);

			setTimeout(function () {
				gameWon(dif, movesMade, $(".blink").attr('title'), $(".stars").attr('title'), inRow, mistakesMade);
				return;
			}, 500);
		}


		// Update Moves and Starts
		moves.html(movesMade);
		$('.stargolden').css('width', `${stars}%`);
		$(".stars").attr("title", countStars.toFixed(1));


	});
};

function gameWon(dif, movesMade, time, starsCount, inRow, mistakes) {
	mistakes = Math.max(0, mistakes);
	stars = (33 - mistakes) * 3;

	let mstime = time * 1000;
	let timeScore = time * dif;

	const score = timeScore + mistakes - inRow - starsCount;

	let text = `<h1>Game Won!</h1>	
	<div class="stars"><div class="stargolden" style="width:${stars}%;"> </div></div>
	<p>You finished the game in <strong>${convertms(mstime)}</strong> with <strong>${mistakes} mistakes</strong>!<br /><br />
	<strong>Score: ${score.toFixed(2)} <br /></strong>
	--------<br />
	Time = ${timeScore.toFixed(2)}<br />
	Mistakes = ${mistakes}<br />
	Stars = -${starsCount}<br />
	${(inRow)?"Found In Row = -"+inRow:""}
	
	</p><p><button class="newgame ripple">New Game</button></p>`;

	deck.css('background', `linear-gradient(170deg, #5C4 0%, #382 100%)`);

	message.html(text);
	$(".fade-bg").fadeToggle("slow", "linear");

	$('.newgame').click(function () {
		startGame('0', 'yes');
	});

}

function gameMenu(dif) {
	timerOn = false;

	let text = `<h1>Game Paused! MIKKKKKEE</h1><hr><p>
	<button class="resume ripple">Resume Game</button>
	<button class="new ripple">New Game</button>
	<button class="restart ripple">Restart Game</button>
	</p>`;

	deck.css('background', `linear-gradient(160deg, #999 0%, #666 100%)`);

	message.html(text);
	$(".fade-bg").fadeToggle("slow", "linear");

	$('.resume').click(function () {
		timerOn = true;
	});

	$('.new').click(function () {
		startGame('0', 'new');
	});

	$('.restart').click(function () {
		playerDiff = $(this).attr('class');
		playerDiff = playerDiff.split(" ");
		dif = playerDiff[1];
		restartGame(dif);
	});

	$('.resume, .restart').click(function () {
		$(".fade-bg").fadeToggle("slow", "linear");
		deck.css('background', `linear-gradient(160deg, #ABD 0%, #89D 100%)`);
	});

}


function gameOver(dif) {

	if (dif === 0.3) { // Very Hardcore
		gameText = [0.6, 'Maybe you\'re not so hardcore as you thought? Try Hardcore?'];
	} else if (dif === 0.6) { // Hardcore
		gameText = [1.5, 'It\'s okey but maybe you should try Intermediate?'];
	} else if (dif === 1.5) { // Intermediate
		gameText = [3, 'Sorry, but that\'s life. Suggestion: Try Beginner?'];
	} else if (dif === 3) { // Beginner
		gameText = [301, 'Is it still too hard for you? are you a n00b?'];
	}

	let text = `<h1>Game Over!</h1><hr><p><button class="diff ${gameText[0]} ripple">${gameText[1]}</button></p><p><button class="new ripple">New Game</button> <button class="restart ripple">Restart Game</button></p>`;

	deck.css('background', `linear-gradient(160deg, #C00 0%, #C77 100%)`);

	message.html(text);
	$(".fade-bg").fadeToggle("slow", "linear");

	$('.diff').click(function () {
		playerDiff = $(this).attr('class');
		playerDiff = playerDiff.split(" ");
		dif = playerDiff[1];
		restartGame(dif);
	});

	$('.new').click(function () {
		startGame('0', 'new');
	});

	$('.restart').click(function () {
		restartGame(dif, 'new');
	});	

	$('.diff, .restart').click(function () {
		$(".fade-bg").fadeToggle("slow", "linear");
		deck.css('background', `linear-gradient(160deg, #ABD 0%, #89D 100%)`);
	});
	
}


function twoDig(num) {
	return num > 9 ? "" + num : "0" + num;
}

function startTime(width) {
	dif = width / 100;
	if (dif === 301) {
		$('.progress').css("display", "none");
		return;
	}


	timerOn = true;
	currentTimer = setInterval(function () {
		if (timerOn === false) {
			return;
		}

		if (width - second < -1) {
			return;
		}
		let minutes = Math.floor(second / 60);
		let hours = Math.floor(minutes / 60);
		let seconds = second - minutes * 60;

		let countTime = `${(hours)?twoDig(hours) + ":":""}${(minutes)?twoDig(minutes):"00"}:${(seconds)?twoDig(seconds):"00"}`;
		let widthPerSec = `${300 / width * seconds}px`;

		$(".blink").attr("title", second)

		if (width === second + 60) {
			countTime = '* one minute left *';
		} else if (width <= second + 10) {
			countTime = `<strong>${width - second}</strong>`;
		}

		if (width - second < 0) {
			countTime = `<strong>GAME OVER</strong>`;
			gameOver(dif, width);
			clearInterval(currentTimer);
			widthPerSec = '100%'
		}


		$('.progress .red').css('width', `${widthPerSec}`);
		timer.html(`${countTime}`);
		second = second + 1;
	}, 1000);
}

function convertms(s) {
	const ms = s % 1000;
	s = (s - ms) / 1000;
	const secs = s % 60;
	s = (s - secs) / 60;
	const mins = s % 60;
	const hrs = (s - mins) / 60;

	return `${(hrs)?twoDig(hrs) + ":":""}${(mins || hrs)?twoDig(mins) + ":":""}${(mins || hrs)?twoDig(secs):secs + " seconds"}`;
}

$(".menu").bind("click", function () {
	gameMenu();
});

startGame('0');
