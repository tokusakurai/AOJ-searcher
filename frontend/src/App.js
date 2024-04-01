import { useState } from 'react';

function QueryForm({ onSearch }) {
    const [userId, setUserId] = useState('');
    const [problemId, setProblemId] = useState('');
    const [language, setLanguage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(userId, problemId, language);
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    className='form-input'
                    type='text'
                    placeholder='User ID'
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                />
                <span className='form-space'></span>
                <input
                    className='form-input'
                    type='text'
                    placeholder='Problem ID'
                    value={problemId}
                    onChange={(e) => setProblemId(e.target.value)}
                />
                <span className='form-space'></span>
                <input
                    className='form-input'
                    type='text'
                    placeholder='Language'
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                />
                <span className='form-space'></span>
                <button
                    className='form-submit'
                    type='submit'
                >Search</button>
            </form>
        </div>
    );
}

function FindSubmissions(userId, problemId, language) {
    const url = 'http://localhost:8000/submissions';
    const dataToSend = {
        UserId: userId,
        ProblemId: problemId,
        Language: language
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }).then(data => {
        console.log(data);
    }).catch(error => {
        console.error('Error:', error);
    })
}

export default function MyApp() {
    return (
        <div>
            <QueryForm onSearch={FindSubmissions} />
        </div>
    );
}
