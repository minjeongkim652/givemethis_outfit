import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Question from './pages/Question';
import About from './pages/About'; 

import Main from './pages/Main';
import WorldCup from './pages/Worldcup';
import Testo from './pages/testo/Testo';
import Chat from './pages/Chat';
import Loading from './pages/Loading';
import Result from './pages/testo/Result';
import Rank from './pages/Rank';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Question />} />
                <Route path="/loading" element={<Loading />} />
                <Route path="/Main" element={<Main />} />
                <Route path="/Worldcup" element={<WorldCup />} />
                <Route path="/Testo" element={<Testo />} />
                <Route path="/testo/Result" element={<Result />} />
                <Route path="/Chat" element={<Chat />} />
                <Route path="/about" element={<About />} /> 
                <Route path="/rank" element={<Rank />} />
            </Routes>
        </Router>
    );
}

export default App;