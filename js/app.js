
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
//array for all row divs. Will push to this as the rows are created 
const rows = []
//array for all token divs. Will push to this as the tokens are generated 
const tokens = []
//variable to track which token div is "active" - which one has been clicked and is being readied to be moved.
let activeToken = null
//variable to track a token which has made a capture and could be eligible to keep going
let takerToken = false
//objet to track game score
const capturedBy = {
    'red' : 0,
    'black': 0
}

//variable to track which color(s) are able to be moved
let lastPlayer = 'black'

//declare board abstraction. Will be filled programtically 
const boardState = []

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
    console.log(player)
    const playerTokens = Array.from(gameBoard.querySelectorAll(`.token-${player}`))
    if (playerTokens.some(token => {
        if (findValidMoves(token)) {console.log(token)}
        console.log(findValidMoves(token))
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

//function to generate tokens in game board. 
const makeTokens = () => {

    rows.forEach((row, rowNumber) => {
        if (!(rowNumber > 2 && rowNumber < 5)) {
            let color = rowNumber < 3 ? 'black' : 'red'
            row.childNodes.forEach((box, colNumber) => {
                if ((rowNumber % 2 === 0 && colNumber % 2 === 1) || (rowNumber % 2 === 1 && colNumber % 2 === 0)) {
                    let token = document.createElement('div')
                    token.classList.add('token', `token-${color}`)
                    //set useful data on token
                    token.dataset.row = rowNumber
                    token.dataset.column = colNumber
                    token.dataset.color = `${color}`
                    tokens.push(token)
                    box.appendChild(token)
                    //add token to board state
                    boardState[rowNumber][colNumber] = `${color}`
                }
            })    
        }
    })
 
}

//function to determine the status of the spaces directly diagonal to a given token. The function takes a token and returns an object of key value pairs where each key describes a diagonal and each value is the board state at that diagonal
const getDiag = (token) => {
    const rowUp = parseInt(token.dataset.row) - 1
    const rowDown = parseInt(token.dataset.row) + 1
    const colLeft = parseInt(token.dataset.column) - 1
    const colRight = parseInt(token.dataset.column) + 1

    const diagonals = {
        'up' : boardState[rowUp] ? {
            'left' : boardState[rowUp][colLeft] ? {
                'color' : boardState[rowUp][colLeft],
                'row' : rowUp, 
                'column' : colLeft
            } : null,
            'right' : boardState[rowUp][colRight] ? {
                'color' : boardState[rowUp][colRight],
                'row' : rowUp,
                'column' : colRight
            } : null
        } : null,
        'down' : boardState[rowDown] ? {
            'left' : boardState[rowDown][colLeft] ? {
                'color' : boardState[rowDown][colLeft],
                'row' : rowDown, 
                'column' : colLeft
            } : null,
            'right' : boardState[rowDown][colRight] ? {
                'color' : boardState[rowDown][colRight],
                'row' : rowDown,
                'column' : colRight
            } : null
        } : null       
    }

    return diagonals
}


//function which takes a token element and determines which boxes are valid places to move the token into. The function returns an array of the valid box nodes. If there are no valid moves the functio returns false 

const findValidMoves  = (token) => {
    const color = token.dataset.color
    const oppColor = color === 'black' ? 'red' : 'black'
    const type = token.dataset.type
    const row = parseInt(token.dataset.row)
    const column = parseInt(token.dataset.column)
    const diagonals = getDiag(token)
    const validMoves = {
        'adjacent' : [],
        'capture' : {
            'boxes' : [],
            'tokens': []
        }
    }
    //for red tokens and black tokens with king status, check for allowable movement up a row
    if (color === 'red' || (color === 'black' && token.dataset.type === 'king' && diagonals.up)) {
        //check for valid moves left and right
        for (let leftRight in diagonals.up) {
            //grab row, column and color of the adjacent diagonal (recall color will be 'e' if the diag is empty)
            let diagRow = diagonals.up[leftRight] ? diagonals.up[leftRight].row : null
            let diagCol = diagonals.up[leftRight] ? diagonals.up[leftRight].column : null
            let diagColor = diagonals.up[leftRight] ? diagonals.up[leftRight].color : null
            //allow for movement if the adjacent diagonal square is empty
            if (diagonals.up[leftRight]) {
                if (diagColor === 'e') {
                    validMoves.adjacent.push(rows[diagRow].children[diagCol])
                //if the diag is not empty, then check for a valid capture if the next diagonal square along the current path is empty
                } else if (diagColor === oppColor) {
                    const candidateToken = rows[diagRow].children[diagCol].firstChild
                    const candidateDiags = getDiag(candidateToken)
                    if (candidateDiags.up) {
                        //if the active token can jump the opposing token into an empty square, allow for the capture. Push the empty box and the token that could be captured into the valid moves object
                        if (candidateDiags.up[leftRight] && candidateDiags.up[leftRight].color === 'e') {
                            const boxRow = candidateDiags.up[leftRight].row
                            const boxCol = candidateDiags.up[leftRight].column
                            validMoves.capture.tokens.push(candidateToken)
                            validMoves.capture.boxes.push(rows[boxRow].children[boxCol])
                        }
                    }
                }
            }
           
        } 
    }
    //for black tokens and red tokens with king status, check for allowable movement down a row. The process is the same as for the up row.
    if (color === 'black' || (color === 'red' && token.dataset.type === 'king' && diagonals.down)) {
        //check for valid moves left and right
        for (let leftRight in diagonals.down) {
            //grab row, column and color of the adjacent diagonal (recall color will be 'e' if the diag is empty)
            let diagRow = diagonals.down[leftRight] ? diagonals.down[leftRight].row : null
            let diagCol = diagonals.down[leftRight] ? diagonals.down[leftRight].column : null
            let diagColor = diagonals.down[leftRight] ? diagonals.down[leftRight].color : null
            //allow for movement if the adjacent diagonal square is empty
            if (diagonals.down[leftRight]) {
                if (diagColor === 'e') {
                    validMoves.adjacent.push(rows[diagRow].children[diagCol])
                //if the diag is not empty, then check for a valid capture if the next diagonal square along the current path is empty
                } else if (diagColor === oppColor) {
                    const candidateToken = rows[diagRow].children[diagCol].firstChild
                    const candidateDiags = getDiag(candidateToken)
                    if (candidateDiags.down) {
                        //if the active token can jump the opposing token into an empty square, allow for the capture. Push the empty box and the token that could be captured into the valid moves object
                        if (candidateDiags.down[leftRight] && candidateDiags.down[leftRight].color === 'e') {
                            const boxRow = candidateDiags.down[leftRight].row
                            const boxCol = candidateDiags.down[leftRight].column
                            validMoves.capture.tokens.push(candidateToken)
                            validMoves.capture.boxes.push(rows[boxRow].children[boxCol])
                        }
                    }
                }
            }
           
        } 
    }
    if (!validMoves.adjacent.length && !validMoves.capture.boxes.length) {
        return false
    } else {
        return validMoves
    }
}



//function which "activates" a token and gets it ready to be moved or deactivates it if it already is the active token
const setToken = (event) => {
    event.stopPropagation()
    const clickedToken = event.target
    const currentPlayer = lastPlayer === 'black' ? 'red' : 'black'
    const clickedColor = clickedToken.dataset.color
    const chainCapture = (takerToken === clickedToken && findValidMoves(clickedToken) && findValidMoves(clickedToken).capture.boxes.length)
    if (!chainCapture) {
        takerToken = false
    }
    //make sure no other token has alrady been readied to be moved. If not, set active token to the target. Set the 
    if (activeToken === null && (chainCapture || clickedColor === currentPlayer)) {
        if (takerToken != clickedToken) {
            takerToken = false
        }
        activeToken = event.target
        activeToken.style.border='thick solid orange'
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
            capturedTokenDiv.appendChild(capturedToken)

        }
        //if move is not a capture, make sure there has not already been a token used to make a capture during this turn. If the move is a capture, it doesn't matter so allow the move.
        if ((validAdjacent.includes(event.target) && !takerToken) || validCapture.boxes.includes(event.target)) {
            event.target.appendChild(activeToken)
            activeToken.dataset.row = newRow
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
           
        } 
        //check for a win condition being met
        checkWin()
    }
}

//function to generate the gameboard and add event listeners to the boxes
const createGameBoard = () => {
    //create grid. Start by creating 8 rows to append in the board and then iterate to create 8 squares per row
    for (let i=1; i<9; i++) {
        const row = document.createElement('div')
        row.classList.add('row')
        row.id = `row-${i}`
        gameBoard.appendChild(row)
        rows.push(row)
    }
    //rows are done, now for each row iteratively create 8 squares.
    rows.forEach((row,rowNumber) => {
        for (let columnNumber =0; columnNumber < 8; columnNumber++) {
            const box = document.createElement('div')
            box.classList.add('box')
            if ((rowNumber + columnNumber) % 2 === 1) {
                box.classList.add('box-checker')
            } else {
                box.classList.add('box-no-checker')
            }
            box.dataset.row = rowNumber
            box.dataset.column = columnNumber
            box.addEventListener('click', moveToken)
            row.appendChild(box)
        }
    })
    //color squares
    //set boardState variable to all 'e' values for empty.. As tokens are made, they will replace empty squares. As the game progresses it will be helpful to differentiate between empty squares and null/undefined squares that fall ouside the parameters of the game board
    for (let i = 0; i < 8; i++) {
        boardState.push(new Array(8).fill('e'))
    }
    //add token images to appropriate squares
    makeTokens()
    //add event listeners to tokens
    tokens.forEach((token) => {
        token.addEventListener('click',setToken)
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