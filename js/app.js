
const tokens = []
const boxArray = [[],[],[],[],[],[],[],[]]
const activeToken = null

//grab the div containing the game grid 
const gameBoard = document.querySelector('#game-board')
//grab DOM element for the pop-up box so its display can be toggled
const popUp = document.querySelector('#pop-up')
//get instruction text so its display can be toggled 
const instructions = document.querySelector('#instructions')
//grab win-message node so it can be toggled and so a message can be programatically put into it
const winMessage = document.querySelector('#win-message')
//grab both capture zones to append captured tokens into
const redCapture = document.querySelector('#red-capture')
const blackCapture = document.querySelector('#black-capture')
//variable to track a token which has made a capture and could be eligible to keep going
let takerToken = false
//objet to track game score
const capturedBy = {
    'red' : 0,
    'black': 0
}

//variable to track which color(s) are able to be moved
let lastPlayer = 'black'

class Box {
    constructor(row,column) {
        this.row = row
        this.column = column
        this.token = null
        this.node = this.makeNode()
        boxArray[row][column] = this
    }


    makeNode () {
        const newBoxDiv = document.createElement('div')
        const type =  ((this.row + this.column) % 2 === 1) ? 'box-checker' : 'box-no-checker'
        newBoxDiv.classList.add('box',type)
        newBoxDiv.dataset.row = this.row
        newBoxDiv.dataset.column = this.column
        newBoxDiv.addEventListener('click', moveToken)
        return newBoxDiv
    }
}

class Token {
    constructor(box) {
        this.color = box.row > 4 ? 'red' : 'black'
        this.box = box
        this.row = box.row
        this.column = box.column
        this.node = this.makeNode()
        this.isCaptured = false
        this.madeCapture = false
        this.isActive = false 
        this.type = 'regular'
        tokens.push(this)
    }
    get validMovesAdj() {
        return this.findValidMoves.adjacent
    }
    get validCaptures() {
        return this.findValidMoves.captures
    }
    get allMoves() {
        return this.findValidMoves
    }

    makeNode() {
        const tokenNode = document.createElement('div')
        tokenNode.classList.add('token', `token-${this.color}`)
        tokenNode.dataset.row = this.row
        tokenNode.dataset.column = this.column
        tokenNode.dataset.color = this.color
        tokenNode.addEventListener('click', setToken)
        return tokenNode

    }

    findValidMoves() {
        const validMoves =  {
            'adjacent' : [],
            'capture' : []
        } 
        //search for valid moves for this token along diagonals. Only push a valid move to the appropriate array if it is in the correct direction given this token's color and status as king/regular. I will create an array of either ['up'], ['down'], or ['up','down'] to iterate over depending on the characteristics of the token
        const oppColor = this.color === 'red' ? 'black' : 'red'
        const natDirection = this.color === 'red' ? 'up' : 'down'
        const oppDirection = this.color === 'red' ? 'down' : 'up'
        const upDown = this.type === 'king' ? [natDirection, oppDirection] : [natDirection]
        upDown.forEach((rowDir) => {
            const leftRight = ['left', 'right']
            leftRight.forEach((colDir) => {
                const diagBox = findDiagonal(rowDir,colDir)
                //if a diagonalBox is empty push it to the adjacent moves array
                if (diagBox && !diagBox.token) {
                    validMoves.push(diagBox)
                    //if the diagonally adjacent box contains a token of the opposite color, check the next square along the same diagonal for being empty
                } else if (diagBox && diagBox.token.color === oppColor) {
                    const diagDiagBox = diagBox.token.findDiagonal(rowDir, colDir)
                    if (diagDiagBox && !diagDiagBox.token) {
                        validMoves.capture.push(diagDiagBox)
                    }
                }
            })
        })

    }

    findDiagonal(upOrDown,leftOrRight) {
        let rowCheck = upOrDown === 'up' ? this.row + 1 : this.row - 1
        let colCheck = leftOrRight === 'left' ? this.col - 1 : this.row + 1
        if (rowCheck < 0 || rowCheck > 7 || colCheck < 0 || rowCheck > 7) {
            return null
        }
        return boxArray[rowCheck][colCheck]

    }
   
}





//below is original code





