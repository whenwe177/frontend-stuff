
class ChessPiece {
    constructor(type, player, isActive, currentGridObject, chessGrid, element) {
        this.type = type;
        this.isActive = isActive;
        
        this.currentGridObject = currentGridObject;
        this.currentGrid = null;
        
        this.player = player;
        this.chessGrid = chessGrid;
        this.moves = 0;
        this.element = element;
    }

    moveRange() {
        if (this.currentGrid === null) {
            return [];
        }

        const colIndex = {
            "a" : 0,
            "b" : 1,
            "c" : 2,
            "d" : 3,
            "e" : 4,
            "f" : 5,
            "g" : 6,
            "h" : 7
        }

        const gridRow = 8 - Number(this.currentGrid.dataset.row);
        const gridCol = colIndex[this.currentGrid.dataset.col];

        const movableGrids = [];

        switch (this.type) {
            case "rook": {
                this.rookRange(movableGrids, gridRow, gridCol);
                break;
            }
            case "pawn": {
                this.pawnRange(movableGrids, gridRow, gridCol);
                break;

            }
            case "knight": {
                this.knightRange(movableGrids, gridRow, gridCol);
                break;
            }
            case "bishop": {
                this.bishopRange(movableGrids, gridRow, gridCol);
                break;
            }
            case "queen": {
                this.rookRange(movableGrids, gridRow, gridCol);
                this.bishopRange(movableGrids, gridRow, gridCol);
                break;

            }
            case "king": {
                this.kingRange(movableGrids,gridRow, gridCol);
                break;
                
            }
            default: break;
        }
        return movableGrids;
    }

    pawnRange(movableGrids, gridRow, gridCol) {
        const movableSlot = (this.player === "one") ? this.chessGrid[gridRow + 1][gridCol] : this.chessGrid[gridRow - 1][gridCol];

        if (movableSlot.occupier === undefined) {
            movableGrids.push(movableSlot);
        }

        if (this.moves === 0) {
            const firstMoveSlot = (this.player === "one") ? this.chessGrid[gridRow + 2][gridCol] : this.chessGrid[gridRow - 2][gridCol];
            if (firstMoveSlot.occupier === undefined) {
                movableGrids.push(firstMoveSlot);
            }
        }

        const diagonalLeft = (this.player === "one") ? this.chessGrid[gridRow + 1][gridCol + 1] : this.chessGrid[gridRow - 1][gridCol - 1];
        const diagonalLeftOccupier = diagonalLeft?.occupier?.player;    
        if ((diagonalLeftOccupier !== undefined) && (diagonalLeftOccupier !== this.player)) {
            movableGrids.push(diagonalLeft);
        }
        
        const diagonalRight = (this.player === "one") ? this.chessGrid[gridRow + 1][gridCol - 1] : this.chessGrid[gridRow - 1][gridCol + 1];
        const diagonalRightOccupier = diagonalRight?.occupier?.player;
        if ((diagonalRightOccupier !== undefined) && (diagonalRightOccupier !== this.player)) {
            movableGrids.push(diagonalRight);
        }

        const canEatFirstMovePawnRow = (this.player === "one") ? 4 : 3;
        if (gridRow === canEatFirstMovePawnRow) {
            const canEatPawnPossibleGrids = [
                this.chessGrid[gridRow]?.[gridCol - 1],
                this.chessGrid[gridRow]?.[gridCol + 1]
            ]

            const pushedGrids =[
                this.chessGrid[(this.player === "one") ? (gridRow + 1) : (gridRow - 1)][gridCol - 1],
                this.chessGrid[(this.player === "one") ? (gridRow + 1) : (gridRow - 1)][gridCol + 1]
            ]

            for (let i = 0; i < canEatPawnPossibleGrids.length; i++) {
                const possibleGrid = canEatPawnPossibleGrids[i];
                const gridOccupierType = possibleGrid.occupier?.type;
                const gridOccupierPlayer = possibleGrid.occupier?.player ?? this.player;
                const gridOccupierMoves = possibleGrid.occupier?.moves ?? 0;

                if ((gridOccupierType === "pawn") && (gridOccupierPlayer !== this.player) && (gridOccupierMoves === 1)) {
                    movableGrids.push(pushedGrids[i]);
                }
            }
        }
    }

