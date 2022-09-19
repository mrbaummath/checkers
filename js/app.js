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
    //add event listeners to tokens

}

document.addEventListener('DOMContentLoaded', () => {
    //draw the gameboard by adding elements to the DOM
    drawGameBoard()
    

})