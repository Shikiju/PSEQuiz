import "./styles.css";
import React, { useState, useEffect } from "react";
import { allData } from "./data";
import packageJson from './../package.json';

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
  const [correctlyAnsweredQuestions, setCorrectlyAnsweredQuestions] = useState([]);
  
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

    const windowUrl = window.location.search;
    const deeplinkMatch = windowUrl.match(new RegExp("[?&]deeplink=([^&]+).*$"));
    const deeplink = deeplinkMatch === null ? null : deeplinkMatch[1];
    const alternativeSortMatch = windowUrl.match(new RegExp("[?&]alternativeSort=([^&]+).*$"));
    const alternativeSort = alternativeSortMatch === null ? null : alternativeSortMatch[1];

    let deeplinkData = null;
    if(deeplink !== null) {
      const deepLinkResult = allData.find( ({id}) => id === parseInt(deeplink));
      deeplinkData = deepLinkResult;
    }
    let loadedData = [];
    if(alternativeSort) {
      loadedData = filteredAllData.sort(function(a, b){ return b.id - a.id; }).slice(0,46);
    } else  {
      loadedData = filteredAllData.sort(() => .5 - Math.random()).slice(0,46);
    }
    if(deeplinkData !== null) {
      loadedData[0] = deeplinkData;
    }

    setData(loadedData);
  };

  const checkAnswer = (variant) => {
    setMyAnswer(variant);
    setClickAnswer(true);
  };

  const checkCorrectAnswer = () => {
    if (myAnswer === data[currentQuestionIndex].answer) {
      if(!correctlyAnsweredQuestions.includes(data[currentQuestionIndex].id)) {
        setScore(score + 1);
        let mutatedCorrectlyAnsweredQuestions = [...correctlyAnsweredQuestions];
        mutatedCorrectlyAnsweredQuestions.push(data[currentQuestionIndex].id);
        setCorrectlyAnsweredQuestions(mutatedCorrectlyAnsweredQuestions);
      }
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

  const removeFromSkippedQuestionArray = (id) => {
    if(localStorage.getItem('skippedQuestions') === null) {
      return;
    }
    let lsSkippedQuestions = localStorage.getItem('skippedQuestions');
    let skippedQuestions = JSON.parse(lsSkippedQuestions);
    const index = skippedQuestions.indexOf(id);
    if (index > -1) {
      skippedQuestions.splice(index, 1);
    }
    setTotalSkippedQuestionCount(skippedQuestions.length);
    localStorage.setItem("skippedQuestions", JSON.stringify(skippedQuestions));
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
          <span className="m-2 ml-5 border-2 border-black mx-auto px-2 bg-gray-600 text-pink-400 rounded-lg text-center">
            Score: {`${score}`}
          </span>
          {data[currentQuestionIndex].variants.map((variant, index) => (
            <div className="m-2 border-2 border-black mx-auto text-center" key={index}>
              <p
                key={variant.id}
                className={`p-2 variant ${
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

          {currentQuestionIndex > 0 && (
            <button
              className="w-2/5 h-14 mt-2 px-2 rounded-lg bg-gray-600 text-pink-400 font-bold hover:bg-gray-800 hover:text-pink-600"
              onClick={() => {
                removeFromSkippedQuestionArray(data[currentQuestionIndex].id);
                setCurrentQuestionIndex(currentQuestionIndex - 1);
                reset();
              }}
            >
              Vorige vraag
            </button>
          )}
          {currentQuestionIndex < data.length - 1 && (
            <button
              className="w-2/5 float-right h-14 mt-2 px-2 rounded-lg bg-gray-600 text-pink-400 font-bold hover:bg-gray-800 hover:text-pink-600"
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
              className="w-2/5 h-14 mt-2 px-2 rounded-lg bg-gray-600 text-pink-400 font-bold hover:bg-gray-800 hover:text-pink-600"
              onClick={() => finishHandler()}
            >
              Examen afronden
            </button>
          )}

          <div className="mt-5 h-10 w-full clear-both text-pink-400 hover:text-pink-600">
            <a href={window.location.origin+"?deeplink="+data[currentQuestionIndex].id} target="_blank">Klik hier voor een deeplink naar deze vraag</a>
          </div>

          <div className="h-10 clear-both">
            <button
              className="w-50 h-14 mt-2 px-2 rounded-lg bg-gray-600 text-pink-400 font-bold hover:bg-gray-800 hover:text-pink-600"
              onClick={() => resetSkippedQuestionArray()}
            >
              Reset alle vragen en begin opnieuw
            </button>

            <span className="m-2 mt-5 float-right border-2 border-black mx-auto px-2 bg-gray-600 text-pink-400 rounded-lg text-center">
              Je hebt {totalSkippedQuestionCount} van de in totaal {totalQuestionCount} vragen gezien.
            </span>
          </div>
          <footer className="m-4 text-center w-full clear-both">
            Version {packageJson.version}
          </footer>
        </div>
      </div>
    );
  }
}
