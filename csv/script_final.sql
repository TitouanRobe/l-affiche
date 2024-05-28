drop schema if exists BDDreco cascade;
create schema BDDreco;

set schema 'BDDreco';

---------------------------OEUVRE---------------------------
CREATE TABLE BDDreco._film(
    id_film VARCHAR(15) PRIMARY KEY NOT NULL,
    titre VARCHAR(300),
    titre_populaire VARCHAR(300),
    date_de_sortie VARCHAR(11),
    isAdult VARCHAR(3),
    duree VARCHAR(15),
    description VARCHAR(1000)
);

---------------------------NOTE---------------------------
CREATE TABLE  BDDreco._note(
    id_film VARCHAR(15), --tconst dans idimdb
    note FLOAT,
    nb_votes VARCHAR(50),
    CONSTRAINT Fk_note_film FOREIGN KEY (id_film) REFERENCES BDDreco._film(id_film)
);


---------------------------GENRE---------------------------
CREATE TABLE  BDDreco._genre(
    id_genre SERIAL PRIMARY KEY NOT NULL, -- id à donner
    nom_genre VARCHAR(50)
);


---------------------------FILM GENRE---------------------------
CREATE TABLE BDDreco._film_genre(
    id_genre INTEGER,
    id_film VARCHAR(15),
    CONSTRAINT fk_film_genre FOREIGN KEY (id_genre) REFERENCES BDDreco._genre(id_genre),
    CONSTRAINT fk_film_film FOREIGN KEY (id_film) REFERENCES BDDreco._film(id_film),
    CONSTRAINT pk_film_film PRIMARY KEY (id_genre,id_film)
);

---------------------------PROFESSION---------------------------
CREATE TABLE  BDDreco._profession(
    id_profession SERIAL PRIMARY KEY NOT NULL, -- id à donner
    profession VARCHAR(50)
);

---------------------------PERSONNE---------------------------
CREATE TABLE BDDreco._personne(
    id_personne VARCHAR(50) PRIMARY KEY NOT NULL, --nconst dans idimcb
    prenom VARCHAR(800),
    nom VARCHAR(800)

);

-- drop table bddreco._equipe;
---------------------------EQUIPE---------------------------
CREATE TABLE  BDDreco._equipe( -- classe association entre personne et oeuvre
    id_film VARCHAR(15), -- id de l'oeuvre
    id_personne VARCHAR(20), -- id de personne
    role_personne VARCHAR(50),
    role_film VARCHAR(50),
    CONSTRAINT fk_equipe_personne FOREIGN KEY (id_personne) REFERENCES BDDreco._personne(id_personne),
    CONSTRAINT fk_equipe_film FOREIGN KEY (id_film) REFERENCES BDDreco._film(id_film),
    CONSTRAINT PK_equipe PRIMARY KEY (id_film,id_personne, role_personne) 
);

---------------------------UTILISATEURS---------------------------
CREATE TABLE BDDreco._utilisateur(
    id_utilisateur INT PRIMARY KEY NOT NULL,
    pseudo VARCHAR(50)
);


---------------------------LISTE FAVORIS---------------------------
CREATE TABLE BDDreco._liste_favoris(
    id_film VARCHAR(15),
    id_utilisateur INTEGER,
    CONSTRAINT pk_film_favoris PRIMARY KEY (id_film,id_utilisateur),
    CONSTRAINT fk_liste_favoris1 FOREIGN KEY (id_film) REFERENCES BDDreco._film(id_film),
    CONSTRAINT fk_liste_favoris2 FOREIGN KEY (id_utilisateur) REFERENCES BDDreco._utilisateur(id_utilisateur)
);


--------------------------- PROFESSION_PERSONNE ---------------------------
CREATE TABLE BDDreco._profession_personne(

    id_profession INTEGER NOT NULL,
    id_personne VARCHAR(20) NOT NULL,
    CONSTRAINT pk_profession_personne PRIMARY KEY (id_profession, id_personne),
    CONSTRAINT fk_personne_profession1 FOREIGN KEY (id_profession) REFERENCES BDDreco._profession(id_profession),
    CONSTRAINT fk_personne_profession2 FOREIGN KEY (id_personne) REFERENCES BDDreco._personne(id_personne)
);

------------ --------------TRIGGERS -------------------------------

