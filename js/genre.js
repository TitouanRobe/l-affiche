
let items = document.querySelectorAll('.slider .list .item');
let next = document.getElementById('next');
let prev = document.getElementById('prev');
// config param
let countItem = items.length;
let itemActive = 0;
// event next click
next.onclick = function(){
    itemActive = itemActive + 1;
    if(itemActive >= countItem){
        itemActive = 0;
    }
    showSlider();
}
//event prev click
prev.onclick = function(){
    itemActive = itemActive - 1;
    if(itemActive < 0){
        itemActive = countItem - 1;
    }
    showSlider();
}

// auto run slider
let refreshInterval = setInterval(() => {
    next.click();
}, 5000)
function showSlider(){
    // remove item active old
    let itemActiveOld = document.querySelector('.slider .list .item.active');
    itemActiveOld.classList.remove('active');

    // active new item
    items[itemActive].classList.add('active');
    // clear auto time run slider
    clearInterval(refreshInterval);
    refreshInterval = setInterval(() => {
        next.click();
    }, 5000)
}



const themeMap = {
  dark: "light",
  light: "solar",
  solar: "dark"
};

const theme = localStorage.getItem('theme')
  || (tmp = Object.keys(themeMap)[0],
      localStorage.setItem('theme', tmp),
      tmp);
const bodyClass = document.body.classList;
bodyClass.add(theme);

function toggleTheme() {
  const current = localStorage.getItem('theme');
  const next = themeMap[current];

  bodyClass.replace(current, next);
  localStorage.setItem('theme', next);
}

document.getElementById('themeButton').onclick = toggleTheme;
function displayTopMovies(topMovies) {
  const moviesContainer = document.getElementById('movies-container');
  
  // Créer une liste ordonnée pour les films
  const moviesList = document.createElement('ol');
  moviesList.classList.add('movies-list');
 
  // Parcourir les données des meilleurs films et les afficher
  topMovies.forEach((movie, index) => {
  // Créer un élément de liste pour chaque film
  const movieListItem = document.createElement('a');
  movieListItem.classList.add('movie-list-item');
  movieListItem.href=`./movie.html?id_film=${movie.ID}`;
 
  console.log(movie);
 
  // Créer un conteneur div pour chaque film
  const movieDiv = document.createElement('div');
  movieDiv.classList.add('movie');
 
  // Créer un élément de titre pour le film
  const title = document.createElement('h2');
  title.textContent = movie.titre;
 
  const nb_votes = document.createElement('h4');
  nb_votes.textContent = movie.nb_votes;
 
  // Créer un élément de titre pour le film
  const note = document.createElement('h4');
  note.textContent = 'Note du film : ' + movie.note + ' ( ' + movie.nb_votes + ' votes ) ';
 
  // Créer un élément d'image pour le poster du film
  const poster = document.createElement('img');
  poster.src = movie.poster;
  poster.alt = movie.titre + ' Poster';
  
  // Créer un élément pour afficher le numéro du film à gauche du bloc
  const rank = document.createElement('span');
  rank.textContent = ' TOP ' + (index + 1) + ' - '+ movie.titre;
  rank.classList.add('movie-rank');
 
  const movieDivspan = document.createElement('div');
  movieDivspan.appendChild(rank);
  movieDivspan.appendChild(note);
 
  // Ajouter les éléments au conteneur du film
  movieDiv.appendChild(poster);
 
  // Ajouter le conteneur du film à l'élément de liste
  movieListItem.appendChild(movieDiv);
  movieListItem.appendChild(movieDivspan);
 
  // Ajouter l'élément de liste à la liste des films
  moviesList.appendChild(movieListItem);
  });
 
  // Ajouter la liste des films au conteneur des films
  moviesContainer.appendChild(moviesList);
 }
 
 function getTopMovies() {
  var xhr = new XMLHttpRequest();
  var url = 'http://127.0.0.1:8000/top_movies';
 
  xhr.open('GET', url);
  xhr.onreadystatechange = function () {
  if (xhr.readyState === 4) {
  if (xhr.status === 200) {
  var response = JSON.parse(xhr.responseText);
  console.log(response);
  displayTopMovies(response);
  } else {
  console.error('Erreur lors de la récupération des meilleurs films.');
  }
  }
  };
  xhr.send();
 }


