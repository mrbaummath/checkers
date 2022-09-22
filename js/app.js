
//grab the div containing the game grid 
const gameBoard = document.querySelector('#game-board')
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
                if (diagColor === 'e' && !takerToken) {
                    validMoves.adjacent.push(rows[diagRow].children[diagCol])
                //if the diag is not empty, then check for a valid capture if the next diagonal square along the current path is empty
                } else if (diagColor === oppColor) {
                    const candidateToken = rows[diagRow].children[diagCol].firstChild
                    const candidateDiags = getDiag(candidateToken)
                    if (candidateDiags.up) {
                        //if the active token can jump the opposing token into an empty square, allow for the capture. Push the empty box and the token that could be captured into the valid moves object
                        if (candidateDiags.up[leftRight].color === 'e') {
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
                if (diagColor === 'e' && !takerToken) {
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
    const clickedToken = event.target
    const currentPlayer = lastPlayer === 'black' ? 'red' : 'black'
    const clickedColor = clickedToken.dataset.color
    const chainCapture = findValidMoves(clickedToken) && clickedToken === takerToken
    //make sure no other token has alrady been readied to be moved. If not, set active token to the target. Set the 
    if (activeToken === null && (chainCapture || clickedColor === currentPlayer)) {
        if (takerToken != clickedToken) {
            takerToken = null
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
    //check for an active token. Only call to the function for seeing if this is a valid move if there is
    if (activeToken) {
        //grab data and row values to update the board state and the data on the moved token
        const oldRow = parseInt(activeToken.dataset.row)
        const oldCol = parseInt(activeToken.dataset.column)
        const newRow = parseInt(event.target.dataset.row)
        const newCol = parseInt(event.target.dataset.column)
        //grab arrays of box elements which are valid to be moved into, whether because they are empty and adjacent or because they represent where the token moves to after a capture
        const initValid = findValidMoves(activeToken)
        console.log(initValid)
        const validAdjacent = initValid.adjacent
        let validCapture = initValid.capture  //let because this will need to be changed if a piece is captured
        //if the move represents a capture, remove the captured piece from the board (add it to opposing player's captured pile) and move the token
        if (validCapture.boxes.includes(event.target)) {
            takerToken = activeToken
            const capturedToken = validCapture.tokens[validCapture.boxes.indexOf(event.target)]
            //before removing the captured token, grab some data to update boardState
            const capturedRow = parseInt(capturedToken.dataset.row)
            const capturedCol = parseInt(capturedToken.dataset.column)
            const capturedColor = capturedToken.dataset.color
            boardState[capturedRow][capturedCol] = 'e'
            const taker = capturedColor === 'black' ? 'red' : 'black'
            capturedBy[taker] += 1

            //for now, just delete the token and increment the relevant capture count. TBD: instead of deleting, move to captured pile
            capturedToken.remove()

        }

        if (validAdjacent.includes(event.target) || validCapture.boxes.includes(event.target)) {
            event.target.appendChild(activeToken)
            activeToken.dataset.row = newRow
            activeToken.dataset.column = newCol
            console.log(activeToken)
            boardState[newRow][newCol] = activeToken.dataset.color
            boardState[oldRow][oldCol] = 'e'
            lastPlayer = activeToken.dataset.color
            activeToken.style.border = 'none'
            activeToken = null
        } 
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

document.addEventListener('DOMContentLoaded', () => {
    //draw the gameboard by adding elements to the DOM
    createGameBoard()
})