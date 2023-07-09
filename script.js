//DECLARATION DE MES VARIABLES
//DIMENSIONS DU CANVAS (ESPACE DE DESSIN)
var canvasWidth         = 900;
var canvasHeight        = 600;
var blockSize           = 30;
//CONTEXTE DE JEU
var ctx;
//VITESSE DE JEU
var delay               = 100;
//OBJETS SERPENT ET POMME
var snakee;
var applee;
//DIMENSIONS DES BLOCS COMPOSANT LE CANVAS
var widthInBlock        = canvasWidth/blockSize;
var heightInBlock       = canvasHeight/blockSize;
//VARIABLE POUR STOCKER LE SCORE
var score;
//TIMER DU JEU
var timeout             = null;

//DECLARATION DE MES CONSTANTES
//GAME OVER
const GAME_OVER_TEXT         = "Game Over";
const TITLE_FONT             = '70px sans-serif';
const TITLE_COLOR            = '#000';
const TITLE_ALIGN            = 'center';
const TITLE_BASELINE         = 'middle';
//REJOUER   
const REPLAY_TEXT            = "Appuyez sur la barre d'espace pour rejouer.";
const REPLAY_FONT            = '30px sans-serif';
//DIRECTIONS
const DIRECTION_RIGHT        = 'right';
const DIRECTION_LEFT         = 'left';
const DIRECTION_UP           = 'up';
const DIRECTION_DOWN         = 'down';
//DIRECTION INVALIDE
const UNVALID_DIRECTION_TEXT = "Direction non-valide";


//DEMARRAGE DU JEU
init();

function init(){
    // CREATION DU CANVAS
    var canvas = document.createElement('canvas'); // <canvas></canvas>
    canvas.width = canvasWidth; // <canvas width="xxx"></canvas>
    canvas.height = canvasHeight; // <canvas width="xxx" height="xxx"></canvas>
    // AJOUT DU CANVAS EN 2D DANS LE BODY DE MON HTML
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    // INITIALISAION DE MES VARIABLES : SERPENT, POMME ET SCORE
    restart();
}

// FONCTION DE REMISE A  ZERO DU CANVAS
function refreshCanvas(){
    console.log("RefreshCanvas");
    // LE SERPENT AVANCE
    snakee.advance(); 
    // S'IL ENTRE EN COLLISION, GAME OVER
    if (snakee.checkCollision()){
        gameOver();
    } else {   
        // S'IL MANGE LA POMME
        if (snakee.isEatingApple(applee)){
            // LE SCORE AUGMENTE
            score++;
            snakee.ateApple = true;
            // LA POMME AURA UNE NOUVELLE POSITION CHAQUE FOIS QU'ELLE SERA MANGEE
            // NOUVELLE POSITION AUSSI SI ELLE APPARAIT SUR LE SERPENT
            do {
                applee.setNewPosition();
            } while (applee.isOnSnake(snakee));
        }
        // ON EFFACE LE CANVAS ET REINITIALISE SCORE, SERPENT ET POMME   
        ctx.clearRect(0,0,canvasWidth, canvasHeight); 
        drawScore();
        snakee.draw();
        applee.draw();
        // ON PREVOIT UN NOUVEAU REFRESH DU CANVAS
        timeout = setTimeout(refreshCanvas,delay);
    }
}

// QUAND LE JEU EST TERMINE, ON LE SIGNALE AU USER
function gameOver() {
    ctx.save();
    ctx.font         = TITLE_FONT;
    ctx.fillStyle    = TITLE_COLOR;
    ctx.textAlign    = TITLE_ALIGN;
    ctx.textBaseline = TITLE_BASELINE;
    ctx.fillText(GAME_OVER_TEXT, canvasWidth / 2, canvasHeight / 2 - 180);

    // ON LUI PROPOSE DE REJOUER EN APPUYANT SUR ESPACE
    ctx.font         = REPLAY_FONT;
    ctx.fillText(REPLAY_TEXT, canvasWidth / 2, canvasHeight / 2 - 120);
    ctx.restore();
}

// LE USER REJOUE APRES AVOIR APPUYE SUR ESPACE
function restart(){
    // REINITIALISATION DES VARIABLES
    snakee = new Snake ([[6,4], [5,4], [4,4], [3,4], [2,4]], DIRECTION_RIGHT);
    applee = new Apple ([10,10]);
    score = 0;
    if(timeout != null)
        clearTimeout(timeout);
    refreshCanvas();   
}

// AFFICHAGE DU SCORE AU MILIEU DU CANVAS
function drawScore(){
    ctx.save();
    var centreX = canvasWidth / 2;
    var centreY = canvasHeight / 2;
    ctx.fillText(score.toString(), centreX, centreY);
    ctx.restore();
}


