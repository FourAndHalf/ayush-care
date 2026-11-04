package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"time"
)

const (
	StatusPublished = "published"
	StatusPending   = "pending"
)

// Item is one question, with its answer once published.
type Item struct {
	ID        string    `json:"id"`
	Category  string    `json:"category"`
	Question  string    `json:"question"`
	Answer    string    `json:"answer,omitempty"`
	Status    string    `json:"status"`
	Source    string    `json:"source,omitempty"` // "seed" or "visitor"
	Name      string    `json:"name,omitempty"`
	Email     string    `json:"email,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// PublicItem is what the open API exposes (no personal details).
type PublicItem struct {
	ID        string    `json:"id"`
	Category  string    `json:"category"`
	Question  string    `json:"question"`
	Answer    string    `json:"answer"`
	UpdatedAt time.Time `json:"updatedAt"`
}

var ErrNotFound = errors.New("not found")

type Store struct {
	mu    sync.RWMutex
	path  string
	items []Item
}

type fileShape struct {
	FAQs []Item `json:"faqs"`
}

// OpenStore loads the runtime file, creating it from the seed on first run.
func OpenStore(path, seedPath string) (*Store, error) {
	s := &Store{path: path}
	b, err := os.ReadFile(path)
	if errors.Is(err, os.ErrNotExist) {
		if b, err = os.ReadFile(seedPath); err != nil {
			return nil, err
		}
		var f fileShape
		if err := json.Unmarshal(b, &f); err != nil {
			return nil, err
		}
		now := time.Now().UTC()
		for i := range f.FAQs {
			f.FAQs[i].CreatedAt, f.FAQs[i].UpdatedAt = now, now
			if f.FAQs[i].Source == "" {
				f.FAQs[i].Source = "seed"
			}
		}
		s.items = f.FAQs
		return s, s.saveLocked()
	}
	if err != nil {
		return nil, err
	}
	var f fileShape
	if err := json.Unmarshal(b, &f); err != nil {
		return nil, err
	}
	s.items = f.FAQs
	return s, nil
}

func (s *Store) saveLocked() error {
	if err := os.MkdirAll(filepath.Dir(s.path), 0o755); err != nil {
		return err
	}
	b, err := json.MarshalIndent(fileShape{FAQs: s.items}, "", "  ")
	if err != nil {
		return err
	}
	tmp := s.path + ".tmp"
	if err := os.WriteFile(tmp, b, 0o600); err != nil {
		return err
	}
	return os.Rename(tmp, s.path)
}

func newID() string {
	b := make([]byte, 5)
	_, _ = rand.Read(b)
	return "q-" + hex.EncodeToString(b)
}

// Published returns answered items, optionally for one category.
func (s *Store) Published(category string) []PublicItem {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := []PublicItem{}
	for _, it := range s.items {
		if it.Status == StatusPublished && (category == "" || it.Category == category) {
			out = append(out, PublicItem{it.ID, it.Category, it.Question, it.Answer, it.UpdatedAt})
		}
	}
	return out
}

func (s *Store) Categories() []string {
	s.mu.RLock()
	defer s.mu.RUnlock()
	seen := map[string]bool{}
	out := []string{}
	for _, it := range s.items {
		if it.Status == StatusPublished && !seen[it.Category] {
			seen[it.Category] = true
			out = append(out, it.Category)
		}
	}
	sort.Strings(out)
	return out
}

func (s *Store) Get(id string) (PublicItem, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, it := range s.items {
		if it.ID == id && it.Status == StatusPublished {
			return PublicItem{it.ID, it.Category, it.Question, it.Answer, it.UpdatedAt}, nil
		}
	}
	return PublicItem{}, ErrNotFound
}

// Submit saves a visitor question as pending.
func (s *Store) Submit(question, name, email string) (Item, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now().UTC()
	it := Item{ID: newID(), Category: "Visitor questions", Question: question, Status: StatusPending,
		Source: "visitor", Name: name, Email: email, CreatedAt: now, UpdatedAt: now}
	s.items = append(s.items, it)
	return it, s.saveLocked()
}

// List returns items with the given status (all if empty), for admins.
func (s *Store) List(status string) []Item {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := []Item{}
	for _, it := range s.items {
		if status == "" || it.Status == status {
			out = append(out, it)
		}
	}
	return out
}

// Answer sets the answer on an existing item and publishes it.
func (s *Store) Answer(id, answer, question, category string) (Item, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.items {
		if s.items[i].ID == id {
			s.items[i].Answer = answer
			if question != "" {
				s.items[i].Question = question
			}
			if category != "" {
				s.items[i].Category = category
			}
			s.items[i].Status = StatusPublished
			s.items[i].UpdatedAt = time.Now().UTC()
			return s.items[i], s.saveLocked()
		}
	}
	return Item{}, ErrNotFound
}

// Create adds an already-answered item.
func (s *Store) Create(category, question, answer string) (Item, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now().UTC()
	it := Item{ID: newID(), Category: category, Question: question, Answer: answer,
		Status: StatusPublished, Source: "admin", CreatedAt: now, UpdatedAt: now}
	s.items = append(s.items, it)
	return it, s.saveLocked()
}

func (s *Store) Delete(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.items {
		if s.items[i].ID == id {
			s.items = append(s.items[:i], s.items[i+1:]...)
			return s.saveLocked()
		}
	}
	return ErrNotFound
}
