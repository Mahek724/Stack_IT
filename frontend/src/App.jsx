import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AskQuestionPage from './pages/AskQuestionPage';
import HomePage from './pages/HomePage';
import SmartNavbar from './components/SmartNavbar'; // ✅ Import it here
import ProfilePage from './pages/ProfilePage';
import AnswerPage from './pages/AnswerPage';
import EditQuestionPage from './pages/EditQuestionPage'; // ✅ Import EditQuestionPage

function App() {
  return (
    <Router>
      <SmartNavbar /> {/* ✅ Always shows correct navbar */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/askQuestion" element={<AskQuestionPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/questions/:id" element={<AnswerPage />} />
        <Route path="/edit-question/:id" element={<EditQuestionPage />} />



      </Routes>
    </Router>
  );
}

export default App;
