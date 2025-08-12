import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StartPage from './pages/StartPage';
import Question from './pages/Question';

import Main from './pages/Main';
import WorldCup from './pages/Worldcup';
import Testo from './pages/Testo';
import Chat from './pages/Chat';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<StartPage />} />
                <Route path="/Main" element={<Main />} />
                <Route path="/Question" element={<Question />} />
                <Route path="/Worldcup" element={<WorldCup />} />
                <Route path="/Testo" element={<Testo />} />
                <Route path="/Chat" element={<Chat />} />
            </Routes>
        </Router>
    );
}

export default App;