// CONSTRUCTEUR DE L'OBJET SERPENT
function Snake(body, direction){
    this.body = body;
    this.direction = direction;
    this.ateApple = false;
    // DESSINE LE SERPENT EN SUITE DE BLOCS
    this.draw = function(){
        ctx.save();
        var x;
        var y;
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--snakee-color');
        for(var i = 0; i < this.body.length; i++){
            //drawBlock(ctx, this.body[i], "snakee");
            x = this.body[i][0] * blockSize;
            y = this.body[i][1] * blockSize;
            ctx.fillRect(x, y, blockSize, blockSize);
        }
        ctx.restore();     
    };
    // LE SERPENT AVANCE : ON LUI AJOUTE UN BLOC A LA PROCHAINE POSITION
    // S'IL AVANCE SANS AVOIR MANGE DE POMME, ON LUI RETIRE LE DERNIER BLOC POUR QU'IL CONSERVE SA TAILLE
    this.advance = function(){
        var nextPosition = this.body[0].slice();
        switch(this.direction){
            //DECREMENTATION DE 1 BLOC POUR X SI LE SERPENT VA A GAUCHE
            case DIRECTION_LEFT:
                nextPosition[0] -= 1;
                break;
            //INCREMENTATION DE 1 BLOC POUR X SI LE SERPENT VA A DROITE
            case DIRECTION_RIGHT:
                nextPosition[0] += 1;
                break;
            //INCREMENTATION DE 1 BLOC POUR Y SI LE SERPENT VA EN BAS
            case DIRECTION_DOWN:
                nextPosition[1] += 1;
                break;
            //DECREMENTATION DE 1 BLOC POUR Y SI LE SERPENT VA EN HAUT
            case DIRECTION_UP:
                nextPosition[1] -= 1;
                break; 
            default :
                throw (UNVALID_DIRECTION_TEXT); 
        }
        //SI LE SERPENT N'A PAS MANGE DE POMME PENDANT SON ADVANCE, IL PERD SON DERNIER BLOC
        this.body.unshift(nextPosition);
        if(!this.ateApple){
            this.body.pop();
        } else {
            this.ateApple = false;
        }
    };
    //MAJ DE LA DIRECTION DU SERPENT A CONDITION QU'ELLE SOIT AUTORISEE
    this.setDirection = function(newDirection){
    var allowedDirections;
    switch(this.direction){
        //S'IL SE DIRIGE VERS LA GAUCHE OU LA DROITE, IL PEUT ENSUITE SE DIRIGER VERS LE HAUT OU LE BAS
        case DIRECTION_LEFT:
        case DIRECTION_RIGHT:
            allowedDirections= [DIRECTION_UP,DIRECTION_DOWN];
            break;
        //S'IL SE DIRIGE VERS LE HAUT OU LE BAS, IL PEUT ENSUITE SE DIRIGER VERS LA GAUCHE OU LA DROITE
        case DIRECTION_DOWN:
        case DIRECTION_UP:
            allowedDirections= [DIRECTION_LEFT, DIRECTION_RIGHT];
            break;
        //EXCLUSION D'AUTRES POSSIBILITES
        default :
            throw(UNVALID_DIRECTION_TEXT); 
    }
    //SI LES TOUCHES CHOISIES SONT VALIDES, LE SERPENT PREND LA DIRECTION CHOISIE
    if(allowedDirections.indexOf(newDirection)> -1){
        this.direction = newDirection;
    }
};

// VERIFICATION S'IL Y A COLLISION
this.checkCollision = function(){
    // AVEC UN MUR OU LUI-MEME
    
    var rest = this.body.slice(1);
    //SI LA POSITION X OU Y DU SERPENT DEPASSE CELLE DU CANVAS
    if (this.body[0][0] < 0 || 
        this.body[0][0] > widthInBlock - 1 || 
        this.body[0][1] < 0 || 
        this.body[0][1] > heightInBlock - 1) {
        //IL Y A COLLISION
        return true;
    }
    //SI LA POSITION X ET Y DU CORPS DU SERPENT EST LA MEME QU'UNE AUTRE PARTIE DE SON CORPS
    for(var i = 0; i < rest.length ; i++){
        if(this.body[0][0] == rest[i][0] && this.body[0][1] == rest[i][1]){
            //IL Y A COLLISION
            return true;
        }
    }  
    //SI AUCUN DES DEUX CAS NE SE PRODUIT, IL N'Y A PAS COLLISION
    return false;
};

// VERIFICATION SI LE SERPENT MANGE LA POMME (SI SA TETE ARRIVE SUR L'EMPLACEMENT DE CELLE-CI°)
this.isEatingApple = function(appleToEat){
    var head = this.body[0]; 
    if(head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1]){
      return true; 
    } else {
      return false;
    }
};
}

// CONSTRUCTEUR DE L'OBJET APPLE
function Apple(position){
    this.position = position;
    //CALCUL ALEATOIRE DE LA NOUVELLE POSITION
    this.setNewPosition = function(){
        var newX = Math.round(Math.random() * (widthInBlock - 1)); 
        var newY = Math.round(Math.random() * (heightInBlock - 1)); 
        this.position = [newX, newY];
    };
    // EMPECHE LA POMME D'APPARAITRE SUR LE SERPENT
    this.isOnSnake = function(snakeToCheck){

        for(var i = 0 ; i < snakeToCheck.body.length; i++){
            if(this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]){
                return true;
            }
        }

        return false;
    };

        // DESSIN DE LA POMME
    this.draw = function() {
        ctx.save();
        ctx.beginPath();
        var x = this.position[0] * blockSize + blockSize / 2;
        var y = this.position[1] * blockSize + blockSize / 2;
        var radius = blockSize / 2;
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--applee-color');
        ctx.arc(x, y, radius, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.restore();
    };
    
    }

//EVENEMENTS QUAND LES TOUCHES SUIVANTES SONT ENFONCEES
document.addEventListener("keydown", handleKeyDown);

 //LA DIRECTION DU SERPENT CHANGE EN FONCTION DE LA FLECHE DU CLAVIER CHOISIE
function handleKeyDown(event){

    var newDirection;

    switch( event.key) {
        case "ArrowLeft":
            newDirection = DIRECTION_LEFT;
            break;
        case "ArrowUp": 
            newDirection = DIRECTION_UP;
            break;
        case "ArrowRight": 
            newDirection = DIRECTION_RIGHT;
            break;
        case "ArrowDown": 
            newDirection = DIRECTION_DOWN;
            break;
            // LE JEU REDEMARRE SI ON APPUIE SUR ESPACE
        case " ":
            restart();
            return;
        default:
            return;
    }
    //LE SERPENT EMPREINTE LA DIRECTION CHOISIE
    snakee.setDirection(newDirection); 
};

