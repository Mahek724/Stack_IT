import React, { useEffect, useState } from 'react';
import axios from '../../src/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import QuestionCard from '../components/QuestionCard';
import '../assets/css/home.css';

const HomePage = () => {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const limit = 5;

  const { user } = useAuth();          
  const navigate = useNavigate();      

  // Handle Ask Question click
  const handleAskQuestion = () => {
    if (user) {
      navigate('/askQuestion');
    } else {
      navigate('/signup'); // Redirect to signup if not logged in
    }
  };

  useEffect(() => {
  const fetchQuestions = async () => {
    try {
      const res = await axios.get(
        `/api/questions?search=${search}&filter=${filter}&page=${page}`
      );
      setQuestions(res.data.questions);
      setTotalQuestions(res.data.total);
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  fetchQuestions();
}, [search, filter, page]);

const totalPages = Math.ceil(totalQuestions / limit);

  return (
    <div className="homepage">
      {/* ✅ Action Bar */}
      <div className="action-bar">
        <button className="ask-btn" onClick={handleAskQuestion}>
          Ask Question
        </button>

        <select
          className="filter-select"
          onChange={(e) => setFilter(e.target.value)}
          value={filter}
        >
          <option value="newest">Newest</option>
          <option value="unanswered">Unanswered</option>
          <option value="mostvoted">Most Voted</option>
        </select>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by title or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button>🔍</button>
        </div>
      </div>

      {/* Questions List */}
      <div className="question-list">
        {questions.map((q) => (
          <QuestionCard key={q._id} question={q} />
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Previous
        </button>

        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            className={page === index + 1 ? 'active' : ''}
            onClick={() => setPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}

        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>

    </div>
  );
};

export default HomePage;
