from typing import Optional, Union, List
from fastapi import FastAPI, Request, responses
import psycopg2
import pandas as pd
from google_images_search import GoogleImagesSearch
from fastapi.responses import HTMLResponse, RedirectResponse
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import create_engine
from sklearn.preprocessing import StandardScaler
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel



# Informations de connexion à la base de données PostgreSQL
db_host = "
db_port = 5432
db_database = ""
db_username = ""
db_password = ""

# Connexion a la base via create engine
db_url = f"postgresql://{db_username}:{db_password}@{db_host}:{db_port}/{db_database}"
engine = create_engine(db_url)

cur = conn.cursor()

# Afficher la version de PostgreSQL
cur.execute("SELECT version();")
version = cur.fetchone()
#print("Version : ", version,"\n")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
 return {"Bienvenue sur notre API de recherche de film"}


@app.get("/version")
def read_version():
 return {"Version" : version}


gis = GoogleImagesSearch('AIzaSyCknF9ESap-SJJwU1uOxKDy-hdRDTPzUug', 'b71068df5f9444437')

async def get_first_google_image(movie_title):
    try:
        _search_params = {
            'q': f'{movie_title} poster imdb',
            'num': 0,
            'imgType': 'photo',
            'fileType': 'jpg'
        }

        gis.search(search_params=_search_params)
        results = gis.results()

        if results:
            return results[0].url
        else:
            return None
    except Exception as e:
        print(f"Erreur lors de la recherche d'image : {e}")
        return None

async def get_movie_backdrop_url(movie_title):
    try:
        _search_params = {
        'q': f'{movie_title} movie backdrop',
        'num': 1,
        'imgType': 'photo',
        'fileType': 'jpg'
        }

        gis.search(search_params=_search_params)
        results = gis.results()

        if results:
            return results[0].url
        else:
            return None
    except Exception as e:
        print(f"Erreur lors de la recherche d'image : {e}")
        return None

async def get_personne_image_url(personne,role):
    if(role=='acteur'):
        query=personne+' imdb'
    else:
        query=personne+' director'
    try:
        _search_params = {
        'q': f'{query}',
        'num': 1,
        'imgType': 'photo',
        'fileType': 'jpg'
        }

        gis.search(search_params=_search_params)
        results = gis.results()

        if results:
            return results[0].url
        else:
            return None
    except Exception as e:
        print(f"Erreur lors de la recherche d'image : {e}")
        return None

async def get_poster(id_film,titre_film):
    ##on vérifie si le poster est déja dans la bdd ou s'il faut aller le chercher
        cur.execute("Select poster from bddreco._film Where id_film = %s", (id_film,))
        poster=cur.fetchall()
        if(poster[0][0]==None):
            ##s'il n'est pas dans la bdd on récupère via goggle image
            poster_url = await get_first_google_image(titre_film)
            ##on met à jour la table _film
            cur.execute("Update bddreco._film set poster = %s where id_film=%s", (poster_url,id_film,))
            conn.commit()
        else:
            ##s'il existe déja, on récupère le poster
            poster_url=poster[0][0]
        return poster_url

async def get_backdrop(id_film,titre_film):
    ##on vérifie si le backdrop est déja dans la bdd ou s'il faut aller le chercher
        cur.execute("Select backdrop from bddreco._film where id_film= %s",(id_film,))
        backdrop=cur.fetchall()
        if(backdrop[0][0]==None):
            backdrop_url = await get_movie_backdrop_url(titre_film)
            cur.execute("Update bddreco._film set backdrop = %s where id_film=%s", (backdrop_url,id_film,))
            conn.commit()
        else:
            backdrop_url=backdrop[0][0]
        return backdrop_url

def get_description(id_film):
    cur.execute("Select * from bddreco.film_description where id_film = %s" ,(id_film,))
    res_description=cur.fetchall()
    if(len(res_description)==0):
        description="description indisponible"
    else:
        description=res_description[0]
    return description

def get_genres(id_film):
    li_genre=[]
    cur.execute("Select * from bddreco._film_genre natural join bddreco._genre WHERE id_film=%s",(id_film,))
    res_genre=cur.fetchall()
    for genre in res_genre:
        li_genre.append(genre[2])
    return li_genre

