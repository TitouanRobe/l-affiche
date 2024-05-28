window.onload=function(){
    id_utilisateur=getCookie('id_utilisateur');
    console.log(id_utilisateur);
    if(id_utilisateur=="" || id_utilisateur==null){
      console.log("gg")
      console.log("le compte n'est pas connecté")
      document.getElementById('btn_con').style.display='block';
      document.getElementById('btn_insc').style.display='block';
      document.getElementById('btn_deco').style.display='none';

    }else{

      document.getElementById("btn_con").style.display='none';
      document.getElementById("btn_insc").style.display='none';
      document.getElementById("btn_deco").style.display='block';
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