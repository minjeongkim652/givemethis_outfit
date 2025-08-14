import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import './Main.css';

const filters = {
    when: ['봄', '여름', '가을', '겨울'],
    where: ['데일리', '데이트', '운동', '여행', '격식'],
   
};

const Main = () => {
    const location = useLocation();
    const [youtubeResults, setYoutubeResults] = useState([]);
    const [musinsaResults, setMusinsaResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFilters, setSelectedFilters] = useState({});

    useEffect(() => {
        const answers = location.state?.answers;
        if (answers) {
            setSelectedFilters({
                when: answers.season,
                where: answers.occasion,
                who: answers.appointmentType || answers.company,
            });
        }

        const fetchRecommendations = async () => {
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

    const handleFilterChange = (category, value) => {
        setSelectedFilters(prev => ({ ...prev, [category]: value }));
    };

    return (
        <>
            <Header />
            <main className="content-area">
                <section className="filter-section">
                    <div className="filter-controls">
                        {Object.entries(filters).map(([title, options], index) => (
                            <React.Fragment key={title}>
                                <div className="filter-group">
                                    <strong>{title.toUpperCase()}</strong>
                                    <div className="checkbox-options">
                                        {options.map((option) => (
                                            <label key={option} className={selectedFilters[title] === option ? 'selected' : ''}>
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
                                {index < Object.keys(filters).length - 1 && <div className="filter-separator"></div>}
                            </React.Fragment>
                        ))}
                    </div>
                    <button className="research-button">재검색</button>
                </section>

                {loading && <p>AI가 추천 데이터를 불러오는 중입니다...</p>}
                {error && <p style={{ color: 'red' }}>오류: {error}</p>}

                {!loading && !error && (
                    <>
                        <section className="youtube-section">
                            <h3>추천 유튜브</h3>
                            <div className="video-grid">
                                {youtubeResults.length > 0 ? (
                                    youtubeResults.map((video, index) => (
                                        <a key={index} href={`https://www.youtube.com/watch?v=${video.video_id}`} target="_blank" rel="noopener noreferrer">
                                            <div className="item-card">
                                                <img src={`http://localhost:5000${video.thumbnail_path}`} alt={video.title} />
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
                            <h3>무신사 추천 아이템</h3>
                            <div className="item-grid">
                                {musinsaResults.length > 0 ? (
                                    musinsaResults.map((item, index) => (
                                        <a key={index} href={item.product_link} target="_blank" rel="noopener noreferrer">
                                            <div className="item-card">
                                                <img src={`http://localhost:5000${item.image}`} alt={item.style} />
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