async def get_personne(id_film):
    li_personne=[]
    li_url=[]
    cur.execute("SELECT * from bddreco._equipe natural join bddreco._personne natural join bddreco._film WHERE id_film= %s ", (id_film,))
    results_personne=cur.fetchall()

    for personne in results_personne:
        if (personne[2]=="1"):
            role="directeur"
        elif (personne[2]=="2"):
            role="scénariste"
        elif (personne[2]=="3"):
            role="acteur"

        id_personne=personne[1]

        cur.execute("Select portrait from bddreco._personne where id_personne= %s",(id_personne,))
        portrait=cur.fetchall()
        if(portrait[0][0]==None):
            portrait_url = await get_personne_image_url(personne[3]+" "+personne[4],role)
            cur.execute("Update bddreco._personne set portrait = %s where id_personne=%s", (portrait_url,id_personne,))
            conn.commit()
        else:
            portrait_url=portrait[0][0]
        li_personne.append({' Id ':id_personne,'nom ':personne[3],' prenom ':personne[4],' professions ':role,' portrait_url':portrait_url})


    return li_personne

########################### recherche de films ###########################

@app.get("/search_movie_titre/{recherche}")
async def recherche_film(recherche:str):
    li_resultat=[]

    #récupérer les informations du films via un regex
    movie_regex='^'+recherche+'$'
    ##on execute la requete avec le regex
    cur.execute("Select * from bddreco._film natural join bddreco._note Where titre ~* %s", (movie_regex,))

    results_movie = cur.fetchall()

    ##on regarde si la requete avec le regx trouve des films
    if(len(results_movie)==0):
        ##s'il ne trouve pas avec le regex, on tente avec le titre du film
        cur.execute("Select * from bddreco._film natural join bddreco._note Where titre ~* %s", (recherche,))
        results_reg=cur.fetchall()

        ## si même avec le regex, on ne trouve pas alors on en informe l'utilisateur
        if (len(results_reg)<=0):
            li_resultat.append('aucun')

        ## s'il y a plus de 7 films, pour gérer l'affichage, on n'affiche que les 10 premiers films
        elif(len(results_reg)>=7):

            for i in range(7):
                li_info_film=[]
                id_film=results_reg[i][0]
                titre_film=results_reg[i][1]

                ##on récupère le poster
                poster_url = await get_poster(id_film,titre_film)

                #on récupère les genres
                li_genre=get_genres(id_film)

                li_info_film.append({'titre_film':titre_film,' ID ':id_film,' Titre populaire ': results_reg[i][2], ' Annee de sortie ':results_reg[i][3],' Adult ':results_reg[i][4],' Duree ':results_reg[i][5],' notes ':results_reg[i][8],' nombre de vote ':results_reg[i][9],' poster ' : poster_url,'genres':li_genre})

                li_resultat.append(li_info_film)
        else:
            li_info_film=[]
            id_film=results_reg[0][0]
            titre_film=results_reg[0][1]

            ##on récupère le poster
            poster_url = await get_poster(id_film,titre_film)

            #on récupère les genres
            li_genre=get_genres(id_film)

            ##on ajoute les infos du films à la liste
            li_info_film.append({'titre_film':titre_film,' ID ':id_film,' Titre populaire ': results_reg[0][2], ' Annee de sortie ':results_reg[0][3],' Adult ':results_reg[0][4],' Duree ':results_reg[0][5],' notes ':results_reg[0][8],' nombre de vote ':results_reg[0][9],' poster ' : poster_url,'genres':li_genre})

            li_resultat.append(li_info_film)

    ##si l'on ne trouve pas avec un regex, on tente avec une comparaison directe
    else:

        for movie in results_movie:
            li_info_film=[]
            li_genre=[]
            id_film=movie[0]
            titre_film=movie[1]

            ##on récupère le poster
            poster_url = await get_poster(id_film,titre_film)

            #on récupère les genres
            li_genre=get_genres(id_film)

            li_info_film.append({'titre_film':titre_film,' ID ':id_film,' Titre populaire ': movie[2], ' Annee de sortie ':movie[3],' Adult ':movie[4],' Duree ':movie[5],' notes ':movie[8],' nombre de vote ':movie[9],' poster ' : poster_url,'genres':li_genre})

            li_resultat.append(li_info_film)
    return li_resultat

########################### recupérer un films ###########################

