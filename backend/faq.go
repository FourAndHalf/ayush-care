package main

import (
	"crypto/subtle"
	"encoding/json"
	"net"
	"net/http"
	"net/mail"
	"strings"
	"sync"
	"time"
	"unicode/utf8"
)

type API struct {
	store      *Store
	adminToken string
	limiter    *limiter
}

func (a *API) routes(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/faqs", a.listFAQs)
	mux.HandleFunc("GET /api/faqs/{id}", a.getFAQ)
	mux.HandleFunc("POST /api/questions", a.submitQuestion)

	mux.HandleFunc("GET /api/admin/questions", a.admin(a.adminList))
	mux.HandleFunc("POST /api/admin/faqs", a.admin(a.adminCreate))
	mux.HandleFunc("PUT /api/admin/faqs/{id}", a.admin(a.adminAnswer))
	mux.HandleFunc("DELETE /api/admin/faqs/{id}", a.admin(a.adminDelete))
}

func (a *API) listFAQs(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "public, max-age=300")
	writeJSON(w, http.StatusOK, map[string]any{
		"faqs":       a.store.Published(r.URL.Query().Get("category")),
		"categories": a.store.Categories(),
	})
}

func (a *API) getFAQ(w http.ResponseWriter, r *http.Request) {
	it, err := a.store.Get(r.PathValue("id"))
	if err != nil {
		writeErr(w, http.StatusNotFound, "not found")
		return
	}
	writeJSON(w, http.StatusOK, it)
}

type submitReq struct {
	Question string `json:"question"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Website  string `json:"website"` // honeypot: real people leave this empty
}

func (a *API) submitQuestion(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 8<<10)
	var in submitReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeErr(w, http.StatusBadRequest, "invalid request")
		return
	}
	if in.Website != "" { // bot: pretend success, store nothing
		writeJSON(w, http.StatusCreated, map[string]string{"status": "received"})
		return
	}
	q := strings.TrimSpace(in.Question)
	if n := utf8.RuneCountInString(q); n < 10 || n > 500 {
		writeErr(w, http.StatusBadRequest, "question must be 10 to 500 characters")
		return
	}
	name := strings.TrimSpace(in.Name)
	if utf8.RuneCountInString(name) > 80 {
		writeErr(w, http.StatusBadRequest, "name is too long")
		return
	}
	email := strings.TrimSpace(in.Email)
	if email != "" {
		if _, err := mail.ParseAddress(email); err != nil || len(email) > 120 {
			writeErr(w, http.StatusBadRequest, "email looks invalid")
			return
		}
	}
	if !a.limiter.allow(clientIP(r)) {
		writeErr(w, http.StatusTooManyRequests, "too many questions, please try again later")
		return
	}
	it, err := a.store.Submit(q, name, email)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "could not save your question")
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"status": "received", "id": it.ID})
}

// ---- admin ----

func (a *API) admin(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if a.adminToken == "" {
			writeErr(w, http.StatusForbidden, "admin API disabled: set ADMIN_TOKEN")
			return
		}
		got := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
		if subtle.ConstantTimeCompare([]byte(got), []byte(a.adminToken)) != 1 {
			writeErr(w, http.StatusUnauthorized, "unauthorized")
			return
		}
		next(w, r)
	}
}

func (a *API) adminList(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"items": a.store.List(r.URL.Query().Get("status"))})
}

type answerReq struct {
	Category string `json:"category"`
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

func (a *API) adminCreate(w http.ResponseWriter, r *http.Request) {
	in, ok := decodeAnswer(w, r)
	if !ok {
		return
	}
	if strings.TrimSpace(in.Question) == "" {
		writeErr(w, http.StatusBadRequest, "question is required")
		return
	}
	cat := in.Category
	if cat == "" {
		cat = "General"
	}
	it, err := a.store.Create(cat, in.Question, in.Answer)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "could not save")
		return
	}
	writeJSON(w, http.StatusCreated, it)
}

func (a *API) adminAnswer(w http.ResponseWriter, r *http.Request) {
	in, ok := decodeAnswer(w, r)
	if !ok {
		return
	}
	it, err := a.store.Answer(r.PathValue("id"), in.Answer, strings.TrimSpace(in.Question), strings.TrimSpace(in.Category))
	if err == ErrNotFound {
		writeErr(w, http.StatusNotFound, "not found")
		return
	} else if err != nil {
		writeErr(w, http.StatusInternalServerError, "could not save")
		return
	}
	writeJSON(w, http.StatusOK, it)
}

func (a *API) adminDelete(w http.ResponseWriter, r *http.Request) {
	if err := a.store.Delete(r.PathValue("id")); err == ErrNotFound {
		writeErr(w, http.StatusNotFound, "not found")
		return
	} else if err != nil {
		writeErr(w, http.StatusInternalServerError, "could not delete")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func decodeAnswer(w http.ResponseWriter, r *http.Request) (answerReq, bool) {
	r.Body = http.MaxBytesReader(w, r.Body, 32<<10)
	var in answerReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeErr(w, http.StatusBadRequest, "invalid request")
		return in, false
	}
	in.Answer = strings.TrimSpace(in.Answer)
	if in.Answer == "" {
		writeErr(w, http.StatusBadRequest, "answer is required")
		return in, false
	}
	return in, true
}

func writeErr(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

// ---- tiny per-IP limiter: 5 questions per hour ----

type limiter struct {
	mu   sync.Mutex
	hits map[string][]time.Time
	max  int
	win  time.Duration
}

func newLimiter(max int, win time.Duration) *limiter {
	return &limiter{hits: map[string][]time.Time{}, max: max, win: win}
}

func (l *limiter) allow(key string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()
	now := time.Now()
	recent := l.hits[key][:0]
	for _, t := range l.hits[key] {
		if now.Sub(t) < l.win {
			recent = append(recent, t)
		}
	}
	if len(recent) >= l.max {
		l.hits[key] = recent
		return false
	}
	l.hits[key] = append(recent, now)
	return true
}

func clientIP(r *http.Request) string {
	if f := r.Header.Get("X-Forwarded-For"); f != "" {
		return strings.TrimSpace(strings.Split(f, ",")[0])
	}
	h, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return h
}
