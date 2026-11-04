package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"
)

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type, Authorization", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func cors(next http.Handler) http.Handler {
	origin := os.Getenv("CORS_ORIGIN")
	if origin == "" {
		origin = "http://localhost:5173"
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func newMux(api *API) http.Handler {
	mux := http.NewServeMux()
	api.routes(mux)
	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]any{
			"status": "ok",
			"time":   time.Now().UTC().Format(time.RFC3339),
		})
	})
	mux.HandleFunc("GET /api/hello", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"message": "Hello from the Go backend"})
	})
	return cors(mux)
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	dataFile := os.Getenv("DATA_FILE")
	if dataFile == "" {
		dataFile = "data/store.json"
	}
	store, err := OpenStore(dataFile, "data/faqs.seed.json")
	if err != nil {
		log.Fatalf("open store: %v", err)
	}
	api := &API{store: store, adminToken: os.Getenv("ADMIN_TOKEN"), limiter: newLimiter(5, time.Hour)}
	if api.adminToken == "" {
		log.Print("ADMIN_TOKEN not set: admin API is disabled")
	}
	log.Printf("listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, newMux(api)))
}
