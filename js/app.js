//DOM elements
const gameBoard = document.querySelector('#game-board')
const rows = []

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

//function to fill tokens in game board. Takes row numbers and a color.
const fillTokens = (firstRow, lastRow, color) => {
    rows.slice(firstRow,lastRow + 1).forEach((row) => {
        row.childNodes.forEach((box) => {
            let token = document.createElement('div')
            token.classList.add('token', `token-${color}`)
            token.dataset.type = 'normal'
            box.appendChild(token)
        })
    })
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
    console.log(rows)
    //add token images to appropriate squares
    fillTokens(0,2,'red')
    fillTokens(5,7,'black')
    //add event listeners to tokens
}

document.addEventListener('DOMContentLoaded', () => {
    //draw the gameboard by adding elements to the DOM
    drawGameBoard()
    

})