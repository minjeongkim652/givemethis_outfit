// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import './Question.css';

// // 질문 데이터
// const questions = [
//     {
//         id: 1,
//         type: 'input',
//         text: '키와 몸무게를 알려주세요.',
//         fields: [
//             { name: 'height', placeholder: '키 (cm)' },
//             { name: 'weight', placeholder: '몸무게 (kg)' },
//         ],
//     },
//     {
//         id: 2,
//         type: 'image',
//         text: '가장 비슷한 체형을 골라주세요.',
//         options: ['역삼각형', '모래시계', '직사각형', '둥근형', '삼각형'],
//         field: 'bodyShape',
//     },
//     {
//         id: 3,
//         type: 'select',
//         text: '어디에 가는 옷이 필요한가요?',
//         options: ['데일리', '데이트', '운동', '여행', '격식 있는 자리'],
//         field: 'occasion',
//     },
//     {
//         id: 4,
//         type: 'select',
//         text: '누구와 함께 하시나요?',
//         options: ['혼자', '친구', '연인', '가족', '동료'],
//         field: 'company',
//     },
// ];

// // 애니메이션 Variants
// const variants = {
//     enter: { x: '100%', opacity: 0 },
//     center: { x: 0, opacity: 1 },
//     exit: { x: '-100%', opacity: 0 },
// };

// function Question() {
//     const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//     const [answers, setAnswers] = useState({});
//     const navigate = useNavigate();

//     const currentQuestion = questions[currentQuestionIndex];

//     const handleNext = () => {
//         if (currentQuestionIndex < questions.length - 1) {
//             setCurrentQuestionIndex(currentQuestionIndex + 1);
//         } else {
//             navigate('/Main', { state: { answers } });
//         }
//     };

//     const handleAnswer = (field, value) => {
//         setAnswers({ ...answers, [field]: value });
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         handleAnswer(name, value);
//     };

//     const isNextButtonDisabled = () => {
//         if (currentQuestion.type === 'input') {
//             return !answers.height || !answers.weight;
//         }
//         return !answers[currentQuestion.field];
//     };

//     return (
//         <div className="question-page-container">
//             <AnimatePresence mode="wait">
//                 <motion.div
//                     key={currentQuestionIndex}
//                     className="question-box"
//                     variants={variants}
//                     initial="enter"
//                     animate="center"
//                     exit="exit"
//                     transition={{ type: 'tween', ease: 'easeInOut', duration: 0.5 }}
//                 >
//                     <div className="question-content">
//                         <h2>{currentQuestion.text}</h2>
//                         <div className="options-container">
//                             {currentQuestion.type === 'input' &&
//                                 currentQuestion.fields.map((field) => (
//                                     <input
//                                         key={field.name}
//                                         type="number"
//                                         name={field.name}
//                                         placeholder={field.placeholder}
//                                         onChange={handleInputChange}
//                                         value={answers[field.name] || ''}
//                                         className="text-input"
//                                     />
//                                 ))}

//                             {currentQuestion.type === 'image' &&
//                                 currentQuestion.options.map((option) => (
//                                     <div
//                                         key={option}
//                                         className={`image-option ${
//                                             answers[currentQuestion.field] === option ? 'selected' : ''
//                                         }`}
//                                         onClick={() => handleAnswer(currentQuestion.field, option)}
//                                     >
//                                         <div className="placeholder-image">{option}</div>
//                                     </div>
//                                 ))}

//                             {currentQuestion.type === 'select' &&
//                                 currentQuestion.options.map((option) => (
//                                     <button
//                                         key={option}
//                                         className={`select-option ${
//                                             answers[currentQuestion.field] === option ? 'selected' : ''
//                                         }`}
//                                         onClick={() => handleAnswer(currentQuestion.field, option)}
//                                     >
//                                         {option}
//                                     </button>
//                                 ))}
//                         </div>
//                     </div>

//                     <button onClick={handleNext} disabled={isNextButtonDisabled()} className="next-button">
//                         {currentQuestionIndex === questions.length - 1 ? '시작하기' : '다음'}
//                     </button>
//                 </motion.div>
//             </AnimatePresence>
//         </div>
//     );
// }

// export default Question;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Question.css';

// 질문 데이터
const questions = [
    {
        id: 1,
        type: 'input',
        text: '키와 몸무게를 알려주세요.',
        fields: [
            { name: 'height', placeholder: '키 (cm)' },
            { name: 'weight', placeholder: '몸무게 (kg)' },
        ],
    },
    {
        id: 2,
        type: 'image',
        text: '가장 비슷한 체형을 골라주세요.',
        options: ['역삼각형', '모래시계', '직사각형', '둥근형', '삼각형'],
        field: 'bodyShape',
    },
    {
        id: 3,
        type: 'select',
        text: '어디에 가는 옷이 필요한가요?',
        options: ['데일리', '데이트', '운동', '여행', '격식 있는 자리'],
        field: 'occasion',
    },
    {
        id: 4,
        type: 'select',
        text: '누구와 함께 하시나요?',
        options: ['혼자', '친구', '연인', '가족', '동료'],
        field: 'company',
    },
];

// 애니메이션 Variants
const variants = {
    enter: { x: '100%', opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
};

function Question() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const navigate = useNavigate();

    const currentQuestion = questions[currentQuestionIndex];

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            navigate('/Main', { state: { answers } });
        }
    };

    const handleAnswer = (field, value) => {
        setAnswers({ ...answers, [field]: value });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        handleAnswer(name, value);
    };

    const isNextButtonDisabled = () => {
        if (currentQuestion.type === 'input') {
            return !answers.height || !answers.weight;
        }
        return !answers[currentQuestion.field];
    };

    return (
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
                            {currentQuestion.type === 'input' &&
                                currentQuestion.fields.map((field) => (
                                    <input
                                        key={field.name}
                                        type="number"
                                        name={field.name}
                                        placeholder={field.placeholder}
                                        onChange={handleInputChange}
                                        value={answers[field.name] || ''}
                                        className="text-input"
                                    />
                                ))}

                            {currentQuestion.type === 'image' &&
                                currentQuestion.options.map((option, idx) => (
                                    <div
                                        key={option}
                                        className={`image-option ${
                                            answers[currentQuestion.field] === option ? 'selected' : ''
                                        }`}
                                        onClick={() => handleAnswer(currentQuestion.field, option)}
                                    >
                                        <img
                                            src={`/${idx + 1}.png`}
                                            alt={option}
                                            style={{ width: '100%', height: 'auto', borderRadius: '12px' }}
                                        />
                                        <div className="placeholder-image">{option}</div>
                                    </div>
                                ))}

                            {currentQuestion.type === 'select' &&
                                currentQuestion.options.map((option) => (
                                    <button
                                        key={option}
                                        className={`select-option ${
                                            answers[currentQuestion.field] === option ? 'selected' : ''
                                        }`}
                                        onClick={() => handleAnswer(currentQuestion.field, option)}
                                    >
                                        {option}
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
    );
}

export default Question;
