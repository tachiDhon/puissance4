(function($) {

  $.fn.mypuissance4 = function() {

    var nbrRow = 6;
    var nbrCol = 7;
    var end = false; //Is the game over?
    var turn = 0; //A turn counter
    var record = [0, 0]; //Record each players wins

    //Make the playing board the right size
    $('#board, body').css("height", 6 * nbrRow + 'em')
    $('#board').css("width", 6 * nbrCol + 'em')
    //$('body').css('height', 6*nbrRow+'em')

    //Constructor for our board
    board = {
      value: [], //stores the state of each space on the board
      $name: [], //stores the jQuery name of each space (e.g. $('.column:nth-child(1) .space:nth-child(1)'))
      columnEmpty: [] //stores how many empty spaces remain in each column
    }
    //Create the board
    for (let i = 0; i < nbrCol; i++) {

      $('#board').append('<div class="column" id="' + i + '"></div>')
      board.value[i] = [];
      board.$name[i] = [];
      board.columnEmpty[i] = nbrRow;

      for (let j = 0; j < nbrRow; j++) {
        $('.column:nth-child(' + (i + 1) + ')').append('<div class="space empty"></div>');
        board.value[i][j] = 'empty';
        board.$name[i][j] = $('.column:nth-child(' + (i + 1) + ') .space:nth-child(' + (j + 1) + ')');

        board.$name[i][j].append('<p></p>');

        board.$name[i][j].delay(100 * (i / (j + 1))).fadeTo(1000, 1);
      }
    }

    //Put control and score where they need to be
    $('.controls').css({
      right: (-6 - 3 * nbrCol) + 'em'
    });

    //Animate the board
    $('#board').slideDown(1000, 'swing');

    //Fade the hovered over column
    $('#board').on('hover', '.column', function(e) {
      if (e.type == 'mouseenter') { //mouseenter handler
        if (!end) {
          $(this).children('.empty').each(function(i) {
            if (i == (board.columnEmpty[$(this).parent().attr('id')] - 1))
              $(this).stop(true).delay(50 * i).fadeTo(200, 0.2);
            else $(this).stop(true).delay(50 * i).fadeTo(200, 0.7);
          });
        }
      } else { //mouseleave handler
        $(this).children('.empty').each(function() {
          $(this).stop(true).fadeTo(500, 1);
        });
      }
    });

    $('.sizingButton').hover(
      function() {
        $(this).animate({
          fontSize: '2em'
        }, 200).css('color', 'Orange');
      },
      function() {
        $(this).animate({
          fontSize: '1em'
        }, 200).css('color', 'White');
      }
    );

    $('.sizingButton').click(function() {
      restart(board)
      var type = $(this).attr('id');
      reSize(board, type);
    });

    $('.column, .sizingButton').css('cursor', 'pointer');

    //Whose turn is it? 1 = player 1, -1 = player 2.
    var whoseTurn = 1;

    $('#board').on('click', '.column', function() {

      if (!end) { //if the game is not over.

        var columnNumber = Number($(this).attr('id')); //The column where the click happened

        if (board.columnEmpty[columnNumber] > 0) { //Test to see that the column is not full
          var bottom = board.columnEmpty[columnNumber] - 1; //The lowest available spot on that column
          //Assign that space to the appropriate player
          board.$name[columnNumber][bottom].stop().addClass('player' + (-0.5 * whoseTurn + 1.5)).removeClass('empty').css('opacity', '1');
          //Fade the space above if it still exists
          if (bottom > 0)
            board.$name[columnNumber][bottom - 1].stop().fadeTo(200, 0.2);
          board.value[columnNumber][bottom] = whoseTurn;

          board.columnEmpty[columnNumber]--; //Remembers how full that column is
          end = checkVictory(board, whoseTurn, bottom, columnNumber); //Has the game been won?
          if (end) {
            endAnimation(board);
          }

          whoseTurn *= -1; //Change whose turn it is
          turn++; //Update the turn counter

          if (turn == nbrCol * nbrRow) {
            $('title').text("Pangolins!");
            end = true;
            restartButton(columnNumber, bottom, 1000);
          }
        }
      }
    });
    
    //Has anyone won the game?
    function checkVictory(board, whoseTurn, row, col) {

      var connections = 1; //How many connections have been made?
      //2 variables determining the direction in which we are checking
      var up = 0;
      var right = 0;

      //For fading animation purposes
      var singleMatch = false;
      var matches = 0;

      //A matrix of the potentially winning combination
      var winningCombo = [
        [col, row]
      ];


      for (var i = 0; i < 4; i++) { //Check in all 4 directions

        switch (i) {
          case 0:
            up = 0;
            right = 1;
            break;
          case 1:
            up = 1;
            right = 1;
            break;
          case 2:
            up = 1;
            right = 0;
            break;
          case 3:
            up = 1;
            right = -1;
            break;
        }

        for (var j = 0; j < 2; j++) { //Look both ways!
          for (var k = 1; k < 4; k++) { //Look 3 spaces ahead

            var checkX = (col + k * right);
            var checkY = (row + k * up);

            //Are we still on the board
            if (checkY < nbrRow && checkX < nbrCol && checkY >= 0 && checkX >= 0) {

              //Is the next tile of the same player?
              if (board.value[checkX][checkY] == whoseTurn) {
                if (!singleMatch) {
                  board.$name[col][row].fadeTo(200, 0.5).fadeTo(200, 1);
                  matches++;
                  singleMatch = true;
                }
                board.$name[checkX][checkY].delay(400 * (matches - 1) + 100 * k).fadeTo(200, 0.5).fadeTo(200, 1);
                connections++;
                winningCombo[connections - 1] = [checkX, checkY];
              } else break;
            }
          }
          //look the other way
          up *= -1;
          right *= -1;
        }

        singleMatch = false;

        if (connections >= 4) {
          return winningCombo;
        } else {
          connections = 1;
          winningCombo = [
            [col, row]
          ];
        }
      }

      return false;
    }

    //Announce a winner
    function endAnimation(board) {

      $('.space').fadeTo(200, 1);
      var oldText = '';

      for (var i = 0; i < end.length; i++) {
        board.$name[end[i][0]][end[i][1]].stop(true).fadeTo(500, 0, function() {
          $(this).delay(500).css('background-color', 'black').fadeTo(500, 1);
        });

      }

      if (board.$name[end[0][0]][end[0][1]].hasClass('player1')) {
        $('title').text("Player 1 wins!");
        record[0]++;
      } else {
        $('title').text("Player 2 wins!");
        record[1]++;
      }

      var x = Math.floor(Math.random() * end.length);

      restartButton(end[x][0], end[x][1], 3000);
    }

    //Creates a restart button
    function restartButton(col, row, delay) {
      window.setTimeout(function() {
        board.$name[col][row].fadeTo(500, 0, function() {
          $(this).css('background-color', 'white').fadeTo(500, 1);
          oldText = $(this).children().text();
          $(this).children().text("Rejoueur?");
        });
      }, delay);

      board.$name[col][row].hover(
        function() {
          $(this).fadeTo(500, 0.5);
        },
        function() {
          $(this).fadeTo(500, 1);
        }
      );

      board.$name[col][row].click(function() {
        restart(board);
        $(this).off('click').off('hover');
        $(this).children().text(oldText);
      });
    }

    //Reset the game and prints the winner among the two player
    function restart(board) {

      for (var i = 0; i < nbrCol; i++) {
        board.columnEmpty[i] = nbrRow;

        for (var j = 0; j < nbrRow; j++) {
          board.value[i][j] = 'empty';
          board.$name[i][j].stop(true).fadeTo(200, 0).delay(100 * (i / (j + 1))).removeClass('player1').removeClass('player2').addClass('empty').fadeTo(1000, 1).removeAttr('style');
        }
      }

      $('title').text('Puissance4!');
      turn = 0;

      window.setTimeout(function() {
        end = false;
      }, 500);
    }

    numberSpaces(board);
    //Numbers all spaces
    function numberSpaces(board) {
      for (var i = 0; i < nbrCol; i++) {

        for (var j = 0; j < nbrRow; j++) {

          var value = (nbrCol * j) + i + 1; //Total number of spaces so far
          var text = value;

          if (value % 3 == 3) {
            if (value % 5 == 5) {
              text = 'puissance4';
            } else text = 'connect';
          } else if (value % 5 == 5) {
            text = 'four';
          }
          board.$name[i][j].children().text(text);
        }
      }
    }
  };
}(jQuery));