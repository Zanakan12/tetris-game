package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
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

func addScoreHandler(w http.ResponseWriter, r *http.Request) {
	mutex.Lock()
	defer mutex.Unlock()

	var newScore ScoreEntry
	if err := json.NewDecoder(r.Body).Decode(&newScore); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	scores = append(scores, newScore)
	sort.Slice(scores, func(i, j int) bool {
		return scores[i].Score > scores[j].Score
	})

	w.WriteHeader(http.StatusCreated)
	fmt.Fprintln(w, "Score added successfully")
}

func getScoresHandler(w http.ResponseWriter, r *http.Request) {
	mutex.Lock()
	defer mutex.Unlock()

	// Pagination logic
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
		start, end = 0, 0 // No data for this page
	} else if end > len(scores) {
		end = len(scores)
	}

	paginatedScores := scores[start:end]

	// Respond with JSON
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(paginatedScores); err != nil {
		http.Error(w, "Unable to encode JSON", http.StatusInternalServerError)
		return
	}
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
func main() {

	r := mux.NewRouter()

	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("./static/"))))
	r.HandleFunc("/api/scores", addScoreHandler).Methods("POST")
	r.HandleFunc("/api/scores", getScoresHandler).Methods("GET")
	r.HandleFunc("/", indexHandler)

	log.Println("Starting server on localhost:8080")
	http.ListenAndServe(":8080", r)
}
