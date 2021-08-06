//Colour codes
const colourCodes = {
    "red_bull" : ["#0006ab","white", null],
    "mercedes" : ["#00faa7","black", null],
    "mclaren" : ["#ff9100","black", null],
    "aston_martin" : ["#00540a", "white", null],
    "alpine" : ["#00a4d1", "black", null],
    "ferrari" : ["#f20000", "white", null],
    "alphatauri" : ["#003c5e", "white", null],
    "alfa" : ["#730000","white", null],
    "haas" : ["white", "black", "#d10000"],
    "williams" : ["#0054d1", "white", null]
}

const month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
]

//Document elements
const dropdownButton = document.querySelector(".navbar-toggle");
const dropdownMenu = document.querySelector(".navbar-list");
const prevButton = document.querySelector("#carousel-button-left");
const nextButton = document.querySelector("#carousel-button-right");
const carouselBar = document.querySelector(".carousel-track");

//Adding Event Listeners
dropdownButton.addEventListener("click",dropdownActive);
prevButton.addEventListener("click", prevElements);
nextButton.addEventListener("click", nextElements);

//Event Listener Functions
function dropdownActive(event) {
    dropdownButton.classList.toggle("active");
    dropdownMenu.classList.toggle("active");
}

function prevElements(event) {
    const currentElements = document.querySelectorAll(".slide-displayed");
    const [firstElem, secondElem, thirdElem, fourthElem, fifthElem] = currentElements;
    const prevElem = firstElem.previousElementSibling;
    const amountMoved = 25 * prevElem.dataset.index;

    prevElem.classList.add("slide-displayed");
    fifthElem.classList.remove("slide-displayed");

    carouselBar.style.transform = `translateX(-${amountMoved}%)`;
    // console.log(nextElement);
    // console.log(allElements);

}

function nextElements(event) {
    const currentElements = document.querySelectorAll(".slide-displayed");
    
    const [firstElem, secondElem, thirdElem, fourthElem, fifthElem] = currentElements;
    const amountMoved = 25 * secondElem.dataset.index;

    const nextElem = fifthElem.nextElementSibling;
    firstElem.classList.remove("slide-displayed");
    nextElem.classList.add("slide-displayed");

    carouselBar.style.transform = `translateX(-${amountMoved}%)`;
    console.log(document.querySelectorAll(".slide-displayed"));
    console.log(nextElem);

}

function getSelectedRaceResult(event) {
    const eventTarget = event.currentTarget;
    const raceIndex = eventTarget.dataset.index;

    getResults(raceIndex)
    .then(raceResult => replaceResults(raceResult,eventTarget,null))
    .catch(error => replaceResults(null,eventTarget,error));
}

//API fetching
const API_DRIVERS = "https://ergast.com/api/f1/current/driverStandings.json";
const API_CONSTRUCTORS = "https://ergast.com/api/f1/current/constructorStandings.json";
const API_RECENT_RESULTS = "https://ergast.com/api/f1/current/last/results.json";
const API_SEASON = "https://ergast.com/api/f1/current.json";

function getDriverStandings() {
    return fetch(API_DRIVERS)
    .then(res => res.json())
    .then(data => {
        const {
            MRData:{StandingsTable:{StandingsLists}},
        } = data;

        const driverStandings = StandingsLists[0].DriverStandings;

        const driver = Object.entries(driverStandings).map(
            ([,driverInfo]) => {
                const {Constructors,Driver} = driverInfo;
                return {
                    position: driverInfo.position,
                    driverId: Driver.driverId,
                    
                    firstName: Driver.givenName,
                    lastName: Driver.familyName,
                    nationality: Driver.nationality,

                    constructorId: Constructors[0].constructorId,                   
                    
                    points: driverInfo.points

                }
            }
            )
        return driver;
    });
}

function getConstructorStandings() {
    return fetch(API_CONSTRUCTORS)
    .then(res => res.json())
    .then(data => {
        const {MRData:{StandingsTable:{StandingsLists}}} = data;
        const {ConstructorStandings:constructorStandings} = StandingsLists[0];


        const constStandings = Object.entries(constructorStandings).map(
            ([,constructor]) => {
                const {Constructor:constructorInfo} = constructor;
                return {
                    position: constructor.position,
                    points: constructor.points,

                    constructorId: constructorInfo.constructorId,
                    constructorName: constructorInfo.name,
                    nationality: constructorInfo.nationality
                }
            }
        )
        return constStandings;
    });
}

