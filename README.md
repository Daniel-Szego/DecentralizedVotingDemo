# DecentralizedVoting

Decentralized voting with Hyperledger Fabric Composer

Assets:
- VotingRound
- Vote

Participants:
- Voter
- Admin

Voting process:
- INIT: Create VotingRound
- Create Voters
- ROUND 1: StartVotingTransaction -> Voting (only hash values)
- VoteTransaction -> vote for the possible values
- ROUND 2: Set VotingState to Calculating 
- RevealVoteTransaction (revealing vote values and salts)
- CLOSE: CalculateVotesTransaction -> calculating the votes and the vinner