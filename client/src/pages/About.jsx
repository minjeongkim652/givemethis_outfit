import React from 'react';
import { useNavigate } from 'react-router-dom';
import './About.css';

const About = () => {
    const navigate = useNavigate();

    return (
        <div className="about-overlay">
            <button className="close-button" onClick={() => navigate(-1)}>×</button>
            <div className="about-content">
                <h1></h1>
                <p>
                    이옷나조는 AI 기반 패션 스타일 추천 서비스입니다.
                </p>
                <p>
                    수많은 패션 콘텐츠 속에서 당신에게 꼭 맞는 스타일을 찾아보세요.
                    당신의 취향, 상황, 체형을 고려하여 최적의 유튜브 영상과 의류 상품을 추천해드립니다.
                </p>
            </div>
        </div>
    );
};

export default About;