const newGame = () => {
    rows.length = 0
    tokens.length = 0
    activeToken = null
    takerToken = false
    capturedBy.red = 0
    capturedBy.black = 0
    lastPlayer = 'black'
    boardState.length = 0
    while (gameBoard.firstChild) {
        gameBoard.removeChild(gameBoard.firstChild)
    }
    const redCapture = document.querySelector('#red-capture')
    const blackCapture = document.querySelector('#black-capture')
    while (redCapture.firstChild) {
        redCapture.removeChild(redCapture.firstChild)
    }
    while (blackCapture.firstChild) {
        blackCapture.removeChild(blackCapture.firstChild)
    }
    instructions.style.display = 'none'
    winMessage.style.display = 'none'
    winMessage.firstChild.textContent = ''
    popUp.style.display = 'none'
    createGameBoard()
}

//function to disable event listeners and effectively end the game
const endGame = () => {
    tokens.forEach((token) => {
        token.removeEventListener('click', setToken)
    })
    rows.forEach((row) => {
       row.childNodes.forEach((box) => {
        box.removeEventListener('click', moveToken)
       })
    })
}

//function to check whether a given player has any valid moves remaining.
const anyValidMoves = (player) => {
    const playerTokens = Array.from(gameBoard.querySelectorAll(`.token-${player}`))
    if (playerTokens.some(token => {
        return findValidMoves(token)
    })) {
        return true
    } else {
        return false
    }

}

//function to check for win conditions
const checkWin = () => {
    const otherPlayer = lastPlayer === 'black' ? 'red' : 'black' 
    //last player to go wins if capture count is now 12 for that player.
    if (capturedBy[lastPlayer] === 12 || !anyValidMoves(otherPlayer)) {
        instructions.style.display = 'none'
        const winText  = `${lastPlayer} has won the game. Click 'restart' to start a new game`
        winMessage.firstChild.textContent = winText
        popUp.style.display = 'flex'
        winMessage.style.display = 'block'
        endGame()
    } else {
        return false
    }
}






//function which "activates" a token and gets it ready to be moved or deactivates it if it already is the active token
const setToken = (event) => {
    event.stopPropagation()
    const clickedToken = event.target
    const tokenObj = boxArray[clickedToken.dataset.row][clickedToken.dataset.column].token
    // const clickedTokenObject = boxArray[clickedToken.dataset.row][clickedToken.dataset.column].token
    const currentPlayer = lastPlayer === 'black' ? 'red' : 'black'
    const clickedColor = tokenObj.color
    const chainCapture = (tokenObj.madeCapture && tokenObj.validCaptures)
    //make sure no other token has alrady been readied to be moved. If not, set active token to the target. Set the 
    if (activeToken === null && (chainCapture || clickedColor === currentPlayer)) {
        if (takerToken != tokenObj) {
            takerToken = false
        }
        activeToken = tokenObj
        tokenObj.isActive = true
        activeToken.node.style.border='thick solid orange'
        console.log("token is ready to be moved")
    //if the token clicked is already the active token, un-ready it for mvoement and set active token to none 
    } else if (event.target === activeToken) {
        activeToken.style.border='none'
        activeToken = null
        console.log("active token has been unclicked")
    //if clicked token is not the active token, do nothing
    } else if (clickedColor !== currentPlayer) {
        console.log('wait your turn!')
    } else {
        console.log('there is already an active token')
    }

}

const translate = (movedNode,destinationNode) => {
    const pointARect = destinationNode.getBoundingClientRect()
    const pointBRect = movedNode.getBoundingClientRect()
    const xTrans = pointARect.x - pointBRect.x
    const yTrans = pointARect.y - pointBRect.y
    movedNode.style.transform = `translate(${xTrans}px, ${yTrans}px)`
    setTimeout(()=> {
        destinationNode.appendChild(movedNode)
        movedNode.style.removeProperty('transform')
    },600)
}


