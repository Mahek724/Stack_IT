import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AskQuestionPage from './pages/AskQuestionPage';
import HomePage from './pages/HomePage';
import SmartNavbar from './components/SmartNavbar'; 
import ProfilePage from './pages/ProfilePage';
import AnswerPage from './pages/AnswerPage';
import EditQuestionPage from './pages/EditQuestionPage'; 
import EditAnswerPage from './pages/EditAnswerPage';
import GoogleCallback from './pages/GoogleCallback';

function App() {
  return (
    <Router>
      <SmartNavbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/askQuestion" element={<AskQuestionPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/edit-question/:id" element={<EditQuestionPage />} />
        <Route path="/edit-answer/:id" element={<EditAnswerPage />} />
        <Route path="/questions/:id" element={<AnswerPage />} />
        <Route path="/answer/:id" element={<AnswerPage />} />
        <Route path="/google/callback" element={<GoogleCallback />} />
      </Routes>
    </Router>
  );
}

export default App;