    rookRange(movableGrids, gridRow, gridCol) {
        for (let i = gridRow + 1; i < 8; i++) {
            const possibleGrid = this.chessGrid[i][gridCol];
            
            const occupierPlayer = possibleGrid.occupier?.player;
            
            if ((occupierPlayer !== undefined) && (occupierPlayer !== this.player)) {
                movableGrids.push(possibleGrid);
                break;
            }

            if (occupierPlayer === this.player) {
                break;
            }

            movableGrids.push(possibleGrid);
        }

        for (let i = gridRow - 1; i >= 0; i--) {
            const possibleGrid = this.chessGrid[i][gridCol];
            
            const occupierPlayer = possibleGrid.occupier?.player;
            
            if ((occupierPlayer !== undefined) && (occupierPlayer !== this.player)) {
                movableGrids.push(possibleGrid);
                break;
            }

            if (occupierPlayer === this.player) {
                break;
            }

            movableGrids.push(possibleGrid);
        }

        for (let i = gridCol + 1; i < 8; i++) {
            const possibleGrid = this.chessGrid[gridRow][i];
            
            const occupierPlayer = possibleGrid.occupier?.player;
            
            if ((occupierPlayer !== undefined) && (occupierPlayer !== this.player)) {
                movableGrids.push(possibleGrid);
                break;
            }

            if (occupierPlayer === this.player) {
                break;
            }

            movableGrids.push(possibleGrid); 
        }

        for (let i = gridCol - 1; i >= 0; i--) {
            const possibleGrid = this.chessGrid[gridRow][i];
            
            const occupierPlayer = possibleGrid.occupier?.player;
            
            if ((occupierPlayer !== undefined) && (occupierPlayer !== this.player)) {
                movableGrids.push(possibleGrid);
                break;
            }

            if (occupierPlayer === this.player) {
                break;
            }

            movableGrids.push(possibleGrid);
        }
    }

    bishopRange(movableGrids, gridRow, gridCol) {
        let row = gridRow + 1;
        let col = gridCol + 1;

        while ((row < 8) && (col < 8)) {
            const possibleGrid = this.chessGrid[row][col];
            
            const occupierPlayer = possibleGrid.occupier?.player;
            if ((occupierPlayer !== undefined) && (occupierPlayer !== this.player)) {
                movableGrids.push(possibleGrid);
                break;
            }

            if ((occupierPlayer === this.player)) {
                break;
            }

            movableGrids.push(possibleGrid);

            row++;
            col++;
        }

        row = gridRow + 1;
        col = gridCol - 1;

        while((row < 8) && (col >= 0)) {
            const possibleGrid = this.chessGrid[row][col];
            
            const occupierPlayer = possibleGrid.occupier?.player;
            if ((occupierPlayer !== undefined) && (occupierPlayer !== this.player)) {
                movableGrids.push(possibleGrid);
                break;
            }

            if ((occupierPlayer === this.player)) {
                break;
            }

            movableGrids.push(possibleGrid);

            row++;
            col--;
        }

        row = gridRow - 1;
        col = gridCol + 1;

        while ((row >= 0) && (col < 8)) {
            const possibleGrid = this.chessGrid[row][col];
            
            const occupierPlayer = possibleGrid.occupier?.player;
            if ((occupierPlayer !== undefined) && (occupierPlayer !== this.player)) {
                movableGrids.push(possibleGrid);
                break;
            }

            if ((occupierPlayer === this.player)) {
                break;
            }

            movableGrids.push(possibleGrid);

            row--;
            col++;
        }
        
        row = gridRow - 1;
        col = gridCol - 1;

        while ((row >= 0) && (col >= 0)) {
            const possibleGrid = this.chessGrid[row][col];
            
            const occupierPlayer = possibleGrid.occupier?.player;
            if ((occupierPlayer !== undefined) && (occupierPlayer !== this.player)) {
                movableGrids.push(possibleGrid);
                break;
            }

            if ((occupierPlayer === this.player)) {
                break;
            }

            movableGrids.push(possibleGrid);

            row--;
            col--;
        }
    }

