
class ChessPiece {
    constructor(type, player, isActive, currentGridObject, chessGrid, element) {
        this.type = type;
        this.isActive = isActive;
        
        this.currentGridObject = currentGridObject;
        this.currentGrid = null;
        this.originalGrid = null;
        
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
        const promotionRow = (this.player === "one") ? 7 : 0;
        const movableSlot = (this.player === "one") ? this.chessGrid[gridRow + 1]?.[gridCol] : this.chessGrid[gridRow - 1]?.[gridCol];

        if ((movableSlot !== undefined) && (movableSlot.occupier === undefined)) {
            const possibleMoveToGrid = {
                slot: movableSlot,
                type: "normal"
            }

            if (movableSlot.row === promotionRow) {
                possibleMoveToGrid.canPromote = true;
            }
            
            movableGrids.push(possibleMoveToGrid);
        }

        if (this.moves === 0) {
            const firstMoveSlot = (this.player === "one") ? this.chessGrid[gridRow + 2][gridCol] : this.chessGrid[gridRow - 2][gridCol];
            if (firstMoveSlot.occupier === undefined) {
                movableGrids.push(
                    {
                        slot    : firstMoveSlot,
                        type    : "normal"
                    }
                );
            }
        }

        const diagonalLeft = (this.player === "one") ? this.chessGrid[gridRow + 1]?.[gridCol + 1] : this.chessGrid[gridRow - 1]?.[gridCol - 1];
        const diagonalLeftOccupier = diagonalLeft?.occupier?.player;    
        if ((diagonalLeftOccupier !== undefined) && (diagonalLeftOccupier !== this.player)) {
            const possibleMoveToGrid = {
                slot    : diagonalLeft,
                type    : "capture"
            }

            if (movableSlot.row === promotionRow) {
                possibleMoveToGrid.canPromote = true;
            }
            movableGrids.push(possibleMoveToGrid);
        }
        
        const diagonalRight = (this.player === "one") ? this.chessGrid[gridRow + 1]?.[gridCol - 1] : this.chessGrid[gridRow - 1]?.[gridCol + 1];
        const diagonalRightOccupier = diagonalRight?.occupier?.player;
        if ((diagonalRightOccupier !== undefined) && (diagonalRightOccupier !== this.player)) {
            const possibleMoveToGrid = {
                slot    : diagonalRight,
                type    : "capture"
            }

            if (movableSlot.row === promotionRow) {
                possibleMoveToGrid.canPromote = true;
            }
            movableGrids.push(possibleMoveToGrid);
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
                const gridOccupierType = possibleGrid?.occupier?.type;
                const gridOccupierPlayer = possibleGrid?.occupier?.player ?? this.player;
                const gridOccupierMoves = possibleGrid?.occupier?.moves ?? 0;

                if ((gridOccupierType === "pawn") && (gridOccupierPlayer !== this.player) && (gridOccupierMoves === 1)) {
                    movableGrids.push(
                        {
                            slot        : pushedGrids[i],
                            type        : "enpassant",
                            pawnGrid    : possibleGrid
                        }
                    );
                }
            }
        }
    }

    rookRange(movableGrids, gridRow, gridCol) {
        for (let i = gridRow + 1; i < 8; i++) {
            const possibleGrid = this.chessGrid[i][gridCol];
            
            const occupierPlayer = possibleGrid.occupier?.player;
            
            if ((occupierPlayer !== undefined) && (occupierPlayer !== this.player)) {
                movableGrids.push(
                    {
                        slot    : possibleGrid,
                        type    : "capture"
                    }
                );
                break;
            }

            if (occupierPlayer === this.player) {
                break;
            }

            movableGrids.push(
                {
                    slot    : possibleGrid,
                    type    : "normal"
                }
            );
        }

        for (let i = gridRow - 1; i >= 0; i--) {
            const possibleGrid = this.chessGrid[i][gridCol];
            
            const occupierPlayer = possibleGrid.occupier?.player;
            
            if ((occupierPlayer !== undefined) && (occupierPlayer !== this.player)) {
                movableGrids.push(
                    {
                        slot    : possibleGrid,
                        type    : "capture"
                    }
                );
                break;
            }

            if (occupierPlayer === this.player) {
                break;
            }

            movableGrids.push(
                {
                    slot    : possibleGrid,
                    type    : "normal"
                }
            );
        }

        for (let i = gridCol + 1; i < 8; i++) {
            const possibleGrid = this.chessGrid[gridRow][i];
            
            const occupierPlayer = possibleGrid.occupier?.player;
            
            if ((occupierPlayer !== undefined) && (occupierPlayer !== this.player)) {
                movableGrids.push(
                    {
                        slot    : possibleGrid,
                        type    : "capture"
                    }
                );
                break;
            }

            if (occupierPlayer === this.player) {
                break;
            }

            movableGrids.push(
                {
                    slot    : possibleGrid,
                    type    : "normal"
                }
            ); 
        }

        for (let i = gridCol - 1; i >= 0; i--) {
            const possibleGrid = this.chessGrid[gridRow][i];
            
            const occupierPlayer = possibleGrid.occupier?.player;
            
            if ((occupierPlayer !== undefined) && (occupierPlayer !== this.player)) {
                movableGrids.push(
                    {
                        slot    : possibleGrid,
                        type    : "capture"
                    }
                );
                break;
            }

            if (occupierPlayer === this.player) {
                break;
            }

            movableGrids.push(
                {
                    slot    : possibleGrid,
                    type    : "normal"
                }
            );
        }
    }

    bishopRange(movableGrids, gridRow, gridCol) {
        let row = gridRow + 1;
        let col = gridCol + 1;

        while ((row < 8) && (col < 8)) {
            const possibleGrid = this.chessGrid[row][col];
            
            const occupierPlayer = possibleGrid.occupier?.player;
            if ((occupierPlayer !== undefined) && (occupierPlayer !== this.player)) {
                movableGrids.push(
                    {
                        slot    : possibleGrid,
                        type    : "capture"
                    }
                );
                break;
            }

            if ((occupierPlayer === this.player)) {
                break;
            }

            movableGrids.push(
                {
                    slot    : possibleGrid,
                    type    : "normal"
                }
            );

            row++;
            col++;
        }

        row = gridRow + 1;
        col = gridCol - 1;

        while((row < 8) && (col >= 0)) {
            const possibleGrid = this.chessGrid[row][col];
            
            const occupierPlayer = possibleGrid.occupier?.player;
            if ((occupierPlayer !== undefined) && (occupierPlayer !== this.player)) {
                movableGrids.push(
                    {
                        slot    : possibleGrid,
                        type    : "capture"
                    }
                );
                break;
            }

            if ((occupierPlayer === this.player)) {
                break;
            }

            movableGrids.push(
                {
                    slot    : possibleGrid,
                    type    : "normal"
                }
            );

            row++;
            col--;
        }

        row = gridRow - 1;
        col = gridCol + 1;

        while ((row >= 0) && (col < 8)) {
            const possibleGrid = this.chessGrid[row][col];
            
            const occupierPlayer = possibleGrid.occupier?.player;
            if ((occupierPlayer !== undefined) && (occupierPlayer !== this.player)) {
                movableGrids.push(
                    {
                        slot    : possibleGrid,
                        type    : "capture"
                    }
                );
                break;
            }

            if ((occupierPlayer === this.player)) {
                break;
            }

            movableGrids.push(
                {
                    slot    : possibleGrid,
                    type    : "normal"
                }
            );

            row--;
            col++;
        }
        
        row = gridRow - 1;
        col = gridCol - 1;

        while ((row >= 0) && (col >= 0)) {
            const possibleGrid = this.chessGrid[row][col];
            
            const occupierPlayer = possibleGrid.occupier?.player;
            if ((occupierPlayer !== undefined) && (occupierPlayer !== this.player)) {
                movableGrids.push(
                    {
                        slot    : possibleGrid,
                        type    : "capture"
                    }
                );
                break;
            }

            if ((occupierPlayer === this.player)) {
                break;
            }

            movableGrids.push(
                {
                    slot    : possibleGrid,
                    type    : "normal"
                }
            );

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
                movableGrids.push(
                    {
                        slot    : possibleGrid,
                        type    : "normal"
                    }
                );
            }

            if ((occupierPlayer !== undefined) && (occupierPlayer !== this.player)) {
                movableGrids.push(
                    {
                        slot    : possibleGrid,
                        type    : "capture"
                    }
                );
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
                movableGrids.push(
                    {
                        slot    : possibleGrid,
                        type    : "normal"
                    }
                );
            }

            if ((occupiedPlayer !== undefined) && (occupiedPlayer !== this.player)) {
                movableGrids.push(
                    {
                        slot    : possibleGrid,
                        type    : "capture"
                    }
                );
            }
        }
    }
}

