import { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate, useParams, NavigateFunction } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { Button, Form, InputGroup, Navbar, Table } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.css";

interface Status {
    UserId: string;
    ProblemId: string;
    Language: string;
}

interface Submission {
    JudgeId: number;
    UserId: string;
    ProblemId: string;
    Language: string;
    Version: string;
    SubmissionTime: string;
    CpuTime: number;
    Memory: number;
}

function HeadNavigator() {
    return (
        <Navbar style={{ backgroundColor: '#0a0a3c' }}>
            <Navbar.Brand style={{ color: 'white' }} className='margin-box'>AOJ Searcher</Navbar.Brand>
        </Navbar>
    );
}

function QueryForm({ defaultUserId, defaultProblemId, defaultLanguage }: {
    defaultUserId: string;
    defaultProblemId: string;
    defaultLanguage: string;
}) {
    const [userId, setUserId] = useState<string>(defaultUserId);
    const [problemId, setProblemId] = useState<string>(defaultProblemId);
    const [language, setLanguage] = useState<string>(defaultLanguage);
    const navigate: NavigateFunction = useNavigate();

    function handleSubmit(e: any) {
        e.preventDefault();
        var url: string = '';
        url += '/user/' + (userId ? userId : '*');
        url += '/problem/' + (problemId ? problemId : '*');
        url += '/language/' + (language ? language : '*');
        navigate(url);
    }

    function handleKeyPress(e: any) {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    }

    function handleReset(e: any) {
        e.preventDefault();
        navigate('/');
    }

    return (
        <Navbar className='bg-body-tertiary'>
            <Form className='form-inline margin-box'>
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
            <Form className='form-inline margin-box'>
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
            <Form className='form-inline margin-box'>
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
    const { userId, problemId, language } = useParams<{
        userId: string;
        problemId: string;
        language: string
    }>();
    const [submissions, setSubmissions] = useState<Submission[]>([]);

    useEffect(
        () => {
            const url: string = 'http://localhost:8000/submissions';
            const dataToSend: Status = {
                UserId: userId === undefined ? '*' : userId === '*' ? '' : userId,
                ProblemId: problemId === undefined ? '' : problemId === '*' ? '' : problemId,
                Language: language === undefined ? '' : language === '*' ? '' : language
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
        <Table>
            <thead>
                <tr>
                    <th style={{ textAlign: 'center' }}>#</th>
                    <th style={{ textAlign: 'center' }}>Submission Time</th>
                    <th style={{ textAlign: 'center' }}>Problem ID</th>
                    <th style={{ textAlign: 'center' }}>User ID</th>
                    <th style={{ textAlign: 'center' }}>Language</th>
                    <th style={{ textAlign: 'center' }}>CPU Time</th>
                    <th style={{ textAlign: 'center' }}>Memory</th>
                    <th style={{ textAlign: 'center' }}>Link</th>
                </tr>
            </thead>
            <tbody>
                {submissions.map((item: Submission, index: number) => (
                    <tr key={index}>
                        <td style={{ textAlign: 'right' }}>{index + 1}</td>
                        <td>{item.SubmissionTime}</td>
                        <td>{item.ProblemId}</td>
                        <td>{item.UserId}</td>
                        <td>{item.Language}</td>
                        <td style={{ textAlign: 'right' }}>{item.CpuTime * 10} ms</td>
                        <td style={{ textAlign: 'right' }}>{item.Memory} KB</td>
                        <td style={{ textAlign: 'right' }}>{item.JudgeId}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}

function Default() {
    return (
        <div style={{ position: 'sticky', top: 0 }}>
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
    const { userId, problemId, language } = useParams<{
        userId: string;
        problemId: string;
        language: string
    }>();
    return (
        <div>
            <div style={{ position: 'sticky', top: 0 }}>
                <HeadNavigator />
                <QueryForm
                    defaultUserId={userId === undefined ? '' : userId === '*' ? '' : userId}
                    defaultProblemId={problemId === undefined ? '' : problemId === '*' ? '' : problemId}
                    defaultLanguage={language === undefined ? '' : language === '*' ? '' : language}
                />
            </div>
            <div>
                <FindSubmissions />
            </div>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path=''
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
