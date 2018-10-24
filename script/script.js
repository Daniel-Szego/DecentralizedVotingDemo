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

const namespace = "org.booking.model"; 

/**
 * Initializing test data.
 * @param {org.booking.model.InitTestData} param The sample transaction instance.
 * @transaction
 */
async function InitTestDataTransaction(param) {  
    console.log('init test data');

    console.log('Creating a Hotel');  
    const factory = getFactory(); 
	
  	// adding hotel 1
    const hotelReg = await getParticipantRegistry(namespace + '.Hotel');   
    const hotel = await factory.newResource(namespace, 'Hotel', "1");
    hotel.hotelName = "Hotel 1";
    const newAddress = await factory.newConcept(namespace, 'Address');
	newAddress.country = "Bejing";
	newAddress.city = "China";
	newAddress.street = "Xia Mo Street";
    newAddress.hauseNr = 16;
  	hotel.address = newAddress;
  
    await hotelReg.add(hotel);       

  	// adding hotel 1
    console.log('Hotel 2');  

    const hotel2 = await factory.newResource(namespace, 'Hotel', "2");
    hotel2.hotelName = "Hotel 2";
    const newAddress2 = await factory.newConcept(namespace, 'Address');
	newAddress2.country = "Hong Kong";
	newAddress2.city = "China";
	newAddress2.street = "Mua Mo Street";
    newAddress2.hauseNr = 22;
  	hotel2.address = newAddress2;
  
    await hotelReg.add(hotel2);     
  
  	// adding endUser 1
    const endUserReg = await getParticipantRegistry(namespace + '.EndUser');   
    const endUser = await factory.newResource(namespace, 'EndUser', "1");
    endUser.UserName = "John Rambo";
  
    await endUserReg.add(endUser);       

    // adding endUser 2
    const endUser2 = await factory.newResource(namespace, 'EndUser', "2");
    endUser2.UserName = "John Rambo";
  
    await endUserReg.add(endUser2);       

    console.log('Creating Room 1');  
	
  	// adding room 1
    const roomReg = await getAssetRegistry(namespace + '.Room');   
    const room = await factory.newResource(namespace, 'Room', "1");
    var dateString = "2019-01-01";
    room.date = new Date(dateString);
    room.numberOfPeople = 3;
    room.numberOfBeds = 2;
    room.roomType = "SIMPLE";
    room.roomStatus = "FREE";
    room.hotel = hotel;
  
    await roomReg.add(room);       

    // adding room 2
    const room2 = await factory.newResource(namespace, 'Room', "2");
    var dateString2 = "2019-01-01";
    room2.date = new Date(dateString2);
    room2.numberOfPeople = 3;
    room2.numberOfBeds = 2;
    room2.roomType = "DELUXE";
    room2.roomStatus = "FREE";
    room2.hotel = hotel2;
  
    await roomReg.add(room2);       

    // adding room 3
    const room3 = await factory.newResource(namespace, 'Room', "3");
    var dateString3 = "2019-01-01";
    room3.date = new Date(dateString3);
    room3.numberOfPeople = 3;
    room3.numberOfBeds = 2;
    room3.roomType = "SIMPLE";
    room3.roomStatus = "FREE";
    room3.hotel = hotel2;
  
    await roomReg.add(room3);       

}

/**
 * Clearing test data.
 * @param {org.booking.model.ClearData} param The sample transaction instance.
 * @transaction
 */
async function ClearDataTransaction(param) {  
    console.log('clearing test data');

    // deleting assets
    const RoomReg = await getAssetRegistry(namespace + '.Room'); 
    let Rooms = await RoomReg.getAll();
    await RoomReg.removeAll(Rooms);
  
  	// deleting participants
    const hotelReg = await getParticipantRegistry(namespace + '.Hotel');
    let hotels = await hotelReg.getAll();
    await hotelReg.removeAll(hotels);
    
    const endUserReg = await getParticipantRegistry(namespace + '.EndUser');
    let endUsers = await endUserReg.getAll();
    await endUserReg.removeAll(endUsers);
}

/**
 * Issue hotel room.
 * @param {org.booking.model.IssueHotelRoom} param The sample transaction instance.
 * @transaction
 */
async function IssueHotelRoomTransaction(param) { 
  
  const factory = getFactory(); 

  const hotel = param.hotel;
  const numberOfPeople = param.numberOfPeople;
  const numberOfBeds = param.numberOfBeds;
  const roomType = param.roomType;
  const roomStatus = param.roomStatus;
  const dateString = param.dateString;

  const roomReg = await getAssetRegistry(namespace + '.Room');   

  // getting next id
  let existingRooms = await roomReg.getAll();
  let numberOfRooms = 0;
  
  await existingRooms.forEach(function (room) {
    numberOfRooms ++;
  });
  numberOfRooms ++; 	

  const room3 = await factory.newResource(namespace, 'Room', numberOfRooms.toString());
  room3.date = new Date(dateString);
  room3.numberOfPeople = numberOfPeople;
  room3.numberOfBeds = numberOfBeds;
  room3.roomType = roomType;
  room3.roomStatus = roomStatus;
  
  room3.hotel = hotel;
  
  await roomReg.add(room3);      
  
  // emitting ObjectIssued event

  let objectIssuedEvent = factory.newEvent(namespace, 'ObjectIssued');
  objectIssuedEvent.object = room3;
  objectIssuedEvent.objectHolder = hotel;
  await emit(objectIssuedEvent);  	
  
}

/**
 * Reserve hotel room.
 * @param {org.booking.model.ReserveRoom} param The sample transaction instance.
 * @transaction
 */
async function ReserveRoomTransaction(param) {  
   let room = param.room
   let user = param.me
   
   const factory = getFactory(); 
   
   const roomReg = await getAssetRegistry(namespace + '.Room'); 
   room.roomStatus = "RESEREVED";
   room.endUser = user;
   await roomReg.update(room); 
  
   // emitting ObjectReservered event

   let objectreservedEvent = factory.newEvent(namespace, 'ObjectReservered');
   objectreservedEvent.object = room;
   await emit(objectreservedEvent);  	

}

/**
 * Transfer hotel room.
 * @param {org.booking.model.TransferRoom} param The sample transaction instance.
 * @transaction
 */
async function TransferRoomTransaction(param) {  
 let room = param.room;
 let endUser = param.to;
  
 const factory = getFactory(); 
   
 const roomReg = await getAssetRegistry(namespace + '.Room'); 
 room.roomStatus = "RESEREVED";
 room.endUser = endUser;
 await roomReg.update(room); 
  
 // emitting ObjectTransferred event

 let objectTransferredEvent = factory.newEvent(namespace, 'ObjectTransferred');
 objectTransferredEvent.object = room;
  objectTransferredEvent.to = endUser; 
 await emit(objectTransferredEvent);  	  
}



