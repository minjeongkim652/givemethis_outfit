// src/pages/WorldcupPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
// import stylesData from '../data/stylesData'; // 나중에 스타일 데이터 추가할 곳


const dummyStyles = [
    { id: 1, name: '스타일1', image: '' }, // 이미지 URL 나중에 추가
    { id: 2, name: '스타일2', image: '' },
    { id: 3, name: '스타일3', image: '' },
    { id: 4, name: '스타일4', image: '' },
    { id: 5, name: '스타일5', image: '' },
    { id: 6, name: '스타일6', image: '' },
    { id: 7, name: '스타일7', image: '' },
];

function WorldcupPage() {
    const navigate = useNavigate();
    const [roundStyles, setRoundStyles] = useState(shuffleArray(dummyStyles));
    const [currentPairIndex, setCurrentPairIndex] = useState(0);
    const [winners, setWinners] = useState([]);

    // 배열 셔플 함수
    function shuffleArray(array) {
        return [...array].sort(() => Math.random() - 0.5);
    }

    // 사용자가 스타일 선택 시
    const handleSelect = (selectedStyle) => {
        setWinners([...winners, selectedStyle]);

        // 다음 페어로 이동
        if (currentPairIndex + 2 >= roundStyles.length) {
            // 이번 라운드 끝, 다음 라운드 준비
            if (winners.length + 1 === 1) {
                // 최종 결과 도출 (winners에 하나만 남음)
                navigate('/worldcup-result', { state: { winner: selectedStyle } });
            } else {
                // 다음 라운드에 진출할 스타일들로 교체
                setRoundStyles(shuffleArray([...winners, selectedStyle]));
                setWinners([]);
                setCurrentPairIndex(0);
            }
        } else {
            setCurrentPairIndex(currentPairIndex + 2);
        }
    };

    // 현재 비교할 두 스타일
    const style1 = roundStyles[currentPairIndex];
    const style2 = roundStyles[currentPairIndex + 1];

    if (!style1 || !style2) return <div>로딩 중...</div>;

    return (
        <>
     <Header />
        <div style={{ textAlign: 'center', padding: '40px' }}> 
         
            <h1>스타일 월드컵</h1>
            <p>원하는 스타일을 선택해주세요!</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '40px' }}>
                {[style1, style2].map((style) => (
                    <div
                        key={style.id}
                        onClick={() => handleSelect(style)}
                        style={{
                            border: '2px solid #ccc',
                            borderRadius: '16px',
                            padding: '20px',
                            width: '200px',
                            cursor: 'pointer',
                        }}
                    >
                        {/* 이미지가 있으면 보여주고, 없으면 이름만 */}
                        {style.image ? (
                            <img src={style.image} alt={style.name} style={{ width: '100%', borderRadius: '12px' }} />
                        ) : (
                            <div
                                style={{
                                    height: '150px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: '#f0f0f0',
                                    borderRadius: '12px',
                                    fontSize: '1.2rem',
                                    color: '#666',
                                }}
                            >
                                이미지 준비중
                            </div>
                        )}
                        <h3>{style.name}</h3>
                    </div>
                ))}
            </div>
        </div>
     </>
    );
}

export default WorldcupPage;
