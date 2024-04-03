import { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate, useParams } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { Button, Form, InputGroup, Navbar } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.css";

function HeadNavigator() {
    return (
        <Navbar style={{ backgroundColor: '#0a0a3c' }}>
            <Navbar.Brand style={{ color: 'white' }} className='margin-box'>AOJ Searcher</Navbar.Brand>
        </Navbar>
    );
}

function QueryForm({ defaultUserId, defaultProblemId, defaultLanguage }) {
    const [userId, setUserId] = useState(defaultUserId);
    const [problemId, setProblemId] = useState(defaultProblemId);
    const [language, setLanguage] = useState(defaultLanguage);
    const navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();
        var url = '';
        url += '/user/' + (userId ? userId : '*');
        url += '/problem/' + (problemId ? problemId : '*');
        url += '/language/' + (language ? language : '*');
        navigate(url);
    }

    function handleKeyPress(e) {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    }

    function handleReset(e) {
        e.preventDefault();
        navigate('/');
    }

    return (
        <Navbar className='bg-body-tertiary'>
            <Form inline className='margin-box'>
                <InputGroup>
                    <Form.Control
                        type='text'
                        placeholder='User ID'
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        onKeyDown={(e) => handleKeyPress(e)}
                    />
                </InputGroup>
            </Form>
            <Form inline className='margin-box'>
                <InputGroup>
                    <Form.Control
                        type='text'
                        placeholder='Problem ID'
                        value={problemId}
                        onChange={(e) => setProblemId(e.target.value)}
                        onKeyDown={(e) => handleKeyPress(e)}
                    />
                </InputGroup>
            </Form>
            <Form inline className='margin-box'>
                <InputGroup>
                    <Form.Control
                        type='text'
                        placeholder='Language'
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        onKeyDown={(e) => handleKeyPress(e)}
                    />
                </InputGroup>
            </Form>

            <Button
                className='margin-box'
                variant='primary'
                type='submit'
                onClick={(e) => handleSubmit(e)}
            >Search!</Button>

            <Button
                className='margin-box'
                variant='Light'
                type='reset'
                onClick={(e) => handleReset(e)}
            >Reset</Button>
        </Navbar >
    );
}

function FindSubmissions() {
    const { userId, problemId, language } = useParams();
    const [submissions, setSubmissions] = useState([]);

    useEffect(
        () => {
            const url = 'http://localhost:8000/submissions';
            const dataToSend = {
                UserId: userId === '*' ? '' : userId,
                ProblemId: problemId === '*' ? '' : problemId,
                Language: language === '*' ? '' : language
            };

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
                setSubmissions(data);
            }).catch(error => {
                console.error('Error:', error);
            });
        }, [userId, problemId, language]
    );

    if (!submissions) {
        return null;
    }

    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>Submission Time</th>
                        <th>Problem ID</th>
                        <th>User ID</th>
                        <th>Language</th>
                        <th>CPU Time</th>
                        <th>Memory</th>
                        <th>Submission ID</th>
                    </tr>
                </thead>
                <tbody>
                    {submissions.map((item, index) => (
                        <tr key={index}>
                            <td>{item.SubmissionTime}</td>
                            <td>{item.ProblemId}</td>
                            <td>{item.UserId}</td>
                            <td>{item.Language}</td>
                            <td>{item.CpuTime}</td>
                            <td>{item.Memory}</td>
                            <td>{item.JudgeId}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function Default() {
    return (
        <div>
            <HeadNavigator />
            <QueryForm
                defaultUserId={''}
                defaultProblemId={''}
                defaultLanguage={''}
            />
        </div>
    );
}

function Result() {
    const { userId, problemId, language } = useParams();
    return (
        <div>
            <HeadNavigator />
            <QueryForm
                defaultUserId={userId === '*' ? '' : userId}
                defaultProblemId={problemId === '*' ? '' : problemId}
                defaultLanguage={language === '*' ? '' : language}
            />
            <FindSubmissions />
        </div>
    );
}

export default function MyApp() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    exact path=''
                    element={<Default />}
                ></Route>
                <Route
                    path='user/:userId/problem/:problemId/language/:language'
                    element={<Result />}
                ></Route>
                <Route
                    path='*'
                    element={<Navigate to='' replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}
