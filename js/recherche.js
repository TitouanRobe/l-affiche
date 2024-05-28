// Récupérez les paramètres d'URL
const paramètres = window.location.search;

// Accédez aux paramètres d'URL
const paramètresObjet = new URLSearchParams(paramètres);

// Imprimez la valeur du paramètre "id"
recherche = paramètresObjet.get("recherche")


function chargerRecherche(movies){

  let enTeteImageElement = document.querySelector('.en-tete-image');
  //premier_res = movies[0]
  //enTeteImageElement.style.backgroundImage = `url(${premier_res[0][" backdrop "]})`;

  console.log(movies)

  movies.forEach(movie => {

    attributs = movie[0]
    genres = movie[0]["genres"]

    let carte_film = document.createElement("a")
    carte_film.setAttribute("class", "carte_film")
    //carte_film.attr("src", `./movie.html?id_film=${attributs["ID"]}`) 
    carte_film.setAttribute("href", `./movie.html?id_film=${attributs[" ID "]}`)

    let poster = document.createElement("img")
    poster.src = attributs[" poster "]

    let titre_bloc = document.createElement("h3")
    titre_bloc.textContent = attributs["titre_film"]

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

    let note = attributs[" notes "]
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


function getMoviesSearch(search) {
    var xhr = new XMLHttpRequest();
    var url = 'http://127.0.0.1:8000/search_movie_titre/' + search;
    
    xhr.open('GET', url);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        var response = JSON.parse(xhr.responseText);
        
        if(response[0] == 'aucun'){
			

			
			let aucun_res_bloc = document.createElement("p"); 
			aucun_res_bloc.className = 'bloc_aucun_res';
			aucun_res_bloc.textContent = 'Aucun résultat pour la recherche.';
			
			document.querySelector(".films_recherche").appendChild(aucun_res_bloc);
			
		}else{
			

			chargerRecherche(response)
			
		}	
        document.title = `Résultats de la recherche pour : ${search}`
        document.querySelector(".main__recherche h3").textContent = `Résultats de la recherche pour : ${search}`


      }
    };
    xhr.send();
  }


  getMoviesSearch(recherche)
