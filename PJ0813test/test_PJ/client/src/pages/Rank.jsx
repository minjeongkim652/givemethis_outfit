import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import './Rank.css';

const Rank = () => {
    const [rankings, setRankings] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/rank');
                if (!response.ok) {
                    throw new Error('서버에서 랭킹 정보를 가져오는데 실패했습니다.');
                }
                const data = await response.json();
                setRankings(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchRankings();
    }, []);

    const top3 = rankings.slice(0, 3);
    const otherRanks = rankings.slice(3);

    console.log({ rankings, otherRanks });

    return (
        <>
            <Header />
            <div className="rank-container">
                <h1>스타일 랭킹</h1>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                
                <h2 className="top3-title">Top 3 스타일</h2>
                <div className="top3-container">
                    {top3.map((item) => (
                        <div key={item.rank} className={`top3-item rank-${item.rank}`}>
                            <img src={`http://localhost:5000${item.image}`} alt={item.style} />
                            {item.rank === 1 && <img src="/icons/nukki.png" alt="nukki" className="nukki-image" style={{ transform: 'scale(0.125)' }} />}
                            <div className="top3-info">
                                <span className="rank-number">{item.rank}</span>
                                <span className="rank-style">{item.style}</span>
                                <span className="rank-count">{item.count}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <h2>전체 랭킹</h2>
                <div className="rank-list">
                    {otherRanks.map((item) => (
                        <div key={item.rank} className="rank-item">
                            <span className="rank-number">{item.rank}</span>
                            <span className="rank-style">{item.style}</span>
                            <span className="rank-count">{item.count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Rank;
