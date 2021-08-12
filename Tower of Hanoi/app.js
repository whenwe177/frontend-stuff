
//Main Function
(function main() {
    
    //Variable declarations
    const colours = ["hsl(275, 98%, 25%)", "hsl(275, 98%, 35%)", "hsl(275, 98%, 45%)", "hsl(275, 98%, 55%)", "hsl(275, 98%, 65%)", "hsl(275, 98%, 70%)"]
    const diskSlider = document.querySelector("#disk-slider");
    const disks = []; 
    const pegs = document.querySelectorAll(".peg");
    const gameButton = document.querySelector("#disk-count");
    const stopwatch = document.querySelector(".stopwatch--time");
    const timeDisk = document.querySelector("#time-solving-disks");

    
    let draggedDisk = null;
    let diskBelowDraggedDisk = undefined;
    let numberOfDisks = 3;
    let interval = null;
    
    let stopwatchMinute = 0;
    let stopwatchSecond = 0;
    let stopwatchMilisecond = 0;
    
    let scoreStandings = JSON.parse(localStorage.getItem("towerofhanoi"));
    if (scoreStandings === null) {
        scoreStandings = 
        {
            3   : null,
            4   : null,
            5   : null,
            6   : null,
            7   : null
        };
        localStorage.setItem("towerofhanoi", JSON.stringify(scoreStandings));
    }
    
    if (scoreStandings[3] !== null) {
        timeDisk.innerText = `The fastest time you have done solving 3 disks is ${scoreStandings[3]}`;
    }
    
    //Event Listeners
    diskSlider.addEventListener("input", renameDiskLabel);

    pegs.forEach(
        (peg) => {
            peg.addEventListener("dragover", pegDragOver);
            peg.addEventListener("dragleave", pegDragLeave);
            peg.addEventListener("dragenter", pegDragEnter);
            peg.addEventListener("drop", pegDrop);
        }
    )

    gameButton.addEventListener("click", generateGame);


    //Function (Event listeners)
    function renameDiskLabel(event) {
        const diskLabel = document.querySelector("#disk-label");

        const fastestTime = (scoreStandings[diskSlider.value] === null) ? "00:00.00" : scoreStandings[diskSlider.value];

        timeDisk.innerText = `The fastest time you have done solving ${diskSlider.value} disks is ${fastestTime}`;
        diskLabel.innerText = `Number of disks: ${diskSlider.value}`;
    }

    function diskDragStart(event) {
        draggedDisk = this;
        diskBelowDraggedDisk = draggedDisk.previousElementSibling;

        setTimeout(
            () => {
                draggedDisk.style.display = "none";
            }, 0
        )
    }

    function diskDragEnd(event) {
        draggedDisk.style.display = "block";
        setTimeout(
            () => {
                draggedDisk = null;
            }, 0
        )
    }

    function pegDrop(event) {
        currentPeg = event.currentTarget;

        if (draggedDisk === null) {
            return;
        }

        if (currentPeg === draggedDisk.parentNode) {
            return;
        }

        const disksInPeg = currentPeg.querySelectorAll(".disk");

        const topDisk = disksInPeg[disksInPeg.length - 1];
        
        if ((topDisk !== undefined) && (Number(topDisk.style.getPropertyValue("--order")) < Number(draggedDisk.style.getPropertyValue("--order")))) {
            return;
        }

        if (diskBelowDraggedDisk !== null) {
            diskBelowDraggedDisk.setAttribute("draggable", "true");
        }

        disksInPeg.forEach(
            (disk) => {
                disk.setAttribute("draggable", "false");
            }
        )
        
      
        currentPeg.appendChild(draggedDisk); 
        draggedDisk.style.setProperty("--peg-height", disksInPeg.length);
        draggedDisk.classList.add("disk--moved");

        for (let i = 1; i < pegs.length; i++) {
            const selectedPegChild = pegs[i].querySelectorAll(".disk");
            if (selectedPegChild.length === numberOfDisks) {
                window.clearInterval(interval);
                const diskLabel = document.querySelector("#disk-label");

                if (scoreStandings[numberOfDisks] === null) {
                    scoreStandings[numberOfDisks] = stopwatch.innerText;
                    localStorage.setItem("towerofhanoi", JSON.stringify(scoreStandings));
                    timeDisk.innerText = `The fastest time you have done solving ${diskSlider.value} disks is ${scoreStandings[diskSlider.value]}`;
                    return;
                }

                const hasSetFasterTime = isFastestTime(numberOfDisks, stopwatchMinute, stopwatchSecond, stopwatchMilisecond);
                if (hasSetFasterTime) {
                    scoreStandings[numberOfDisks] = stopwatch.innerText;
                    localStorage.setItem("towerofhanoi", JSON.stringify(scoreStandings));
                    timeDisk.innerText = `The fastest time you have done solving ${diskSlider.value} disks is ${scoreStandings[diskSlider.value]}`;

                }
                return;
            }
        }
    }
    
    function pegDragEnter(event) {
        event.preventDefault();
    }
    
    function pegDragOver(event) {
        event.preventDefault();
    }
    
    function pegDragLeave(event) {
        
    }
    
    function generateGame(event) {
        
        disks.forEach(
            (disk) => disk.remove()
            )
            
            numberOfDisks = Number(diskSlider.value);
            
            for (let i = 0; i < numberOfDisks; i++) {
                const newDisk = document.createElement("div");
                newDisk.classList.add("disk");
                
                newDisk.style = `--order: ${numberOfDisks - i}; --disk-count: ${numberOfDisks}`;
                newDisk.style.background = colours[i];
                newDisk.setAttribute("draggable", (i === numberOfDisks - 1) ? "true" : "false");
                
                newDisk.addEventListener("dragstart", diskDragStart);
                newDisk.addEventListener("dragend", diskDragEnd);
                
                pegs[0].appendChild(newDisk);
                disks.push(newDisk);
            }
            
            [stopwatchMinute, stopwatchSecond, stopwatchMilisecond] = [0,0,0]
            interval = window.setInterval(stopwatchStart, 10);
        }
    
    //Function (Non-event listeners)
    function stopwatchStart() {
            stopwatchMilisecond++;
            
            if (stopwatchMilisecond >= 100) {
                stopwatchSecond++;
            stopwatchMilisecond = 0;
        }

        if (stopwatchSecond >= 60) {
            stopwatchMinute++;
            stopwatchSecond = 0;
        }

        stopwatch.innerText = `${String(stopwatchMinute).padStart(2,"0")}:${String(stopwatchSecond).padStart(2,"0")}.${String(stopwatchMilisecond).padStart(2,"0")}`;
    }

    function isFastestTime(disks,minute,second,milisecond) {
        const currentMinute = Number(scoreStandings[disks].substring(0,2));
        const currentSecond = Number(scoreStandings[disks].substring(3,5));
        const currentMilisecond = Number(scoreStandings[disks].substring(6));

        if (currentMinute !== minute) {
            return currentMinute > minute;
        }
        if (currentSecond !== second) {
            return currentSecond > second;
        }
        return currentMilisecond > milisecond;
    }

})();