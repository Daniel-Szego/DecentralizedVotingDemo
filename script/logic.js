/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global getAssetRegistry getFactory emit */

var namespace = "org.decentralizedvoting.model";

/**
 * Creating test data.
 * @param {org.decentralizedvoting.model.CreateTestDataTransaction} param The sample transaction instance.
 * @transaction
 */
async function CreateTestDataTransaction(param) {  
  
    console.log('init test data');
	
    console.log('Creating a votinground and two voters');  
    const factory = getFactory(); 
	
  	// adding a Voting round
    const votingRoundReg = await getAssetRegistry(namespace + '.VotingRound');   
    const votingRound = await factory.newResource(namespace, 'VotingRound', "1");
    votingRound.votingStates = "INITIATED";
    votingRound.valueOfVote = new Array();
      
    const possibleVoteValue1 = await factory.newConcept(namespace, 'ValueOfVote');  
	possibleVoteValue1.value = 1;
	possibleVoteValue1.valueSecription = "First choice";
	possibleVoteValue1.votes = 0;
  	votingRound.valueOfVote.push(possibleVoteValue1); 

    const possibleVoteValue2 = await factory.newConcept(namespace, 'ValueOfVote');  
	possibleVoteValue2.value = 2;
	possibleVoteValue2.valueSecription = "Second choice";
	possibleVoteValue2.votes = 0;
  	votingRound.valueOfVote.push(possibleVoteValue2); 

    const possibleVoteValue3 = await factory.newConcept(namespace, 'ValueOfVote');  
	possibleVoteValue3.value = 3;
	possibleVoteValue3.valueSecription = "Third choice";
	possibleVoteValue3.votes = 0;
  	votingRound.valueOfVote.push(possibleVoteValue3); 
  
    await votingRoundReg.add(votingRound);       

  	// adding a Voter 1
    const voterReg = await getParticipantRegistry(namespace + '.Voter');   
    const voter = await factory.newResource(namespace, 'Voter', "1");
    voter.firstName = "John";
    voter.lastName = "Rambo";
  
    await voterReg.add(voter);       

    // adding a Voter 2
    const voter2 = await factory.newResource(namespace, 'Voter', "2");
    voter2.firstName = "Chuck";
    voter2.lastName = "Norris";
  
    await voterReg.add(voter2);       

  	// adding an Admin
    const adminReg = await getParticipantRegistry(namespace + '.Admin');   
    const admin = await factory.newResource(namespace, 'Admin', "1");
  
    await adminReg.add(admin);       
  

    console.log('init test data finished');

}

/**
 * Deleting test data.
 * @param {org.decentralizedvoting.model.ClearDataTransaction} param The sample transaction instance.
 * @transaction
 */
async function ClearDataTransaction(param) {  
    console.log('clearing test data');

    // deleting assets
    const votingRoundReg = await getAssetRegistry(namespace + '.VotingRound'); 
    let VotingRounds = await votingRoundReg.getAll();
    await votingRoundReg.removeAll(VotingRounds);
  
    const voteReg = await getAssetRegistry(namespace + '.Vote'); 
    let votes = await voteReg.getAll();
    await voteReg.removeAll(votes);
  
  	// deleting participants
    const voterReg = await getParticipantRegistry(namespace + '.Voter');
    let voters = await voterReg.getAll();
    await voterReg.removeAll(voters);
    
    const adminReg = await getParticipantRegistry(namespace + '.Admin');
    let admins = await adminReg.getAll();
    await adminReg.removeAll(admins);
  
}

/**
 * Start voting
 * @param {org.decentralizedvoting.model.StartVotingTransaction} param The sample transaction instance.
 * @transaction
 */
async function StartVotingTransaction(param) { 
  const factory = getFactory(); 
  
  let votingRound = param.votingRound;
  console.log("State:");
  console.log(votingRound.votingStates);
  
    // State check
  // actual state not initialized -> error
  if (!(votingRound.votingStates == "INITIATED")) {
  	 throw new Error("start voting can be executed only in initiated state");
  } 
  
  const votingRoundReg = await getAssetRegistry(namespace + '.VotingRound'); 
  votingRound.votingStates = "VOTING";
  votingRoundReg.update(votingRound);
   
  // emitting VotingStartedEvent event

  let votingStartedEvent = factory.newEvent(namespace, 'VotingStartedEvent');
  votingStartedEvent.votingRound = votingRound;
  await emit(votingStartedEvent);  	   
}

/**
 * Calculate votes
 * @param {org.decentralizedvoting.model.CalculateVotesTransaction} param The sample transaction instance.
 * @transaction
 */
async function CalculateVotesTransaction(param) {  
}

/**
 * Vote
 * @param {org.decentralizedvoting.model.VoteTransaction} param The sample transaction instance.
 * @transaction
 */
async function VoteTransaction(param) {  
  const factory = getFactory(); 
  let votingRound = param.votingRound;
  let voter = param.voter;
  let hash = param.hash;
  
  
  // State check
  // Voting can be done only in voting state
  if (votingRound.votingStates != "VOTING") {
  	 throw new Error("Voting can be done only in voting state");
  }

 
  const voteReg = await getAssetRegistry(namespace + '.Vote');   

  // getting max votes
  let existingVotes = await voteReg.getAll();
  let numberOfVotes = 0;
  
  await existingVotes.forEach(function (vote) {
    numberOfVotes ++;
  });
  numberOfVotes ++; 	
  
  const vote = await factory.newResource(namespace, 'Vote', numberOfVotes.toString());
  vote.votingRound = votingRound;
  vote.hash = hash;
  vote.voter = voter;
  vote.voteSate = "VOTED";
    
  await voteReg.add(vote);       

}

/**
 * Reveal Vote
 * @param {org.decentralizedvoting.model.RevealVoteTransaction} param The sample transaction instance.
 * @transaction
 */
async function RevealVoteTransaction(param) {  
  const vote = param.vote;
  const voteValue = param.voteValue;
  const salt = param.salt;
  const votingRound = vote.votingRound;
 
  // State check
  // Reveal can be done only in voting state
  if (votingRound.votingStates != "CALCULATING") {
  	 throw new Error("Reveal can be started only in calculating state");
  }

  // Reveal can be done only in voting state
  if (vote.voteSate != "VOTED") {
  	 throw new Error("Votes can be revealed only once");
  }
  
  let calculatedhash = sha256(voteValue.toString() + salt);
  
  if (calculatedhash != vote.hash) {
  	throw new Error("Incorrect hash");
  }
  
  const votingRoundReg = await getAssetRegistry(namespace + '.VotingRound');
  votingRound.valueOfVote[voteValue].votes = votingRound.valueOfVote[voteValue].votes + 1;
  votingRoundReg.update(votingRound);

  const votingReg = await getAssetRegistry(namespace + '.Vote');
  vote.voteSate = "REVEALED";
  votingReg.update(vote); 
}









