import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header2 from '../components/Header2';
import './Question.css';

const questions = [ {
        id: 3,
        type: 'select',
        text: '계절을 골라주세요?',
        field: 'season',
        options: [
            { value: '봄', image: '/spring.png' },
            { value: '여름', image: '/summer.png' },
            { value: '가을', image: '/autumn.png' },
            { value: '겨울', image: '/winter.png' },
        ],
    },
    {
        id: 1,
        type: 'select',
        text: '어디에 가는 옷이 필요한가요?',
        field: 'occasion',
        options: [
            { value: '데일리', image: '/daily.png' },
            { value: '데이트', image: '/plan.png' },
            { value: '운동', image: '/e.png' },
            { value: '격식', image: '/wedding.png' },
            { value: '여행', image: '/travel.png' },
        ],
    },
    {
        id: 2,
        type: 'select',
        text: '누구와 함께하는 약속인가요?',
        field: 'appointmentType',
        condition: {
            field: 'occasion',
            value: '데이트',
        },
        options: [
            { value: '친구', image: '/friend.png' },
            { value: '연인', image: '/couple.png' },
        ],
    },
   
];

const variants = {
    enter: { x: '100%', opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
};

function Question() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const navigate = useNavigate();

    const handleAnswer = (field, value) => {
        setAnswers({ ...answers, [field]: value });
    };

    const handleNext = () => {
        let nextIndex = currentQuestionIndex + 1;

        while (nextIndex < questions.length && questions[nextIndex].condition && answers[questions[nextIndex].condition.field] !== questions[nextIndex].condition.value) {
            nextIndex++;
        }

        if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex);
        } else {
            navigate('/loading', { state: { answers } });
        }
    };

    const currentQuestion = questions[currentQuestionIndex];

    const isNextButtonDisabled = () => {
        return !answers[currentQuestion.field];
    };

    return (
        <>
            <Header2 />
            <div className="question-page-container">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestionIndex}
                        className="question-box"
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.5 }}
                    >
                        <div className="question-content">
                            <h2>{currentQuestion.text}</h2>
                            <div className="options-container">
                                {currentQuestion.type === 'select' &&
                                    currentQuestion.options.map((option) => (
                                        <button
                                            key={option.value}
                                            className={`select-option ${
                                                answers[currentQuestion.field] === option.value ? 'selected' : ''
                                            }`}
                                            onClick={() => handleAnswer(currentQuestion.field, option.value)}
                                        >
                                            <img src={option.image} alt={option.value} className="option-image" />
                                            <span>{option.value}</span>
                                        </button>
                                    ))}
                            </div>
                        </div>

                        <button onClick={handleNext} disabled={isNextButtonDisabled()} className="next-button">
                            {currentQuestionIndex === questions.length - 1 ? '시작하기' : '다음'}
                        </button>
                    </motion.div>
                </AnimatePresence>
            </div>
        </>
    );
}

export default Question;