-- table temporaire pour l'insertion des films
CREATE TABLE bddreco._temp_film (
    id_film VARCHAR(15) PRIMARY KEY,
    titre VARCHAR(300),
    titre_populaire VARCHAR(300),
    date_de_sortie VARCHAR(11),
    isAdult VARCHAR(3),
    duree VARCHAR(15),
    genres VARCHAR(100),
    note FLOAT,
    nb_votes VARCHAR(50),
    directeur VARCHAR(2000),
    writer VARCHAR(2000)
);

-- trigger pour insérer les genres des films et notes 
CREATE OR REPLACE FUNCTION bddreco.inserer_film_genre()
RETURNS TRIGGER AS $$
DECLARE
    genre_arr VARCHAR[];
    genre_id INT;
    genre_name VARCHAR; 
BEGIN

    INSERT INTO bddreco._film (id_film, titre, titre_populaire, date_de_sortie, isAdult, duree)
    VALUES (NEW.id_film, NEW.titre, NEW.titre_populaire, NEW.date_de_sortie, NEW.isAdult, NEW.duree);

    INSERT INTO bddreco._note (id_film, note, nb_votes) 
    VALUES (NEW.id_film, NEW.note, NEW.nb_votes);

    genre_arr := string_to_array(NEW.genres, ',');


    FOREACH genre_name IN ARRAY genre_arr
    LOOP

        SELECT id_genre INTO genre_id FROM bddreco._genre WHERE nom_genre = genre_name;

        -- Si le genre n'existe pas, l'ajouter
        IF genre_id IS NULL THEN
            INSERT INTO bddreco._genre (nom_genre) VALUES (genre_name) RETURNING id_genre INTO genre_id;
        END IF;

        -- Insérer le couple (id_film, id_genre) dans la table film_genre
        INSERT INTO bddreco._film_genre (id_film, id_genre) VALUES (NEW.id_film, genre_id);
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Trigger AFTER INSERT pour la table temp_film
CREATE TRIGGER inserer_film_genre_trigger
AFTER INSERT ON bddreco._temp_film
FOR EACH ROW
EXECUTE FUNCTION bddreco.inserer_film_genre();

--DROP TABLE BDDreco._temp_personnes
CREATE TABLE  BDDreco._temp_personnes(
    id_film VARCHAR(30),
    id_personne VARCHAR(50), 
    nom VARCHAR(50),
    prenom VARCHAR(50),
    professions VARCHAR(50),
    CONSTRAINT pk_temp_personnes PRIMARY KEY (id_film,id_personne, professions)
);

-- trigger pour insérer les personnes et gérer les professions
CREATE OR REPLACE FUNCTION bddreco.inserer_personnes()
RETURNS TRIGGER AS $$
DECLARE
    profession_array VARCHAR[];
    profession_id INT;
    profession_name VARCHAR;
    idP VARCHAR;
    couple_existe BOOLEAN; 
BEGIN

    SELECT id_personne INTO idP FROM bddreco._personne WHERE id_personne = NEW.id_personne;
    
    IF idP IS NULL THEN
              
      INSERT INTO BDDreco._personne (id_personne, nom, prenom) VALUES (NEW.id_personne, NEW.nom, NEW.prenom);
    END IF;

    profession_array := string_to_array(NEW.professions, ',');

    FOREACH profession_name IN ARRAY profession_array 
    LOOP

        SELECT id_profession INTO profession_id FROM bddreco._profession WHERE profession = profession_name;

        -- Si la profession n'existe pas, l'ajouter
        IF profession_id IS NULL THEN
            INSERT INTO bddreco._profession (profession) VALUES (profession_name) RETURNING id_profession INTO profession_id;
        END IF;
        
        INSERT INTO bddreco._profession_personne (id_personne, id_profession) SELECT NEW.id_personne, profession_id WHERE NOT EXISTS (
            SELECT 1
            FROM bddreco._profession_personne
            WHERE id_personne = NEW.id_personne AND id_profession = profession_id
        );
        -- Insérer le couple (id_personne, id_profession) dans la table profession_personne
        --INSERT INTO bddreco._profession_personne (id_personne, id_profession) VALUES (NEW.id_personne, profession_id)          
        INSERT INTO bddreco._equipe(id_film,id_personne,role_personne) VALUES (NEW.id_film, NEW.id_personne, profession_id);
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inserer_personnes_trigger
AFTER INSERT ON bddreco._temp_personnes
FOR EACH ROW
EXECUTE FUNCTION bddreco.inserer_personnes();

delete from bddreco._profession_personne;
delete from bddreco._equipe;
delete from bddreco._personne;
delete from bddreco._temp_personnes;

