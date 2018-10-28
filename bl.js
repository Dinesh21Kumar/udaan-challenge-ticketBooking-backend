var mongo = require("./mongodb.js")
var Promise = require('bluebird')


//this function will researve seats in a screen if possible, if not then reject with a message 
function  reserveSeats(name,seats,screen) {
	return new Promise(function(resolve,reject) {
		
		//console.log(seats)
		console.log(screen)
		var currentScreenStatus = screen[0].screenInfo; //get complete object 
		console.log(currentScreenStatus)
		
		for(var row in seats) { //row is key , seats is dict
			for( var c in currentScreenStatus) { //c is key,currentScreenStatus is dict
				//console.log(currentScreenStatus[c])
				if(row == c ) {
				   var requiredSeats = seats[row] //requiredSeats is an array
				   for(var s in requiredSeats) {
					   console.log(requiredSeats[s])
					   console.log(currentScreenStatus[c].rowStatus[requiredSeats[s]]) //row -> array of seats(seat no) -> checkstatus
					   if( currentScreenStatus[c].rowStatus[requiredSeats[s]].seatStatus == "reserved") {
						  reject("seats are not available")
					   }
				   }
				}
			}   
		   }


		for(var row in seats) { //row is key 
			for( var c in currentScreenStatus) { //c is key
				//console.log(currentScreenStatus[c])
				if(row == c ) {
				   var requiredSeats = seats[row] //this is an array
				   for(var s in requiredSeats) {
					   console.log(requiredSeats[s])
					   console.log(currentScreenStatus[c].rowStatus[requiredSeats[s]]) //row -> array of seats(seat no) -> checkstatus
					   currentScreenStatus[c].rowStatus[requiredSeats[s]].seatStatus = "reserved"
				   }
				}
			}   
		   }

		 console.log(currentScreenStatus)
		 resolve(currentScreenStatus)
	})
}


//this function will return all unreserved seats in a screen
function getAllAvailableSeats(screen,status) {

	return new Promise(function (resolve, reject) {
		//console.log(screen);
		var availSeats = 
		{
							"A":[],
							"B":[],
							"D":[]
		}

		var seatsInRowA = screen[0].screenInfo.A.rowStatus
		var seatsInRowB = screen[0].screenInfo.B.rowStatus
		var seatsInRowD = screen[0].screenInfo.D.rowStatus

		for(var s=0; s<seatsInRowA.length;s++) {
			console.log(seatsInRowA[s].seatStatus)
			if(seatsInRowA[s].seatStatus == status) {
				availSeats["A"].push(seatsInRowA[s].seatNo)
			}
		}

		for(var s=0; s<seatsInRowB.length;s++) {
			console.log(seatsInRowB[s].seatStatus)
			if(seatsInRowB[s].seatStatus == status) {
				availSeats["B"].push(seatsInRowB[s].seatNo)
			}
		}

		for(var s=0; s<seatsInRowD.length;s++) {
			console.log(seatsInRowD[s].seatStatus)
			if(seatsInRowD[s].seatStatus == status) {
				availSeats["D"].push(seatsInRowD[s].seatNo)
			}
		}



		console.log(availSeats)
		resolve(availSeats)
	})

}


//this function will return the seats , when a customer enters num of seats, choice ( row number + seat number)
//it will return the optimal number of seats as per choice if possible , else will reject with message 

