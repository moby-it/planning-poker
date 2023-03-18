## Components

- feedback on failed to connect ws


- Enhance e2e suits
  - Voting
    1. User creates room
    2. Voter joins the room
    3. One selects a card, ui changes
    4. Someone clicks reveal, after 5 seconds cards get revealed.
    5. MAKE SURE bad paths are tested
  - Spectating
    - Verify that spectator sees the same things without seeing voting card list
    - Verify that spectator can change role while people are voting
  - When a new votes joins, the revealing should stop