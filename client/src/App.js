import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Question from './pages/Question';
import About from './pages/About'; // Import the new component

import Main from './pages/Main';
import WorldCup from './pages/Worldcup';
import Testo from './pages/Testo';
import Chat from './pages/Chat';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Question />} />
                <Route path="/Main" element={<Main />} />
                <Route path="/Worldcup" element={<WorldCup />} />
                <Route path="/Testo" element={<Testo />} />
                <Route path="/Chat" element={<Chat />} />
                <Route path="/about" element={<About />} /> {/* Add the new route */}
            </Routes>
        </Router>
    );
}

export default App;