@app.get("/search_movie_titre_id/{id_movie}")
async def read_movie(id_movie : Union[str, None] = None):
    resultat=[]
    li_info_film=[]


    cur.execute("Select * from bddreco._film natural join bddreco._note WHERE id_film= %s", (id_movie,))
    results = cur.fetchall()

    if(len(results)==0):
        resultat.append("cette id n'existe pas")
    else:
        id_film=results[0][0]
        titre_film=results[0][1]
        ##on récupère le poster
        poster_url = await get_poster(id_film,titre_film)

        ##on récuupère le backdrop
        backdrop_url = await get_backdrop(id_film,titre_film)

        ##on récupère sa description si elle existe
        description=get_description(id_film)

        #on récupère les genres
        li_genre=get_genres(id_film)

        ##on récupère les différentes personnes ayant travaillé sur un film
        li_personne=await get_personne(id_film)


        li_info_film.append({'titre':titre_film ,'ID ':id_film,' Titre populaire ': results[0][2], ' Annee de sortie ':results[0][3],' Adult ':results[0][4],' Duree ':results[0][5],' notes ':results[0][8],' nombre de vote ':results[0][9],' description ': description[1],' poster ':poster_url,' backdrop ':backdrop_url})
        resultat.append(li_info_film)
        resultat.append(li_personne)
        resultat.append(li_genre)
    return resultat

########################### recherche de réalisateur en fonction du film ###########################

@app.get("/get_realisateurs_movie/{id_movie}")
def read_director(id_movie : Union[str, None] = None):

    cur.execute("SELECT * from bddreco._equipe natural join bddreco._personne natural join bddreco._film WHERE id_film= %s and role_personne = '1'", (id_movie,))

    results = cur.fetchall()

    resultat=[]

    reals = []
    if(len(results)==0):
        resultat.append("cette id n'existe pas")
    else:
        for i in range(len(results)):
            reals.append({results[i][1] : results[i][4]+' '+results[i][5]})
        resultat.append({"id_film": id_movie, "titre" : results[0][6], "realisateurs" : reals})

    return resultat

########################### recherche d'acteur' en fonction du film ###########################

@app.get("/get_actors_movie/{id_movie}")
def read_director(id_movie : Union[str, None] = None):

    cur.execute("SELECT * from bddreco._equipe natural join bddreco._personne natural join bddreco._film WHERE id_film= %s and role_personne = '3'", (id_movie,))

    results = cur.fetchall()

    resultat=[]

    reals = []
    if(len(results)==0):
        resultat.append("cette id n'existe pas")
    else:
        for i in range(len(results)):
            reals.append({results[i][1] : results[i][4]+' '+results[i][5]})
        resultat.append({"id_film": id_movie, "titre" : results[0][6], "acteurs" : reals})

    return resultat

########################### recherche des info sur le réalisateur ###########################

########################### recherche des info sur le réalisateur ###########################

@app.get("/get_movies_director/{id_director}")
async def read_director(id_director : Union[str, None] = None):

    cur.execute("select * from bddreco._equipe natural join bddreco._film natural join bddreco._personne natural join bddreco._note where id_personne = %s and role_personne = '1'", (id_director,))

    results = cur.fetchall()
    resultat=[]


    director = results[0][11] + ' ' + results[0][10]

    films = []

    if(len(results)==0):
        resultat.append("cette id n'existe pas")
    else:
        for i in range(len(results)) :

            id_film = results[i][0]
            titre = results[i][3]

            genres = get_genres(id_film)


            poster = await get_poster(id_film, titre)

            film = {"id": id_film, "titre" : titre, "poster" : poster, "note" : results[i][13], "genres" : genres}
            films.append(film)
        resultat = {director : films }
    return resultat

################### Films d'une personne ######################

@app.get("/get_movies_personne/{id_personne}")
async def read_director(id_personne : Union[str, None] = None):

    cur.execute("select * from bddreco._equipe natural join bddreco._film natural join bddreco._personne natural join bddreco._note where id_personne = %s", (id_personne,))

    results = cur.fetchall()
    resultat=[]


    personne = results[0][11] + ' ' + results[0][10]

    personne = {"prenom" : results[0][11], "nom" : results[0][10], "poster" : results[0][12]}
    films = []

    if(len(results)==0):
        resultat.append("cette id n'existe pas")
    else:
        for i in range(len(results)) :

            id_film = results[i][0]
            titre = results[i][3]

            genres = get_genres(id_film)


            poster = await get_poster(id_film, titre)

            film = {"id": id_film, "titre" : titre, "poster" : poster, "note" : results[i][13], "genres" : genres}
            films.append(film)
        resultat = {id_personne : personne, "films" : films}
    return resultat