function displayBestNoteByGenre(results) {
    var container = document.getElementById('movies-container'); // Change the container ID if needed

    results.forEach(movie => {

      // attributs = movie[0]

      id_film = Object.keys(movie)[0] 
      attributs = movie[id_film][0]
      genres = attributs["genres"]

 
      let carte_film = document.createElement("a")
      carte_film.setAttribute("class", "carte_film")
      //carte_film.attr("src", `./movie.html?id_film=${attributs["ID"]}`) 
      carte_film.setAttribute("href", `./movie.html?id_film=${id_film}`)
  
      let poster = document.createElement("img")
      poster.src = attributs["poster"]
  
      let titre_bloc = document.createElement("h3")
      titre_bloc.textContent = attributs["titre"]
  
      carte_film.appendChild(poster)
      carte_film.appendChild(titre_bloc)
  
      let carte_film_infos = document.createElement("ul")
      carte_film_infos.setAttribute("class", "carte-film--bloc")
      
      for (genre of genres){
  
        let li = document.createElement("li")
        li.textContent = genre
    
        carte_film_infos.appendChild(li)
      }
  
      carte_film.appendChild(carte_film_infos)
  
      let note = attributs["note"]
      note = parseFloat(note) * 10
  
      let carteFilmStats = document.createElement("div"); 
      carteFilmStats.className = "carte_film--stats"; 
      
      let barContainer = document.createElement("div"); 
      barContainer.className = "carte_film--bar-container"; 
      
      let barRouge = document.createElement("div"); 
      barRouge.className = "carte_film--bar carte_film--bar__rouge"; 
      
      let barVert = document.createElement("div"); 
      barVert.className = "carte_film--bar carte_film--bar__vert"; 
      barVert.style.width = `${note}%`; 
      
      let likesContainer = document.createElement("div"); 
      likesContainer.className = "carte_film--likes"; 
      
      let greenLikeImg = document.createElement("img"); 
      greenLikeImg.src = "./pictures/green_like.svg"; 
      greenLikeImg.alt = "green like"; 
      
      let percentageText = document.createElement("p"); 
      percentageText.textContent = `Recommandé à ${note}%`; 
      
      let redDislikeImg = document.createElement("img"); 
      redDislikeImg.src = "./pictures/red_dislike.svg"; 
      redDislikeImg.alt = "red dislike"; 
      
      // Construction de la structure 
      barContainer.appendChild(barRouge); 
      barContainer.appendChild(barVert); 
      likesContainer.appendChild(greenLikeImg); 
      likesContainer.appendChild(percentageText); 
      likesContainer.appendChild(redDislikeImg); 
      carteFilmStats.appendChild(barContainer); 
      carteFilmStats.appendChild(likesContainer); 
  
      carte_film.appendChild(carteFilmStats)
      
      let bloc_films_recherche = document.querySelector(".films_recherche")
  
      bloc_films_recherche.appendChild(carte_film)
  
    });
}

function getBestNoteByGenre(genreId) {
    var xhr = new XMLHttpRequest();
    var url = 'http://127.0.0.1:8000/best_note_genre/' + genreId;

    xhr.open('GET', url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            var response = JSON.parse(xhr.responseText);

            //console.log(response);
            displayBestNoteByGenre(response);
        }
    };
    xhr.send();
}

function redirectToGenre(button) {
    const genre = button.getAttribute('data-genre');
    window.location.href = `./genre.html?genre=${encodeURIComponent(genre)}`;
}

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
  
  function traiter_nb_votes(nb_votes){
  
    
  
    nb_votes = Math.round(parseFloat(nb_votes))
  
    if (nb_votes > 1000) {
  
      nb_votes = nb_votes / 1000
  
      nb_votes = ` ${Math.round(nb_votes)}k`
    }
  
    let nb_votes_content = document.querySelector(".bloc-nb-vues span")
    nb_votes_content.textContent = `${nb_votes} votes`
    
  }
  
  function charger_infos_distribution(distribution){
  
  
    for (personne of distribution){
  
      let carte_personne = document.createElement("div")
      carte_personne.setAttribute("class", "carte-personne")
  
      let portrait = document.createElement("img")
      portrait.src = personne[" portrait_url"]
  
      let nom_personne = document.createElement("h5")
      nom_personne.textContent = personne["nom "] + " " + personne[" prenom "]
  
      let profession = document.createElement("p")
      profession.textContent = personne[" professions "]
  
  
  
      carte_personne.appendChild(portrait)
      carte_personne.appendChild(nom_personne)
      carte_personne.appendChild(profession)
  
      document.querySelector(".distribution-personnes").appendChild(carte_personne)
  
    } 
  }
  
  
  function chargerinfosmovie(data){
  
    let infos_film = data[0][0]
  
    document.title = infos_film["titre"]
  
    let title = document.querySelector(".bloc-film .titre-film")
    title.textContent = infos_film["titre"]
  
    let bloc_noter_title = document.querySelector(".popup h3")
    bloc_noter_title.textContent = `Noter ${infos_film["titre"]}`
  
    let annee_sortie = document.querySelector(".supplement-titre .annee_sortie")
    annee_sortie.textContent = `${infos_film[" Annee de sortie "]} -`
  
    let age_visionnage = document.querySelector(".supplement-titre .annee_sortie+span")
    
    if (infos_film[" Adult "] == "0.0") {
  
      age_visionnage.textContent = "Tous publics -"
    } else {
  
      age_visionnage.textContent = "Convient à public averti -"
    }
  
    let duree_film = document.querySelector(".supplement-titre .duree_film")
    duree_film.textContent = `${infos_film[" Duree "]} min`
  
    
  
    const backdrop = 'https://image.tmdb.org/t/p/original/6ELJEzQJ3Y45HczvreC3dg0GV5R.jpg'
    const poster = 'https://m.media-amazon.com/images/M/MV5BMTg1MTY2MjYzNV5BMl5BanBnXkFtZTgwMTc4NTMwNDI@._V1_FMjpg_UX1000_.jpg'
  
    let enTeteImageElement = document.querySelector('.en-tete-image');
    enTeteImageElement.style.backgroundImage = `url(${infos_film[" backdrop "]}`;
  
    let enTetePoster = document.querySelector(".bloc-film .poster-film")
    enTetePoster.src = infos_film[" poster "]
  
    etablir_note(infos_film[" notes "])
  
    traiter_nb_votes(infos_film[" nombre de vote "])
  
    let description_bloc = document.querySelector(".bloc-synopsys p")
    description_bloc.textContent = infos_film[" description "]
  
    let genres = data[2]
  
    for (genre of genres){
  
      let li = document.createElement("li")
      li.textContent = genre
  
      document.querySelector(".genres ul").appendChild(li)
    }
  
    charger_infos_distribution(data[1])
  
    chargerSortieRecente(infos_film["titre"])
   
  }

