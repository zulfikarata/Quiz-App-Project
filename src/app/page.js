"use client";
import { useState, useEffect } from 'react';
import _shuffle from 'lodash/shuffle';

export default function Home() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(30);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts");
        const data = await response.json();

        // Shuffle the questions randomly
        const shuffledQuestions = _shuffle(data).slice(0, 10);

        const apiQuestions = shuffledQuestions.map((item, index) => {
          const options = item.body.split(' ').slice(0, 4); // Take first 4 words from body as options
          return {
            id: index + 1,
            text: `${item.title}`,
            options,
            correctAnswer: options[0] // Set the correct answer as the first option.
          };
        });

        setQuestions(apiQuestions);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    let interval;

    if (quizStarted && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [quizStarted, timer]);

  useEffect(() => {
    if (quizStarted && timer === 10) {
      setSelectedAnswer(null);
    }

    if (quizStarted && timer === 0) {
      handleNextQuestion();
    }
  }, [timer, quizStarted]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setTimer(30);
  };

  const handleAnswerSelect = (answer) => {
    if (timer > 20)  {
      // If the timer is between 10 and 20 seconds, do not allow selecting an answer.
      setSelectedAnswer(null);
    } else {
      setSelectedAnswer(answer);
    }
  };
  
  

  const handleNextQuestion = () => {
    const currentQuestionData = questions[currentQuestion];
    const isCorrect = selectedAnswer === currentQuestionData.correctAnswer;
  
    setAnswers((prevAnswers) => [
      ...prevAnswers,
      {
        questionId: currentQuestionData.id,
        selectedAnswer,
        isCorrect,
      },
    ]);
  
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setTimer(30);
    } else {
      // If it's the last question, finish the quiz
      setQuizStarted(false);
    }
  };
  
  

  const handleFinishQuiz = () => {
    setQuizStarted(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {!quizStarted ? (
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded-md"
          onClick={handleStartQuiz}
        >
          Start Quiz
        </button>
      ) : (
        <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          {`Question: ${currentQuestion + 1} - ${questions[currentQuestion].text}`}
        </h1>


          <div className="grid grid-cols-2 gap-4">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                className={`py-2 px-4 border border-gray-300 rounded-md ${
                  selectedAnswer === option ? 'bg-blue-500 text-white' : ''
                }`}
                onClick={() => handleAnswerSelect(option)}
                disabled={timer < 10}
              >
                {option}
              </button>
            ))}
          </div>
          <p className="mt-4">{`Remaining time: ${timer} seconds`}</p>
          <button 
          className="mt-4 bg-green-500 text-white py-2 px-4 rounded-md"
          onClick={handleNextQuestion}
          disabled={selectedAnswer === null}
          >
             Next Question
          </button>

        </div>
      )}
      {answers.length > 0 && !quizStarted && (
        <div className="mt-4">
          <h1 className="text-2xl font-bold mb-4">Test Results</h1>
          <table className="table-auto">
            <thead>
              <tr>
                <th className="border px-4 py-2">Question ID</th>
                <th className="border px-4 py-2">Selected Answer</th>
                <th className="border px-4 py-2">Is Correct?</th>
              </tr>
            </thead>
            <tbody>
              {answers.map((answer) => (
                <tr key={answer.questionId}>
                  <td className="border px-4 py-2">{`${currentQuestion + 1} - ${questions.find(q => q.id === answer.questionId)?.text}`}</td>


                  <td className="border px-4 py-2">{answer.selectedAnswer}</td>
                  <td className={`border px-4 py-2 ${answer.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                    {answer.isCorrect ? 'Correct' : 'Incorrect'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md"
            onClick={handleFinishQuiz}
          >
            Finish
          </button>
        </div>
      )}
    </div>
  );
}
