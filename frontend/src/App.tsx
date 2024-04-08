import { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { Badge, Button, Form, InputGroup, Navbar, Table } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.css";

interface Status {
    UserId: string;
    ProblemId: string;
    Language: string;
    PageSize: number;
    PageId: number;
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
    const navigate = useNavigate();

    function handleSubmit(e: any) {
        e.preventDefault();

        let url: string = '/submissions?';
        url += 'user=' + (userId ? userId : '*');
        url += '&problem=' + (problemId ? problemId : '*');
        url += '&language=' + (language ? language : '*');
        url += '&page=0';
        url += '&size=100';
        console.log(url);
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
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const userId = searchParams.get('user');
    const problemId = searchParams.get('problem');
    const language = searchParams.get('language');
    const pageSize = searchParams.get('size');
    const pageId = searchParams.get('page');

    const [submissions, setSubmissions] = useState<Submission[]>([]);

    useEffect(
        () => {
            const url: string = 'http://localhost:8000/submissions';
            const dataToSend: Status = {
                UserId: userId === null ? '*' : userId === '*' ? '' : userId,
                ProblemId: problemId === null ? '' : problemId === '*' ? '' : problemId,
                Language: language === null ? '' : language === '*' ? '' : language,
                PageSize: pageSize === null ? 100 : Number(pageSize),
                PageId: pageId === null ? 0 : Number(pageId),
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
        }, [userId, problemId, language, pageSize, pageId]
    );

    if (!submissions) {
        return null;
    }

    return (
        <Table striped bordered hover responsive className='table fixed'>
            <thead>
                <tr>
                    <th style={{ width: '20px', textAlign: 'center' }}>#</th>
                    <th style={{ width: '170px', textAlign: 'center' }}>Submission Time</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Problem ID</th>
                    <th style={{ width: '150px', textAlign: 'center' }}>User ID</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Language</th>
                    <th style={{ width: '20px', textAlign: 'center' }}>Verdict</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>CPU Time</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Memory</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Link</th>
                </tr>
            </thead>
            <tbody>
                {submissions.map((item: Submission, index: number) => (
                    <tr key={index}>
                        <td style={{ textAlign: 'right' }}>{index + 1 + Number(pageSize) * Number(pageId)}</td>
                        <td>{item.SubmissionTime}</td>
                        <td><a
                            href={'https://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=' + item.ProblemId}
                            target='_blank'
                            rel='noreferrer noopener'
                            style={{ textDecoration: 'none' }}
                        >{item.ProblemId}</a></td>
                        <td><a
                            href={'https://judge.u-aizu.ac.jp/onlinejudge/user.jsp?id=' + item.UserId}
                            target='_blank'
                            rel='noreferrer noopener'
                            style={{ textDecoration: 'none' }}
                        >{item.UserId}</a></td>
                        <td>{item.Language}</td>
                        <td style={{ textAlign: 'center' }}><Badge bg='success'>AC</Badge></td>
                        <td style={{ textAlign: 'right' }}>{item.CpuTime * 10} ms</td>
                        <td style={{ textAlign: 'right' }}>{item.Memory} KB</td>
                        <td style={{ textAlign: 'center' }}><a
                            href={'https://judge.u-aizu.ac.jp/onlinejudge/review.jsp?rid=' + item.JudgeId}
                            target='_blank'
                            rel='noreferrer noopener'
                            style={{ textDecoration: 'none' }}
                        >{'#' + item.JudgeId}</a></td>
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
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const userId = searchParams.get('user');
    const problemId = searchParams.get('problem');
    const language = searchParams.get('language');

    return (
        <div>
            <div style={{ position: 'sticky', top: 0 }}>
                <HeadNavigator />
                <QueryForm
                    defaultUserId={userId === null ? '' : userId === '*' ? '' : userId}
                    defaultProblemId={problemId === null ? '' : problemId === '*' ? '' : problemId}
                    defaultLanguage={language === null ? '' : language === '*' ? '' : language}
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
                    path='/'
                    element={<Default />}
                ></Route>
                <Route
                    path='/submissions/*'
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
