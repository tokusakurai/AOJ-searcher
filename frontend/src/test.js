const url = 'http://backend:8000/submissions';
const dataToSend = { UserId: 'tokusakurai', ProblemId: '2560', Language: 'C++17' }; // 送信するデータ

function wait(seconds) {
    return new Promise(resolve => {
        setTimeout(resolve, seconds * 1000);
    });
}

async function fetchData() {
    await wait(20);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        });
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error:', error);
    }
}

fetchData();