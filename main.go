package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"sort"
	"strconv"
	"sync"
	"text/template"

	"github.com/gorilla/mux"
)

type ScoreEntry struct {
	Name  string `json:"name"`
	Score int    `json:"score"`
	Time  string `json:"time"`
}

var (
	scores []ScoreEntry
	mutex  sync.Mutex
)

// 📌 Charger les scores depuis le fichier JSON
func loadScores() {
	file, err := os.Open("scores.json")
	if err != nil {
		log.Println("Aucun fichier de scores trouvé, création d'un nouveau.")
		return
	}
	defer file.Close()

	bytes, err := ioutil.ReadAll(file)
	if err != nil {
		log.Println("Erreur lors de la lecture du fichier:", err)
		return
	}

	json.Unmarshal(bytes, &scores)
}

// 📌 Sauvegarder les scores dans le fichier JSON
func saveScores() {
	bytes, err := json.MarshalIndent(scores, "", "  ")
	if err != nil {
		log.Println("Erreur lors de l'encodage des scores:", err)
		return
	}

	err = ioutil.WriteFile("scores.json", bytes, 0644)
	if err != nil {
		log.Println("Erreur lors de l'écriture dans le fichier:", err)
	}
}

// 📌 Ajouter un score (POST /api/scores)
func addScoreHandler(w http.ResponseWriter, r *http.Request) {
	mutex.Lock()
	defer mutex.Unlock()

	var newScore ScoreEntry
	if err := json.NewDecoder(r.Body).Decode(&newScore); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	scores = append(scores, newScore)

	// Trier les scores du plus grand au plus petit
	sort.Slice(scores, func(i, j int) bool {
		return scores[i].Score > scores[j].Score
	})

	saveScores() // Sauvegarde dans le fichier JSON

	w.WriteHeader(http.StatusCreated)
	fmt.Fprintln(w, "Score ajouté avec succès")
}

// 📌 Récupérer les scores avec pagination (GET /api/scores?page=1&limit=5)
func getScoresHandler(w http.ResponseWriter, r *http.Request) {
	mutex.Lock()
	defer mutex.Unlock()

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 5
	}

	start := (page - 1) * limit
	end := start + limit
	if start >= len(scores) {
		start, end = 0, 0
	} else if end > len(scores) {
		end = len(scores)
	}

	paginatedScores := scores[start:end]

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(paginatedScores)
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("index.html")
	if err != nil {
		log.Println("Erreur lors du chargement du template:", err)
		http.Error(w, "Erreur interne du serveur 1", http.StatusInternalServerError)
		return
	}

	// Exécution du template
	if err := tmpl.ExecuteTemplate(w, "index.html", ""); err != nil {
		log.Println("Erreur lors de l'exécution du template:", err)
		http.Error(w, "Erreur interne du serveur 2", http.StatusInternalServerError)
	}
}

// 📌 Lancer l'API
func main() {
	loadScores() // Charger les scores existants

	r := mux.NewRouter()

	// Servir les fichiers statiques
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("./static/"))))

	// Routes API
	r.HandleFunc("/api/scores", addScoreHandler).Methods("POST")
	r.HandleFunc("/api/scores", getScoresHandler).Methods("GET")
	r.HandleFunc("/",indexHandler)

	log.Println("🚀 Serveur démarré sur http://localhost:8080")
	http.ListenAndServe(":8080", r)
}
