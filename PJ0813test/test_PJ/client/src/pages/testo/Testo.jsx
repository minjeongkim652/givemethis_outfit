import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import './Testo.css';

const Testo = () => {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleAnalysis = useCallback(() => {
        if (!uploadedFile) return;

        setLoading(true);

        const formData = new FormData();
        formData.append('file', uploadedFile);

        fetch('http://localhost:5000/api/testo', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            navigate('/testo/result', { 
                state: { 
                    imagePreview: uploadedFile.preview,
                    results: data 
                } 
            });
        })
        .catch(error => {
            console.error('Error:', error);
            setLoading(false);
            // You might want to show an error message to the user here
        });
    }, [uploadedFile, navigate]);

    useEffect(() => {
        if (uploadedFile) {
            handleAnalysis();
        }
    }, [uploadedFile, handleAnalysis]);

    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0];
        if (file) {
            setUploadedFile(Object.assign(file, {
                preview: URL.createObjectURL(file)
            }));
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop,
        accept: {
            'image/jpeg': [],
            'image/png': [],
        },
        disabled: !!uploadedFile
    });

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadedFile(Object.assign(file, {
                preview: URL.createObjectURL(file)
            }));
        }
    };

    return (
        <>
            <Header />
            {loading && (
                <div className="loading-overlay">
                    <video src="/loading.mp4" autoPlay loop muted style={{ width: '150px', height: '150px' }} />
                    <p className="loading-text">분석 중...</p>
                </div>
            )}
            <div className="testo-container">
                <h1 className="testo-title">에겐녀 vs 테토녀 스타일 테스트</h1>
                <a>당신이 올린 사진 한 장으로 당신의 패션 코드를 분석해 드립니다.</a>
                <div className="testo-content">
                    <div className="testo-left">
                        <img src="/test.png" alt="로고" className="test" />
                    </div>
                    <div className="testo-right">
                        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                            <input {...getInputProps()} />
                            {
                                uploadedFile ?
                                    <div className="preview-container">
                                        <img src={uploadedFile.preview} alt="미리보기" className="image-preview" />
                                    </div> :
                                    <>
                                        {isDragActive ?
                                            <p>여기에 이미지를 놓으세요...</p> :
                                            <p>이미지를 드래그 앤 드롭하거나 아래 버튼을 클릭하세요.</p>
                                        }
                                        <label htmlFor="file-upload" className="upload-button" onClick={(e) => e.stopPropagation()}>
                                            이미지 업로드
                                        </label>
                                        <input id="file-upload" type="file" onChange={handleFileInput} accept="image/*" style={{ display: 'none' }} />
                                    </>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Testo;