function getResults(trackInd = null) {
    const now = new Date(Date.now());
    const usedAPI = (trackInd === null) ? API_RECENT_RESULTS : `http://ergast.com/api/f1/${now.getFullYear()}/${Number(trackInd) + 1}/results.json`;
    return fetch(usedAPI)
    .then(result => result.json())
    .then(data => {
        // console.log(data);
        const {MRData: {RaceTable:{Races}}} = data;
        const {Circuit, Results, round, raceName} = Races[0];

        const resultTable = Object.entries(Results).map(
            ([,pos]) => {
                const {Constructor, Driver, Time, points, position, status} = pos;
                return {
                    constructor: Constructor.name,
                    driverFirstName: Driver.givenName,
                    driverLastName: Driver.familyName,
                    position: position,
                    timeRetired: ((status === "Finished") ? Time.time : status),
                    points: points
                }
            }
        )
        
        return {
            circuitId : Circuit.circuitId,
            round: round,
            grandPrix : raceName,
            resultTable: resultTable,

        }
    })
}

function getSeason() {
    return fetch(API_SEASON)
    .then(result => result.json())
    .then(data => {
        const {MRData: {RaceTable : {Races}}} = data;
        const circuitLst = Races.map(
            (race) => {
                const {Circuit, raceName, date} = race;
                dateInDateClass = new Date(date);
                
                return {
                    raceDate: dateInDateClass.getDate(),
                    raceMonth: month[dateInDateClass.getMonth()],
                    
                    circuitId: Circuit.circuitId,
                    raceName: raceName
                }
            }
        )
        return circuitLst;
    })
}

function displayDrivers(contestant,maxPoint) {
    const {position,driverId,firstName,lastName,nationality,constructorId,points} = contestant;
    const [bgColour, textColour, borderColour] = colourCodes[constructorId];
    let percentage = Number(points) / maxPoint * 100;

    if (percentage < 9) {
        percentage = 9; 
    }

    const standingBar = document.getElementById("driver-standings");
    
    const positionCol = document.createElement("div");
    const positionAnim = document.createElement("div");

    positionCol.classList.add("position-col");
    
    positionAnim.classList.add("animation-in");
    positionAnim.style.setProperty("--order",Number(position) - 1);
    positionAnim.appendChild(positionCol);
    standingBar.appendChild(positionAnim);

    const pointBar = document.createElement("div");
    pointBar.classList.add("point-bar");
    pointBar.style.setProperty("--point-percent", `${percentage}%`);
    pointBar.style.setProperty("--constructor-bg", bgColour);
    pointBar.style.setProperty("--constructor-fg", textColour);

    if (borderColour !== null) {
        pointBar.style.setProperty("border",`${borderColour} 0.15rem solid`);
    }

    const nameAndPointInfo = document.createElement("div");
    nameAndPointInfo.classList.add("point-bar-div");

    const driverName = document.createElement("p");
    const driverPoints = document.createElement("p");
    const flagSpan = document.createElement("span");
    const flag = document.createElement("img");

    driverName.classList.add("point-bar-text");
    driverPoints.classList.add("point-bar-text");
    flag.classList.add("flag");

    driverName.innerText = `${firstName} ${lastName}`;
    driverPoints.innerText = (Number(points) === 1) ? `${points} pt` : `${points} pts`;
    flag.src = `images/nationalities/${nationality}.png`;

    flagSpan.appendChild(flag);
    driverName.appendChild(flagSpan);

    nameAndPointInfo.appendChild(driverName);
    nameAndPointInfo.appendChild(driverPoints);
    

    const logo = document.createElement("img");
    logo.classList.add("constructor-logo");
    logo.src = `images/constructors/${constructorId}.png`;

    const positionText = document.createElement("h2");
    positionText.classList.add("point-bar-pos");
    positionText.innerText = position;

    if (percentage > 25) {
        const pointBarLogo = document.createElement("div");
        pointBarLogo.classList.add("point-bar-logo-div");

        pointBarLogo.appendChild(positionText);
        pointBarLogo.appendChild(logo);

        pointBar.appendChild(pointBarLogo);
        pointBar.appendChild(nameAndPointInfo);
        

        positionCol.appendChild(pointBar);
    }

    else if (percentage > 0) {
        pointBar.classList.add("point-bar-logo-div");
        pointBar.classList.add("point-bar-overflow");
        pointBar.appendChild(positionText);
        pointBar.appendChild(logo);

        positionCol.appendChild(pointBar);
        positionCol.appendChild(nameAndPointInfo);

        driverName.classList.add("align-left");
        driverPoints.classList.add("align-left");

    }

}

