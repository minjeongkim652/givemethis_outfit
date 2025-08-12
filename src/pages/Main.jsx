import React from 'react';
import Header from '../components/Header';
import './Main.css';

// 필터 데이터
const filters = {
    체형: ['역삼각형', '타원형', '직사각형', '삼각형', '모래시계'],
    어디에: ['데일리', '데이트', '운동', '여행', '격식'],
    누구와: ['친구', '연인', '가족', '동료', '혼자'],
};

const Main = () => {
    return (
        <>
            {/* 상단 헤더 */}
            <Header />

            <main className="content-area">
                {/* 필터 섹션 */}
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

                {/* 유튜브 추천 섹션 */}
                <section className="youtube-section">
                    <h3>#추천 유튜브</h3>
                    <div className="video-grid">{/* 유튜브 영상이 여기에 표시됩니다 */}</div>
                </section>

                {/* 무신사 추천 아이템 섹션 */}
                <section className="musinsa-section">
                    <h3>#무신사 추천 아이템</h3>
                    <div className="item-grid">{/* 무신사 아이템이 여기에 표시됩니다 */}</div>
                </section>
            </main>
        </>
    );
};

export default Main;
