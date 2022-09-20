//DOM elements
//div containing grid 
const gameBoard = document.querySelector('#game-board')
//array for all row divs. Will push to this as the rows are created 
const rows = []
//array for all token divs. Will push to this as the tokens are generated 
const tokens = []
//variable to track which token div is "active" - which one has been clicked and is being readied to be moved.
let activeToken = null

//board abstraction
const boardState = [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    []
]



//function to fill tokens in game board. Takes row numbers and a color. Will fill the relevant rows with tokens of the specified color and append them to the DOM.
const fillTokens = (firstRow, lastRow, color) => {
    rows.slice(firstRow,lastRow + 1).forEach((row,rowNumber) => {
        row.childNodes.forEach((box,columnNumber) => {
            if ((rowNumber % 2 === 0 && columnNumber % 2 === 1) || rowNumber % 2 === 1 && columnNumber % 2 === 0) {
                let token = document.createElement('div')
                token.classList.add('token', `token-${color}`)
                token.dataset.type = 'normal'
                token.dataset.row = box.dataset.row
                token.dataset.column = box.dataset.column
                box.appendChild(token)
                tokens.push(token)
            }
        })
    })
}

//function which takes a token element and determines which boxes are valid places to move the token into. The function returns an array of the valid box nodes.
const findValidMoves  = (token) => {
    let row = parseInt(token.dataset.row)
    let column = parseInt(token.dataset.column)
    let validMoves = []

}

//function which "activates" a token and gets it ready to be moved
const readyToken = (event) => {
    //make sure no other token has alrady been readied to be moved. If not, set active token to the target
    if (activeToken === null) {
        activeToken = event.target
        activeToken.style.border='thick solid black'
        console.log("token is ready to be moved")
    //if the token clicked is already the active token, un-ready it for mvoement and set active token to none 
    } else if (event.target === activeToken) {
        activeToken.style.border='none'
        activeToken = null
        console.log("active token has been unclicked")
    //if clicked token is not the active token, do nothing
    } else {
        console.log('there is already an active token')
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
            row.appendChild(box)
        }
    })
    //color squares
  
    //add token images to appropriate squares
    fillTokens(0,2,'red')
    fillTokens(5,7,'black')
    //add event listeners to tokens
    tokens.forEach((token) => {
        token.addEventListener('click',readyToken)
    })
}

document.addEventListener('DOMContentLoaded', () => {
    //draw the gameboard by adding elements to the DOM
    drawGameBoard()
    

})