function displayConstructors(constructors,maxPoints) {
    const {constructorId, constructorName, points, position} = constructors;
    const [colourBg,colourText,colourBorder] = colourCodes[constructorId];

    let percentage = Number(points) / maxPoints * 100;
    if (percentage < 9) {
        percentage = 9;
    }
    
    const standingBar = document.querySelector("#constructor-standings");
    const positionAnim = document.createElement("div");
    const positionCol = document.createElement("div");
    positionCol.classList.add("position-col");
    positionAnim.classList.add("animation-in");
    positionAnim.style.setProperty("--order",Number(position) - 1);
    
    positionAnim.appendChild(positionCol);
    standingBar.appendChild(positionAnim);

    const pointBar = document.createElement("div");
    pointBar.style.setProperty("--point-percent",`${percentage}%`);
    pointBar.style.setProperty("--constructor-bg", colourBg);
    pointBar.style.setProperty("--constructor-fg", colourText);

    if (colourBorder !== null) {
        pointBar.style.setProperty("border", `${colourBorder} 0.15rem solid`)
    }
    pointBar.classList.add("point-bar");

    const positionText = document.createElement("h2");
    const logo = document.createElement("img");

    positionText.innerText = position;
    logo.src = `images/constructors/${constructorId}.png`;

    positionText.classList.add("point-bar-pos");
    logo.classList.add("constructor-logo");

    const nameAndPointInfo = document.createElement("div");
    nameAndPointInfo.classList.add("point-bar-div");
    
    const teamName = document.createElement("p");
    const teamPoints = document.createElement("p");

    teamName.innerText = constructorName;
    teamPoints.innerText = (points == 1) ? `${points} pt` : `${points} pts`;

    teamName.classList.add("point-bar-text");
    teamPoints.classList.add("point-bar-text");

    nameAndPointInfo.appendChild(teamName);
    nameAndPointInfo.appendChild(teamPoints);
    
    if (percentage > 25) {
        const logoDiv = document.createElement("div");
        logoDiv.classList.add("point-bar-logo-div");
        logoDiv.appendChild(positionText);
        logoDiv.appendChild(logo);

        pointBar.appendChild(logoDiv);
        pointBar.appendChild(nameAndPointInfo);

        positionCol.appendChild(pointBar);
    }

    else {
        pointBar.classList.add("point-bar-logo-div", "point-bar-overflow");
        pointBar.appendChild(positionText);
        pointBar.appendChild(logo);

        teamName.classList.add("align-left");
        teamPoints.classList.add("align-left");

        positionCol.appendChild(pointBar);
        positionCol.appendChild(nameAndPointInfo);
    }

}

function displayResults({circuitId, round, grandPrix,resultTable}) {
    // const raceInfo = document.createElement("div");
    // raceInfo.classList.add("race-info");
    const raceInfo = document.querySelector(".race-info");

    const raceText = document.createElement("h1");
    raceText.classList.add("race-text","fg-dark","align-center");
    raceText.innerText = grandPrix;

    const circuitMap = document.createElement("img");
    circuitMap.classList.add("circuit-illus");
    circuitMap.src = `images/tracks/${circuitId}.png`;

    raceInfo.appendChild(raceText);
    raceInfo.appendChild(circuitMap);
    

    const raceResult = document.querySelector(".race-result");
    resultTable.forEach(
        pos => {
            const {constructor, driverFirstName, driverLastName, position, timeRetired, points} = pos;
            
            const resultBar = document.createElement("div");
            resultBar.classList.add("result-bar");

            const positionTxt = document.createElement("h6");
            positionTxt.innerText = position;
            positionTxt.classList.add("point-bar-title", "align-center");
            resultBar.appendChild(positionTxt)

            let driverName = `${driverFirstName} ${driverLastName}`;
            const result = [driverName, constructor, timeRetired, points]

            for (let elem of result) {
                const pText = document.createElement("p");
                pText.classList.add("point-bar-text", "align-center");
                pText.innerText = elem;
                resultBar.appendChild(pText);
            }

            raceResult.appendChild(resultBar);
        }
    )

}


