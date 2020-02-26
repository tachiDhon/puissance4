(function($) {

  $.fn.mypuissance4 = function() {

    var nbrRow = 5;
    var nbrCol = 6;
    var end = false; //Vérifie si le jeu est terminé?
    var turn = 0; //le compteur de tourne
    var record = [0, 0]; //Enregistre le gain de chaque jouer

    //Le Board à jouer de bonne taille
    $('#board, body').css("height", 6 * nbrRow + 'em')
    $('#board').css("width", 6 * nbrCol + 'em')
    //$('body').css('height', 6*nbrRow+'em')

    //Constructeur de nos board
    board = {
      value: [], //Ranger l'état de chaque espace sur le board  
      $name: [], //Ranger le nom jQuery de chaque espace (e.g. $('.colonne:nth-child(1) .space:nth-child(1)'))
      columnEmpty: [] //Ranger combien des espaces libres restent dans chaque colonne
    }
    //Créer le board
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

    $('.controls').css({
      right: (-6 - 3 * nbrCol) + 'em'
    });

    //Animer le board
    $('#board').slideDown(1000, 'swing');


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

    //Le tour du quelle jouer? 1 = player 1, -1 = player 2.
    var whoseTurn = 1;

    $('#board').on('click', '.column', function() {

      if (!end) { //Si le jeu est fini.

        var columnNumber = Number($(this).attr('id')); //Le colonne où l'on clique 

        if (board.columnEmpty[columnNumber] > 0) { //Tester pour vérifier si le colonne n'est pas rempli.
          var bottom = board.columnEmpty[columnNumber] - 1; //L'espacement le plus bas dans la colonne.
          //Attribuer cet espace à un jouer approprié
          board.$name[columnNumber][bottom].stop().addClass('player' + (-0.5 * whoseTurn + 1.5)).removeClass('empty').css('opacity', '1');
          //Fade l'espace de haut s'il existe toujours.
          if (bottom > 0)
            board.$name[columnNumber][bottom - 1].stop().fadeTo(200, 0.2);
          board.value[columnNumber][bottom] = whoseTurn;

          board.columnEmpty[columnNumber]--; //Se souvient du colonne si elle est remplie ou pas.
          end = checkVictory(board, whoseTurn, bottom, columnNumber); //Checker le gagnant?
          if (end) {
            endAnimation(board);
          }

          whoseTurn *= -1; //Changer le tour du jouer.
          turn++; //Mise à jour du turn compteur.

          if (turn == nbrCol * nbrRow) {
            $('title').text("Pangolins!");
            end = true;
            restartButton(columnNumber, bottom, 1000);
          }
        }
      }
    });
    
    //Quelqu'un a gagné le jeu?
    function checkVictory(board, whoseTurn, row, col) {

      var connections = 1; //Combien de connection a été fiat?
      //2 variables, determinant la direction dans laquelle on check.
      var up = 0;
      var right = 0;

      //Pour fading Animation
      var singleMatch = false;
      var matches = 0;

      //Matrice de la combinaison potentiellement gagnante 
      var winningCombo = [
        [col, row]
      ];


      for (var i = 0; i < 4; i++) { //Verifie sur la 4 directions. 

        switch (i) {
          case 0:
            up = 0;
            right = 1;  //check le droit.
            break;
          case 1:
            up = 1;
            right = 1; //check le diagonale gauche.
            break;
          case 2:
            up = 1;
            right = 0; //check le haut.
            break;
          case 3:
            up = 1;
            right = -1; //check le diagonale droit.
            break;
        }

        for (var j = 0; j < 2; j++) { //Verifie les deux directions!
          for (var k = 1; k < 4; k++) { //Verifie 3 espaces en avant.

            var checkX = (col + k * right);
            var checkY = (row + k * up);

            //Toujours en board du jeu?
            if (checkY < nbrRow && checkX < nbrCol && checkY >= 0 && checkX >= 0) {

              //La prochaine tuile(ronde) de la même jouer?
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
          //Verifie l'autre direction.
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

    //Annoncer le gagnant.
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

      restartButton(end[x][0], end[x][1], 2000);
    }

    //Créer le bouton de restart.
    function restartButton(col, row, delay) {
      window.setTimeout(function() {
        board.$name[col][row].fadeTo(500, 0, function() {
          $(this).css('background-color', 'white').fadeTo(500, 1);
          oldText = $(this).children().text();
          $(this).children().css('font-weight', 'bold').text("Rejoueur?");
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

    //Reset le jeu & affiche le gagnant du deux jouer.
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
    //Numeroter tous les espaces.
    function numberSpaces(board) {
      for (var i = 0; i < nbrCol; i++) {

        for (var j = 0; j < nbrRow; j++) {

          var value = (nbrCol * j) + i + 1; //Nombre totale des espaces.
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