WbImport -file='/home/etuinfo/trobe/Téléchargements/movies_final.tsv'
         -table=bddreco._temp_film
         -filecolumns=id_film,titre,titre_populaire,date_de_sortie,isAdult,duree,genres,note,nb_votes,directeur,writer
         -delimiter='\t'
         -dateformat="yyyy-MM-dd";
         
         
WbImport -file='/home/etuinfo/trobe/Téléchargements/personnes_final.tsv'
         -table=bddreco._temp_personnes
         -filecolumns=id_film,id_personne,nom,prenom,professions
         -delimiter='\t'
         -dateformat="yyyy-MM-dd";
         

WbImport -file='/home/etuinfo/trobe/Téléchargements/user.tsv'
         -table=bddreco._utilisateur
         -filecolumns=id_utilisateur,pseudo
         -delimiter='\t'
         -dateformat="yyyy-MM-dd";
         
         
WbImport -file='/home/etuinfo/trobe/Téléchargements/favorie.tsv'
         -table=bddreco._liste_favoris
         -filecolumns=id_film,id_utilisateur
         -delimiter='\t'
         -dateformat="yyyy-MM-dd";
         

ALTER TABLE bddreco._personne 
RENAME COLUMN nom TO temp_nom;

ALTER TABLE bddreco._personne 
RENAME COLUMN prenom TO nom;

ALTER TABLE bddreco._personne 
RENAME COLUMN temp_nom TO prenom;

set schema 'bddreco';
CREATE VIEW films_genres_notes AS SELECT id_film, id_genre, nom_genre, titre, note, nb_votes from bddreco._film natural join bddreco._note natural join bddreco._genre natural join bddreco._film_genre WHERE CAST(nb_votes AS FLOAT) > 20000 ORDER BY note DESC;

Create table bddreco.film_description(

  id_film VARCHAR(30),
  description VARCHAR(1000),
  CONSTRAINT pk_film_description PRIMARY KEY (id_film),
  CONSTRAINT fk_film_description FOREIGN KEY (id_film) REFERENCES BDDreco._film(id_film)
);

WbImport -file='/home/etuinfo/trobe/Documents/SAE_RECO/PARTIE4/description.tsv'
         -table=bddreco.film_description
         -filecolumns=id_film,description
         -delimiter='\t'
         -dateformat="yyyy-MM-dd";
         
 

WbImport -file='/home/etuinfo/trobe/Documents/SAE_RECO/PARTIE4/description4_finale.tsv'
         -table=bddreco.film_description
         -filecolumns=id_film,description
         -delimiter='\t'
         -dateformat="yyyy-MM-dd";
         

CREATE TABLE bddreco._temp_acteurs(

    id_film VARCHAR(30),
    id_personne VARCHAR(50), 
    prenom VARCHAR(50),
    nom VARCHAR(50),
    profession VARCHAR(20),
    films VARCHAR(5000)
);

Insert into bddreco._profession(id_profession, profession) VALUES(3, 'acteur');

CREATE OR REPLACE FUNCTION import_equipe()
RETURNS TRIGGER AS $$
DECLARE
    id_personne_temp_acteurs TEXT;
    id_film TEXT;
BEGIN

    INSERT INTO BDDreco._personne (id_personne, prenom, nom) VALUES (NEW.id_personne, NEW.prenom, NEW.nom);
    
    INSERT INTO bddreco._profession_personne (id_personne, id_profession) VALUES (NEW.id_personne, 3);
    -- Récupérer les valeurs de la ligne insérée dans bddreco._temp_acteurs
    id_personne_temp_acteurs := NEW.id_personne;

    -- Convertir la colonne films en liste de films
    FOR id_film IN SELECT unnest(string_to_array(NEW.films, ',')) LOOP
        -- Insérer dans bddreco._equipe
        INSERT INTO bddreco._equipe (id_film, id_personne, role_personne)
        VALUES (id_film, id_personne_temp_acteurs, 3);
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
CREATE TRIGGER trigger_import_equipe
AFTER INSERT ON bddreco._temp_acteurs
FOR EACH ROW
EXECUTE FUNCTION import_equipe();


WbImport -file='/home/etuinfo/trobe/Documents/SAE_RECO/PARTIE4/acteurs_finaux.tsv'
         -table=bddreco._temp_acteurs
         -filecolumns=id_film,id_personne,prenom,nom,profession,films
         -delimiter='\t'
         -dateformat="yyyy-MM-dd";
