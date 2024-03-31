import { useState } from 'react';

function QueryForm({ onSearch }) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit">Search</button>
        </form>
    );
}

function FindSubmissions(problemId) {
    const url = 'http://localhost:8000/submissions';
    const dataToSend = { UserId: 'tokusakurai', ProblemId: problemId, Language: 'C++17' };

    console.log(dataToSend);

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
