import { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { Badge, Button, Form, InputGroup, Navbar, Table } from 'react-bootstrap';
import { IconContext } from 'react-icons';
import { SlArrowLeftCircle, SlArrowRightCircle } from "react-icons/sl";
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
    Rank: number;
}

function HeadNavigator() {
    return (
        <Navbar style={{ backgroundColor: '#0a0a3c' }}>
            <Navbar.Brand style={{ color: 'white' }} className='margin-box'>AOJ Searcher</Navbar.Brand>
        </Navbar>
    );
}

function QueryForm({ defaultUserId, defaultProblemId, defaultLanguage, defaultPageSize, defaultPageId }: {
    defaultUserId: string;
    defaultProblemId: string;
    defaultLanguage: string;
    defaultPageSize: number;
    defaultPageId: number;
}) {
    const [userId, setUserId] = useState<string>(defaultUserId);
    const [problemId, setProblemId] = useState<string>(defaultProblemId);
    const [language, setLanguage] = useState<string>(defaultLanguage);
    const [pageSize, setPageSize] = useState<number>(defaultPageSize);
    const [pageId, setPageId] = useState<number>(defaultPageId);
    const [selectCounter, setSelectCounter] = useState<number>(0);
    const navigate = useNavigate();

    function handleSubmit(e: any) {
        e.preventDefault();

        let url: string = '/submissions?';
        url += 'user=' + encodeURIComponent(userId);
        url += '&problem=' + encodeURIComponent(problemId);
        url += '&language=' + encodeURIComponent(language);
        url += '&page=' + String(pageId);
        url += '&size=' + String(pageSize);
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

    useEffect(
        () => {
            if (selectCounter == 0) {
                return;
            }
            let url: string = '/submissions?';
            url += 'user=' + encodeURIComponent(userId);
            url += '&problem=' + encodeURIComponent(problemId);
            url += '&language=' + encodeURIComponent(language);
            url += '&page=' + String(pageId);
            url += '&size=' + String(pageSize);
            console.log(url);
            navigate(url);
        }, [selectCounter]
    );

    return (
        <Navbar className='bg-body-secondary'>
            <Form className='form-inline margin-box'>
                <InputGroup>
                    <Form.Control
                        type='text'
                        placeholder='User ID'
                        value={userId}
                        onChange={(e) => { setUserId(e.target.value); setPageId(0); }}
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
            >Search</Button>

            <Button
                className='margin-box'
                variant='light'
                type='submit'
                onClick={(e) => handleReset(e)}
            >Reset</Button>

            <Form className='margin-box'>
                <InputGroup>
                    <InputGroup.Text id="basic-addon1"># per page</InputGroup.Text>
                    <Form.Select
                        className='margin-box' style={{ width: '80px' }}
                        value={String(pageSize)}
                        onChange={
                            (e) => {
                                setPageSize(Number(e.target.value));
                                setPageId(0);
                                setSelectCounter(selectCounter + 1);
                            }
                        }
                    >
                        <option value='10'>10</option>
                        <option value='20'>20</option>
                        <option value='50'>50</option>
                        <option value='100'>100</option>
                    </Form.Select>
                </InputGroup>
            </Form>
        </Navbar >
    );
}

function PageMover() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const userId = searchParams.get('user');
    const problemId = searchParams.get('problem');
    const language = searchParams.get('language');
    const pageSize = searchParams.get('size');
    const pageId = searchParams.get('page');
    const navigate = useNavigate();

    const [hoverLeft, setHoverLeft] = useState<boolean>(false);
    const [hoverRight, setHoverRight] = useState<boolean>(false);

    function handleClick(e: any, delta: number) {
        e.preventDefault();

        let nextPageId: number = (pageId === null ? 0 : Number(pageId)) + delta;
        if (nextPageId < 0) {
            nextPageId = 0;
        }

        let url: string = '/submissions?';
        url += 'user=' + (userId === null ? '' : encodeURIComponent(userId));
        url += '&problem=' + (problemId === null ? '' : encodeURIComponent(problemId));
        url += '&language=' + (language === null ? '' : encodeURIComponent(language));
        url += '&page=' + String(nextPageId);
        url += '&size=' + (pageSize === null ? '' : encodeURIComponent(pageSize));
        console.log(url);
        navigate(url);
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {
                hoverLeft ?
                    <IconContext.Provider value={{ style: { color: '#aaa' } }}>
                        <SlArrowLeftCircle
                            onClick={(e) => handleClick(e, -1)}
                            onMouseLeave={() => setHoverLeft(false)}
                            onMouseEnter={() => setHoverLeft(true)}
                            className='icon'
                        ></SlArrowLeftCircle>
                    </IconContext.Provider> :
                    <IconContext.Provider value={{ style: { color: '#000' } }}>
                        <SlArrowLeftCircle
                            onClick={(e) => handleClick(e, -1)}
                            onMouseLeave={() => setHoverLeft(false)}
                            onMouseEnter={() => setHoverLeft(true)}
                            className='icon'
                        ></SlArrowLeftCircle>
                    </IconContext.Provider>
            }
            {
                hoverRight ?
                    <IconContext.Provider value={{ style: { color: '#aaa' } }}>
                        <SlArrowRightCircle
                            onClick={(e) => handleClick(e, 1)}
                            onMouseLeave={() => setHoverRight(false)}
                            onMouseEnter={() => setHoverRight(true)}
                            className='icon'
                        ></SlArrowRightCircle>
                    </IconContext.Provider> :
                    <IconContext.Provider value={{ style: { color: '#000' } }}>
                        <SlArrowRightCircle
                            onClick={(e) => handleClick(e, 1)}
                            onMouseLeave={() => setHoverRight(false)}
                            onMouseEnter={() => setHoverRight(true)}
                            className='icon'
                        ></SlArrowRightCircle>
                    </IconContext.Provider>
            }
        </div>
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
                UserId: userId === null ? '' : decodeURIComponent(userId),
                ProblemId: problemId === null ? '' : decodeURIComponent(problemId),
                Language: language === null ? '' : decodeURIComponent(language),
                PageSize: pageSize === null ? 100 : Number(decodeURIComponent(pageSize)),
                PageId: pageId === null ? 0 : Number(decodeURIComponent(pageId)),
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
                    console.error('Network response was not ok');
                    return null;
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

    if (submissions === null) {
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
                        <td style={{ textAlign: 'right' }}>{item.Rank}</td>
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
                defaultPageSize={20}
                defaultPageId={0}
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
    const pageSize = searchParams.get('size');
    const pageId = searchParams.get('page');

    console.log(pageId)

    return (
        <div>
            <div style={{ position: 'sticky', top: 0 }}>
                <HeadNavigator />
                <QueryForm
                    defaultUserId={userId === null ? '' : userId}
                    defaultProblemId={problemId === null ? '' : problemId}
                    defaultLanguage={language === null ? '' : language}
                    defaultPageSize={pageSize === null ? 20 : Number(pageSize)}
                    defaultPageId={pageId === null ? 0 : Number(pageId)}
                />
            </div>
            <div>
                <PageMover />
                <FindSubmissions />
                <PageMover />
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
