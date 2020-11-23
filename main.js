"use strict"

let operationCtn = document.querySelector(".operations-container");
const buttons = document.getElementsByTagName("button");
const resultCtn = document.querySelector(".result-container");
const btnsCtn = document.querySelector(".btns-container");
const historySquare = document.querySelector(".history");

let keyboardRegex = /[+-/x\*]|[0-9]|(^C$|^H$|^AC$|Backspace)|=/; // keyboard regex to get input
document.body.addEventListener("keydown", writeToScreen); // add keyboard functionality
document.body.addEventListener("keydown", changeBgColor);
document.body.addEventListener("keyup", changeBgColor);

for (let button of buttons){ // add click functionality in the calculator keyboard
    button.addEventListener("click", writeToScreen);
    button.addEventListener("click", changeBgColor);
}

let defaultColor; // button default color
let keysQueue = []; // keys queue when multiple buttons are pressed
let numberLength = 0; // number to calculate length (max 13)

function changeBgColor(event){ // change background color when clicked
    if (event.type == "click"){
        defaultColor = event.target.style.background;
        event.target.style.background = "grey"; // after validation an animation is created to represent the click
        event.target.style.opacity = "0.5";
        setTimeout(() => {
        event.target.style.background = defaultColor;
        event.target.style.opacity = "1";
        }, 30)
    } else {
        let tag = document.getElementById(event.key);
        if (tag !== null){ // verify if the tag exists in the calculator keyboard
            try {
                keysQueue.push(tag); // get the tag to the keys queue
                if (event.type == "keydown"){ // verify if the key was pressed
                    if (defaultColor == undefined){ // prevent from getting the wrong default color for the key
                        // just when one of the keys stopped beign pressed the algorithm will get the next default color
                        defaultColor = keysQueue.shift().style.background;  // get the button default color from the keys queue
                    }
                    keysQueue.shift().style.background = "grey"; // change the color
                    keysQueue.shift().style.opacity = "0.5";
                } else { // if key stopped beign pressed
                    keysQueue.shift().style.background = defaultColor; // get the default style back
                    keysQueue.shift().style.opacity = "1";
                    defaultColor = undefined;
                }
            } catch (error) {
                if (error == TypeError){
                    return 0;
                }
            }
        }
    }
}

function recountNumberLength(recountType="normal"){
    if (operationCtn.textContent.slice(-1) !== "."){ // verify if the last chracter is a dot to recount the number length
        let expression = operationCtn.textContent.replace(".", ""); // avoiding counting the dot as a number
        if (isNaN(operationCtn.textContent.slice(-1))){ // verify if the last character is an operation or not
            if (Array.from(expression.matchAll(/[+-/x]/g)).length >= 2){ 
                // if it is, and there is more or equal than two operators, then get the next number length before last one
                let matches = Array.from(expression.matchAll(/[+-/x]/g));
                let indexes = [matches.slice(-2)[0].index, matches.slice(-1)[0].index]; // get the position of the last two operators
                numberLength = expression.slice(indexes[0]+1, indexes[1]).length; // new number length between the two operators
            }  else {
                numberLength = expression.slice(0, -1).length; 
                // if there is one or any operators in the expression, then count the number length as the entire expression 
            }
        } else if (recountType == "enter"){ 
            // when an expression is calculated through the equal sign, recalculate the number length
            numberLength = expression.length;
        } else if (numberLength > 0){ // if a number from the expression was erased
            numberLength--;
        }
    }
}

