window.onload=function(){
  id_utilisateur=getCookie('id_utilisateur');
  var id_film = paramètresObjet.get("id_film")
  console.log('ok'+id_utilisateur)
  if(id_utilisateur=="" || id_utilisateur==null){
    console.log("le compte n'est pas connecté")
    document.querySelector('.note-uti').style.display='none';
    document.getElementById('btn_con').style.display='block';
    document.getElementById('btn_insc').style.display='block';
    document.getElementById('btn_deco').style.display='none';
  }else{
    var xhr = new XMLHttpRequest();
    var url = 'http://127.0.0.1:8000/note_uti/' + id_utilisateur+'/'+id_film;
    console.log(url)
    xhr.open('GET', url);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        let response = JSON.parse(xhr.responseText);
        console.log(response[0])
        console.log('ok')
        if(response[0]!=""){
          console.log("gg")
          document.querySelector('.note-uti').innerHTML='ma note: '+response[0];
          document.querySelector('.note-uti').style.display='block';
          document.getElementById("btn_con").style.display='none';
          document.getElementById("btn_insc").style.display='none';
          document.getElementById("btn_deco").style.display='block';
        }else{
          console.log("deconnecté")
          document.querySelector('.note-uti').innerHTML='pas de notes';
          document.querySelector('.note-uti').style.display='none';
        }
      }       
    };
    xhr.send();
  }
}



function setCookie(name, value) {
  var encodedValue = encodeURIComponent(value);
  document.cookie = name + "=" + encodedValue + ";"
}

function deconnexion(){
  setCookie('id_utilisateur', '', -1); // La date d'expiration négative supprime le cookie
  alert('Déconnexion réussie!');
  console.log(getCookie('id_utilisateur'))
  window.location.reload(); // Recharger la page
}


function getCookie(name) {
  var cookies = document.cookie.split('; ');

  for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].split('=');
      if (cookie[0] === name) {
          return decodeURIComponent(cookie[1]);
      }
  }

  return null;
}


function etablir_note(note_film){

  let progressBar = document.querySelector(".circular-progress");
  let valueContainer = document.querySelector(".value-container .note");

  let progressValue = 0;
  let note = parseFloat(note_film)

  note = Math.round(note_film * 100) /100;
  console.log(note)
  alert(note)

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

    let carte_personne = document.createElement("a")
    carte_personne.setAttribute("class", "carte-personne")
    carte_personne.setAttribute("href", `./personne.html?id_personne=${personne[" Id "]}`)

    let portrait = document.createElement("img")
    portrait.src = personne[" portrait_url"]

    let nom_personne = document.createElement("h5")
    nom_personne.textContent = personne[" prenom "] + " " + personne["nom "]

    let profession = document.createElement("p")
    profession.textContent = personne[" professions "]

    if (personne[" professions "] == "directeur"){

        getMoviesDirector(personne[" Id "])
    }

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
    //li.textContent = genre

    let link = document.createElement("a");
    link.href = `./genre.html?genre=${genre}`;
    link.textContent = genre ;

    li.appendChild(link)

    document.querySelector(".genres ul").appendChild(li)
  }

  charger_infos_distribution(data[1])

  getRecommandationsMovie(infos_film["titre"])

}

function chargerRecomandations(movies){

  movies.forEach(movie => {

    let titre = Object.keys(movie)[0];

    attributs = movie[titre]

    let carte_film = document.createElement("a")
    carte_film.setAttribute("class", "carte_film")
    //carte_film.attr("src", `./movie.html?id_film=${attributs["ID"]}`) 
    carte_film.setAttribute("href", `./movie.html?id_film=${attributs["ID"]}`)

    let poster = document.createElement("img")
    poster.src = attributs["poster"]

    let titre_bloc = document.createElement("h3")
    titre_bloc.textContent = titre

    carte_film.appendChild(poster)
    carte_film.appendChild(titre_bloc)

    let carte_film_infos = document.createElement("ul")
    carte_film_infos.setAttribute("class", "carte-film--bloc")

    genres = attributs["genres"].split(',')
    
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

    document.querySelector(".recommendations").appendChild(carte_film)

  });
}

function ChargerMoviesDirector(movies){

  directeur = Object.keys(movies)[0]
  movies = movies[directeur]


  let nom_directeur = document.querySelector(".recommendations+h3")
  nom_directeur.textContent = `De ${directeur}`

  movies.forEach(movie => {

    if (id_film != movie["id"]){

      let titre = movie["titre"];

      let carte_film = document.createElement("a")
      carte_film.setAttribute("class", "carte_film")
      //carte_film.attr("src", `./movie.html?id_film=${attributs["ID"]}`) 
      carte_film.setAttribute("href", `./movie.html?id_film=${movie["id"]}`)
  
      let poster = document.createElement("img")
      poster.src = movie["poster"]
  
      let titre_bloc = document.createElement("h3")
      titre_bloc.textContent = titre
  
      carte_film.appendChild(poster)
      carte_film.appendChild(titre_bloc)
  
      let carte_film_infos = document.createElement("ul")
      carte_film_infos.setAttribute("class", "carte-film--bloc")
  
     for (genre of movie["genres"]){
  
        let li = document.createElement("li")
        li.textContent = genre
    
        carte_film_infos.appendChild(li)
      }
  
      carte_film.appendChild(carte_film_infos)
  
      let note = movie["note"]
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
  
      document.querySelector(".recommendations.directeur").appendChild(carte_film)
      
    } else if (movies.length == 1){


      let nouvelleDiv = document.createElement('div');
      nouvelleDiv.setAttribute("class", "aucun_film")
      // Contenu à ajouter à la div
      let contenu = `${directeur} n'a aucun film supplémentaire à son actif.`;

      // Ajout du texte à la div
      nouvelleDiv.textContent = contenu;

      // Ajout de la div au document (par exemple, au body)
      document.querySelector(".recommendations.directeur").appendChild(nouvelleDiv);

      document.querySelector(".recommendations.directeur").style.overflowX = 'hidden'

    }

  });
}


