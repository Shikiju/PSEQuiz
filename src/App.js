import "./styles.css";
import React, { useState, useEffect } from "react";
import { allData } from "./data";

export default function App() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [myAnswer, setMyAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [finish, setFinish] = useState(false);
  const [show, setShow] = useState(false);
  const [clickAnswer, setClickAnswer] = useState(false);
  const [data, setData] = useState([{id: -1, question: 'loading', variants: ['loading', 'loading']}]);
  const [correctPassword, setCorrectPassword] = useState(false);
  const [totalQuestionCount, setTotalQuestionCount] = useState(0);
  const [totalSkippedQuestionCount, setTotalSkippedQuestionCount] = useState(0);
  
  useEffect(() => {
    console.log(`Initial load`);
    checkPassword(localStorage.getItem("message"));
    loadData();
  }, []);

  const checkPassword = (password) => {
    if(password === null) { // TODO set password here
      setCorrectPassword(true);
    }
  };
  
  const loadData = () => {
    let lsSkippedQuestions = localStorage.getItem('skippedQuestions') === null ? "[]" : localStorage.getItem('skippedQuestions');
    let skippedQuestions = JSON.parse(lsSkippedQuestions);

    setTotalQuestionCount(allData.length);
    setTotalSkippedQuestionCount(skippedQuestions.length);

    let filteredAllData = allData.filter( (data) => {
      return !skippedQuestions.includes(parseInt(data.id));
    });

    if(filteredAllData.length <= 45) {
      resetSkippedQuestionArray();
      return;
    }

    // uncomment for live version 
    const loadedData = filteredAllData.sort(() => .5 - Math.random()).slice(0,46);
    //const loadedData = filteredAllData.sort(function(a, b){ return b.id - a.id; }).slice(0,46);
    setData(loadedData);
  };

  const checkAnswer = (variant) => {
    setMyAnswer(variant);
    setClickAnswer(true);
  };

  const checkCorrectAnswer = () => {
    if (myAnswer === data[currentQuestionIndex].answer) {
      setScore(score + 1);
    }
  };

  const showAnswer = () => {
    setShow((show) => !show); //better to be toggled like this
  };

  const reset = () => {
    setShow(false);
    setClickAnswer(false);
  };

  const finishHandler = () => {
    if (currentQuestionIndex === data.length - 1) {
      setFinish(true);
    }
  };

  const resetSkippedQuestionArray = () => {
    localStorage.setItem("skippedQuestions", "[]");
    startOver();
  };

  const addToSkippedQuestionArray = (id) => {
    let lsSkippedQuestions = localStorage.getItem('skippedQuestions') === null ? "[]" : localStorage.getItem('skippedQuestions');
    let skippedQuestions = JSON.parse(lsSkippedQuestions);
    skippedQuestions.push(id);
    setTotalSkippedQuestionCount(skippedQuestions.length);
    localStorage.setItem("skippedQuestions", JSON.stringify(skippedQuestions));
  };

  const startOver = () => {
    setCurrentQuestionIndex(0);
    setFinish(false);
    setMyAnswer("");
    setScore(0);
    loadData();
  };

  if (!correctPassword) {
    return <input></input>
  } else if (finish) {
    return (
      <div className="container m-4 p-4 mx-auto h-min-screen grid grid-rows-1 grid-cols-1 items-center">
        <div className="wrapper">
          <h3 className="m-4 p-2 h-30 text-center text-2xl font-bold">
            {`Examen voorbij! Je score is 
            ${score}/${data.length - 1}.`}
          </h3>
          {score >= 33 && (
            <div>
              <div>Gefeliciteerd, je bent geslaagd!</div>
              <div class="pyro">
                <div class="before"></div>
                <div class="after"></div>
              </div>
            </div>
          )}
          {score < 33 && (
            <div>Oei, meer dan 12 fouten. Nog even doorleren!</div>
          )}
          <button
            className="w-full h-14 mt-2 px-2 rounded-lg bg-gray-600 text-pink-400 font-bold hover:bg-gray-800 hover:text-pink-600"
            onClick={() => startOver()}
          >
            Nog een examen doen
          </button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="container m-4 p-4 mx-auto h-min-screen grid grid-rows-1 grid-cols-1 items-center">
        <div className="wrapper">
          <h2 className="m-4 p-2 h-30 text-center text-2xl font-bold" dangerouslySetInnerHTML={{__html: data[currentQuestionIndex].question}}>
          </h2>
          <span className="m-2 border-2 border-black mx-auto px-2 bg-gray-600 text-pink-400 rounded-lg text-center">
            {`${currentQuestionIndex}/${data.length - 1}`}
          </span>
          {data[currentQuestionIndex].variants.map((variant, index) => (
            <div className="m-2 p-2 border-2 border-black mx-auto text-center" key={index}>
              <p
                key={variant.id}
                className={`variant ${
                  myAnswer === variant
                    ? myAnswer === data[currentQuestionIndex].answer
                      ? "correctAnswer"
                      : "incorrectAnswer"
                    : null
                }`}
                onClick={() => checkAnswer(variant)}
              >
                { String.fromCharCode(65 + index)} - {variant}
              </p>
            </div>
          ))}

          {clickAnswer && (
            <button
              className="w-full h-14 mt-2 px-2 rounded-lg bg-gray-200 text-blue-400 font-bold hover:bg-gray-400 hover:text-blue-600"
              onClick={() => showAnswer()}
            >
              Toon antwoord
            </button>
          )}
          {show && (
            <p className="m-2 h-14 mx-auto text-center">
              Correct antwoord: {data[currentQuestionIndex].answer}
            </p>
          )}

          {currentQuestionIndex < data.length - 1 && (
            <button
              className="w-full h-14 mt-2 px-2 rounded-lg bg-gray-600 text-pink-400 font-bold hover:bg-gray-800 hover:text-pink-600"
              onClick={() => {
                addToSkippedQuestionArray(data[currentQuestionIndex].id);
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                checkCorrectAnswer();
                reset();
              }}
            >
              Volgende vraag
            </button>
          )}

          {currentQuestionIndex === data.length - 1 && (
            <button
              className="w-full h-14 mt-2 px-2 rounded-lg bg-gray-600 text-pink-400 font-bold hover:bg-gray-800 hover:text-pink-600"
              onClick={() => finishHandler()}
            >
              Examen afronden
            </button>
          )}

          <div className="h-10"></div>

          <button
            className="w-50 h-14 mt-2 px-2 rounded-lg bg-gray-600 text-pink-400 font-bold hover:bg-gray-800 hover:text-pink-600"
            onClick={() => resetSkippedQuestionArray()}
          >
            Reset alle vragen en begin opnieuw
          </button>

          <span className="m-2 float-right border-2 border-black mx-auto px-2 bg-gray-600 text-pink-400 rounded-lg text-center">
            Je hebt {totalSkippedQuestionCount} van de in totaal {totalQuestionCount} vragen gezien.
          </span>

          <footer className="m-4 text-center">
            <a
              className="text-pink-400"
              href="https://nl.wikipedia.org/wiki/Anonymous_%28collectief%29"
              target="_blank"
              rel="noreferrer"
            >
              Made by
            </a>{" "}<br></br>
            Version 0.4.1
          </footer>
        </div>
      </div>
    );
  }
}
