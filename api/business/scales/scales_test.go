package scales_test

import (
	"testing"

	"github.com/George-Spanos/poker-planning/business/scales"
)

func TestOrder(t *testing.T) {
	want := []string{"fibonacci", "tshirt", "powersof2", "animals"}
	if len(scales.Order) != len(want) {
		t.Fatalf("Order = %v, want %v", scales.Order, want)
	}
	for i, name := range want {
		if scales.Order[i] != name {
			t.Errorf("Order[%d] = %q, want %q", i, scales.Order[i], name)
		}
	}
}

func TestAllReturnsEveryScaleInOrder(t *testing.T) {
	all := scales.All()
	if len(all) != len(scales.Order) {
		t.Fatalf("All() returned %d scales, want %d", len(all), len(scales.Order))
	}
	for i, scale := range all {
		if scale.Value != scales.Order[i] {
			t.Errorf("All()[%d].Value = %q, want %q", i, scale.Value, scales.Order[i])
		}
		if scale.Name == "" {
			t.Errorf("scale %q has no display name", scale.Value)
		}
	}
}

func TestNumericFlags(t *testing.T) {
	want := map[string]bool{
		"fibonacci": true,
		"tshirt":    false,
		"powersof2": true,
		"animals":   false,
	}
	for name, numeric := range want {
		if got := scales.Get(name).Numeric; got != numeric {
			t.Errorf("Get(%q).Numeric = %v, want %v", name, got, numeric)
		}
	}
}

// Every scale must offer the two escape hatches, as the last two cards, so the
// voting card list always ends the same way.
func TestEveryScaleEndsWithTheSpecialCards(t *testing.T) {
	for _, scale := range scales.All() {
		cards := scale.Cards
		if len(cards) < 2 {
			t.Fatalf("scale %q has %d cards", scale.Value, len(cards))
		}
		unknown, coffee := cards[len(cards)-2], cards[len(cards)-1]
		if unknown.Label != "?" || unknown.Value != scales.Unknown {
			t.Errorf("scale %q: second to last card = %+v, want {? %d}", scale.Value, unknown, scales.Unknown)
		}
		if coffee.Label != "☕" || coffee.Value != scales.Coffee {
			t.Errorf("scale %q: last card = %+v, want {☕ %d}", scale.Value, coffee, scales.Coffee)
		}
	}
}

func TestIsValid(t *testing.T) {
	for _, name := range scales.Order {
		if !scales.IsValid(name) {
			t.Errorf("IsValid(%q) = false, want true", name)
		}
	}
	for _, name := range []string{"", "FIBONACCI", "planets", "fibonacci "} {
		if scales.IsValid(name) {
			t.Errorf("IsValid(%q) = true, want false", name)
		}
	}
}

func TestGetFallsBackToFibonacci(t *testing.T) {
	if got := scales.Get("planets").Value; got != scales.Default {
		t.Errorf("Get(\"planets\").Value = %q, want %q", got, scales.Default)
	}
	if got := scales.Get("").Value; got != scales.Default {
		t.Errorf("Get(\"\").Value = %q, want %q", got, scales.Default)
	}
}

func TestLabel(t *testing.T) {
	tests := []struct {
		scale string
		value int
		want  string
	}{
		{"fibonacci", 13, "13"},
		{"fibonacci", scales.Unknown, "?"},
		{"fibonacci", scales.Coffee, "☕"},
		{"tshirt", 3, "M"},
		{"tshirt", 13, "XXL"},
		{"animals", 8, "Cow"},
		{"powersof2", 64, "64"},
		{"fibonacci", 7, ""}, // not a card on this scale
	}
	for _, tt := range tests {
		if got := scales.Get(tt.scale).Label(tt.value); got != tt.want {
			t.Errorf("Get(%q).Label(%d) = %q, want %q", tt.scale, tt.value, got, tt.want)
		}
	}
}

func TestClosestLabel(t *testing.T) {
	tests := []struct {
		scale  string
		target float64
		want   string
	}{
		{"fibonacci", 6, "5"},   // 6 is nearer 5 than 8
		{"fibonacci", 7, "8"},   // 7 is nearer 8 than 5
		{"fibonacci", 2.408, "2"}, // the case asserted by the e2e suite
		{"fibonacci", 0, "0"},
		{"fibonacci", 1000, "89"}, // clamps to the largest estimable card
		{"tshirt", 10.5, "XL"},
		{"tshirt", 1, "XS"},
		{"animals", 12, "Elephant"},
		{"powersof2", 3, "2"}, // ties break towards the first card met
		{"powersof2", 48, "32"},
	}
	for _, tt := range tests {
		if got := scales.Get(tt.scale).ClosestLabel(tt.target); got != tt.want {
			t.Errorf("Get(%q).ClosestLabel(%v) = %q, want %q", tt.scale, tt.target, got, tt.want)
		}
	}
}

// A verdict is an estimate, so the special cards must never win the search even
// when the target sits right on top of them.
func TestClosestLabelNeverReturnsASpecialCard(t *testing.T) {
	for _, scale := range scales.All() {
		for _, target := range []float64{float64(scales.Unknown), float64(scales.Coffee), 5000} {
			got := scale.ClosestLabel(target)
			if got == "?" || got == "☕" {
				t.Errorf("Get(%q).ClosestLabel(%v) = %q, want an estimable card", scale.Value, target, got)
			}
		}
	}
}