const moveToken = (event) => {
    event.stopPropagation()
    //check for an active token. Only call to the function for seeing if this is a valid move if there is
    const boxToken = event.target.firstChild 
    //only act on empty squares when there is an active token
    if (activeToken && !boxToken) {
        //grab data and row values to update the board state and the data on the moved token
        const oldRow = parseInt(activeToken.dataset.row)
        const oldCol = parseInt(activeToken.dataset.column)
        const newRow = parseInt(event.target.dataset.row)
        const newCol = parseInt(event.target.dataset.column)
        const color = activeToken.dataset.color
        //grab arrays of box elements which are valid to be moved into, whether because they are empty and adjacent or because they represent where the token moves to after a capture
        const validMoves = findValidMoves(activeToken)
        const validAdjacent = validMoves.adjacent
        let validCapture = validMoves.capture 
        //if the move represents a capture, remove the captured piece from the board (add it to opposing player's captured pile) and move the token
        if (validCapture && validCapture.boxes.includes(event.target)) {
            takerToken = activeToken
            const capturedToken = validCapture.tokens[validCapture.boxes.indexOf(event.target)]
            //before removing the captured token, grab some data to update boardState
            const capturedRow = parseInt(capturedToken.dataset.row)
            const capturedCol = parseInt(capturedToken.dataset.column)
            const capturedColor = capturedToken.dataset.color
            boardState[capturedRow][capturedCol] = 'e'
            const taker = capturedColor === 'black' ? 'red' : 'black'
            capturedBy[taker] += 1

            //append the captured token into the opposing player's zone and remove it's event listener
            const zone = capturedColor === 'red' ? blackCapture : redCapture
            const capturedTokenDiv = document.createElement('div')
            capturedToken.removeEventListener('click',setToken)
            const boxStyle = getComputedStyle(document.querySelector('.box'))
            //assign the div containing the captured token to have the current height and width of a gameboard div. This will make it so the tokens in the capture area have the size of the game tokens (at least when captured)
            capturedTokenDiv.classList.add('capture-box')
            capturedTokenDiv.style.height = boxStyle.getPropertyValue('height')
            capturedTokenDiv.style.width = boxStyle.getPropertyValue('width')
            zone.appendChild(capturedTokenDiv)
            //call translate function
            translate(capturedToken,capturedTokenDiv)
            //append token to capture area
            // capturedTokenDiv.appendChild(capturedToken)

        }
        //if move is not a capture, make sure there has not already been a token used to make a capture during this turn. If the move is a capture, it doesn't matter so allow the move.
        if ((validAdjacent.includes(event.target) && !takerToken) || validCapture.boxes.includes(event.target)) {
            translate(activeToken,event.target)
            // event.target.appendChild(activeToken)
            setTimeout(()=>{activeToken.dataset.row = newRow
            activeToken.dataset.column = newCol
            boardState[newRow][newCol] = activeToken.dataset.color
            boardState[oldRow][oldCol] = 'e'
            //check if the active token needs king status and apply it if need
            if ((color === 'black' && newRow === 7) || (color ==='red' && newRow === 0)) {
                activeToken.dataset.type = 'king'
                activeToken.classList.add('king')

            }
            lastPlayer = activeToken.dataset.color
            activeToken.style.border = 'none'
            activeToken = null
            },700)
           
        }
        //check for a win condition being met
        setTimeout( () => {
            checkWin()
        }, 750)
    }
}

//function to generate the gameboard and add event listeners to the boxes
const createGameBoard = () => {
    //create grid. Start by creating 8 rows to append in the board and then iterate to create 8 squares per row
    const rows = []
    for (let i=0; i<8; i++) {
        const row = document.createElement('div')
        row.classList.add('row')
        row.id = `row-${i}`
        gameBoard.appendChild(row)
        rows.push(row)
    }
    //rows are done, now for each row iteratively create 8 squares. Add a token if the box is supposed to have a token
    rows.forEach((row,rowNumber) => {
        for (let colNumber = 0; colNumber < 8; colNumber ++) {
            const box = new Box(rowNumber, colNumber)
            row.appendChild(box.node)
            if (!(rowNumber === 3 || rowNumber === 4) && box.node.classList.contains('box-checker')) {
                const token = new Token(box)
                box.token = token
                box.node.appendChild(token.node)
            }
        }
    })
}

//function to resize captured tokens if there are any
const resizeCaptured = () => {

    const zones = document.querySelectorAll('.captured-tokens')

    zones.forEach((zone) => {
        if (zone.querySelectorAll('div')) {
            const captureDivs = Array.from(zone.querySelectorAll('.capture-box'))
            const style = getComputedStyle(document.querySelector('.box'))
            captureDivs.forEach((div) => {
                div.style.height = style.getPropertyValue('height')
                div.style.width = style.getPropertyValue('width')
            })
        }
    })


}

document.addEventListener('DOMContentLoaded', () => {
    //draw the gameboard by adding elements to the DOM
    createGameBoard()
    //set restart listener on restart button
    const restartBtn = document.querySelector('#restart')
    restartBtn.addEventListener('click', newGame)
    //set listener on pop-up close icon
    const closeIcon = document.querySelector('#popup-close')
    closeIcon.addEventListener('click', () => {
        popUp.style.display = 'none'
        instructions.style.display = 'none'
        winMessage.style.display = 'none'
    })
    //set listener on instructions link
    const rulesLink = document.querySelector('#rules-link')
    rulesLink.addEventListener('click', () => {
        popUp.style.display = 'flex'
        instructions.style.display = 'block'
    })
    //add a window resize event to the window to resize captured tokens if there are any
    window.onresize = resizeCaptured
})