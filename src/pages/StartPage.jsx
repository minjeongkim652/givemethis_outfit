import { useNavigate } from 'react-router-dom';
import './StartPage.css';
// import imsilogo from '/imsilogo.png';

function StartPage() {
    const navigate = useNavigate();

    return (
        <div className="App">
            <header className="App-header">
                <img src="/imsilogo.png" alt="로고" className="logo" />
                <h1>
                    나만의 스타일을 찾는 가장 쉬운 방법
                    <br />
                    지금 시작하세요!
                </h1>

                <h4>
                    수많은 유튜브 패션 영상 속에서 나에게 딱 맞는 스타일을 찾기 어려우셨나요?
                    <br />
                    더 이상 헤매지 마세요!
                    <br />
                    저희 <strong>이옷나조</strong>는 당신의 상황을 분석하여 유튜브 영상 기반의 맞춤 스타일을
                    제안해드립니다!
                </h4>

                <button className="start-button" onClick={() => navigate('/Question')}>
                    시작하기
                </button>
            </header>
        </div>
    );
}

export default StartPage;