function getAvailableSeatsWithChoice(screen,numSeats,choice) {

	return new Promise(function (resolve, reject) {
		//console.log(screen);
		var availSeats = 
		{
		}
		var rowNo = choice[0]
		var preferSeatNo = choice.substr(1, choice.length)
		console.log(rowNo)
		console.log(preferSeatNo)

		var seatsInRow = []
		if(rowNo == "A") {
			seatsInRow= screen[0].screenInfo.A.rowStatus
			availSeats = { "A":[]}
		}
		if(rowNo == "B"){
		   seatsInRow= screen[0].screenInfo.B.rowStatus
		   availSeats = { "B":[]}
		}
		if(rowNo == "D"){
		   seatsInRow= screen[0].screenInfo.D.rowStatus
		   availSeats = { "D":[]}
		}
		

		console.log(seatsInRow)

		if(numSeats ==1 && preferSeatNo < seatsInRow.length) {
			console.log(seatsInRow[parseInt(preferSeatNo)])
			if(seatsInRow[parseInt(preferSeatNo)].seatStatus == 'unreserved') {
				availSeats[rowNo].push(preferSeatNo)
				resolve(availSeats)
			}
			else {
				reject("seats are not available for this choice") //can give some err
			}
		}
		
		else if(preferSeatNo < seatsInRow.length){

			if(seatsInRow[parseInt(preferSeatNo)].seatStatus=="unreserved" ) {
			 //case 1 starts from prefered seat number
			 var count = 0;
			 for(var s = parseInt(preferSeatNo) ; s< seatsInRow.length ; s++) {
				if(count >= numSeats) {
					break;
				}
				if(seatsInRow[s].seatStatus == "unreserved" && seatsInRow[s].isAisel == false ) {
					console.log(seatsInRow[s])
					count++;
					availSeats[rowNo].push(seatsInRow[s].seatNo)
				}
				else {
					break;
				}
				
			 }
			 console.log("count  =" +count)
			 console.log("after 1st case " + availSeats)
			 if(availSeats[rowNo].length >= numSeats) {
				resolve(availSeats)
			 }
			 //end of case 1


			 //case 2 prefered seat number is the last
				count = 0;
				if(rowNo == "A") {
				seatsInRow= screen[0].screenInfo.A.rowStatus
				availSeats = { "A":[]}
				}
				if(rowNo == "B"){
				seatsInRow= screen[0].screenInfo.B.rowStatus
				availSeats = { "B":[]}
				}
				if(rowNo == "D"){
				seatsInRow= screen[0].screenInfo.D.rowStatus
				availSeats = { "D":[]}
				}

				for(var s = parseInt(preferSeatNo) ; s>=0  ; s--) {
					if(count >= numSeats) {
						break;
					}
					if(seatsInRow[s].seatStatus == "unreserved" && seatsInRow[s].isAisel == false ) {
						console.log(seatsInRow[s])
						count++;
						availSeats[rowNo].push(seatsInRow[s].seatNo)
					}
					else {
						break;
					}
				
			 }
			 console.log("count  =" +count)
			 console.log("after 2nd case " + availSeats)
			 if(availSeats[rowNo].length >= numSeats) {
                availSeats[rowNo] = availSeats[rowNo].reverse() // will keep in asc order
				resolve(availSeats)
			 }

			 //end of second case


			 //third case is when the prefered seat is in between
				count = 0;
				if(rowNo == "A") {
				seatsInRow= screen[0].screenInfo.A.rowStatus
				availSeats = { "A":[]}
				}
				if(rowNo == "B"){
				seatsInRow= screen[0].screenInfo.B.rowStatus
				availSeats = { "B":[]}
				}
				if(rowNo == "D"){
				seatsInRow= screen[0].screenInfo.D.rowStatus
				availSeats = { "D":[]}
				}
			 var start =  parseInt(preferSeatNo)
			 var end = start+1;
			
			 if(seatsInRow[start].isAisel == true) {
				reject("seats are not available")
			 }

			 while(start>=0 || end < seatsInRow.length) {
				if(count >= numSeats) {
					break;
				}
				if(start >=0 && end < seatsInRow.length && seatsInRow[start].seatStatus == "unreserved" && seatsInRow[end].seatStatus == "unreserved" && seatsInRow[start].isAisel == false && seatsInRow[end].isAisel==false) {
					availSeats[rowNo].push(seatsInRow[start].seatNo)
					start --;
					availSeats[rowNo].push(seatsInRow[end].seatNo)
					end ++;
					count ++;
				}
				else if(start >=0 && seatsInRow[start].seatStatus == "unreserved" && seatsInRow[start].isAisel == false ) {
					availSeats[rowNo].push(seatsInRow[start].seatNo)
					start --;
					count ++;
				}

				else if( end < seatsInRow.length && seatsInRow[end].seatStatus == "unreserved" && seatsInRow[end].isAisel==false) {
					availSeats[rowNo].push(seatsInRow[end].seatNo)
					end ++;
					count ++;
				}
				else {
					break;
				}
			 }

             //end of third case

			 console.log("count  =" +count)
			 console.log("after 3rd case " + availSeats)
			 if(availSeats[rowNo].length >= numSeats) {
				resolve(availSeats)
			 }
		}
    }

		console.log(availSeats)
		reject("seats are not available for this choice") 
		
	})

}




module.exports = {reserveSeats:reserveSeats,getAllAvailableSeats:getAllAvailableSeats,getAvailableSeatsWithChoice:getAvailableSeatsWithChoice}