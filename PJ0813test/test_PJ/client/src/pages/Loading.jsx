import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Loading.css';

const Loading = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        const answers = location.state?.answers;

        if (!answers) {
            navigate('/');
            return;
        }

        const fetchRecommendations = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/process', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(answers),
                });

                if (!response.ok) {
                    throw new Error('Server error');
                }

                const data = await response.json();
                navigate('/Main', { state: { results: data, answers: answers } });
            } catch (err) {
                setError(err.message);
                navigate('/Main', { state: { error: err.message, answers: answers } });
            }
        };

        fetchRecommendations();
    }, [location.state, navigate]);

    return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>AI가 당신을 위한 스타일을 찾고 있어요...</p>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        </div>
    );
};

export default Loading;