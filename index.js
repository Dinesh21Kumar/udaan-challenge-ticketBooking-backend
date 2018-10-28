const express = require('express')
const app = express() //creating an express application
require('dotenv').config() 
const port = process.env.PORT

const bodyParser = require('body-parser') //required for parsing the POST request body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


var mongo = require("./mongodb.js") //adding mongodb file which contains all mongodb CRUD functions 
var bl = require("./bl.js") // adding business logic file which contains the logical functions


// basic application root route
app.get('/', (req, res) => {
	res.send('Hello World!')
})



//route to first api to add one screen at a time
app.post('/screens', (req, res) => { 

    //getting POST request body params
	var name = req.body.name;
	var rowA = req.body.screenInfo.A
	var rowB = req.body.screenInfo.B
	var rowD = req.body.screenInfo.D

    //debugging
	console.log(rowA)
	console.log(rowB)
	console.log(rowD)

	var aisleSeatsInA = rowA.aisleSeats
	var aisleSeatsInB = rowB.aisleSeats
	var aisleSeatsInD = rowD.aisleSeats

	console.log(aisleSeatsInA)
	console.log(aisleSeatsInB)
	console.log(aisleSeatsInD)

	var noOfSeatsInA = rowA.noOfSeats
	var noOfSeatsInB = rowB.noOfSeats
	var noOfSeatsInD = rowD.noOfSeats

	var rowStatusA = []
	var rowStatusB = []
	var rowStatusD = []

    //for each row storing information about each seat -> (seatStatus,isAisel,SeatNo)
	var seatNo;
	for( seatNo = 0; seatNo < noOfSeatsInA; seatNo++) {
		var obj = {"seatNo": seatNo,"seatStatus":"unreserved","isAisel":false}
		if(aisleSeatsInA.indexOf(seatNo)!=-1) {
			obj = {"seatNo": seatNo,"seatStatus":"unreserved","isAisel":true}
		}
		rowStatusA.push(obj);
	}

	for( seatNo = 0; seatNo < noOfSeatsInB; seatNo++) {
		var obj = {"seatNo": seatNo,"seatStatus":"unreserved","isAisel":false}
		if(aisleSeatsInB.indexOf(seatNo)!=-1) {
			obj = {"seatNo": seatNo,"seatStatus":"unreserved","isAisel":true}
		}
		rowStatusB.push(obj);
	}

	for( seatNo = 0; seatNo < noOfSeatsInD; seatNo++) {
		var obj = {"seatNo": seatNo,"seatStatus":"unreserved","isAisel":false}
		if(aisleSeatsInD.indexOf(seatNo)!=-1) {
			obj = {"seatNo": seatNo,"seatStatus":"unreserved","isAisel":true}
		}
		rowStatusD.push(obj);
	}

    //debugging
	console.log("A" + rowStatusA)
	console.log("B" + rowStatusB)
	console.log("D" + rowStatusD)

    //screen object which will stored in MONGO DB
	var screen = {
		"name": name,
		"screenInfo": {
			"A": {
				"noOfSeats": noOfSeatsInA,
				"availableSeats": noOfSeatsInA,
				"rowStatus": rowStatusA
			},
			"B": {
				"noOfSeats": noOfSeatsInB,
				"availableSeats": noOfSeatsInB,
				"rowStatus":rowStatusB
			},
			"D": {
				"noOfSeats": noOfSeatsInD,
				"availableSeats": noOfSeatsInD,
				"rowStatus":rowStatusD
			}
		}
	}

    //debugging
	console.log(screen)

    //inserting the screen object in mongodb , running at "mongodb://localhost:27017"
	mongo.insert(screen).then(function(result) {
		res.status(200).send('Screen is added sucessfully!')
	}).catch(function (err) {
		console.log(err)
		res.status(400).send("insertion failed")
	})	
	
})


//second api for reserving the seats at screen
app.post('/screens/:name/reserve', (req,res) => {

    //reading request params in url as well as in body
	var name = req.params.name
	var query = {"name":name} //query to find screen by name
	var body = req.body
	var seats = body.seats

    //mongodb query to find screen by name
	mongo.find(query).then(function(result) {
        //debugging
		console.log(result)
		console.log(seats)
		console.log(name)

        //after screen is found , bl function call to check weather input seats can be reserved or not?
		bl.reserveSeats(name,seats,result).then(function(r) {

            //after seats can be reserved, update the screen with status to reserved to given seats
			mongo.update({"name":name}, {$set:{"screenInfo": r}}).then(function(output) {
				res.status(200).send("seats are successfully booked!")
			})
			.catch(function(e) {
				res.status(400).send(e) //if error in update give 400
			})
			
		})
		.catch(function(err) { // if seats cannot be reserved, because they are laready reserved
			console.log(err)
			res.status(400).send(err)
		})
		
	})
    .catch(function(err) { //if screen is not found then 400 with err
		console.log(err)
		res.status(400).send(err)
	})
})



//third and 4th API route , GET all available seats in a screen or GET the suitable seats after some custom input like row no and perefered seats number
app.get('/screens/:name/seats', (req,res) => {
	
    //getting input params
    var name = req.params.name
	var query = {"name":name}
	var seatStatus = req.query.status
	var numSeats =  req.query.numSeats
	var choice  = req.query.choice

	//third api if request params contains seatStatus 
	if(seatStatus !=undefined) {
        //find screen by name
		mongo.find(query).then(function(screen) {
        //get all seats with status unreserved
		bl.getAllAvailableSeats(screen,seatStatus).then(function(availSeats) {
			res.status(200).send(availSeats)
		})
		.catch(function(err) {
			console.log(err)
		    res.status(400).send(err)
		})
		
		
	   }).catch(function(err) {
		console.log(err)
	   	res.status(400).send(err)
	   })
	}
    //fourth api if request params contains numSeats and choice
	else if(numSeats !=undefined && choice!=undefined) {
        //get screen by name
		mongo.find(query).then(function(screen) {
            //get customized results
			bl.getAvailableSeatsWithChoice(screen,numSeats,choice).then(function(availSeats) {
			res.status(200).send(availSeats)
		})
		.catch(function(err) {
			console.log(err)
		    res.status(400).send(err)
		})
		}).catch(function(err) {
		   console.log(err)
	   	   res.status(400).send(err)
	   })
		

	}
	
})



//run the express server on port 9090
app.listen(port, () => console.log(`Express app listening on port ${port}!`))