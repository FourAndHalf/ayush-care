package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func testAPI(t *testing.T) (http.Handler, *API) {
	t.Helper()
	store, err := OpenStore(filepath.Join(t.TempDir(), "store.json"), "data/faqs.seed.json")
	if err != nil {
		t.Fatal(err)
	}
	api := &API{store: store, adminToken: "secret", limiter: newLimiter(5, time.Hour)}
	return newMux(api), api
}

func do(h http.Handler, method, path, body, token string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	return rec
}

func TestHealth(t *testing.T) {
	h, _ := testAPI(t)
	if rec := do(h, "GET", "/api/health", "", ""); rec.Code != 200 {
		t.Fatalf("got %d", rec.Code)
	}
}

func TestPublicListHidesPendingAndPrivateFields(t *testing.T) {
	h, _ := testAPI(t)
	rec := do(h, "GET", "/api/faqs", "", "")
	if rec.Code != 200 {
		t.Fatalf("got %d", rec.Code)
	}
	var out struct {
		FAQs []map[string]any `json:"faqs"`
	}
	json.Unmarshal(rec.Body.Bytes(), &out)
	if len(out.FAQs) != 11 {
		t.Fatalf("want 11 published, got %d", len(out.FAQs))
	}
	for _, f := range out.FAQs {
		if _, ok := f["email"]; ok || f["answer"] == "" {
			t.Fatalf("bad public item: %v", f)
		}
	}
}

func TestSubmitAndAnswerFlow(t *testing.T) {
	h, _ := testAPI(t)
	rec := do(h, "POST", "/api/questions", `{"question":"Do you deliver on Sundays?","email":"a@b.co"}`, "")
	if rec.Code != 201 {
		t.Fatalf("submit: %d %s", rec.Code, rec.Body)
	}
	var sub map[string]string
	json.Unmarshal(rec.Body.Bytes(), &sub)

	// not public until answered
	if strings.Contains(do(h, "GET", "/api/faqs", "", "").Body.String(), "Sundays") {
		t.Fatal("pending question leaked")
	}
	// admin needs the token
	if do(h, "GET", "/api/admin/questions", "", "").Code != 401 {
		t.Fatal("want 401 without token")
	}
	rec = do(h, "GET", "/api/admin/questions?status=pending", "", "secret")
	if rec.Code != 200 || !strings.Contains(rec.Body.String(), "Sundays") {
		t.Fatalf("admin list: %d", rec.Code)
	}
	rec = do(h, "PUT", "/api/admin/faqs/"+sub["id"], `{"answer":"Yes, we do."}`, "secret")
	if rec.Code != 200 {
		t.Fatalf("answer: %d %s", rec.Code, rec.Body)
	}
	if !strings.Contains(do(h, "GET", "/api/faqs", "", "").Body.String(), "Yes, we do.") {
		t.Fatal("answered question should be public")
	}
}

func TestSubmitValidation(t *testing.T) {
	h, _ := testAPI(t)
	for name, body := range map[string]string{
		"short":    `{"question":"hi"}`,
		"bademail": `{"question":"A perfectly long question?","email":"nope"}`,
		"badjson":  `{`,
	} {
		if rec := do(h, "POST", "/api/questions", body, ""); rec.Code != 400 {
			t.Errorf("%s: want 400, got %d", name, rec.Code)
		}
	}
	// honeypot: success response but nothing stored
	do(h, "POST", "/api/questions", `{"question":"Buy cheap watches now","website":"x.com"}`, "")
	if strings.Contains(do(h, "GET", "/api/admin/questions", "", "secret").Body.String(), "watches") {
		t.Fatal("honeypot submission was stored")
	}
}

func TestRateLimit(t *testing.T) {
	h, _ := testAPI(t)
	for i := 0; i < 5; i++ {
		if rec := do(h, "POST", "/api/questions", `{"question":"How long is the call exactly?"}`, ""); rec.Code != 201 {
			t.Fatalf("%d: %d", i, rec.Code)
		}
	}
	if rec := do(h, "POST", "/api/questions", `{"question":"How long is the call exactly?"}`, ""); rec.Code != 429 {
		t.Fatalf("want 429, got %d", rec.Code)
	}
}

func TestAdminDisabledWithoutToken(t *testing.T) {
	store, _ := OpenStore(filepath.Join(t.TempDir(), "s.json"), "data/faqs.seed.json")
	h := newMux(&API{store: store, limiter: newLimiter(5, time.Hour)})
	if rec := do(h, "GET", "/api/admin/questions", "", ""); rec.Code != 403 {
		t.Fatalf("want 403, got %d", rec.Code)
	}
}

func TestPersistsAcrossRestart(t *testing.T) {
	path := filepath.Join(t.TempDir(), "store.json")
	s, _ := OpenStore(path, "data/faqs.seed.json")
	s.Submit("Will this survive a restart?", "", "")
	s2, err := OpenStore(path, "data/faqs.seed.json")
	if err != nil {
		t.Fatal(err)
	}
	if len(s2.List(StatusPending)) != 11 { // 10 seeded + 1 new
		t.Fatalf("pending after reload: %d", len(s2.List(StatusPending)))
	}
}