function replaceResults(grandPrix, target, error) {
     const grandPrixName = target.dataset.grandPrixName;
     const circuitId = target.dataset.circuitId;

     const grandPrixResultDiv = document.querySelector(".race-result");
     const grandPrixResultDivChildren = Array.from(grandPrixResultDiv.children);
     
     const circuitMap = document.querySelector(".circuit-illus");
     circuitMap.src = `images/tracks/${circuitId}.png`;
     
     const grandPrixTitle = document.querySelector(".race-text.fg-dark.align-center");
     grandPrixTitle.innerText = grandPrixName;

     grandPrixResultDivChildren.forEach(
         element => grandPrixResultDiv.removeChild(element)
     )

     if (error !== null) {
         const oopsMessage = document.createElement("h4");
         oopsMessage.classList.add("race-text","fg-dark","align-center");
         oopsMessage.innerText = "Oops... We haven't raced here yet...";

         const stayTunedMessage = document.createElement("h4");
         stayTunedMessage.classList.add("fg-dark", "align-center");
         stayTunedMessage.innerText = "We'll update the results later on.";

         grandPrixResultDiv.appendChild(oopsMessage);
         grandPrixResultDiv.appendChild(stayTunedMessage);
        //  console.log(error);

         return;
     }

     const classificationText = document.createElement("h2");
     classificationText.classList.add("race-text","fg-dark","align-left");
     classificationText.innerText = "Classifications:";
     grandPrixResultDiv.appendChild(classificationText);

     const resultBarBgNone = document.createElement("div");
     resultBarBgNone.classList.add("result-bar", "bg-none");

     const positionHeader = document.createElement("h6");
     positionHeader.classList.add("point-bar-title", "align-center");
     positionHeader.innerText = "Position";
     resultBarBgNone.appendChild(positionHeader);

     const positionArr = ["Driver", "Constructor", "Time/Retired", "Points"];
     positionArr.forEach(
         text => {
             const textSlot = document.createElement("p");
             textSlot.classList.add("point-bar-text", "align-center");
             textSlot.innerText = text;
             resultBarBgNone.appendChild(textSlot);
         }
     )
     grandPrixResultDiv.appendChild(resultBarBgNone);
     resultLst = grandPrix.resultTable;

     resultLst.forEach(
        pos => {
            const {constructor, driverFirstName, driverLastName, position, timeRetired, points} = pos;
            
            const resultBar = document.createElement("div");
            resultBar.classList.add("result-bar");

            const positionTxt = document.createElement("h6");
            positionTxt.innerText = position;
            positionTxt.classList.add("point-bar-title", "align-center");
            resultBar.appendChild(positionTxt)

            let driverName = `${driverFirstName} ${driverLastName}`;
            const result = [driverName, constructor, timeRetired, points]

            for (let elem of result) {
                const pText = document.createElement("p");
                pText.classList.add("point-bar-text", "align-center");
                pText.innerText = elem;
                resultBar.appendChild(pText);
            }

            grandPrixResultDiv.appendChild(resultBar);
        }
     )


}

function displaySeason(circuitLst) {
    const seasonCarousel = document.querySelector(".carousel-track");

    circuitLst.forEach(
        (grandPrix,index) => {
            const {raceDate, raceMonth, raceName, circuitId} = grandPrix;

            const carouselCard = document.createElement("li");
            carouselCard.classList.add("carousel-slide");

            const circuitImage = document.createElement("img");
            circuitImage.src = `images/tracks/${circuitId}.png`;
            circuitImage.classList.add("slide-track");

            const cardBottomDiv = document.createElement("div");
            cardBottomDiv.classList.add("card-bottom");

            const grandPrixName = document.createElement("h4");
            grandPrixName.innerText = raceName;
            grandPrixName.classList.add("slide-title");
            cardBottomDiv.appendChild(grandPrixName);

            const grandPrixDate = document.createElement("h5");
            grandPrixDate.innerText = `${raceDate} ${raceMonth}`;
            grandPrixDate.classList.add("slide-text");
            cardBottomDiv.appendChild(grandPrixDate);

            carouselCard.appendChild(circuitImage);
            carouselCard.appendChild(cardBottomDiv);
            carouselCard.dataset.circuitId = circuitId;
            carouselCard.dataset.grandPrixName = raceName;
            carouselCard.dataset.index = index;
            carouselCard.addEventListener("click", getSelectedRaceResult);

            if (index < 5) {
                carouselCard.classList.add("slide-displayed");
            }
            
            seasonCarousel.appendChild(carouselCard);
        }
    )

}

getDriverStandings().then(driverLst => {
    const maxPoints = Number(driverLst[0].points);
    driverLst.forEach(
        driver => displayDrivers(driver,maxPoints)
    )
})
.then(getConstructorStandings().then(constLst => {
    const maxPoints = Number(constLst[0].points);
    constLst.forEach(
        constructor => displayConstructors(constructor,maxPoints)
    )
}))
.then(getResults().then(resultLst => {
    displayResults(resultLst);
}))
.then(getSeason().then(circuitLst => {
    displaySeason(circuitLst);
}));





