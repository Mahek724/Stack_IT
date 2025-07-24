// src/pages/EditQuestionPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { Editor } from 'react-draft-wysiwyg';
import CreatableSelect from 'react-select/creatable';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import 'react-toastify/dist/ReactToastify.css';
import '../assets/css/edit.css';
import { useTags } from '../context/TagContext';

const EditQuestionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMountedRef = useRef(true);
  const [title, setTitle] = useState('');
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [tags, setTags] = useState([]);
  const [status, setStatus] = useState('open');
  const [showPreview, setShowPreview] = useState(true);
  const { tagOptions, addNewTag } = useTags();

  const keywordTags = tagOptions.map(tag => tag.value.toLowerCase());

  useEffect(() => {
    axios.get(`/api/questions/${id}`)
      .then(res => {
        const { title, description, tags, status } = res.data;
        setTitle(title);
        setTags(tags.map(t => ({ label: t, value: t })));
        setStatus(status);

        const blocksFromHtml = htmlToDraft(description || '');
        const contentState = ContentState.createFromBlockArray(blocksFromHtml.contentBlocks);
        setEditorState(EditorState.createWithContent(contentState));
      })
      .catch(() => {
        toast.error("Failed to fetch question details.");
      });

    return () => { isMountedRef.current = false; };
  }, [id]);

  const detectTagsFromText = (text) => {
    const lowerText = text.toLowerCase();
    const detected = keywordTags
      .filter(tag => lowerText.includes(tag))
      .map(tag => {
        const match = tagOptions.find(t => t.value === tag);
        return match || { label: tag.charAt(0).toUpperCase() + tag.slice(1), value: tag };
      });

    const merged = [...tags];
    detected.forEach(tag => {
      if (!merged.find(t => t.value === tag.value)) {
        merged.push(tag);
      }
    });

    setTags(merged);
  };

  useEffect(() => {
    const plainText = editorState.getCurrentContent().getPlainText();
    detectTagsFromText(plainText);
  }, [editorState]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    detectTagsFromText(e.target.value);
  };

  const handleTagChange = (selected) => {
    setTags(selected || []);
  };

  const handleTagCreate = (inputValue) => {
    const normalized = inputValue.toLowerCase();
    const newTag = {
      label: inputValue.charAt(0).toUpperCase() + inputValue.slice(1),
      value: normalized
    };
    addNewTag(normalized);
    setTags(prev => [...prev, newTag]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const description = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    if (!title.trim() || !editorState.getCurrentContent().hasText() || tags.length === 0) {
      toast.error("Please fill all fields before updating.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/questions/${id}`, {
        title,
        description,
        tags: tags.map(t => t.value),
        status,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      toast.success("Question updated successfully!");
      navigate(`/questions/${id}`);
    } catch (err) {
      toast.error("Failed to update question.");
    }
  };

  return (
    <div className="edit-container">
      <div className="edit-wrapper">
        <h1 className="edit-title">Edit Your Question</h1>
        <form onSubmit={handleUpdate} className="edit-form">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={handleTitleChange}
            required
          />

          <label className="form-label">Description</label>
          <div className="editor-wrapper">
            <Editor
              editorState={editorState}
              onEditorStateChange={setEditorState}
              toolbar={{
                options: ['inline', 'blockType', 'list', 'textAlign', 'link', 'image', 'emoji', 'history'],
              }}
            />
          </div>

          <label className="form-label">Status</label>
          <select
            className="form-input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="open">Open</option>
            <option value="answered">Answered</option>
            <option value="closed">Closed</option>
          </select>

          <label className="form-label">Tags</label>
          <CreatableSelect
            isMulti
            value={tags}
            options={tagOptions}
            onChange={handleTagChange}
            onCreateOption={handleTagCreate}
            className="tag-select"
          />

          <button type="submit" className="submit-btn">Update Question</button>
        </form>

        <button
          type="button"
          onClick={() => setShowPreview(prev => !prev)}
          className="preview-toggle"
        >
          {showPreview ? "Hide Preview" : "Show Preview"}
        </button>

        {showPreview && (
          <>
            <label className="form-label" style={{ marginTop: '2rem' }}>Live Preview</label>
            <div className="preview-meta">
              <p><strong>Title:</strong> {title}</p>
              <p><strong>Status:</strong> {status}</p>
              <p><strong>Tags:</strong> {tags.map(tag => tag.label).join(', ')}</p>
            </div>
            <div
              className="preview-box"
              dangerouslySetInnerHTML={{
                __html: draftToHtml(convertToRaw(editorState.getCurrentContent())),
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default EditQuestionPage;
