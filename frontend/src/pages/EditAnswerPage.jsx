import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import DOMPurify from 'dompurify';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import '../assets/css/answer.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditAnswerPage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [showPreview, setShowPreview] = useState(false);
  const [answer, setAnswer] = useState(null);

  useEffect(() => {
    axios.get(`/api/answers/${id}`)
      .then(res => {
        setAnswer(res.data);
        const html = res.data.content || "";
        const blocksFromHtml = htmlToDraft(html);
        const contentState = ContentState.createFromBlockArray(blocksFromHtml.contentBlocks);
        setEditorState(EditorState.createWithContent(contentState));
      })
      .catch(() => {
        toast.error("Answer not found");
        navigate('/');
      });
  }, [id, navigate]);

  const handleUpdate = async () => {
  const rawContent = convertToRaw(editorState.getCurrentContent());
  const isEmpty = !rawContent.blocks.some(block => block.text.trim() !== "");

  if (isEmpty) {
    toast.error("Answer cannot be empty.");
    return;
  }

  const updatedContent = draftToHtml(rawContent);

  try {
    await axios.put(`/api/answers/${id}`, { content: updatedContent }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    toast.success("Answer updated successfully!");
    
    setTimeout(() => {
      navigate(`/answer/${answer.questionId}`);
    }, 1500);
  } catch (err) {
    toast.error("Update failed. Try again.");
  }
};


  return (
    <div className="answer-page-container">
      <h2>Edit Your Answer</h2>

      <Editor
        editorState={editorState}
        onEditorStateChange={setEditorState}
        wrapperClassName="rich-editor-wrapper"
        editorClassName="rich-editor"
      />

      <button className="preview-toggle-btn" onClick={() => setShowPreview(prev => !prev)}>
        {showPreview ? "Hide Preview" : "Show Preview"}
      </button>

      {showPreview && (
        <div
          className="preview-box"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(draftToHtml(convertToRaw(editorState.getCurrentContent())))
          }}
        />
      )}

      <button className="submit-btn" onClick={handleUpdate}>Update Answer</button>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default EditAnswerPage;
