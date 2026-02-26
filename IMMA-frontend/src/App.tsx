import { useEffect, useState } from 'react';

interface Item {
    id: number;
    name: string;
    description: string;
}

function App() {
    const [items, setItems] = useState<Item[]>([]);

    useEffect(() => {
        fetch('http://localhost:8000/api/items/')
            .then(res => res.json())
            .then(data => setItems(data))
            .catch(err => console.error('Oops!', err));
    }, []);

    return (
        <div>
            <h1>Items List</h1>
            <ul>
                {items.map(item => (
                    <li key={item.id}>
                        <strong>{item.name}</strong>: {item.description}
                    </li>
                ))}
            </ul>
        </div>
    );
}
export default App;
