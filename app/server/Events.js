var Game = require('./Game').Game
	Player = require('./Game').Player
	Food = require('./Game').Food;

module.exports = {
	/*
	* Handshake between client and server
	* Create Player object from data on server
	* Store Player + Socket ID in array
	*/
	handshake: (data) => {
		var p = new Player(data.username, data.socket);
		data.socket['_id'] = p._id;
		Game.Players.push(p);

		// send stuff back to player
		var player_copy = Object.assign({}, p);
		delete player_copy['socket'];

		var packet = {id: 'handshake', player: player_copy, map: Game.Map};
		p.getSocket().sendUTF(JSON.stringify(packet));
	},

	player_move: (data) => {
		var p = Game.FindPlayer(data.player._id);

		// array concurrent modification check
		if(p == null)
			return;

		p.setX(data.player.x);
		p.setY(data.player.y);
		p.setRadius(data.player.radius);
		p.impact = data.player.impact;
	},

	food_move: (data) => {
		var f = Game.FindFood(data.food._id);

		// array concurrent modification check
		if(f == null)
			return;

		f.setX(data.food.x);
		f.setY(data.food.y);
		f.setRadius(data.food.radius);
	},

	/*
	* specifies when a food is eaten + if its chained
	* specifis what player ate it
	*/
	eat: (data) => {
		// console.log(data.food)
		var f = Game.FindFood(data.food._id);
		if(f === null)
			return;

		var p = Game.FindPlayer(data.player._id);

		// array concurrent modification check
		if(p == null)
			return;

		p.setScore(p.getScore() + 1);

		// specifiy if the food is being chained
		if(p.getScore() === 0 || p.getScore() % 10 === 0)
			p.addFood(f);

		Game.RemoveFood(f);
		Game.spawnFood();
	},

	/*
	* disconnect
	*
	*/
	disconnect: (socket) => {
          for(var j = 0; j < Game.Players.length; j++)
            if(Game.Players[j]._id = socket._id) {
              	Game.Players.splice(j, 0);
            }

          console.log('WS: Closed connection.');
	}
}