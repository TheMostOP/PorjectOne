//some code here is based on my 430 assignment HTTP API Assignment 2 https://luke-sullivan-http-api-2-9aad542a9f75.herokuapp.com/
let XMLHttpRequest = require('xhr2'); //for XML HTTP Requests

const votes = {};
const pokemonData = {};

// function to respond with a json object
// takes request, response, status code and object to send
const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

// function to respond without json body
// takes request, response and status code
const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

// return user object as JSON
const getVotes = (request, response) => {
  const responseJSON = {
    votes,
  };

  respondJSON(request, response, 200, responseJSON);
};

// get meta info about user object
// should calculate a 200
// return 200 without message, just the meta data
const getVotesMeta = (request, response) => respondJSONMeta(request, response, 200);

// function for 404 not found requests with message
const notFound = (request, response) => {
  // create error message for response
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  // return a 404 with an error message
  respondJSON(request, response, 404, responseJSON);
};

// function to add a user from a POST body
const addVote = (request, response, body) => {
  // default json message
  const responseJSON = {
    message: 'Required to specify what you are voting for.',
  };

  // check to make sure we have the field
  // If it's missing, send back an error message as a 400 badRequest
  if (!body.name) {
    responseJSON.id = 'addVotemissingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  // default status code to 204 updated
  let responseCode = 204;

  // If the choice voted for doesn't exist yet
  if (!votes[body.name]) {
    // Set the status code to 201 (created) and create a vote with zero points
    responseCode = 201;
    votes[body.name] = {};
    votes[body.name].points = 0;
  }

  // add or update fields for this vote
  votes[body.name].name = body.name;
  votes[body.name].points++;

  // if response is created, then set our created message
  // and send response with a message
  if (responseCode === 201) {
    responseJSON.message = 'Vote Created and Cast Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }
  return respondJSONMeta(request, response, responseCode);
};

const getPokemon = (request, response) => {
  const responseJSON = {
    pokemonData,
  };

  getData("https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0", false);

  respondJSON(request, response, 200, responseJSON);
}

//communcate with external poke-api
//some code here is based on my 235 project "Amiibo Shelf" https://people.rit.edu/lcs3087/235/project2/index.html
function getData(serviceUrl, isImageRequest = false, isRightImage = false) {
  // main entry point to web service
  const SERVICE_URL = serviceUrl;

  // No API Key required!

  // build up our URL string
  // not necessary for this service endpoint
  let url = SERVICE_URL;

  // create a new XHR object
  let xhr = new XMLHttpRequest();


  // set the onload handler
  if (isImageRequest) {
    if (isRightImage) {
      xhr.onload = dataLoadedRightImage;
    }
    else { //isLeftImage
      xhr.onload = dataLoadedLeftImage;
    }
  }
  else {
    xhr.onload = dataLoadedNames;
  }

  // set the onerror handler
  xhr.onerror = dataError;

  // open connection and send the request
  xhr.open("GET", url);
  xhr.send();
}

function dataError(e) {
  console.log("An error occurred");
}

function dataLoaded(e) {
  //e.target is the xhr object
  let xhr = e.target;

  //xhr.responseText is the JSON file we just downloaded

  //turn the text into a parsable JavaScript object
  let obj = JSON.parse(xhr.responseText);

  return obj;
}

function dataLoadedNames(e) {
  let obj = dataLoaded(e);

  //if there are no results, print a message and return
  if (!obj.results || obj.results.length == 0) {
    console.log("No results found");
    return; //Bail out
  }

  results = obj.results;
  console.log("Here are the results!");
  //randomly choose two pokemon
  let rightChoice = Math.floor(Math.random() * results.length);
  let leftChoice = Math.floor(Math.random() * results.length);

  //get the images
  getData(`https://pokeapi.co/api/v2/pokemon/${results[rightChoice].name}`, true, true);
  getData(`https://pokeapi.co/api/v2/pokemon/${results[leftChoice].name}`, true, false);

  //put the names in the PokemonData
  let formatedNameRight = formatNames(results[rightChoice].name);
  let formatedNameLeft = formatNames(results[leftChoice].name);

  pokemonData.rightName = formatedNameRight;
  pokemonData.leftName = formatedNameLeft;
}

//make the names look nicer
function formatNames(name) {
  //remove dashes
  name = name.replaceAll("-", " ");

  //capitalize the first letter of every word
  console.log(name.split(" "));
  let nameArray = name.split(" ");
  name = "";
  for (let i = 0; i < nameArray.length; i++) {
    console.log(nameArray[i]);
    nameArray[i] = nameArray[i][0].toUpperCase() + nameArray[i].slice(1);
    name = name + " " + nameArray[i];
  }
  console.log(nameArray);

  name = name[0].toUpperCase() + name.slice(1);
  name = name.trim();

  console.log("name: ");
  console.log(name);
  return name;
}

function dataLoadedImage(e) {
  let obj = dataLoaded(e);

  //if there is no obj, print a message and return
  if (!obj) {
    console.log("No image results found");
    return; //Bail out
  }

  let results = obj;
  console.log("Here are the image results!");

  return results.sprites.other.home.front_default;
}

//display the image for the left choice
function dataLoadedLeftImage(e) {
  let imgSrc = dataLoadedImage(e);

  pokemonData.leftImgSrc = imgSrc;
}

//display the image for the right choice
function dataLoadedRightImage(e) {
  let imgSrc = dataLoadedImage(e);

  pokemonData.rightImgSrc = imgSrc;
}

// public exports
module.exports = {
  getVotes,
  getVotesMeta,
  addVote,
  getPokemon,
  notFound,
};
