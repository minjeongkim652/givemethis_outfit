import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import Header from '../components/Header';

const getGeminiResponse = async (message) => {
    const lowerCaseMessage = message.toLowerCase();
    if (lowerCaseMessage.includes('청바지')) {
        return '청바지에는 흰색 티셔츠나 스트라이프 셔츠가 클래식한 조합이에요. 좀 더 트렌디하게는 크롭탑이나 오버사이즈 맨투맨도 잘 어울려요!';
    }
    if (lowerCaseMessage.includes('데이트')) {
        return '데이트룩으로는 원피스나 블라우스에 스커트 조합을 추천해요. 부드러운 색감의 옷을 선택하면 로맨틱한 분위기를 연출할 수 있어요.';
    }
    if (lowerCaseMessage.includes('결혼식')) {
        return '결혼식 하객룩으로는 너무 튀지 않는 단정한 원피스나 슬랙스에 블라우스 조합이 좋아요. 화이트 색상은 피하는 게 매너랍니다.';
    }
    if (lowerCaseMessage.includes('안녕')) {
        return '안녕하세요! 패션에 대해 궁금한 점이 있으신가요? 오늘의 스타일을 함께 찾아봐요.';
    }
    return "음... 좀 더 자세히 말씀해주시겠어요? 예를 들어 '청바지 코디'나 '데이트룩 추천'처럼 물어보실 수 있어요.";
};

const ChatbotPage = () => {
    const [messages, setMessages] = useState([
        { text: '안녕하세요! 저는 당신의 AI 패션 스타일리스트입니다. 무엇을 도와드릴까요?', sender: 'bot' },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage = { text: inputValue, sender: 'user' };
        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        setTimeout(async () => {
            const botResponseText = await getGeminiResponse(inputValue);
            const botMessage = { text: botResponseText, sender: 'bot' };
            setMessages((prev) => [...prev, botMessage]);
            setIsLoading(false);
        }, 1000);
    };

    return (
        <>
            <Header />
            <div className="chatbot-container">
                <div className="message-list">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message-bubble ${msg.sender}`}>
                            <p>{msg.text}</p>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message-bubble bot typing">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <form className="chat-input-form" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="여기에 메시지를 입력하세요..."
                        autoFocus
                    />
                    <button type="submit" disabled={isLoading}>
                        전송
                    </button>
                </form>
            </div>
        </>
    );
};

export default ChatbotPage;
