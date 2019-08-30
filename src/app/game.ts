export class Game {

  player1: Player;
  player2: Player;
  side1: Side;
  side2: Side;
  ended: boolean;
  winnerId: string = '';
  startedAt: string;
  endedAt: string;

  constructor() {}

  startGame(player, cell) {

    this.side1 = new Side();
    this.side1 = new Side();
    this.player1 = new Player();
    this.player2 = new Player();

    this.move(player == this.player1 ? this.side1 : this.side2, cell, 4)
  }

  move(side, cell, balls) {

    let totalGameMoves = 0;

    let actualPos;
    let nextMove;
    const canTeba: boolean = false;
    const canGarama: boolean = false;

    let sideGround = new Side;

    side == this.side1 ? this.side1.totalMoves++ : this.side2.totalMoves++;

    totalGameMoves += totalGameMoves;

    if (cell in sideGround.positions) {

      actualPos = Number(cell);

      if (actualPos >= 11 && actualPos < 18 && actualPos >= 21 && actualPos < 28) {
        // Move on the front and on the back line
        nextMove = actualPos + 1;
      } else if (actualPos == 18) {
        // Move from the front to back line
        nextMove = 21
      } else {
        // Move from the back to front line
        nextMove = 11;
      }
    }

    balls -= balls; // Decrement the balls in hand

    if (balls < 0) {
      // Move the balls at the interval of 1 second
      setTimeout(() => this.move(side, nextMove, balls), 1000);
    }

  }
}

class Player {
  id: string = '';
  points: number = 0;
  age: number = 18;
}

class Side {
  totalBalls: number = 32;
  totalMoves: number = 0;
  positions: {
    // First line
    "18": number,
    "17": number,
    "16": number,
    "15": number,
    "14": number,
    "13": number,
    "12": number,
    "11": number,

    //Seocond line
    "21": number,
    "22": number,
    "23": number,
    "24": number,
    "25": number,
    "26": number,
    "27": number,
    "28": number,
  };

  constructor() {
    // First line:
    this.positions["11"] =
      this.positions["12"] =
        this.positions["13"] =
          this.positions["14"] =
            this.positions["15"] =
              this.positions["16"] =
                this.positions["17"] =
                  this.positions["18"] = 4;
    // Second line:
    this.positions["21"] =
      this.positions["22"] =
        this.positions["23"] =
          this.positions["24"] =
            this.positions["25"] =
              this.positions["26"] =
                this.positions["27"] =
                  this.positions["28"] = 0;
  }
}
