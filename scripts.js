$(document).ready(function(){
  var sqrtPresent = 0; //to track whether a sqrt has been entered
  var answer = []; //tracks what buttons have been pressed

  $("button:not(#equals)").on("click", function(){
    if(answer.length < 17 && !$(this).hasClass("invalid")) {

      var value = $(this).val();
      answer.push(value);

      //changing the sign of numbers
      if($(this).is("#pos-neg")) {
        answer.pop();
        answer = addSign(answer);
      }

      //preventing double operators in the array
      if($(this).hasClass("operator")) {
        $(".operator").addClass("invalid");
      } else {
        $(".operator").removeClass("invalid");
      }


      $(".sum").text(answer.join(""));

      //calling percent function
      if(value == "%") {
        answer = percent(answer);
      }

      //used to help track number of sqroots
      if($(this).is("#sqrt")) {
        sqrtPresent++;
        answer.push("("); //let user know that everything they enter after sqrt will be subject to a sqrt calculation
      }


      //preventing multiple zeros unless after decimal point or integers
      if($(this).is("#zero")) {
        if(answer[0] == 0 || [answer[answer.length-2], answer[answer.length-1]].join("").match(/[√\-x+/](?=0{1})/g)) {
          $("#zero").addClass("invalid");
        }
      } else {
         $("#zero").removeClass("invalid");
      }

      //adding a zero before decimal point if not preceeded by digit
      if(value == ".") {
        if(!answer.join("").match(/\d(?=\.)/g)) {
          answer.splice(answer.length-2, 0, "0");
        }
      }


    } else if(answer.length >= 17 ) {
      $(".message").removeClass("hidden");
    }
  });


  //sets calculator back to initial state
  $("#clear").on("click", function(){
    $(".sum, .result").text("0");
    $(".message").addClass("hidden");
    answer = [];
    sqrtPresent = 0;
  });

  //get the users result and handle if sqrt has been clicked
  $("#equals").on("click", function() {
    $(".message").addClass("hidden");

    try {
      if(sqrtPresent != 0) {
        answer = sqroot(answer, sqrtPresent);
        sqrtPresent = 0;
      }

      answer = answer.join(""); //needed for eval to work correctly

      //storing the length of the final answer in a variable
      var len = eval(answer).toString().length;

      //answers longer than 10 are too large to display, the below manages this
      if(len > 10) {
        if(!Number.isInteger(eval(answer))) {
          $(".result").text(eval(answer).toFixed(8));
          answer = [].concat($(".result").text().split(""));
        } else {
          $(".result").text("Error");
          $(".sum").text("Number too large to display");
          answer = [];
        }
      } else {
        $(".result").text(eval(answer));
        answer = [].concat($(".result").text().split(""));
      }

      //handles errors and outputs the error to the console
    } catch(Error) {
      $(".result").text("Error");
      $(".sum").text("clear to continue");
      answer = [];
      console.log(Error);
    }
  });
});


          //**FUNCTIONS**//


/*PERCENTAGES function*/
//function that correctly does percentage operations as opposed to modulo/remainder operations
function percent(array) {
  var nBeforeNum;
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
    var z = y.toString();
  } else {
    var z = (x * y).toString();
  }

  //pushing z to the array and removing the percentage and percent symbol
  array.splice(num, array.length-num, z);

  return array;
}


/* SQUARE ROOT function */
//function to do square root operations
function sqroot(array, sqrootsToFind) {
  var changesMade = 0;
  var sqrtPresent = sqrootsToFind;

  //makes a string containing the required amount of closing brackets given that only opening brackets were pushed to the array after sqrt button was clicked
  var bracket = ")".repeat(sqrtPresent);

  for(var i = 0; i < array.length; i++) {
    if(array[i] == "√") {
      array[i] = "Math.sqrt";
      changesMade ++;
    }

    //if the number of changesMade equals sqrtPresent then there is no longer a need to iterate over the array
    if(changesMade == sqrtPresent) {
      break;
    }
  }

  array.push(bracket);
  $(".sum").append(bracket);
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