    kingRange(movableGrids, gridRow, gridCol) {
        const possibleGridLocations = [
            this.chessGrid?.[gridRow + 1]?.[gridCol + 1],
            this.chessGrid?.[gridRow - 1]?.[gridCol + 1],
            this.chessGrid?.[gridRow - 1]?.[gridCol - 1],
            this.chessGrid?.[gridRow + 1]?.[gridCol - 1],
            this.chessGrid?.[gridRow]?.[gridCol + 1],
            this.chessGrid?.[gridRow]?.[gridCol - 1],
            this.chessGrid?.[gridRow + 1]?.[gridCol],
            this.chessGrid?.[gridRow - 1]?.[gridCol]
        ];


        for (let i = 0; i < possibleGridLocations.length; i++) {
            const possibleGrid = possibleGridLocations[i];
            const occupierPlayer = possibleGrid?.occupier?.player;

            if ((occupierPlayer === undefined) && (possibleGrid !== undefined)) {
                movableGrids.push(possibleGrid);
            }

            if ((occupierPlayer !== undefined) && (occupierPlayer !== this.player)) {
                movableGrids.push(possibleGrid);
            }

        }
    }

    knightRange(movableGrids, gridRow, gridCol) {
        const possibleGridLocations = [
            this.chessGrid?.[gridRow - 2]?.[gridCol - 1],
            this.chessGrid?.[gridRow - 2]?.[gridCol + 1],
            this.chessGrid?.[gridRow + 2]?.[gridCol - 1],
            this.chessGrid?.[gridRow + 2]?.[gridCol + 1],
            this.chessGrid?.[gridRow - 1]?.[gridCol + 2],
            this.chessGrid?.[gridRow - 1]?.[gridCol - 2],
            this.chessGrid?.[gridRow + 1]?.[gridCol + 2],
            this.chessGrid?.[gridRow + 1]?.[gridCol - 2]
        ];

        for (let possibleGrid of possibleGridLocations) {
            const occupiedPlayer = possibleGrid?.occupier?.player;

            if ((occupiedPlayer === undefined) && (possibleGrid !== undefined)) {
                movableGrids.push(possibleGrid);
            }

            if ((occupiedPlayer !== undefined) && (occupiedPlayer !== this.player)) {
                movableGrids.push(possibleGrid);
            }
        }
    }
}

class ChessGrid {
    constructor(element, occupier) {
        this.element = element;
        this.occupier = occupier;
    }

    moveToGrid(chesspiece) {
        const chesspieceGrid = chesspiece.currentGridObject;
        const chesspieceGridElement = chesspiece.currentGrid;
        const chesspieceElement = chesspiece.element;

        chesspieceGrid.occupier = undefined;
        chesspieceGridElement.removeChild(chesspieceElement);

        if (this.occupier !== undefined) {

            const occupierPlayer = this.occupier.player;
            const inactivePieceDiv = document.querySelector(`#inactive-player-${occupierPlayer}`);

            this.occupier.isActive = false;
            this.occupier.currentGridObject = null;
            this.occupier.currentGrid = null;
            this.element.removeChild(this.occupier.element);
            inactivePieceDiv.appendChild(this.occupier.element);
        }

       
        this.occupier = chesspiece;
        this.element.appendChild(chesspieceElement);
        chesspiece.currentGridObject = this;
        chesspiece.currentGrid = this.element;

        chesspiece.moves++;        
    }

    getRowAndColIndex() {
        const colIndex = {
            "a" : 0,
            "b" : 1,
            "c" : 2,
            "d" : 3,
            "e" : 4,
            "f" : 5,
            "g" : 6,
            "h" : 7
        }

        const gridRow = 8 - Number(this.element.dataset.row);
        const gridCol = colIndex[this.element.dataset.col];

        return {
            gridRow,
            gridCol
        }
    }
}

