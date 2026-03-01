import { useEffect, useState } from 'react';

interface Request {
    gemini_request: string;
    image: string;
}

function App() {



    const [requests, setRequests] = useState<Request[]>([{gemini_request:"asdasdsad", image: "text"}]);



    useEffect(() => {
        fetch('http://localhost:8000/api/text_output/', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(requests[0])})
            .then(res => res.json())
            .then(data => setRequests([data]))
            .catch(err => console.error('Oops!', err));
    }, []);

    return (
        <div>
            <h1>Items List</h1>
            <ul>
                {requests.map(request => (
                    <li key={request.gemini_request}>
                        <strong>{request.image}</strong>: {request.image}
                    </li>
                ))}
            </ul>
        </div>
    );
}
export default App;
