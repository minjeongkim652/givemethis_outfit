import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import './Main.css';

// 필터 데이터 (기존과 동일)
const filters = {
    체형: ['역삼각형', '타원형', '직사각형', '삼각형', '모래시계'],
    어디에: ['데일리', '데이트', '운동', '여행', '격식'],
    누구와: ['친구', '연인', '가족', '동료', '혼자'],
};

const Main = () => {
    const location = useLocation();
    const [youtubeResults, setYoutubeResults] = useState([]);
    const [musinsaResults, setMusinsaResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            // Question 페이지에서 전달받은 답변 데이터
            const answers = location.state?.answers;
            if (!answers) {
                setError('설문 데이터가 없습니다. 시작 페이지로 돌아가 다시 시도해주세요.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/process', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(answers),
                });

                if (!response.ok) {
                    throw new Error('서버에서 데이터를 가져오는 데 실패했습니다.');
                }

                const data = await response.json();
                setYoutubeResults(data.youtube_results || []);
                setMusinsaResults(data.musinsa_results || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [location.state]);

    return (
        <>
            <Header />
            <main className="content-area">
                {/* 필터 섹션은 그대로 유지 */}
                <section className="filter-section">
                    <div className="filter-controls">
                        {Object.entries(filters).map(([title, options]) => (
                            <div key={title} className="filter-group">
                                <strong>{title}</strong>
                                <div className="checkbox-options">
                                    {options.map((option) => (
                                        <label key={option}>
                                            <input type="checkbox" name={title} value={option} /> {option}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="research-button">재검색</button>
                </section>

                {/* 로딩 및 에러 처리 */}
                {loading && <p>AI가 추천 데이터를 불러오는 중입니다...</p>}
                {error && <p style={{ color: 'red' }}>오류: {error}</p>}

                {/* 유튜브 추천 섹션 */}
                {!loading && !error && (
                    <>
                        <section className="youtube-section">
                            <h3>#추천 유튜브</h3>
                            <div className="video-grid">
                                {youtubeResults.length > 0 ? (
                                    youtubeResults.map((video, index) => (
                                        <a key={index} href={`https://www.youtube.com/watch?v=${video.video_id}`} target="_blank" rel="noopener noreferrer">
                                            <div className="item-card">
                                                <img src={video.thumbnail_path} alt={video.title} />
                                                <p>{video.style}</p>
                                                <p>{video.title}</p>
                                            </div>
                                        </a>
                                    ))
                                ) : (
                                    <p>추천 유튜브 영상을 찾지 못했습니다.</p>
                                )}
                            </div>
                        </section>

                        <section className="musinsa-section">
                            <h3>#무신사 추천 아이템</h3>
                            <div className="item-grid">
                                {musinsaResults.length > 0 ? (
                                    musinsaResults.map((item, index) => (
                                        <a key={index} href={item.product_link} target="_blank" rel="noopener noreferrer">
                                            <div className="item-card">
                                                <img src={item.image} alt={item.style} />
                                                <p>{item.style}</p>
                                            </div>
                                        </a>
                                    ))
                                ) : (
                                    <p>매칭되는 무신사 아이템을 찾지 못했습니다.</p>
                                )}
                            </div>
                        </section>
                    </>
                )}
            </main>
        </>
    );
};

export default Main;