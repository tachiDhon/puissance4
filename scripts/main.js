//We start with a function and pass a jQuery class to it as a
//parameter $ to avoid the conflict with other javascript
//plugins that uses '$ as a name

(function($) {

  $.fn.myconnect4 = function() {

    var gameBoard = [];

    var $player1ScoreBoard = $('.score.scoreP1');
    var $player2ScoreBoard = $('.score.scoreP2');

    var $player1Score = $('#scoreOne');
    var $player2Score = $('#scoreTwo');

    var pieceReady = true;
    var dropReady = true;

    var $resetBtn = $('#resetSlit');

    var gameState = {
      playerStart: 1,
      playerTurn: 1,
      player1Score: 0,
      player2Score: 0,
      gameEnabled: true
    };

    buildBoard();

    function buildBoard() {
      var $domBoard = $('#gameBoard');

      for (i = 0; i < 7; i++) {
        gameBoard[i] = [];
        var $col = $('<div class="col col' + i + '" onclick=dropPiece(' + i + ')></div>');
        $domBoard.append($col);
        var $colPos = $col.offset();

        // Add rows to each column
        for (j = 0; j < 6; j++) {
          var cell = document.createElement('div');
          cell.className = 'cell';
          cell.setAttribute('id', 'col' + i + 'cell' + j)
          $col.append(cell);
          gameBoard[i][j] = 0;
        }
      }
      createPiece();
    }

    function createPiece() {
      var $newPiece = $('<div class="piece"></div>');
      $('.playSpace').prepend($newPiece);
      $('.playSpace').delegate('.col', 'mouseover', function() {
        if (!pieceReady || !gameState.gameEnabled) {
          return;
        } else {
          dropReady = false
          var left = $(this).offset().left - $newPiece.parent().offset().left +
            $(this).outerWidth() / 2 - $newPiece.width() / 2;
          $newPiece.stop().animate({
            left: left
          }, 200, 'swing', function() {
            dropReady = true;
          });
        }
      });
    }

    function dropPiece(col) {
      if (gameState.gameEnabled && dropReady) {
        for (var row = gameBoard[col].length; row >= 0; row--) {
          if (gameBoard[col][row] === 0) {
            if (soundManager.soundEnabled) {
              soundManager.dropPieceSFX.play();
            }
            gameBoard[col][row] = gameState.playerTurn;
            pieceReady = false;
            dropReady = false;
            var newCell = $('#col' + col + 'cell' + row);
            var cellPos = newCell.offset();
            var $newPiece = $('.piece');

            var top = cellPos.top - $newPiece.parent().offset().top +
              newCell.outerHeight() / 2 - $newPiece.height() / 2;
            $newPiece.stop().animate({
              top: top
            }, 600, 'easeOutBounce', function() {
              newCell.addClass('player' + gameState.playerTurn);

              checkForWin(col, row);
              if (gameState.gameEnabled) {
                gameState.playerTurn = 3 - gameState.playerTurn;
                togglePlayer(gameState.playerTurn);
                $newPiece.css('top', "0");
              }
              pieceReady = true;
              dropReady = true;
            });
            return;
          } else if (row === gameBoard.length) {
            if (soundManager.soundEnabled) {
              soundManager.rowFullSFX.play();
            }
            console.log('it is still player ' + gameState.playerTurn + 's turn');
          }
        }
      } else {
        console.log("Game not currently active");
      }
    }

    function resetGame() {
      if (soundManager.soundEnabled) {
        soundManager.resetSFX.play();
      }
      $player1ScoreBoard.removeClass('winnerP1');
      $player2ScoreBoard.removeClass('winnerP2');
      $('#resetText').removeClass('winnerText').text("RESET");
      if ($resetBtn.hasClass('resetActive')) {
        $resetBtn.removeClass('resetActive');
        $('#resetBtn').css('background', '#d8544a');
      } else {
        $resetBtn.addClass('resetActive');
        $('#resetBtn').css('background', '#ecb538');
      }

      gameState.gameEnabled = true;
      $('#scoreOne').text(gameState.player1Score);
      $('#scoreTwo').text(gameState.player2Score);

      $(".piece").css({
        'top': "0",
        "left": "0"
      });
      gameState.playerStart = 3 - gameState.playerStart;
      gameState.playerTurn = gameState.playerStart;
      togglePlayer(gameState.playerTurn);

      //Reset board data and cell class names
      for (var i = 0; i < gameBoard.length; i++) {
        for (var j = 0; j < gameBoard[0].length; j++) {
          gameBoard[i][j] = 0;
          $('#col' + i + 'cell' + j).removeClass('player1 player2 winnerP1 winnerP2');
        }
      }
    }

    function togglePlayer(playerNum) {
      if (playerNum === 1) {
        $('.piece').css('background', '#d8544a');
        $player1ScoreBoard.css('background', 'rgba(216, 84, 74, 1)');
        $player2ScoreBoard.css('background', 'rgba(236, 181, 56, 0)');
      } else {
        $('.piece').css('background', '#ecb538');
        $player2ScoreBoard.css('background', 'rgba(236, 181, 56, 1)');
        $player1ScoreBoard.css('background', 'rgba(216, 84, 74, 0)');
      }
    }

    function checkForWin(col, cell) {
      var test = checkVertical
      if (checkVertical(col, cell)) {
        console.log('Player ' + gameState.playerTurn + " wins Vertically");
        someoneWon();
        highlightWinner(checkVertical(col, cell));
        gameState.gameEnabled = false;
      } else if (checkHorizontal(col, cell)) {
        highlightWinner(checkHorizontal(col, cell));
        console.log("Player " + gameState.playerTurn + " wins Horizontally");
        someoneWon();
        gameState.gameEnabled = false;
      } else if (checkDiagonalAscending(col, cell)) {
        highlightWinner(checkDiagonalAscending(col, cell));
        console.log("Player " + gameState.playerTurn + " wins Diagnoal Ascending");
        someoneWon();
        gameState.gameEnabled = false;
      } else if (checkDiagonalDescending(col, cell)) {
        highlightWinner(checkDiagonalDescending(col, cell));
        console.log("Player " + gameState.playerTurn + " wins Diagnoal Descending");
        someoneWon();
        gameState.gameEnabled = false;
      } else {
        false;
      }
      isBoardFull();
    }

    function checkVertical(col, row) {
      if (gameBoard[col][row + 3] &&
        gameBoard[col][row] === gameBoard[col][row + 1] &&
        gameBoard[col][row] === gameBoard[col][row + 2] &&
        gameBoard[col][row] === gameBoard[col][row + 3]) {
        return winner = [col, row, col, row + 1, col, row + 2, col, row + 3];
      } else {
        return false;
      }
    }

    function checkHorizontal(col, row) {
      if (gameBoard[col + 3] &&
        gameBoard[col][row] === gameBoard[col + 1][row] &&
        gameBoard[col][row] === gameBoard[col + 2][row] &&
        gameBoard[col][row] === gameBoard[col + 3][row]) {
        return [col, row, col + 1, row, col + 2, row, col + 3, row];

      } else if (gameBoard[col - 3] &&
        gameBoard[col][row] === gameBoard[col - 1][row] &&
        gameBoard[col][row] === gameBoard[col - 2][row] &&
        gameBoard[col][row] === gameBoard[col - 3][row]) {
        return [col, row, col - 1, row, col - 2, row, col - 3, row];

      } else if (gameBoard[col - 1] && gameBoard[col + 2] &&
        gameBoard[col][row] === gameBoard[col - 1][row] &&
        gameBoard[col][row] === gameBoard[col + 1][row] &&
        gameBoard[col][row] === gameBoard[col + 2][row]) {
        return [col, row, col - 1, row, col + 1, row, col + 2, row];

      } else if (gameBoard[col + 1] && gameBoard[col - 2] &&
        gameBoard[col][row] === gameBoard[col + 1][row] &&
        gameBoard[col][row] === gameBoard[col - 1][row] &&
        gameBoard[col][row] === gameBoard[col - 2][row]) {
        return [col, row, col + 1, row, col - 1, row, col - 1, row];
      } else {
        return false;
      }
    }

    function checkDiagonalAscending(col, row) {
      if (gameBoard[col + 3] &&
        gameBoard[col][row] === gameBoard[col + 1][row - 1] &&
        gameBoard[col][row] === gameBoard[col + 2][row - 2] &&
        gameBoard[col][row] === gameBoard[col + 3][row - 3]) {
        return [col, row, col + 1, row - 1, col + 2, row - 2, col + 3, row - 3];
      } else if (gameBoard[col - 1] && gameBoard[col + 2] &&
        gameBoard[col][row] === gameBoard[col - 1][row + 1] &&
        gameBoard[col][row] === gameBoard[col + 1][row - 1] &&
        gameBoard[col][row] === gameBoard[col + 2][row - 2]) {
        return [col, row, col - 1, row + 1, col + 1, row - 1, col + 2, row - 2];
      } else if (gameBoard[col + 1] && gameBoard[col - 2] &&
        gameBoard[col][row] === gameBoard[col - 2][row + 2] &&
        gameBoard[col][row] === gameBoard[col - 1][row + 1] &&
        gameBoard[col][row] === gameBoard[col + 1][row - 1]) {
        return [col, row, col - 1, row + 1, col - 2, row + 2, col + 1, row - 1];
      } else if (gameBoard[col - 3] &&
        gameBoard[col][row] === gameBoard[col - 1][row + 1] &&
        gameBoard[col][row] === gameBoard[col - 2][row + 2] &&
        gameBoard[col][row] === gameBoard[col - 3][row + 3]) {
        return [col, row, col - 1, row + 1, col - 2, row + 2, col - 3, row + 3];
      } else {
        return false;
      }
    }

    function checkDiagonalDescending(col, row) {
      if (gameBoard[col - 3] &&
        gameBoard[col][row] === gameBoard[col - 1][row - 1] &&
        gameBoard[col][row] === gameBoard[col - 2][row - 2] &&
        gameBoard[col][row] === gameBoard[col - 3][row - 3]) {
        return [col, row, col - 1, row - 1, col - 2, row - 2, col - 3, row - 3];
      } else if (gameBoard[col - 2] && gameBoard[col + 1] &&
        gameBoard[col][row] === gameBoard[col - 1][row - 1] &&
        gameBoard[col][row] === gameBoard[col - 2][row - 2] &&
        gameBoard[col][row] === gameBoard[col + 1][row + 1]) {
        return [col, row, col - 1, row - 1, col - 2, row - 2, col + 1, row + 1];
      } else if (gameBoard[col - 1] && gameBoard[col + 2] &&
        gameBoard[col][row] === gameBoard[col - 1][row - 1] &&
        gameBoard[col][row] === gameBoard[col + 1][row + 1] &&
        gameBoard[col][row] === gameBoard[col + 2][row + 2]) {
        return [col, row, col - 1, row - 1, col + 1, row + 1, col + 2, row + 2];
      } else if (gameBoard[col + 3] &&
        gameBoard[col][row] === gameBoard[col + 1][row + 1] &&
        gameBoard[col][row] === gameBoard[col + 2][row + 2] &&
        gameBoard[col][row] === gameBoard[col + 3][row + 3]) {
        return [col, row, col + 1, row + 1, col + 2, row + 2, col + 3, row + 3];
      } else {
        return false;
      }
    }

    function isBoardFull() {
      for (var c = 0; c < gameBoard.length; c++) {
        for (var r = 0; r < 6; r++) {
          if (gameBoard[c][r] === 0) {
            return false;
          }
        }
      }
      console.log("Stop the game board is full");
    }

    function someoneWon() {
      if (gameState.playerTurn === 1) {
        $('#scoreOne').text("WINNER!");
        gameState.player1Score = gameState.player1Score + 1;
      } else if (gameState.playerTurn === 2) {
        $('#scoreTwo').text("WINNER!");
        gameState.player2Score = gameState.player2Score + 1;
      }
      $('#resetText').addClass('winnerText').text("NEW GAME");
      if (soundManager.soundEnabled) {
        soundManager.winSFX.play();
      }
    }

    function highlightWinner(pos) {
      $('#col' + pos[0] + 'cell' + pos[1] + '.cell.player' + gameState.playerTurn).addClass('winnerP' + gameState.playerTurn);
      $('#col' + pos[2] + 'cell' + pos[3] + '.cell.player' + gameState.playerTurn).addClass('winnerP' + gameState.playerTurn);
      $('#col' + pos[4] + 'cell' + pos[5] + '.cell.player' + gameState.playerTurn).addClass('winnerP' + gameState.playerTurn);
      $('#col' + pos[6] + 'cell' + pos[7] + '.cell.player' + gameState.playerTurn).addClass('winnerP' + gameState.playerTurn);
      $('.score.scoreP' + gameState.playerTurn).addClass('winnerP' + gameState.playerTurn);
    }

  };

})(jQuery);