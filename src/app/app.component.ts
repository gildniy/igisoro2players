import { AfterViewInit, Component, OnInit } from "@angular/core";
import { SwUpdate }                         from "@angular/service-worker";
import { range }                            from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  moveInterval = 500;
  handPick;
  ground: any;
  nteba = [];
  ngarama = [];
  isPlayer1 = false;
  isPlayer2 = false;
  previousPickPos;
  gameStartedAt: any;
  gameEndedAt: any = false;
  pickFromOpponent = 0;
  winner = '';
  moving = false;
  // //
  // imageAddr = "http://www.kenrockwell.com/contax/images/g2/examples/31120037-5mb.jpg";
  // downloadSize = 4995374; //bytes

  elemTxtById = (elemId) => document.getElementById(elemId).innerText;
  elemTxtNumById = (elemId) => Number(document.getElementById(elemId).innerText);
  elemById = (elemId) => document.getElementById(elemId);

  constructor(private swUpdate: SwUpdate) {
    this.swUpdate.isEnabled &&
    this.swUpdate.available.subscribe(() => {
      confirm('New Version available. Load New Version?') &&
      window.location.reload();
    })
  }

  ngOnInit(): void {
    this.ground = this.getPositions();

    console.log('THIS IS MY GROUND: ', this.ground);

    this.nteba.push(['111', '122'], ['228', '217']);
    this.ngarama.push(['127', '118'], ['212', '221']);

  }

  ngAfterViewInit(): void {
    // Get all nav links
    const positions = document.querySelectorAll('.pos');

    let refElContent;
    for (let i = 0; i < positions.length; i++) {
      refElContent = positions[i].innerHTML;
      const addedClass = 'ball' + ( refElContent > 1 ? 's' : '' ) + '-' + refElContent;
      positions[i].classList.add(addedClass);
    }
  }

  checkEndGame() {

    const side1 = [];
    const side2 = [];

    for (let id = 111; id <= 228; id++) {
      id >= 111 && id <= 118 && side1.push(this.elemTxtNumById(`${ id }`));
      id >= 121 && id <= 128 && side1.push(this.elemTxtNumById(`${ id }`));
      id >= 211 && id <= 218 && side2.push(this.elemTxtNumById(`${ id }`));
      id >= 221 && id <= 228 && side2.push(this.elemTxtNumById(`${ id }`));
    }

    this.winner = Math.max(...side1) <= 1 && '2' || Math.max(...side2) <= 1 && '1' || '';

    this.gameEndedAt = this.winner !== '' && new Date() + '' + alert(`Game over! Player ${ this.winner } wins!`);

    console.log('GAME ENDED AT: ', this.gameEndedAt);

    return !!this.gameEndedAt
  }

  checkReversableMove(currentPos) { // "Nteba" & "Ngarama" moves

    const sideType = currentPos.charAt(0);

    const reversablePos = sideType == 1 ?
      [...this.ngarama[0], ...this.nteba[0]] :
      [...this.ngarama[1], ...this.nteba[1]];

    let opponentPickableNum = 0;

    console.group('TEST:', [
      reversablePos,
      reversablePos.includes(currentPos)
    ]);

    if (reversablePos.includes(currentPos)) {

      const
        contentReversable = [],
        numFirstPos = 8,
        numReversableCasesByPos = 4,
        initialT1 = 1,
        initialT2 = -1,
        initialG1 = 10,
        initialG2 = 8,
        G1 = [], G2 = [], T1 = [], T2 = [];

      for (let i = 0; i <= numReversableCasesByPos; i++) {

        const horiziantalG1 = [];
        const horiziantalG2 = [];
        const horiziantalT1 = [];
        const horiziantalT2 = [];

        const verticalStep = 16 * i;

        for (let j = 0; j < numFirstPos; j++) {

          const step = verticalStep + j;

          horiziantalG1.push(initialG1 + step);
          horiziantalG2.push(initialG2 + step);
          horiziantalT1.push(initialT1 + step);
          horiziantalT2.push(initialT2 + step);
        }

        G1.push(horiziantalG1);
        G2.push(horiziantalG2);
        T1.push(horiziantalT1);
        T2.push(horiziantalT2);
      }

      G1.pop();
      G2.pop();
      T1.pop();

      G1[3][7] = T1[0][0] = T2[0][0] = T2[0][1] = T2[0][2] = T2[4][2] = T2[4][3] = T2[4][4] = T2[4][5] = T2[4][6] = T2[4][7] = 0;

      contentReversable.push(G1, G2, T1, T2);

      console.log('contentReversable:', contentReversable);

      const reversablePosIndex = reversablePos.indexOf(currentPos);

      const currentPosReversablePossibleCases = contentReversable[reversablePosIndex];

      let possibleCaseIndex;

      const currentPosContent = this.elemTxtById(`${ currentPos }`);

      const handPick = currentPosContent !== '0' ? currentPosContent : this.pickFromOpponent + '';

      const roundReversableIndex = currentPosReversablePossibleCases.findIndex(function (sub) {
        possibleCaseIndex = sub.indexOf(Number(handPick));
        return possibleCaseIndex !== -1;
      });

      const isPossibleCaseIndexValid = possibleCaseIndex !== -1;
      const opponentPickablePos = [];
      const moveableNumForCurrentPos = isPossibleCaseIndexValid && contentReversable[reversablePosIndex][roundReversableIndex][possibleCaseIndex];

      // As a condition to move is to have between 2 and 64 balls in a position
      if (moveableNumForCurrentPos >= 2 && moveableNumForCurrentPos <= 64) {

        const myHalfGround = sideType == '1' ? this.ground[0] : this.ground[1];
        const oppHalfGround = sideType == '2' ? this.ground[0] : this.ground[1];
        const line1 = sideType == '2' ? 0 : 1;
        const line2 = sideType == '2' ? 1 : 0;
        const oppSideType = sideType == '2' ? '1' : '2';
        const caseIndex = sideType == '2' ? possibleCaseIndex : 7 - possibleCaseIndex;

        const opponentPickablePosFirst = oppHalfGround[line1][caseIndex];
        const opponentPickablePosLast = oppHalfGround[line2][caseIndex];

        const isMyPickingPosNumValid = this.elemTxtNumById(`${ sideType }${ myHalfGround[line1][caseIndex] }`) >= 1;

        opponentPickablePos.push(this.elemTxtById(`${ oppSideType }${ opponentPickablePosFirst }`));
        opponentPickablePos.push(this.elemTxtById(`${ oppSideType }${ opponentPickablePosLast }`));

        // move in reverse at the end pick from the opponent
        // Add them to current player lastPickedPosition next pos
        // Then delete the opponent parallel balls

        console.group('Pickables: ', [
          isMyPickingPosNumValid,
          opponentPickablePos[0],
          opponentPickablePos[1]
        ]);

        opponentPickableNum = // If both parallel positions contain balls, the set them as pickable in reverse.
          opponentPickablePos[0] !== '0' &&
          opponentPickablePos[1] !== '0' &&
          Number(opponentPickablePos[0]) +
          Number(opponentPickablePos[1]);

        opponentPickableNum = isPossibleCaseIndexValid && isMyPickingPosNumValid && opponentPickableNum;

      }
    }
    console.log('opponentPickableNum: ', opponentPickableNum);

    return opponentPickableNum;
  }

  pickFromPos(side, event) {

    // console.log(this.checkReversableMove(event.target.id));

    if (!this.moving) {

      this.moving = true;

      const pos = event.target.id;
      const posContentNo = this.elemTxtNumById(`${ pos }`);

      posContentNo > 1 && this.addCurrentAndBallClass(pos);

      if (this.isPlayer1 == false && this.isPlayer2 == false) {
        if (side === '0') {
          this.isPlayer1 = true;
        } else {
          this.isPlayer2 = true;
        }
        this.gameStartedAt = new Date();
        console.warn('GAME STARTED AT :', this.gameStartedAt)
      }

      let handPick = event.target.innerText;

      this.previousPickPos = pos;

      const hpNbr = Number(handPick);

      if (hpNbr) {
        hpNbr > 1
          ? this.dropAPick(pos)
          : alert('You cant\' play one ball!')
      } else {
        alert('No balls here!')
      }
    } else {
      alert('Wait for the previous move to end...')
    }


  }

  addCurrentAndBallClass(posId) {

    // Get all nav links
    const positions = document.querySelectorAll('.pos');

    for (let i = 0; i < positions.length; i++) {
      positions[i].classList.remove('current');
      positions[i].id === posId &&
      positions[i].classList.add('current');

      for (let className of Array.from(positions[i].classList)) {
        className.startsWith("ball") && positions[i].classList.remove(className);
      }

      let refElContent;

      refElContent = positions[i].innerHTML;
      const ballClass = 'ball' + ( refElContent > 1 ? 's' : '' ) + '-' + refElContent;
      positions[i].classList.add(ballClass);
    }
  }

  dropAPick(startPos) {

    let opponentReversePickableNum = this.checkReversableMove(startPos);

    // Set initial next position expected move
    let nextPos = opponentReversePickableNum ? this.move(startPos).nextRevPos : this.move(startPos).nextPos;
    let currentPos, nextValueBefore, nextValueAfter;

    setTimeout(() => {

      this.playSound('pick');

      this.handPick = this.elemTxtNumById(`${ startPos }`);
      document.getElementById(startPos).innerText = '0';

      currentPos = this.move(startPos).currentPos;

      !this.handPick && ( this.handPick = this.pickFromOpponent );

      const intervalId = setInterval(() => {

        console.log('Remain from hand pick: ' + this.handPick);
        console.log('NEXT : ' + nextPos);

        if (this.handPick === 0) {
          clearInterval(intervalId);

          console.log('CURRENT POS: ', currentPos);

          const mySide = currentPos.charAt(0);
          const opponentSide = mySide == '1' ? '2' : '1';
          const currentPos2Digits = currentPos.substring(1);

          let oppParallelFirstLinePos, oppParallelLastLinePos;

          const isFistLineS1 = mySide == '1' && currentPos.charAt(1) == '2';
          const isFistLineS2 = mySide == '2' && currentPos.charAt(1) == '1';

          if (nextValueAfter > 1) {

            const isFirstLine = isFistLineS1 || isFistLineS2;

            if (isFirstLine) {

              if (isFistLineS1) {

                oppParallelFirstLinePos = `${ opponentSide }${ Number(currentPos2Digits) - 10 }`;
                oppParallelLastLinePos = `${ opponentSide }${ currentPos2Digits }`;

              } else if (isFistLineS2) {
                oppParallelFirstLinePos = `${ opponentSide }${ Number(currentPos2Digits) + 10 }`;
                oppParallelLastLinePos = `${ opponentSide }${ currentPos2Digits }`;
              }

              const oppParallelFirstLineValue = this.elemTxtById(`${ oppParallelFirstLinePos }`);
              const oppParallelLastLineValue = this.elemTxtById(`${ oppParallelLastLinePos }`);

              this.pickFromOpponent =
                Number(oppParallelFirstLineValue) !== 0 &&
                Number(oppParallelLastLineValue) !== 0 &&
                ( Number(oppParallelFirstLineValue) + Number(oppParallelLastLineValue) );

              console.log('HERE IS FIRST LINE OPP VALUE: ', oppParallelFirstLineValue);
              console.log('HERE IS LAST LINE OPP VALUE: ', oppParallelLastLineValue);
              console.log('HERE IS OPP TOTAL VALUE: ', this.pickFromOpponent);
            }

            // If we are on the drop ends on the first line with more than 1 ball,
            // and where the opponent parallel 2 positions have more than 1 ball for each
            if (this.pickFromOpponent && isFirstLine) {

              const opponentParallels = [
                this.elemById(`${ oppParallelFirstLinePos }`),
                this.elemById(`${ oppParallelLastLinePos }`)
              ];

              for (let element of opponentParallels) element.classList.add('picking-from-opp');

              setTimeout(() => {

                for (let element of opponentParallels) {
                  element.classList.remove('picking-from-opp');
                  element.innerText = '0';
                }

                this.playSound('pick');

                console.log('PREVIOUS PICK POSITION: ', this.previousPickPos);

                if (this.checkEndGame()) {
                  clearInterval(intervalId);
                  this.moving = false;
                } else {
                  this.dropAPick(this.previousPickPos)
                }

              }, this.moveInterval * 2)

            } else {

              setTimeout(() => {

                this.previousPickPos = currentPos;
                this.dropAPick(currentPos)

              }, this.moveInterval)
            }

          } else {
            this.moving = false;
          }

        } else {
          console.log('POS FOR ACTION: ', nextPos);

          // Do play action
          console.log('Do action here....');

          nextValueBefore = this.elemTxtNumById(`${ nextPos }`);

          document.getElementById(nextPos).innerText = nextValueBefore + 1 + '';

          nextValueAfter = this.elemTxtNumById(`${ nextPos }`);

          console.log('BEFORE: ', nextValueBefore, 'AFTER: ', nextValueAfter);


          currentPos = this.move(nextPos).currentPos;

          // Next position while moving
          nextPos = opponentReversePickableNum ? this.move(nextPos).nextRevPos : this.move(nextPos).nextPos;

          console.log('NEXT MOVE IS: ', nextPos, 'MY CURRENT POS IS: ', currentPos);

          this.addCurrentAndBallClass(currentPos);

          this.playSound('move');

          this.handPick--;
        }

      }, this.moveInterval);

    }, this.moveInterval * 2);
  }

  getPositions(): any {

    let posF = [], posB = [];

    for (let j = 11; j <= 28; j++) {
      j >= 11 && j <= 18 && posF.push(`${ 29 - j }`);
      j >= 21 && j <= 28 && posB.push(`${ 49 - j }`);
    }

    return [[posF, posB], [posF, posB]];
  }

  move(pos) {

    let
      nextPos,
      nextRevPos,
      currentPos,
      currentKeyPos;

    const
      ground = this.getPositions(),
      sideType = pos.charAt(0),
      side = [...ground[0][0], ...( ( ground[0][1] ).reverse() )];

    currentKeyPos = side.indexOf(pos.substring(1));

    currentPos = pos;

    console.log('CURRENT POS: ', currentPos);

    nextPos = sideType + ( currentKeyPos === 0 ? side[15] : side[currentKeyPos - 1] );
    nextRevPos = sideType + ( currentKeyPos === 15 ? side[0] : side[currentKeyPos + 1] );

    return { nextPos, currentPos, nextRevPos }
  }

  private playSound(sound) {
    sound = `../assets/sounds/${ sound }.mp3`;
    sound && ( new Audio(sound) ).play()
  }

  // checkNetworkSpeed() {
  //   // https://stackoverflow.com/questions/5529718/how-to-detect-internet-speed-in-javascript
  //   // https://codepen.io/the_joshb/pen/jBJdi
  //   // https://stackoverflow.com/questions/40055366/javascript-detect-internet-speed-bandwidth
  //
  //   // <h1 id="progress">JavaScript is turned off, or your browser is realllllly slow</h1>
  //
  //   const eventName = 'load';
  //   const handlerName = this.initiateSpeedDetection;
  //   const target = ( <any>window );
  //
  //   if (target.addEventListener) target.addEventListener(eventName, handlerName, false);
  //   else if (target.attachEvent) target.attachEvent("on" + eventName, handlerName);
  //   else target["on" + eventName] = handlerName;
  // }
  //
  // private showProgressMessage(msg) {
  //   if (console) {
  //     if (typeof msg == "string") console.log(msg);
  //     else for (let i = 0; i < msg.length; i++) console.log(msg[i]);
  //   }
  //
  //   const oProgress = document.getElementById("progress");
  //
  //   oProgress && ( oProgress.innerHTML = ( typeof msg == "string" ) ? msg : msg.join("<br />") );
  // }
  //
  // private initiateSpeedDetection() {
  //   this.showProgressMessage("Loading the image, please wait...");
  //   window.setTimeout(this.measureConnectionSpeed, 1);
  // };
  //
  // private measureConnectionSpeed() {
  //   let startTime, endTime;
  //   const download = new Image();
  //   const $this = this;
  //   download.onload = () => {
  //     endTime = ( new Date() ).getTime();
  //     showResults();
  //   };
  //
  //   download.onerror = (err, msg) => $this.showProgressMessage("Invalid image, or error downloading");
  //
  //   startTime = ( new Date() ).getTime();
  //   const cacheBuster = "?nnn=" + startTime;
  //   download.src = this.imageAddr + cacheBuster;
  //
  //   function showResults() {
  //
  //     const duration: any = ( endTime - startTime ) / 1000;
  //     const bitsLoaded: any = $this.downloadSize * 8;
  //     const speedBps: any = ( bitsLoaded / duration ).toFixed(2);
  //     const speedKbps: any = ( speedBps / 1024 ).toFixed(2);
  //     const speedMbps: any = ( speedKbps / 1024 ).toFixed(2);
  //
  //     $this.showProgressMessage([
  //       "Your connection speed is:",
  //       speedBps + " bps",
  //       speedKbps + " kbps",
  //       speedMbps + " Mbps"
  //     ]);
  //   }
  // }
}