function chargerSortieRecente(movies) {
    movies.forEach(movie => {
        let titre = Object.keys(movie)[0];
        attributs = movie[titre];

        let carte_film = document.createElement("a");
        carte_film.setAttribute("class", "carte_film");
        carte_film.setAttribute("href", `./accueil.html?id_film=${attributs["ID"]}`);

        let poster = document.createElement("img");
        poster.src = attributs["poster"];

        let titre_bloc = document.createElement("h3");
        titre_bloc.textContent = titre;

        carte_film.appendChild(poster);
        carte_film.appendChild(titre_bloc);

        let carte_film_infos = document.createElement("ul");
        carte_film_infos.setAttribute("class", "carte-film--bloc");

        genres = attributs["genres"].split(',')

        for (let genre of genres) {
            let li = document.createElement("li");
            li.textContent = genre;
            carte_film_infos.appendChild(li);
        }

        carte_film.appendChild(carte_film_infos);

        

        let note = attributs["notes"];
        note = parseFloat(note) * 10

        let carteFilmStats = document.createElement("div");
        carteFilmStats.className = "carte_film--stats";

        let barContainer = document.createElement("div");
        barContainer.className = "carte_film--bar-container";

        let barVert = document.createElement("div");
        barVert.className = "carte_film--bar carte_film--bar__vert";
        barVert.style.width = `${note}%`;

        let likesContainer = document.createElement("div");
        likesContainer.className = "carte_film--likes";

        let greenLikeImg = document.createElement("img");
        greenLikeImg.src = "./image/green_like.svg";
        greenLikeImg.alt = "green like";

        let percentageText = document.createElement("p");
        percentageText.textContent = `Recommandé à ${note}%`;

        let redDislikeImg = document.createElement("img");
        redDislikeImg.src = "./image/red_dislike.svg";
        redDislikeImg.alt = "red dislike";

        // Construction de la structure
        barContainer.appendChild(barVert);
        likesContainer.appendChild(greenLikeImg);
        likesContainer.appendChild(percentageText);
        likesContainer.appendChild(redDislikeImg);
        carteFilmStats.appendChild(barContainer);
        carteFilmStats.appendChild(likesContainer);

        carte_film.appendChild(carteFilmStats);

        document.querySelector(".recommendations").appendChild(carte_film);
    });
}


function getRecommandationsMovie() {

  var xhr = new XMLHttpRequest();
  var url = 'http://127.0.0.1:8000/sortie_recente';
  
  xhr.open('GET', url);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      
      let response = JSON.parse(xhr.responseText);

      chargerSortieRecente(response)

    }
  };
  xhr.send();
}


function getMovieInfo(movieId) {
  var xhr = new XMLHttpRequest();
  var url = 'http://127.0.0.1:8000/search_movie_titre_id/' + movieId;
  
  xhr.open('GET', url);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      var response = JSON.parse(xhr.responseText);

      chargerinfosmovie(response)
    }
  };
  xhr.send();
}

