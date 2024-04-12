import { useState, useEffect, useMemo } from 'react';
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
    PageId: number;
    PageSize: number;
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

function getDefaultStatus(): Status {
    return {
        UserId: '',
        ProblemId: '',
        Language: '',
        PageId: 0,
        PageSize: 20,
    };
}

function getURLFromStatus(status: Status): string {
    let url: string = '/submissions?';
    url += 'user=' + encodeURIComponent(status.UserId);
    url += '&problem=' + encodeURIComponent(status.ProblemId);
    url += '&language=' + encodeURIComponent(status.Language);
    url += '&page=' + String(status.PageId);
    url += '&size=' + String(status.PageSize);
    console.log(url);
    return url;
}

function getStatusFromURL(searchParams: URLSearchParams): Status {
    const defaultStatus: Status = getDefaultStatus();
    return {
        UserId: searchParams.get('user') || defaultStatus.UserId,
        ProblemId: searchParams.get('problem') || defaultStatus.ProblemId,
        Language: searchParams.get('language') || defaultStatus.Language,
        PageId: Number(searchParams.get('page')) || defaultStatus.PageId,
        PageSize: Number(searchParams.get('size')) || defaultStatus.PageSize,
    }
}

function HeadNavigator() {
    return (
        <Navbar style={{ backgroundColor: '#0a0a3c' }}>
            <Navbar.Brand style={{ color: 'white' }} className='margin-box'>AOJ Searcher</Navbar.Brand>
        </Navbar>
    );
}

function QueryForm() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search)
    const currentStatus: Status = getStatusFromURL(searchParams);
    const [status, setStatus] = useState<Status>(currentStatus);
    const navigate = useNavigate();

    function handleSubmit(e: any) {
        e.preventDefault();
        navigate(getURLFromStatus(status));
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

    function handleSelect(e: any) {
        const tmpStatus: Status = {
            ...status,
            PageId: 0,
            PageSize: Number(e.target.value),
        }
        setStatus(tmpStatus);
        navigate(getURLFromStatus(tmpStatus));
    }

    return (
        <Navbar className='bg-body-secondary'>
            <Form className='form-inline margin-box'>
                <InputGroup>
                    <Form.Control
                        type='text'
                        placeholder='User ID'
                        value={status.UserId}
                        onChange={(e) => {
                            setStatus({
                                ...status,
                                UserId: e.target.value,
                            });
                        }}
                        onKeyDown={(e) => handleKeyPress(e)}
                    />
                </InputGroup>
            </Form>
            <Form className='form-inline margin-box'>
                <InputGroup>
                    <Form.Control
                        type='text'
                        placeholder='Problem ID'
                        value={status.ProblemId}
                        onChange={(e) => {
                            setStatus({
                                ...status,
                                ProblemId: e.target.value,
                            });
                        }}
                        onKeyDown={(e) => handleKeyPress(e)}
                    />
                </InputGroup>
            </Form>
            <Form className='form-inline margin-box'>
                <InputGroup>
                    <Form.Control
                        type='text'
                        placeholder='Language'
                        value={status.Language}
                        onChange={(e) => {
                            setStatus({
                                ...status,
                                Language: e.target.value,
                            });
                        }}
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
                        value={String(status.PageSize)}
                        onChange={(e) => handleSelect(e)}
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
    const searchParams = new URLSearchParams(location.search)
    const status: Status = getStatusFromURL(searchParams);
    const navigate = useNavigate();

    const [hoverLeft, setHoverLeft] = useState<boolean>(false);
    const [hoverRight, setHoverRight] = useState<boolean>(false);

    function handleClick(e: any, delta: number) {
        e.preventDefault();

        let nextPageId: number = status.PageId + delta;
        if (nextPageId < 0) {
            nextPageId = 0;
        }

        const tmpStatus: Status = {
            ...status,
            PageId: nextPageId,
        }
        navigate(getURLFromStatus(tmpStatus));
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

function TableHead() {
    return (
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
    );
}

function FindSubmissions() {
    const location = useLocation();
    const searchParams = useMemo(() => {
        return new URLSearchParams(location.search)
    }, [location]);
    const status: Status = useMemo(() => {
        return getStatusFromURL(searchParams);
    }, [searchParams]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);

    useEffect(
        () => {
            const url: string = 'http://localhost:8000/submissions';
            console.log(status);

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(status)
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
        }, [status]
    );

    if (submissions === null) {
        return (
            <Table striped bordered hover responsive className='table fixed'>
                <TableHead />
            </Table>
        )
    }

    return (
        <Table striped bordered hover responsive className='table fixed'>
            <TableHead />
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
            <QueryForm />
        </div>
    );
}

function Result() {
    return (
        <div>
            <div style={{ position: 'sticky', top: 0 }}>
                <HeadNavigator />
                <QueryForm />
            </div>
            <div>
                <PageMover />
                <FindSubmissions />
                <PageMover />
            </div>
        </div>
    );
}

function App() {
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

export default App;
