import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Question from './pages/Question';
import About from './pages/About'; 

import Main from './pages/Main';
import WorldCup from './pages/Worldcup';
import Testo from './pages/Testo';
import Chat from './pages/Chat';
import Loading from './pages/Loading';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Question />} />
                <Route path="/loading" element={<Loading />} />
                <Route path="/Main" element={<Main />} />
                <Route path="/Worldcup" element={<WorldCup />} />
                <Route path="/Testo" element={<Testo />} />
                <Route path="/Chat" element={<Chat />} />
                <Route path="/about" element={<About />} /> 
            </Routes>
        </Router>
    );
}

export default App;