(function main() {
    //Elements
    const chessPieces = document.querySelectorAll(".chesspiece");
    const chessGrids = document.querySelectorAll(".chessboard--block");

    //Array of chessPiece and chessGrid objects
    
    const chessPieceObjects = Array.from(chessPieces).map(
        (chesspiece) =>  {
            const dataset = chesspiece.dataset;
            return new ChessPiece(dataset.piece, dataset.player, true, null, null, chesspiece);
        }
    );

    const kingPiecesObjects = [];
    
        
    const chessGridObjects = gridify(chessGrids);
    chessPieceObjects.forEach(
        (chesspieceObj) => {
            chesspieceObj.chessGrid = chessGridObjects;
            chesspieceObj.currentGridObject = getGridFromHTMLElement(chesspieceObj.element.parentNode, chessGridObjects);
            chesspieceObj.currentGrid = chesspieceObj.element.parentNode;

            if (chesspieceObj.type === "king") {
                kingPiecesObjects.push(chesspieceObj);
            }
        }
    );


    const playerOnePiecesObjects = Array.from(chessPieceObjects).filter(
        chesspiece => {
            return chesspiece.element.dataset.player == "one";
        }
    )

    const playerTwoPiecesObjects = Array.from(chessPieceObjects).filter(
        chesspiece => {
            return chesspiece.element.dataset.player == "two";
        }
    )

    const playerPiecesMap = {
        "one" : playerOnePiecesObjects.map(getPieceElement),
        "two" : playerTwoPiecesObjects.map(getPieceElement)
    }

    const playerPiecesObjectMap = {
        "one" : playerOnePiecesObjects,
        "two" : playerTwoPiecesObjects
    }
    
    let selectedPiece = null;
    let selectedPieceObject = null;
    let highlightedGrid = null;
    let currentPlayer = "two";
    let gameInCheck = {
        inCheck: false,
        beingChecked: null,
        checker: null
    };
    let eventListeningPieces = [];

    
    //Adding Even Listeners
    playerPiecesMap[currentPlayer].forEach(
        (chesspiece,index) => {
            chesspiece.addEventListener("click", showMovableGrids);
            eventListeningPieces.push(playerPiecesObjectMap[currentPlayer][index]);
        }
    )

    chessGrids.forEach(
        grid => {
            grid.addEventListener("click", movePieceToGrid);
        }
    )
    

    //Even Listening Functions
    function showMovableGrids(event) {
        
        if (highlightedGrid !== null) {
            highlightedGrid.forEach(
                gridObjects => {
                    if (gridObjects === undefined) {
                        return;
                    }

                    const {element} = gridObjects;
                    element.classList.remove("chessboard--block__highlighted");
                }
            );
        }

        
        if (selectedPiece === event.currentTarget) {
            
            highlightedGrid = null;
            selectedPiece = null;
            selectedPieceObject = null;
            event.stopPropagation();
            return;
        }
        
        selectedPiece = event.currentTarget;
        selectedPieceObject = getObjectFromHTMLElement(selectedPiece, chessPieces, chessPieceObjects);
        
        highlightedGrid = selectedPieceObject.moveRange();

        if (selectedPieceObject.type === "king") {
            const possibleCheckers = playerPiecesObjectMap[(currentPlayer === "one") ? "two" : "one"];
            for (let checkers of possibleCheckers) {
                const range = checkers.moveRange();
                for (let i = 0; i < highlightedGrid.length; i++) {
                    const gridOfKingRange = highlightedGrid[i];
                    for (let grid of range) {
                        if (gridOfKingRange === grid) {
                            highlightedGrid[i] = undefined;
                        }
                    }
                }
            }
        }

        if (selectedPieceObject.type !== "king") {
            const savedCurrentPlayer = currentPlayer;
            currentPlayer = (currentPlayer === "one") ? "two" : "one";
            const possibleCheckers = playerPiecesObjectMap[currentPlayer];
            for (let checkers of possibleCheckers) {
                filterHighlightedGridsCheck(highlightedGrid, checkers, selectedPieceObject);
            }
            currentPlayer = savedCurrentPlayer;
        }
        
        
        if (gameInCheck.inCheck) {
            const {checker} = gameInCheck;
            const checkerRange = checker.moveRange();
            
            const savedCurrentPlayer = currentPlayer;
            currentPlayer = (currentPlayer === "one") ? "two" : "one";
            
            const checkedKing = kingPiecesObjects[(currentPlayer === "one") ? 0 : 1];
            if (selectedPieceObject.type === "king") {
                for (let i = 0; i < highlightedGrid.length; i++) {
                    const grid = highlightedGrid[i];
                    console.warn(grid)
                    if (grid === undefined) {
                        continue;
                    }
                    
                    if ((checkerRange.includes(grid))) {
                        highlightedGrid[i] = undefined;
                        continue;
                    }
                    
                    const initialOccupier = grid?.occupier;
                    grid.occupier = selectedPieceObject;
                    selectedPieceObject.currentGridObject.occupier = undefined;
                    
                    const inHypotheticalCheck = isInCheck();
                    
                    if (inHypotheticalCheck.inCheck) {
                        highlightedGrid[i] = undefined;
                    }

                    grid.occupier = initialOccupier;
                    selectedPieceObject.currentGridObject.occupier = selectedPieceObject;
                }
                
                
            }
            if (selectedPieceObject.type !== "king") {
                filterHighlightedGridsCheck(highlightedGrid, checker, selectedPieceObject);
            }
            
            currentPlayer = savedCurrentPlayer;
        }
        
        

        highlightedGrid.forEach(
            gridObjects => {
                if (gridObjects === undefined) {
                    return;
                }

                const {element} = gridObjects;
                element.classList.add("chessboard--block__highlighted");
            }
            );
        event.stopPropagation();
    }

    function movePieceToGrid(event) {
        if (highlightedGrid === null) {
            return;
        }
       
        const selectedGrid = event.currentTarget;
        const selectedGridObject = getGridFromHTMLElement(selectedGrid, chessGridObjects);
        
        highlightedGrid.forEach(
            gridObjects => {
                if (gridObjects === undefined) {
                    return;
                }

                const {element} = gridObjects;
                element.classList.remove("chessboard--block__highlighted");
            }
        );

        if (!(highlightedGrid.includes(selectedGridObject))) {
            highlightedGrid = null;
            selectedPiece = null;
            selectedPieceObject = null;
            return;
        }

        selectedGridObject.moveToGrid(selectedPieceObject);
        const canEatFirstMovePawnRow = (this.player === "one") ? 5 : 2;
        const {gridRow, gridCol} = selectedGridObject.getRowAndColIndex();

        if ((selectedPieceObject.type === "pawn") && (gridRow === canEatFirstMovePawnRow)) {

            const gridWhosePawnCanBeEaten = chessGridObjects[(selectedPieceObject.player === "one") ? (gridRow - 1) : (gridRow + 1)][gridCol];
            const gridPawnOccupierType = gridWhosePawnCanBeEaten.occupier?.type;
            const gridPawnOccupierPlayer = gridWhosePawnCanBeEaten.occupier?.player;

            if ((gridPawnOccupierType === "pawn") && (gridPawnOccupierPlayer !== selectedPieceObject.player)) {
                const occupier = gridWhosePawnCanBeEaten.occupier;
                const inactiveElemDiv = document.querySelector(`#inactive-player-${gridPawnOccupierPlayer}`);
                
                gridWhosePawnCanBeEaten.occupier = undefined;
                occupier.currentGridObject = null;
                occupier.currentGrid = null;
                occupier.isActive = false;

                occupier.element.parentNode.removeChild(occupier.element);
                inactiveElemDiv.appendChild(occupier.element)
                
            }
        }
        
        gameInCheck = isInCheck();

        eventListeningPieces = [];
        playerPiecesMap[currentPlayer].forEach(
            (chesspiece) => {
                chesspiece.removeEventListener("click", showMovableGrids);
            }
        )

        currentPlayer = (currentPlayer === "one") ? "two" : "one";

        playerPiecesMap[currentPlayer].forEach(
            (chesspiece, index) => {
                chesspiece.addEventListener("click", showMovableGrids);
                eventListeningPieces.push(playerPiecesObjectMap[currentPlayer][index]);
            }
        )
        
        highlightedGrid = null;
        selectedPiece = null;
        selectedPieceObject = null;

        if (gameInCheck.inCheck) {
            setupCheckEventListeners(gameInCheck);
            return;
        }
    }

    //Helper Functions
    function gridify(array) {
        const gridifiedArray = [];
        let gridRows = [];
        
        for (let item of array) {
            const gridObject = new ChessGrid(item, getObjectFromHTMLElement(item.children[0], chessPieces, chessPieceObjects));
            gridRows.push(gridObject);
            if (item.dataset.col === "h") {
                gridifiedArray.push(gridRows);
                gridRows = [];
            }
        }

        return gridifiedArray;
    }

    function getObjectFromHTMLElement(HTMLElement,HTMLElementArray,objectArray) {
        const selectedElementIndex = Array.from(HTMLElementArray).indexOf(HTMLElement);
        return objectArray[selectedElementIndex];
    }

    function getGridFromHTMLElement(HTMLElement, gridArray) {
        const colIndex = {
            "a" : 0,
            "b" : 1,
            "c" : 2,
            "d" : 3,
            "e" : 4,
            "f" : 5,
            "g" : 6,
            "h" : 7
        }

        const gridRow = 8 - Number(HTMLElement.dataset.row);
        const gridCol = colIndex[HTMLElement.dataset.col];

        return gridArray[gridRow][gridCol];
    }

    function getPieceElement(piece) {
        return piece.element;
    }

    function isInCheck() {
        for (let piece of playerPiecesObjectMap[currentPlayer]) {

            if (piece.currentGridObject === null) {
                continue;
            }
            
            const pieceRange = piece.moveRange();
            // if (piece.type === "queen") {
            //     console.log(piece.element)
            // }

            // console.log("Objects map in incheck")
            //         console.log(
            //             chessGridObjects.map(
            //                 obj => { return obj.map(arr => {return arr.occupier?.element})}
            //             )
            //         )
            for (let grid of pieceRange) {
                const occupiedType = grid.occupier?.type;
                if (occupiedType === "king") {
                    console.log(chessGridObjects[6][3])
                    // console.error("Current grid")
                    // console.log(piece.currentGridObject)
                    // console.warn(pieceRange)
                    // console.log(grid);
                    console.warn(piece);
                    console.log(piece.currentGridObject);
                    return {
                        inCheck: true,
                        beingChecked: (currentPlayer === "one") ? "two" : "one",
                        checker: piece
                    };
                }
            }
        }
        return {
            inCheck: false,
            beingChecked: null,
            checker: null
        }
    }

    function setupCheckEventListeners(gameInCheck) {
        const {checker} = gameInCheck;
        const checkerRange = checker.moveRange();
        eventListeningPieces = [];
        playerPiecesMap[currentPlayer].forEach(
            chesspiece => {
                chesspiece.removeEventListener("click", showMovableGrids);
            }
        ); 
        
        const checkedKing = (currentPlayer === "one") ? kingPiecesObjects[0] : kingPiecesObjects[1];
        checkedKing.element.addEventListener("click", showMovableGrids);
        eventListeningPieces.push(checkedKing);

        for (let piece of playerPiecesObjectMap[currentPlayer]) {
            if (piece.currentGrid === null) {
                continue;
            }

            const pieceRange = piece.moveRange();

            if (pieceRange.includes(checker.currentGridObject)) {
                piece.element.addEventListener("click", showMovableGrids);
                eventListeningPieces.push(piece);
                continue;
            }

            for (let grid of checkerRange) {
                if (pieceRange.includes(grid)) {
                    piece.element.addEventListener("click", showMovableGrids);
                    eventListeningPieces.push(piece);
                    break;
                }
            }
        }
    }

    function filterHighlightedGridsCheck(highlightedGrid, checker, selectedPieceObject) {
        for (let i = 0; i < highlightedGrid.length; i++) {
            grid = highlightedGrid[i];
            const initialGridOccupier = grid?.occupier;

            if ((initialGridOccupier === checker) || (grid === undefined)) {
                continue;
            }

            grid.occupier = selectedPieceObject;
            selectedPieceObject.currentGridObject.occupier = undefined;
            
            if (initialGridOccupier !== undefined) {
                initialGridOccupier.currentGridObject = null;
                initialGridOccupier.currentGrid = null;
            }

            const inSimulatedCheck = isInCheck();
            if (inSimulatedCheck.inCheck) {
                highlightedGrid[i] = undefined;
            }

            grid.occupier = initialGridOccupier;
            selectedPieceObject.currentGridObject.occupier = selectedPieceObject;

            if (initialGridOccupier !== undefined) {
                initialGridOccupier.currentGridObject = grid;
                initialGridOccupier.currentGrid = grid.element;
            }
        }

        return highlightedGrid;
    }
    
})();