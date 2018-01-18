document.addEventListener("DOMContentLoaded",function(){
  var sqrtPresent = 0; //to track whether a sqrt has been entered
  var answer = []; //tracks what buttons have been pressed

  var buttons = document.querySelectorAll("button");
  var operators = document.querySelectorAll(".operator");
  var sum = document.querySelector(".sum");
  var result = document.querySelector(".result");
  var clear = document.querySelector("#clear");
  var message = document.querySelector(".message");
  var equals = document.querySelector("#equals");

  buttons.forEach(btn => {
    if(btn.id != 'equals') {
      btn.addEventListener('click', function() {
        if(answer.length < 17 && (!checkClass(this, "invalid"))) {

          var value = this.value;
          answer.push(value);

          //changing the sign of numbers
          if(this.id == "pos-neg") {
            answer.pop();
            answer = addSign(answer);
          }

          //preventing double operators in the array
          if(checkClass(this, "operator")) {
            operators.forEach(operator => addClass(operator, "invalid"));
          } else {
            operators.forEach(operator => removeClass(operator, "invalid"));
          }


          sum.innerHTML = answer.join("");

          //calling percent function
          if(value == "%") {
            answer = percent(answer);
          }

          //used to help track number of sqroots
          if(this.id == "sqrt") {
            sqrtPresent++;
            answer.push("("); //let user know that everything they enter after sqrt will be subject to a sqrt calculation
          }


          //preventing multiple zeros unless after decimal point or integers
          if(this.id == "zero") {
            if(answer[0] == 0 || [answer[answer.length-2], answer[answer.length-1]].join("").match(/[√\-x+/](?=0{1})/g)) {
              addClass(this, "invalid");
            }
          } else {
             removeClass(document.querySelector('#zero'), "invalid");
          }

          //adding a zero before decimal point if not preceeded by digit
          if(value == ".") {
            if(!answer.join("").match(/\d(?=\.)/g)) {
              answer.splice(answer.length-2, 0, "0");
            }
          }


        } else if(answer.length >= 17 ) {
          removeClass(message, "hidden");
        }
      });
    }
  });


  //sets calculator back to initial state
  clear.addEventListener("click", function(){
    sum.innerHTML = "0";
    result.innerHTML = "0";
    addClass(message, "hidden");
    answer = [];
    sqrtPresent = 0;
  });

  //get the users result and handle if sqrt has been clicked
  equals.addEventListener("click", function() {
    addClass(message, "hidden");

    try {
      if(sqrtPresent != 0) {
        answer = sqroot(answer, sqrtPresent, sum);
        sqrtPresent = 0;
      }

      answer = answer.join(""); //needed for eval to work correctly

      //storing the length of the final answer in a variable
      console.log(`answer: ${answer}`);
      var len = eval(answer).toString().length;
      console.log(`len: ${len}`);

      //answers longer than 10 are too large to display, the below manages this
      if(len > 10) {
        if(!Number.isInteger(eval(answer))) {
          result.innerHTML = eval(answer).toFixed(8);
          answer = [].concat(result.innerHTML.split(""));
        } else {
          result.innerHTML = "Error";
          sum.innerHTML = "Number too large to display";
          answer = [];
        }
      } else {
        result.innerHTML = eval(answer);
        answer = [].concat(result.innerHTML.split(""));
      }

      //handles errors and outputs the error to the console
    } catch(Error) {
      result.innerHTML = "Error";
      sum.innerHTML = "clear to continue";
      answer = [];
      console.log(Error);
    }
  });
});


          //**FUNCTIONS**//


/*PERCENTAGES function*/
//function that correctly does percentage operations as opposed to modulo/remainder operations
function percent(array) {
  var nBeforeNum, z;
  var num = array.indexOf("%");
  num -=1;

  //finds the start of the users percentage number (num)
  for(var i = num; i > 0; i--) {
    if(!array[i].match(/\d\.?/)) {
      num = i+1;
      break;
    }
  }

  //finds the start of the number before the percentage number (nBeforeNum)
  for(var j =num-2; j > 0; j--) {
    if(!array[j].match(/\d\.?/)) {
      nBeforeNum = j+1;
      break;
    }
  }

  //extracting the number before the percentage from the array
  var x = array.slice(nBeforeNum, num-1).join("")/1;

  //extracting the percentage number from the array and converting to decimal
  var y = array.slice(num, array.length-1).join("")/100;

  //correct handling of multiply/divide and add/subtract by percentages
  if(array[num-1] == "*" || array[num-1] == "/") {
    z = y.toString();
  } else {
    z = (x * y).toString();
  }

  //pushing z to the array and removing the percentage and percent symbol
  array.splice(num, array.length-num, z);

  return array;
}


/* SQUARE ROOT function */
//function to do square root operations
function sqroot(array, sqrootsToFind, sum) {
  var changesMade = 0;
  var sqrtPresent = sqrootsToFind;

  //makes a string containing the required amount of closing brackets given that only opening brackets were pushed to the array after sqrt button was clicked
  var bracket = ")".repeat(sqrtPresent);

  for(var i = 0; i < array.length; i++) {
    if(array[i] == "√") { /*changes to âˆš*/
      array[i] = "Math.sqrt";
      changesMade ++;
    }

    //if the number of changesMade equals sqrtPresent then there is no longer a need to iterate over the array
    if(changesMade == sqrtPresent) {
      break;
    }
  }

  array.push(bracket);
  sum.innerHTML += bracket;
  return array;
}


/*  SIGN function */
//function to add/remove positive/negative sign
function addSign(array) {
  var index = 0; //the start of the number the sign will be added to
  var number;

  //find the start of the number that the sign should be added to
  for(var i = array.length-1; i >= 0; i--) {
    if(!array[i].match(/[\d\.]/g)) {
      index = i+1;
      break;
    }
  }

  //check to see if a sign has already been applied to the number
  if(index == 0) {
      //if no index then add a minus sign
      array.splice(0,0,"-");
      return array;
  } else {
      //if the index is 1 then there is a plus sign, get rid of plus sign
      if(index == 1) {
        array.shift();
        return array;
      } else if(array[index-2].match(/\d\.?/g) && index > 1) {
          number = array.slice(index).join("");
      } else {
        number = array.slice(index-1).join("");
        index = index-1;
    }
  }

  //if no sign has been applied, work out what sign needs to be applied
  if(Math.sign(number) == 1) {
    array.splice(index, 0, "-");
    return array;
  } else {
    array.splice(index, 1);
    return array;
  }
}

/* CHECK CLASS function*/
//function checks the classes of an element(elem) for a specified class(check)
function checkClass(elem, check) {
  return elem.classList.contains(check);
}

function addClass(elem, addMe) {
  elem.classList.add(addMe);
}

function removeClass(elem, removeMe) {
  elem.classList.remove(removeMe);
}