function getRecommandationsMovie(movieName) {

  var xhr = new XMLHttpRequest();
  var url = 'http://127.0.0.1:8000/recommendations/' + movieName;
  
  xhr.open('GET', url);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      
      let response = JSON.parse(xhr.responseText);

      chargerRecomandations(response)

    }
  };
  xhr.send();
}

function getMoviesDirector(id_director){

  var xhr = new XMLHttpRequest();
  var url = 'http://127.0.0.1:8000/get_movies_director/' + id_director;
 
  xhr.open('GET', url);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {


      let response = JSON.parse(xhr.responseText);
      //console.log(response)
      ChargerMoviesDirector(response)

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


// Récupérez les paramètres d'URL
const paramètres = window.location.search;

// Accédez aux paramètres d'URL
const paramètresObjet = new URLSearchParams(paramètres);

// Imprimez la valeur du paramètre "id"
var id_film = paramètresObjet.get("id_film")


getMovieInfo(id_film);


// popup 

function togglePopup() {  
  id_utilisateur=getCookie('id_utilisateur');
  if(id_utilisateur==null){
    window.location.href = "./connexion.html";
  }else{
    document.getElementById("popup-1").classList.toggle("active")
  }
}

function changeStarColor(isHovered) {
  var starIcon = document.getElementById('starIcon');
  if (isHovered) {
    starIcon.setAttribute('src', './pictures/star-regular.svg'); /* Changez le chemin vers l'icône d'étoile pleine au survol */
  } else {
    starIcon.setAttribute('src', './pictures/star-solid.svg'); /* Revert au chemin d'icône d'étoile régulière lorsque la souris quitte */
  }
}

var clickedIndex = -1; // Variable pour stocker l'index de l'étoile cliquée

function changeRatingStarColor(star) {
  var allStars = document.querySelectorAll('.star img');
  hoveredIndex = Array.from(allStars).indexOf(star);

  allStars.forEach(function (star, index) {
    if (index <= hoveredIndex) {
      star.setAttribute('src', './pictures/star-rating.svg');
    } else {
      star.setAttribute('src', './pictures/star-solid.svg');
    }
  });
}

function resetHoveredRatingStars() {
  var allStars = document.querySelectorAll('.star img');

  allStars.forEach(function (star, index) {
    if (index > hoveredIndex && index > clickedIndex) {
      star.setAttribute('src', './pictures/star-solid.svg');
    }
  });

  sleep(1500);
  resetClickedStars(clickedIndex)
}

function resetClickedStars(indexClicked) {
    var allStars = document.querySelectorAll('.star img');

    allStars.forEach(function (star, index) {
      if (index <= indexClicked) {
        star.setAttribute('src', './pictures/star-rating.svg');
      } else {
        star.setAttribute('src', './pictures/star-solid.svg');
      }
    });
  }

function selectRating(selectedStar) {
  var allStars = document.querySelectorAll('.star img');
  clickedIndex = Array.from(allStars).indexOf(selectedStar);

  allStars.forEach(function (star, index) {
    if (index <= clickedIndex) {
      star.setAttribute('src', './pictures/star-rating.svg');
    } else {
      star.setAttribute('src', './pictures/star-solid.svg');
    }
  });
  let btn_noter = document.getElementById("noter-film")
  btn_noter.style.backgroundColor = "#D90429"
  btn_noter.disabled = false
  btn_noter.style.cursor = 'pointer'
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function RatingStar(){
  note=clickedIndex;
  id_utilisateur=getCookie('id_utilisateur');


  var xhr = new XMLHttpRequest();
  var url = 'http://127.0.0.1:8000/rate';

  // Préparer les données à envoyer
  var data = JSON.stringify({
       note: note+1,
       id_utilisateur:id_utilisateur,
       id_film:id_film
  });

  console.log(data)
  // Configurer la requête
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  // Gérer la réponse de l'API
  xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            console.log('note enregistré')
            location.reload();
          } else {
            console.error('Erreur lors de la communication avec l\'API. Statut:', xhr.status);
          }
      }
  };
  xhr.send(data);
}

// signaler film

let signalerIcon = document.getElementById('signalerIcon');

// Ajoutez un gestionnaire d'événements pour le clic
//signalerIcon.addEventListener('click', signalerAfficheMovie);

function signalerAfficheMovie(){


  var xhr = new XMLHttpRequest();
  var url = 'http://127.0.0.1:8000/signaler/';

  // Préparer les données à envoyer
  var data = JSON.stringify({
      id_film : id_film
  });

  console.log(data)
  // Configurer la requête
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  // Gérer la réponse de l'API
  xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
          if (xhr.status === 200) {
              var result = JSON.parse(xhr.responseText);
              console.log(result[0])
              if (result[0]['success']) {
                  
                alert("Signalement du film effectué.");

                } else {
                  alert("Erreur dans le signalement du film");
                  console.log('erreur')
              }
          } else {
              console.error('Erreur lors de la communication avec l\'API. Statut:', xhr.status);
          }
      }
  };
  xhr.send(data);
}