####################### film d'un acteur ###########################

@app.get("/get_movies_actor/{id_actor}")
def read_director(id_actor : Union[str, None] = None):

    cur.execute("select * from bddreco._equipe natural join bddreco._film natural join bddreco._personne where id_personne = %s and role_personne = '3'", (id_actor,))

    results = cur.fetchall()
    resultat=[]


    director = results[0][10] + ' ' + results[0][11]

    films = []

    if(len(results)==0):
        resultat.append("cette id n'existe pas")
    else:
        for i in range(len(results)) :
            films.append({results[i][1] : results[i][4]})
        resultat.append({"Films de l'acteur "+director : films })
    return resultat



####################### recommendation ###########################


# Exécutez une requête SQL pour récupérer les données des tables de la base de données
query_movies = "SELECT * FROM bddreco._temp_film"

# Charger les données dans des DataFrames Pandas
movies_df = pd.read_sql_query(query_movies, engine)

# Critere genre en vecteur binaire
mlb = MultiLabelBinarizer()
genres_df = pd.DataFrame(mlb.fit_transform(movies_df['genres'].str.split(',')), columns=mlb.classes_)

scaler = StandardScaler()
movies_df['nb_votes_standard'] = scaler.fit_transform(movies_df[['nb_votes']])

# Concaténation des genres avec notes et nb_votes
feature_df = pd.concat([genres_df, movies_df['note'], movies_df['nb_votes_standard']], axis=1)

def my_progressbar(url, progress):
    print(url + ' ' + progress + '%')


@app.get("/recommendations/{movie_name}")
async def get_recommendations_with_posters(movie_name: str):
 selected_movies = movies_df[movies_df['titre'].str.contains(movie_name,case=False)]
 print(selected_movies)
 if not selected_movies.empty:
    selected_movie = selected_movies.iloc[0]
    idfilm = selected_movie['id_film']
    selected_features = feature_df.loc[selected_movie.name]
    similarities = cosine_similarity(feature_df, selected_features.values.reshape(1, -1))
    similarity_df = pd.DataFrame(similarities, columns=['similarity'], index=movies_df.index)
    recommended_movies = movies_df.join(similarity_df).sort_values(by='similarity', ascending=False)
    recommended_movies = recommended_movies[recommended_movies['titre'] != movie_name]

    top_recommendations = recommended_movies.head(6)

    recommendation=[]
    for index,row in top_recommendations.iterrows():
        poster_url=await get_poster(row['id_film'],row['titre'])
        recommendation.append({row['titre']:{'ID':row['id_film'],'poster':poster_url, "note":row['note'], "genres" : row["genres"]}})
    return recommendation

 else:
    return "Aucun film trouvé."

########################### dernière sortie ############################
@app.get("/sortie_recente",)
async def sortie_recente():
    sortie=[]
    cur.execute("SELECT * from bddreco._film natural join bddreco._note where date_de_sortie='2023.0'",())
    results = cur.fetchall()
    for i in range(5):

        ##on récupère le poster
        poster_url= await get_poster(results[i][0],results[i][1])

        ##on récupère le backdrop
        backdrop_url=await get_backdrop(results[i][0],results[i][1])

        sortie.append({'titre':results[i][1],'ID':results[i][0],' Titre populaire ': results[i][2], ' Annee de sortie ':results[i][3],' Adult ':results[i][4],' Duree ':results[i][5],' notes ':results[i][8],' nombre de vote ':results[i][9],' poster ':poster_url,' backdrop ':backdrop_url})
    return(sortie)



########################### top film #########################

@app.get("/top_movies")
async def top_movies():
    # Filtrer et trier les films
    li_movie=[]
    top_movies_df = movies_df[movies_df['nb_votes'].astype(float) >= 200000]
    top_movies_df = top_movies_df.sort_values(by='note', ascending=False).head(15)


    for index, row in top_movies_df.iterrows():

        poster_url=await get_poster(row["id_film"],row["titre"])

        
        li_movie.append({'titre':row['titre'],'ID':row['id_film'],'poster':poster_url,'note':row['note'],'nb_votes':row['nb_votes']})
    return li_movie


