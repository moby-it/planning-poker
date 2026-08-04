package stats_test

import (
	"testing"

	"github.com/George-Spanos/poker-planning/business/scales"
	"github.com/George-Spanos/poker-planning/business/stats"
)

func TestCompute(t *testing.T) {
	tests := []struct {
		name  string
		scale string
		votes map[string]int
		want  stats.Stats
	}{
		{
			// The exact case the e2e suite asserts on: three voters casting
			// 1, 2 and 3 on the default scale.
			name:  "the votes cast by the e2e suite",
			scale: "fibonacci",
			votes: map[string]int{"fasolakis": 3, "fasolis": 1, "manolakis": 2},
			want:  stats.Stats{Numeric: true, Average: "2.0", StandardDeviation: "0.8", Verdict: "2"},
		},
		{
			name:  "unanimous round has no spread",
			scale: "fibonacci",
			votes: map[string]int{"a": 5, "b": 5, "c": 5},
			want:  stats.Stats{Numeric: true, Average: "5.0", StandardDeviation: "0.0", Verdict: "5"},
		},
		{
			name:  "single voter",
			scale: "fibonacci",
			votes: map[string]int{"a": 8},
			want:  stats.Stats{Numeric: true, Average: "8.0", StandardDeviation: "0.0", Verdict: "8"},
		},
		{
			// A wide spread pushes the verdict above the average: 7 alone would
			// land on 8 anyway, but half the deviation carries it clear of 5.
			name:  "disagreement pushes the verdict up",
			scale: "fibonacci",
			votes: map[string]int{"a": 1, "b": 13},
			want:  stats.Stats{Numeric: true, Average: "7.0", StandardDeviation: "6.0", Verdict: "8"},
		},
		{
			name:  "special cards are excluded from the numbers",
			scale: "fibonacci",
			votes: map[string]int{"a": 1, "b": 2, "c": 3, "d": scales.Unknown, "e": scales.Coffee},
			want:  stats.Stats{Numeric: true, Average: "2.0", StandardDeviation: "0.8", Verdict: "2"},
		},
		{
			name:  "non numeric scale still gets a verdict",
			scale: "tshirt",
			votes: map[string]int{"a": 5, "b": 8, "c": 13}, // L, XL, XXL
			want:  stats.Stats{Numeric: false, Average: "8.7", StandardDeviation: "3.3", Verdict: "XL"},
		},
		{
			name:  "animals",
			scale: "animals",
			votes: map[string]int{"a": 1, "b": 2}, // Mouse, Cat
			want:  stats.Stats{Numeric: false, Average: "1.5", StandardDeviation: "0.5", Verdict: "Cat"},
		},
		{
			name:  "everyone asked for a break",
			scale: "fibonacci",
			votes: map[string]int{"a": scales.Coffee, "b": scales.Coffee},
			want:  stats.Stats{Numeric: true, Average: "0.0", StandardDeviation: "0.0", Verdict: "☕"},
		},
		{
			name:  "nobody knew",
			scale: "fibonacci",
			votes: map[string]int{"a": scales.Unknown, "b": scales.Unknown},
			want:  stats.Stats{Numeric: true, Average: "0.0", StandardDeviation: "0.0", Verdict: "?"},
		},
		{
			// A break beats a shrug when neither is an estimate.
			name:  "a break outranks a shrug",
			scale: "fibonacci",
			votes: map[string]int{"a": scales.Unknown, "b": scales.Coffee},
			want:  stats.Stats{Numeric: true, Average: "0.0", StandardDeviation: "0.0", Verdict: "☕"},
		},
		{
			name:  "no votes at all",
			scale: "fibonacci",
			votes: map[string]int{},
			want:  stats.Stats{Numeric: true, Average: "0.0", StandardDeviation: "0.0", Verdict: "?"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := stats.Compute(tt.votes, scales.Get(tt.scale))
			if got != tt.want {
				t.Errorf("Compute() = %+v, want %+v", got, tt.want)
			}
		})
	}
}

// The numbers must be formatted to one decimal, matching what the e2e suite
// scrapes out of the stats container.
func TestComputeAlwaysFormatsOneDecimal(t *testing.T) {
	got := stats.Compute(map[string]int{"a": 1, "b": 2}, scales.Get("fibonacci"))
	if got.Average != "1.5" {
		t.Errorf("Average = %q, want %q", got.Average, "1.5")
	}
	if got.StandardDeviation != "0.5" {
		t.Errorf("StandardDeviation = %q, want %q", got.StandardDeviation, "0.5")
	}
}
