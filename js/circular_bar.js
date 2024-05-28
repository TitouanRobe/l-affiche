// let number = document.getElementById('number')
// let cp = 0

// setInterval(() => {
    
//     if (counter == 65){

//         clearInterval;
//     } else{
//         cp += 1
//         number.innerHTML = `${cp}%`;
//     }

// }, 30);

function etablir_note(note_film){

  let progressBar = document.querySelector(".circular-progress");
  let valueContainer = document.querySelector(".value-container .note");

  let progressValue = 0;
  let note = parseFloat(note_film)
  let progressEndValue = note*10;
  let speed = 10;

  let progress = setInterval(() => {
    progressValue++;
    valueContainer.textContent = `${note}`;

    if (note >= 0 && note < 3) {

      progressBar.style.background = `conic-gradient(
        #D2042D ${progressValue * 3.6}deg,
        #cadcff ${progressValue * 3.6}deg
    )`;

      valueContainer.style.color = '#D2042D'

      
    } else if (note > 3 && note < 6){

      progressBar.style.background = `conic-gradient(
        #FF5F1F ${progressValue * 3.6}deg,
        #cadcff ${progressValue * 3.6}deg
    )`;

      valueContainer.style.color = '#FF5F1F' 

    } else {

      progressBar.style.background = `conic-gradient(
        #45cf42 ${progressValue * 3.6}deg,
        #cadcff ${progressValue * 3.6}deg
    )`;

    }

    if (progressValue == progressEndValue) {
      clearInterval(progress);
    }
  }, speed);

}

