import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import './Result.css';

const Result = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { imagePreview, results } = location.state || {};

    if (!imagePreview || !results) {
        // Handle case where data is not available
        return (
            <>
                <Header />
                <div className="result-container error">
                    <h2>오류</h2>
                    <p>분석 결과를 불러올 수 없습니다. 다시 시도해주세요.</p>
                    <button onClick={() => navigate('/testo')} className="retry-button">
                        다시 테스트하기
                    </button>
                </div>
            </>
        );
    }

    const { aegen, teto } = results;

    return (
        <>
            <Header />
            <div className="result-container">
                <h1 className="result-title">스타일 분석 결과</h1>
                <div className="result-content">
                    <div className="result-image-container">
                        <img src={imagePreview} alt="Uploaded outfit" className="result-image" />
                    </div>
                    <div className="result-analysis-container">
                        <h2>당신의 스타일은...</h2>
                        <div className="percentage-bar">
                            <div className="aegen-bar" style={{ width: `${aegen}%` }}>
                                <span>에겐 {aegen}%</span>
                            </div>
                            <div className="teto-bar" style={{ width: `${teto}%` }}>
                                <span>테토 {teto}%</span>
                            </div>
                        </div>
                        <div className="result-summary">
                            {aegen > teto ? 
                                <p><span className="highlight">'에겐녀'</span> 스타일에 더 가깝습니다!</p> :
                                <p><span className="highlight">'테토녀'</span> 스타일에 더 가깝습니다!</p>
                            }
                        </div>
                        <div className="button-container">
                            <button onClick={() => navigate('/testo')} className="retry-button">
                                다시 테스트하기
                            </button>
                        </div>
                    </div>
                </div>
                <div className="recommendation-section">
                    <h3>이런 스타일은 어떠세요?</h3>
                    <div className="recommendation-images">
                        {(aegen > teto ? ['egan1.jpg', 'egan2.png', 'egan3.jpg', 'egan4.png', 'egan5.png', 'egan6.jpg'] : ['teto1.jpg', 'teto2.jpg', 'teto3.png','teto4.png', 'teto5.png', 'teto6.png']).map((img, index) => (
                            <img key={index} src={`/${img}`} alt={`recommendation ${index + 1}`} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Result;