function writeToScreen(event) { // write the content in the calculator's screen
    try {
        let input = getEventType(event); /* get the character clicked in the calculator keyboard or in
        the computer keyboard */
        if (input.match(keyboardRegex) !== null
        && !(input.startsWith("F"))){ // verify if the character exists in the calculator keyboard and dont get f1-f12 keys
            const regexOperation = (operationCtn.textContent + input).match(/\d+[+-/x]\d+/);
            // verify if the content in the screen is a valid operation
            if (input == "AC"){ // if the user wants to erase all the expression
                const answer = resultCtn.children;
                operationCtn.textContent = "";
                answer[0].textContent = "";
                numberLength = 0;
            } else if ((input == "C" || input == "Backspace")){ // erase just the last character typed
                recountNumberLength(); // recount the number length after a digit was erased
                operationCtn.textContent = operationCtn.textContent.slice(0, -1); // erase the last digit
                const answer = resultCtn.children;
                if (operationCtn.textContent.length > 1
                    && operationCtn.textContent.match(/[+-/x]/g) !== null){ // automatic calculation after number is erased
                    answer[0].textContent = calculate(operationCtn.textContent);
                }
                else { // if there isn't any operators in the expression, then the answer is nothing
                    answer[0].textContent = "";
                }
            } else if (input == "="){  // calculate an expression and save it to the calcualtor history
                const answer = resultCtn.children;
                if (calculate(operationCtn.textContent) !== "" && calculate(operationCtn.textContent) !== "ERR"){
                    addToHistory(operationCtn.textContent, answer[0].textContent);
                    operationCtn.textContent = "";
                    operationCtn.textContent = answer[0].textContent;
                    recountNumberLength("enter");
                    answer[0].textContent = "";
                }
            } else if (input == "H"){ // shows the calculator history
                if (historySquare.style.visibility == "visible"){
                    historySquare.style.visibility = "hidden";
                    historySquare.style.left = "-250px";
                } else {
                    historySquare.style.visibility = "visible";
                    requestAnimationFrame(historyAnimation);
                }
            } else if (regexOperation !== null){ // starts calculation automatically when a calculator key is typed
                if (document.querySelector(".result-container") !== null){
                    document.querySelector(".result-container").textContent = "";
                }
                verifyNumberSize(input);
                const showAnswer = document.createElement("p");
                showAnswer.style.float = "right";
                showAnswer.textContent = calculate(operationCtn.textContent);
                resultCtn.appendChild(showAnswer);
            } else {
                verifyNumberSize(input); // to add to the calculator screen, number must be under 13 characters
            }
        }
        input = "";
    } catch (error){
        if (error == TypeError){return 0};
    }
}

function addToHistory(expression, result){ // add the last calculated expression to the calculator history
    const newCalculation = document.createElement("p");
    newCalculation.textContent = `${expression} = ${result}`;
    newCalculation.className = "new-calculation";
    historySquare.appendChild(newCalculation);
}

let start;

function historyAnimation(time){ // create history animation
    if (start == undefined){
        start = time;
    }
    let movement = (time-start)*0.9;
    historySquare.style.left = `${movement-250}px`;
    if (movement-250 < 0){
        requestAnimationFrame(historyAnimation);
    } else {
        start = undefined;
        historySquare.style.left = "0px";
    }
}

function getEventType(input){ // keyboard input or click input
    return input.key !== undefined ? input.key : input.target.textContent;
}

function verifyNumberSize(inputType){ // verify if the number is not bigger than 13
    if (!(isNaN(inputType)) && numberLength < 13){
        operationCtn.textContent += inputType;
        numberLength++;
    } else if (inputType == ".") { // doesnt count to number length
        operationCtn.textContent += inputType;
    } else if (isNaN(inputType)) { // max number size is 8
        operationCtn.textContent += inputType;
        numberLength = 0;
    }
}

function calculate(expression){ // calculate the expression
    let numbers = expression.split(/[+-/*x]/);
    let operators = expression.split(/[\d]/).filter((elem) => {return elem !== ""}); // split get "" at the end of the array
    for (let i = 1; i < numbers.length; i++){
        numbers[0] = makeOperation(Number(numbers[0]), operators.shift(), Number(numbers[i]));
    }
    if (numbers[0].length > 13){
        numbers[0] = "ERR";
    } else if (isNaN(numbers[0]) || numbers[0] == Infinity){
        numbers[0] = "";
    }
    return numbers[0];
}

function makeOperation(numberOne, operator, numberTwo){
    if (operator == "+"){
        return numberOne + numberTwo;
    } else if (operator == "-"){
        return verifyDecimal(numberOne - numberTwo);
    } else if (operator == "x" || operator == "*"){
            return verifyDecimal(numberOne * numberTwo);
    } else {
            return verifyDecimal(numberOne / numberTwo);
    }
}

function verifyDecimal(number){ // if the expression answer is bigger than 3 decimals, then round it
    let numberArray = Array.from(String(number))
    let dot = numberArray.indexOf(".");
    if (numberArray.slice(dot+1, -1).length > 3 && numberArray.slice(dot+1, -1).some(elem => elem !== 0)){
        // verify if the number of decimals bigger than 3 and if some element in the number is different for 0
        return number.toFixed(3); // then, round it
    } else {
        return number;
    }
}