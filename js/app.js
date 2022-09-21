//DOM elements
//div containing grid 
const gameBoard = document.querySelector('#game-board')
//array for all row divs. Will push to this as the rows are created 
const rows = []
//array for all token divs. Will push to this as the tokens are generated 
const tokens = []
//variable to track which token div is "active" - which one has been clicked and is being readied to be moved.
let activeToken = null

//variable to track which color(s) are able to be moved
let activeColor = ['red', 'black']

//declare board abstraction. Will be filled programtically 
const boardState = []

//

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

//function which takes a token element and determines which boxes are valid places to move the token into. The function returns an array of the valid box nodes. If there are no valid moves the functio returns false 

const findValidMoves  = (token) => {
    let row = parseInt(token.dataset.row)
    let column = parseInt(token.dataset.column)
    let validMoves = null
    if (token.dataset.color === 'red' || (token.dataset.color === 'black' && token.dataset.type === 'king')) {
        // validMoves.push([row -1, column + 1], [row -1, column - 1])
        //for red tokens and black tokens with king status which are not on the top row, check for allowable movement up a row
        if (row !== 0) {
            //if token is not on left edge, check for allowable movement on left side
            if (column !== 0) {
                //allow movement immediately if 
            }


        }
    }
    if (token.dataset.color === 'black' || (token.dataset.color === 'red' && token.dataset.type === 'king')) {
        // validMoves.push ([row + 1, column - 1], [row + 1, column -1])
    }
    //find DOM boxes corresponding to the valid moves and store them in an array which is returned by the function
    if (validMoves) {
        let validBoxes = validMoves.map(rowColPair =>  (rows[rowColPair[0]].children[rowColPair[1]]))
        return validBoxes
    } else return false 
}


//function which "activates" a token and gets it ready to be moved
const readyToken = (event) => {
    //make sure no other token has alrady been readied to be moved. If not, set active token to the target
    if (activeToken === null && activeColor.includes(event.target.dataset.color)) {
        activeToken = event.target
        activeToken.style.border='thick solid orange'
        console.log("token is ready to be moved")
    //if the token clicked is already the active token, un-ready it for mvoement and set active token to none 
    } else if (event.target === activeToken) {
        activeToken.style.border='none'
        activeToken = null
        console.log("active token has been unclicked")
    //if clicked token is not the active token, do nothing
    } else if (!activeColor.includes(event.target.dataset.color)) {
        console.log('wait your turn!')
    } else {
        console.log('there is already an active token')
    }

}

const moveInto = (event) => {
    if (activeToken && findValidMoves(activeToken).includes(event.target)) {
        event.target.appendChild(activeToken)
        activeToken.style.border='none'
        
    } 
}

//function to draw the gameboard
const drawGameBoard = () => {
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
        for (let columnNumber =1; columnNumber < 9; columnNumber++) {
            const box = document.createElement('div')
            box.classList.add('box')
            box.dataset.row = rowNumber + 1 
            box.dataset.column = columnNumber
            box.addEventListener('click', moveInto)
            row.appendChild(box)
        }
    })
    //color squares
    //set boardState variable to all null values.. As tokens are made, they will replace empty squares.
    for (let i = 0; i < 8; i++) {
        boardState.push(new Array(8).fill(null))
    }
    console.log(boardState)
    //add token images to appropriate squares
    makeTokens()
    //add event listeners to tokens
    tokens.forEach((token) => {
        token.addEventListener('click',readyToken)
    })
}

document.addEventListener('DOMContentLoaded', () => {
    //draw the gameboard by adding elements to the DOM
    drawGameBoard()
})