########################### recherche des 10 meilleurs films par genre en fonction de leur note ###########################

@app.get("/best_note_genre/{genre}")
async def best_note_genre(genre : Union[str, None] = None):

    cur.execute("SELECT * from bddreco.films_genres_notes  WHERE nom_genre ~* %s ", (genre,))

    results = cur.fetchall()

    resultats = results[:10]

    results_final = []

    for i in range(len(resultats)):

        genres = get_genres(results[i][0])

        poster = await get_poster(results[i][0], results[i][3])

        results_final.append({resultats[i][0] : [{ "titre" : resultats[i][3], "note" : resultats[i][4], 'genres' : genres, 'poster' : poster}]})

    if results_final == []:
        results_final.append("Ce genre n'est pas reconnu.")
        return results_final
    else :
        return results_final

########################### connexion utilisateur ###########################
class User(BaseModel):
    mail: str
    password: str


@app.post("/connexion")
async def connexion(user: User):
    mail = user.mail
    password = user.password

    cur.execute("SELECT * FROM bddreco._utilisateur WHERE email=%s", (mail,))
    utilisateur = cur.fetchall()

    retour = []

    if len(utilisateur) != 0 and password == utilisateur[0][3]:
        retour.append({"success": True,'id_uti': utilisateur[0][0]})
    else:
        retour.append({"success": False})
    return retour

########################### enregistrement utilisateur ###########################
class Inscr(BaseModel):
    mail:str
    pseudo: str
    password: str

@app.post("/inscription")
def inscription(inscr: Inscr):
    pseudo=inscr.pseudo
    mail=inscr.mail
    password=inscr.password
    retour=[]

    cur.execute("Select * from bddreco._utilisateur where email=%s ", (mail,))
    mail_verif=cur.fetchall()

    cur.execute("Select * from bddreco._utilisateur where pseudo=%s ", (pseudo,))
    pseudo_verif=cur.fetchall()

    if(len(mail_verif)!=0):
        retour.append({"success":False,'message':'email déja existant'})
        return retour
    elif(len(pseudo_verif)!=0):
        retour.append({"success":False,'message':'pseudo déja existant'})
        return retour
    elif((len(pseudo_verif)==0) and (len(mail_verif)==0)):
        cur.execute('Insert into bddreco._utilisateur(pseudo,email,mdp) Values (%s,%s,%s)',(pseudo,mail,password,))
        retour.append({"success":True})
        conn.commit()
        return retour

########################### notez un film ###########################
class Req(BaseModel):
    note:float
    id_utilisateur:int
    id_film:str


@app.post("/rate")
def inscription(req: Req):
    note=float(req.note)
    note = round(note, 1)
    id_utilisateur=req.id_utilisateur
    id_film=req.id_film

    cur.execute('Select * from bddreco._note where id_film = %s',(id_film,))
    info=cur.fetchall()
    note_moyenne_film=info[0][1]
    nb_vote=float(info[0][2])
    new_note_moyenne = ((note_moyenne_film * nb_vote) + note )/ (nb_vote + 1)
    cur.execute('Update bddreco._note set note=%s, nb_votes=%s where id_film=%s',(round(new_note_moyenne, 1),str(nb_vote+1),id_film))


    cur.execute('Select * from bddreco._note_film_utilisateur where id_utilisateur = %s and id_film=%s',(id_utilisateur,id_film,))
    res=cur.fetchall()
    if(len(res)==0):
        cur.execute('Insert into bddreco._note_film_utilisateur(id_utilisateur,id_film,note) Values (%s,%s,%s)',(id_utilisateur,id_film,note,))
    else:
        cur.execute('Update bddreco._note_film_utilisateur set note =%s where id_utilisateur=%s and id_film=%s ',(note,id_utilisateur,id_film,))
    conn.commit()

@app.get("/note_uti/{id_utilisateur}/{id_film}")
def note_uti(id_utilisateur : str,id_film :str):
    cur.execute('Select note from bddreco._note_film_utilisateur where id_utilisateur = %s and id_film=%s',(id_utilisateur,id_film,))
    res=cur.fetchall()
    if(res!=""):
        return res
    else:
        return "null"

@app.post("/signaler/{id_film}")
def signaler(id_film):

    cur.execute('Insert into bddreco._signaler VALUES (%s, 1)', (id_film))
    conn.commit()











