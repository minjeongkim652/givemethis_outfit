import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import './Main.css';

// 🔹 필터 옵션 (사용자가 선택할 수 있는 값들)
const filters = {
    when: ['봄', '여름', '가을', '겨울'],
    where: ['데일리', '데이트', '운동', '여행', '격식'],
};

const Main = () => {
    const location = useLocation(); // 이전 페이지에서 전달된 state(answers, results 등)를 가져옴

    // 🔹 상태 정의
    const [youtubeResults, setYoutubeResults] = useState([]);      // 유튜브 추천 결과
    const [musinsaResults, setMusinsaResults] = useState([]);      // 무신사 추천 결과
    const [error, setError] = useState(null);                      // 에러 메시지
    const [selectedFilters, setSelectedFilters] = useState({});    // 사용자가 선택한 필터값
    const [selectedMusinsaCategory, setSelectedMusinsaCategory] = useState('All'); // 무신사 카테고리 필터
    const [loading, setLoading] = useState(false);                 // 로딩 상태

    // 🔹 컴포넌트가 처음 렌더링되었을 때 실행
    useEffect(() => {
        // 이전 페이지(Loading 등)에서 넘어온 데이터 받기
        const { results, answers, error: fetchError } = location.state || {};

        console.log("Received data from Loading page:", location.state);

        if (fetchError) {
            setError(fetchError); // 에러가 있으면 상태에 저장
        } else if (results) {
            // 정상적으로 데이터가 있으면 각각 저장
            console.log("YouTube Results:", results.youtube_results);
            console.log("Musinsa Results:", results.musinsa_results);
            setYoutubeResults(results.youtube_results || []);
            setMusinsaResults(results.musinsa_results || []);
        }

        // 필터 초기값 세팅 (사용자가 이전에 선택했던 답변)
        if (answers) {
            setSelectedFilters({
                when: answers.season,
                where: answers.occasion,
                who: answers.appointmentType || answers.company,
            });
        } else if (!results) {
            // 아무 데이터도 없으면 에러 처리
            setError('추천 데이터가 없습니다. 시작 페이지로 돌아가 다시 시도해주세요.');
        }
    }, [location.state]);

    // 🔹 필터 값 변경 핸들러
    const handleFilterChange = (category, value) => {
        const newFilters = { ...selectedFilters, [category]: value };
        // "where"에서 "데이트"가 아니면 "who" 필터 제거
        if (category === 'where' && value !== '데이트') {
            delete newFilters.who;
        }
        setSelectedFilters(newFilters);
    };

    // 🔹 백엔드 API 호출해서 새로운 추천 결과 가져오기
    const fetchRecommendations = async (filters) => {
        setLoading(true);   // 로딩 시작
        setError(null);     // 에러 초기화
        try {
            // 프론트에서 백엔드로 전달할 데이터
            const answers = {
                season: filters.when,
                occasion: filters.where,
                appointmentType: filters.who,
            };

            // Flask API 호출
            const response = await fetch('http://localhost:5000/api/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(answers),
            });

            if (!response.ok) {
                throw new Error('재검색에 실패했습니다.');
            }

            // 백엔드에서 온 데이터 반영
            const data = await response.json();
            setYoutubeResults(data.youtube_results || []);
            setMusinsaResults(data.musinsa_results || []);
        } catch (err) {
            setError(err.message); // 에러 발생 시 표시
        } finally {
            setLoading(false); // 로딩 종료
        }
    };

    // 🔹 "재검색" 버튼 눌렀을 때 실행
    const handleResearch = () => {
        fetchRecommendations(selectedFilters);
    };

    // 🔹 무신사 결과에서 스타일(category) 목록 뽑아내기
    const musinsaCategories = ['All', ...new Set(musinsaResults.map(item => item.style))];

    return (
        <>
            <Header />
            <main className="content-area">

                {/* 🔹 필터 영역 */}
                <section className="filter-section">
                    <div className="filter-controls">
                        {Object.entries(filters).map(([title, options], index) => (
                            <React.Fragment key={title}>
                                <div className="filter-group">
                                    <strong>{title.toUpperCase()}</strong>
                                    <div className="checkbox-options">
                                        {options.map((option) => (
                                            <label 
                                                key={option} 
                                                className={selectedFilters[title] === option ? 'selected' : ''}
                                            >
                                                <input
                                                    type="radio"
                                                    name={title}
                                                    value={option}
                                                    checked={selectedFilters[title] === option}
                                                    onChange={() => handleFilterChange(title, option)}
                                                /> {option}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* 🔹 "데이트"일 때만 WHO 필터 추가 */}
                                {title === 'where' && selectedFilters.where === '데이트' && (
                                    <>
                                        <div className="filter-separator"></div>
                                        <div className="filter-group">
                                            <strong>WHO</strong>
                                            <div className="checkbox-options">
                                                {['친구', '연인'].map((option) => (
                                                    <label 
                                                        key={option} 
                                                        className={selectedFilters['who'] === option ? 'selected' : ''}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="who"
                                                            value={option}
                                                            checked={selectedFilters['who'] === option}
                                                            onChange={() => handleFilterChange('who', option)}
                                                        /> {option}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* 구분선 */}
                                {index < Object.keys(filters).length - 1 && <div className="filter-separator"></div>}
                            </React.Fragment>
                        ))}
                    </div>
                    {/* 🔹 재검색 버튼 */}
                    <button className="research-button" onClick={handleResearch} disabled={loading}>
                        {loading ? '검색 중...' : '재검색'}
                    </button>
                </section>

                {/* 🔹 에러 메시지 */}
                {error && <p style={{ color: 'red' }}>오류: {error}</p>}

                {/* 🔹 로딩 중이면 스피너 */}
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>AI가 당신을 위한 스타일을 찾고 있어요...</p>
                    </div>
                ) : (
                    !error && (
                        <>
                            {/* 🔹 유튜브 추천 섹션 */}
                            <section className="youtube-section">
                                <h3>추천 유튜브</h3>
                                <div className="video-grid">
                                    {youtubeResults.length > 0 ? (
                                        youtubeResults.map((video, index) => (
                                            <a 
                                                key={index} 
                                                href={`https://www.youtube.com/watch?v=${video.video_id}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                            >
                                                <div className="item-card youtube-card">
                                                    <img 
                                                        src={`http://localhost:5000${video.thumbnail_path}`} 
                                                        alt={video.title} 
                                                    />
                                                    <p>{video.style}</p>
                                                </div>
                                            </a>
                                        ))
                                    ) : (
                                        <p>추천 유튜브 영상을 찾지 못했습니다.</p>
                                    )}
                                </div>
                            </section>

                            {/* 🔹 무신사 추천 섹션 */}
                            <section className="musinsa-section">
                                <h3>무신사 추천 아이템</h3>

                                {/* 무신사 카테고리 필터 버튼 */}
                                {musinsaCategories.length > 2 && (
                                    <div className="category-filters">
                                        {musinsaCategories.map(category => (
                                            <button 
                                                key={category} 
                                                className={`category-button ${selectedMusinsaCategory === category ? 'active' : ''}`}
                                                onClick={() => setSelectedMusinsaCategory(category)}
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* 무신사 아이템 그리드 */}
                                <div className="item-grid">
                                    {musinsaResults.length > 0 ? (
                                        musinsaResults
                                            .filter(item => selectedMusinsaCategory === 'All' || item.style === selectedMusinsaCategory)
                                            .map((item, index) => (
                                                <a 
                                                    key={index} 
                                                    href={item.product_link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                >
                                                    <div className="item-card">
                                                        <img 
                                                            src={`http://localhost:5000${item.image}`} 
                                                            alt={item.style} 
                                                        />
                                                    </div>
                                                </a>
                                            ))
                                    ) : (
                                        <p>매칭되는 무신사 아이템을 찾지 못했습니다.</p>
                                    )}
                                </div>
                            </section>
                        </>
                    )
                )}
            </main>
        </>
    );
};

export default Main;