class ChessGrid {
    constructor(element, occupier, row, col) {
        this.element = element;
        this.occupier = occupier;
        this.row = row;
        this.col = col;
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
            return new ChessPiece(dataset.piece, dataset.player, true, null, null, chesspiece, null);
        }
    );

    const kingPiecesObjects = [];
    
        
    const chessGridObjects = gridify(chessGrids);
    chessPieceObjects.forEach(
        (chesspieceObj) => {
            chesspieceObj.chessGrid = chessGridObjects;
            chesspieceObj.currentGridObject = getGridFromHTMLElement(chesspieceObj.element.parentNode, chessGridObjects);
            chesspieceObj.currentGrid = chesspieceObj.element.parentNode;
            chesspieceObj.originalGrid = chesspieceObj.currentGridObject;

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
    let upgradedPieceObject = null;
    let currentPlayer = "two";
    let gameInCheck = {
        inCheck: false,
        beingChecked: null,
        checker: null
    };
    let gameInCheckMate = {
        inCheckMate: false,
        checkmater: null
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
        //Toggle the highlight of already highlighted grids
        if (highlightedGrid !== null) {
            highlightedGrid.forEach(
                gridObjects => {
                    if (gridObjects === undefined) {
                        return;
                    }

                    const {element} = gridObjects?.slot;
                    element.classList.remove("chessboard--block__highlighted");
                }
            );
        }

        //If no piece has been selected yet, cancel action
        if (selectedPiece === event.currentTarget) {
            
            highlightedGrid = null;
            selectedPiece = null;
            selectedPieceObject = null;
            event.stopPropagation();
            return;
        }
        
        selectedPiece = event.currentTarget;
        selectedPieceObject = getObjectFromHTMLElement(selectedPiece, chessPieces, chessPieceObjects);
        console.log(selectedPieceObject);
        
        highlightedGrid = selectedPieceObject.moveRange();
        if (selectedPieceObject.type === "pawn") {
            console.error(highlightedGrid)
        }


        //Filter move range of chesspiece to prevent check
        const savedCurrentPlayer = currentPlayer;
        currentPlayer = (currentPlayer === "one") ? "two" : "one";
        const possibleCheckers = playerPiecesObjectMap[currentPlayer];
        for (let checkers of possibleCheckers) {
            filterHighlightedGridsCheck(highlightedGrid, checkers, selectedPieceObject);
        }
        currentPlayer = savedCurrentPlayer;
        
        

        highlightedGrid.forEach(
            gridObjects => {
                if (gridObjects === undefined) {
                    return;
                }

                const {element} = gridObjects?.slot;
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
        const initialGridOccupier = selectedGridObject.occupier;
        
        highlightedGrid.forEach(
            gridObjects => {
                if (gridObjects === undefined) {
                    return;
                }

                const {element} = gridObjects?.slot;
                element.classList.remove("chessboard--block__highlighted");

            }
        );

        highlightedGridSlot = highlightedGrid.map(gridObj => gridObj?.slot);

        if (!(highlightedGridSlot.includes(selectedGridObject))) {
            highlightedGrid = null;
            selectedPiece = null;
            selectedPieceObject = null;
            return;
        }

        selectedGridObject.moveToGrid(selectedPieceObject);
        
        const canEatFirstMovePawnRow = (currentPlayer === "one") ? 5 : 2;
        const canPromoteRow = (currentPlayer === "one") ? 7 : 0;
        const {gridRow, gridCol} = selectedGridObject.getRowAndColIndex();

        if ((selectedPieceObject.type === "pawn") && (gridRow === canEatFirstMovePawnRow) && (initialGridOccupier === undefined)) {

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

       
        if ((selectedPieceObject.type === "pawn") && (gridRow === canPromoteRow)) {
            upgradedPieceObject = selectedPieceObject;
            setupPromotion(currentPlayer);
        }
        
        gameInCheck = isInCheck();
        gameInCheckMate = isInCheckMate();

        eventListeningPieces = [];
        playerPiecesMap[currentPlayer].forEach(
            (chesspiece) => {
                chesspiece.removeEventListener("click", showMovableGrids);
            }
        )

        if (gameInCheckMate.inCheckMate) {
            console.log("checkmate");
            console.log(`Player ${currentPlayer} won`)
        }
        
        
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

    function promotePawn(event) {
        const buttonIcon = event.currentTarget;
        const buttonIconType = buttonIcon.dataset.piece;
        const promotePopup = document.querySelector(".chess-upgrade");
        const overlay = document.querySelector(".overlay");

        upgradedPieceObject.element.dataset.piece = buttonIconType;
        upgradedPieceObject.element.className = `fas fa-chess-${buttonIconType} chesspiece player-${currentPlayer}`;

        upgradedPieceObject.type = buttonIconType;
        
        upgradedPieceObject = null;
        overlay.classList.toggle("active");
        promotePopup.style.setProperty("--scale","0");

    }

    //Helper Functions
    function gridify(array) {
        const gridifiedArray = [];
        let gridRows = [];

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

        
        for (let item of array) {
            const gridRow = 8 - Number(item.dataset.row);
            const gridCol = colIndex[item.dataset.col];
            
            const gridObject = new ChessGrid(item, getObjectFromHTMLElement(item.children[0], chessPieces, chessPieceObjects), gridRow, gridCol);
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
                const occupiedType = grid?.slot.occupier?.type;
                if (occupiedType === "king") {
                    // console.log(chessGridObjects[6][3])
                    // console.error("Current grid")
                    // console.log(piece.currentGridObject)
                    // console.warn(pieceRange)
                    // console.log(grid);
                    // console.warn(piece);
                    // console.log(piece.currentGridObject);
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
    
    function isInCheckMate() {
        const otherPlayer = (currentPlayer === "one") ? "two" : "one";
        for (let piece of playerPiecesObjectMap[otherPlayer]) {
            const pieceRange = piece.moveRange();
            let counter = 0;
            
            for (let grid of pieceRange) {
                if (grid === undefined) {
                    counter++;
                }
            }        

            if (counter !== pieceRange.length) {
                return {
                    inCheckMate: false,
                    checkmater: null
                }
            }
        }

        return {
            inCheckMate: true,
            checkmater: currentPlayer
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
            const pieceSlotRange = pieceRange.map(piece => piece?.slot);

            if (pieceSlotRange.includes(checker.currentGridObject)) {
                piece.element.addEventListener("click", showMovableGrids);
                eventListeningPieces.push(piece);
                continue;
            }

            for (let grid of checkerRange) {
                if (pieceSlotRange.includes(grid?.slot)) {
                    piece.element.addEventListener("click", showMovableGrids);
                    eventListeningPieces.push(piece);
                    break;
                }
            }
        }

        console.log(eventListeningPieces)
    }
    

    function filterHighlightedGridsCheck(highlightedGrid, checker, selectedPieceObject) {
        if (selectedPieceObject.type === "king") {
            console.error(selectedPieceObject);
            console.log(highlightedGrid.slice())
        }
        for (let i = 0; i < highlightedGrid.length; i++) {
           
            if (selectedPieceObject.type === "king") {
                console.log(grid)
            }

            if (selectedPieceObject.type === "queen") {
                console.log(highlightedGrid)
            }

            grid = highlightedGrid[i]?.slot;
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
            if (selectedPieceObject.type === "king") {
                console.warn(inSimulatedCheck);
            }
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

    function setupPromotion(currentPlayer) {
        const promotionPopup = document.querySelector(".chess-upgrade");
        const overlay = document.querySelector(".overlay");

        promotionPopup.style.setProperty("--scale","100%");
        overlay.classList.toggle("active");

        const upgradeChoiceButtons = document.querySelectorAll(".upgrade--button");
        upgradeChoiceButtons.forEach(
            (button) => {
                button.dataset.player = currentPlayer;
                button.style.background = (currentPlayer === "one") ? "white" : "black";
                button.addEventListener("click", promotePawn);
            }
        )
    }

    
})();