var fs = require('fs');
var http = require('http');
var url = require('url');

var boardString="IIIIIIIII";

var server = http.createServer(function(request, response) {
    var queryData = url.parse(request.url, true).query;
    // console.log(queryData);
    if(queryData["do"]==='quit'){
    	//implement his after implementing database
    }else if(queryData["do"]==='playtictactoe'){
    	fs.readFile('client.html', 'utf-8', function(err, data){
	        response.writeHead(200, {'Content-Type': 'text/html'});
	        // var data1='(url='++')'
	        console.log(data);
	        response.end(data);
    	});
    }else{
    	fs.readFile('home.html', 'utf-8', function(err, data){
	        response.writeHead(200, {'Content-Type': 'text/html'});
	        response.end(data);
    	});
    }
}).listen(8000,function() {
	console.log('listening at http://localhost:8000');
});

function updateboard(num,i,gameid){
	var newboard="";
	var c;
	if(i=='1'){
		c='X'
	}else{
		c='O'
	}
	var board=vecGames[gameid].board;
	for(var i=0;i<board.length;i++){
		if(i===num){
			newboard=newboard+c;
		}else{
			newboard=newboard+board[i];
		}
	}
	vecGames[gameid].board=newboard;
	return newboard;
}
var players=0;
function get_playerid() {
	if(players==0){
		players=1;
		return players;
	}else if(players==1){
		players=2;
		return players;
	}
}	
function get_gamebegin(gameid){
	if(vecGames[gameid].gameBegun===false){
		return 'Waiting for other Player';
	}else {
		return 'Begin game';
	}
}

// var playerturn=1; //turn of which player
function findnextplayer(gameid){
	var playerturn=vecGames[gameid].playerturn;
	if(playerturn==1){
		return 2
	}else {
		return 1;
	}
}

function check_if_gameend(gameid) {
	var boardString=vecGames[gameid].board;
	c='X';
	if(boardString[0]==c&&boardString[1]==c&&boardString[2]==c || boardString[0]==c&&boardString[3]==c&&boardString[6]==c || boardString[0]==c&&boardString[4]==c&&boardString[8]==c || boardString[2]==c&&boardString[5]==c&&boardString[8]==c || boardString[1]==c&&boardString[4]==c&&boardString[7]==c||boardString[3]==c&&boardString[4]==c&&boardString[5]==c||boardString[6]==c&&boardString[7]==c&&boardString[8]==c||boardString[2]==c&&boardString[4]==c&&boardString[6]==c){
		return '1';
	}
	c='O';
	if(boardString[0]==c&&boardString[1]==c&&boardString[2]==c || boardString[0]==c&&boardString[3]==c&&boardString[6]==c || boardString[0]==c&&boardString[4]==c&&boardString[8]==c || boardString[2]==c&&boardString[5]==c&&boardString[8]==c || boardString[1]==c&&boardString[4]==c&&boardString[7]==c||boardString[3]==c&&boardString[4]==c&&boardString[5]==c||boardString[6]==c&&boardString[7]==c&&boardString[8]==c||boardString[2]==c&&boardString[4]==c&&boardString[6]==c){
		return '2';
	}
	var count=0;
	for(var i=0;i<9;i++){
		if(boardString[i]=='I'){
			
		}else{
			count++;
		}
	}
	if(count==9){
		return '0';
	}
	return '-1';
}

var vecGames = []; //vecGames.push(n), vecGames[0]. 
var Game = function() {
	this.gameNumber=vecGames.length; //index of game in vecgames
	this.board="IIIIIIIII";
	this.players=1;
	this.player1name="";
	this.player2name="";
	this.gameEnded=false;
	this.gameBegun=false;
	this.playerturn=1;
};

//returns gameid and playerid
function createNewGame() {
	var gameid;
	var plid;
	if(vecGames.length==0){
		//create new game
		var game=new Game();
		vecGames.push(game);
		gameid=game.gameNumber;
		plid=1;
	}else if(vecGames[vecGames.length-1].players==1){	
		//add to existing game
		vecGames[vecGames.length-1].players=2;
		vecGames[vecGames.length-1].gameBegun=true;
		gameid=vecGames[vecGames.length-1].gameNumber;
		plid=2;
	}else{
		//create new game
		var game=new Game();
		vecGames.push(game);		
		gameid=game.gameNumber;
		plid=1;
	}
	var arr=[gameid, plid];
	return arr;
}

function setnameofplayer(playerid,gameid,name){
	if(playerid=='1'){
		vecGames[gameid].player1name=name;
	}else{
		vecGames[gameid].player2name=name;
	}
}

var io = require('socket.io')(server);
io.sockets.on('connection', function(socket) {
	console.log("user connected");
	var ret=createNewGame();
	io.sockets.emit('set_playerid', ret);
	var gameid=ret[0];
	io.sockets.emit('set_gamebegin', [get_gamebegin(gameid),gameid]);
    socket.on('to_server_setname', function(info) {
    	var playerid=info[0];
    	var gameid=info[1];
    	var name=info[2];
    	setnameofplayer(playerid,gameid,name);
    	console.log("plname="+name);
    });
    console.log("hereeeeeee");
    socket.on('to_server_move', function(data) {
    	var newboard=updateboard(data[0],data[1],data[2]); 
    	var gameid=data[2];
    	console.log(newboard,data[1]);
    	var playerturn=findnextplayer(gameid);
    	vecGames[gameid].playerturn=playerturn;
    	io.sockets.emit('to_client_newboard', [newboard,playerturn,gameid]);
    	//emit another msg if draw/win/lose:
    	 var playerid=data[1];
    	 var retu=check_if_gameend(gameid);
    	 if(retu=='-1'){
    	 }else{
    	 	io.sockets.emit('to_client_gameend', [retu,gameid]);
    	 } 
	});
});


//multiplayer done! add restart game button, quit game button,etc