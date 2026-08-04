// Package stats summarises the votes of a revealed round.
package stats

import (
	"math"
	"strconv"

	"github.com/George-Spanos/poker-planning/business/scales"
)

// Stats is the summary shown once a round is revealed. The numbers are
// formatted server side so every client displays exactly the same thing.
type Stats struct {
	// Numeric mirrors the scale: t-shirt sizes and animals get a verdict but
	// no average, because the underlying numbers are only an ordering.
	Numeric           bool   `json:"numeric"`
	Average           string `json:"average"`
	StandardDeviation string `json:"standardDeviation"`
	Verdict           string `json:"verdict"`
}

// Compute summarises votes against the scale the room was created with.
//
// The "?" and coffee cards are opinions about the story, not estimates, so they
// are left out of the average and the standard deviation. When nothing
// estimable was voted, the verdict reports what the room actually said.
func Compute(votes map[string]int, scale scales.Scale) Stats {
	estimates := make([]float64, 0, len(votes))
	coffee := false
	for _, vote := range votes {
		if vote >= scales.Unknown {
			if vote == scales.Coffee {
				coffee = true
			}
			continue
		}
		estimates = append(estimates, float64(vote))
	}

	s := Stats{Numeric: scale.Numeric}

	if len(estimates) == 0 {
		s.Average = format(0)
		s.StandardDeviation = format(0)
		if coffee {
			s.Verdict = "☕"
		} else {
			s.Verdict = "?"
		}
		return s
	}

	sum := 0.0
	for _, estimate := range estimates {
		sum += estimate
	}
	average := sum / float64(len(estimates))

	variance := 0.0
	for _, estimate := range estimates {
		variance += (estimate - average) * (estimate - average)
	}
	variance /= float64(len(estimates))
	deviation := math.Sqrt(variance)

	s.Average = format(average)
	s.StandardDeviation = format(deviation)
	// Nudge the verdict towards the pessimistic half of the spread: a round the
	// team disagreed about lands on a higher card than the bare average.
	s.Verdict = scale.ClosestLabel(average + deviation/2)
	return s
}

func format(v float64) string {
	return strconv.FormatFloat(v, 'f', 1, 64)
}
