import React, { useState, useEffect, useRef } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import CreatableSelect from 'react-select/creatable';
import { toast } from 'react-toastify';
import axios from 'axios';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import 'react-toastify/dist/ReactToastify.css';
import '../assets/css/askQuestion.css';
import { useTags } from '../context/TagContext';

const AskQuestionPage = () => {
  const [title, setTitle] = useState('');
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [tags, setTags] = useState([]);
  const isMountedRef = useRef(true);
  const [status, setStatus] = useState('open');
  const [showPreview, setShowPreview] = useState(true);
   const { tagOptions, addNewTag } = useTags();

const keywordTags = tagOptions.map(tag => tag.value.toLowerCase());


  useEffect(() => {
  // When component mounts
  isMountedRef.current = true;

  // When component unmounts
  return () => {
    isMountedRef.current = false;
  };
}, []);

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
  const val = e.target.value;
  setTitle(val);
  detectTagsFromText(val);
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


  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const description = draftToHtml(convertToRaw(editorState.getCurrentContent()));

    if (!title.trim() || !editorState.getCurrentContent().hasText() || tags.length === 0) {
      toast.error('Please fill all fields before submitting.');
      return;
    }

    if (title.length < 10) {
      toast.error('Title must be at least 10 characters.');
      return;
    }

      const payload = {
        title,
        description,
        tags: tags.map((tag) => tag.value),
        status, // ✅ include status
      };


    try {
      const token = localStorage.getItem('token'); // Or from your auth context

        await axios.post('http://localhost:5000/api/questions', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

      toast.success('Question submitted successfully!');
      setTitle('');
      setEditorState(EditorState.createEmpty());
      setTags([]);
    } catch (error) {
      toast.error('Failed to submit question. Try again.');
    }
  };

  return (
    <>
      <div className="ask-container">
        <div className="ask-wrapper">
          <h1 className="ask-title">Ask a Question</h1>
          <form onSubmit={handleSubmit} className="ask-form">
            <label className="form-label">Title</label>
            <input
              type="text"
              placeholder="e.g. How to implement authentication in React using JWT?"
              value={title}
              onChange={handleTitleChange}
              className="form-input"
              required
            />

            <label className="form-label">Description</label>
            <div className="editor-wrapper">
              <Editor
                editorState={editorState}
                onEditorStateChange={setEditorState}
                placeholder="Describe your problem in detail, including what you've tried."
                toolbar={{
                  options: ['inline', 'blockType', 'list', 'textAlign', 'link', 'image', 'emoji', 'history'],
                  inline: {
                    options: ['bold', 'italic', 'underline', 'strikethrough'],
                  },
                  list: {
                    options: ['unordered', 'ordered'],
                  },
                  textAlign: {
                    options: ['left', 'center', 'right'],
                  },
                   link: {
                    inDropdown: false,
                    defaultTargetOption: '_blank',
                    showOpenOptionOnHover: true,
                    options: ['link', 'unlink'],
                  },
                  image: {
                      uploadEnabled: true,
                      uploadCallback: async (file) => {
                        const formData = new FormData();
                        formData.append('file', file);

                        try {
                          const res = await axios.post('http://localhost:5000/api/upload-image', formData, {
                            headers: {
                              'Content-Type': 'multipart/form-data',
                            },
                          });

                          return res.data; // { data: { link: "/api/uploads/<id>" } }
                        } catch (error) {
                          console.error('Image upload failed', error);
                          return Promise.reject(error);
                        }
                      },


                      previewImage: true,
                      alt: { present: true, mandatory: false },
                      },

                  emoji: {
                     emojis: [
                        '😀', '😁', '😂', '😃', '😄', '😅', '😆',
                        '😉', '😊', '😋', '😎', '😍', '😘', '😗',
                        '😙', '😚', '🙂', '🤗', '🤔', '😐', '😑',
                        '😶', '🙄', '😏', '😣', '😥', '😮', '🤐'
                      ],
                  },
                }}
              />
            </div>
            <label className="form-label">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-input"
              >
                <option value="open">Open</option>
                <option value="answered">Answered</option>
                <option value="closed">Closed</option>
              </select>


            <label className="form-label">Tags</label>
            <CreatableSelect
              isMulti
              options={tagOptions}
              value={tags}
              onChange={handleTagChange}
              onCreateOption={handleTagCreate}
              placeholder="Search or add tags"
              className="tag-select"
              noOptionsMessage={() => 'No matching tags. Press Enter to create.'}
            />

            <button type="submit" className="submit-btn">Submit Question</button>
          </form>

          <button
            type="button"
            onClick={() => setShowPreview((prev) => !prev)}
            style={{
              marginTop: '1.5rem',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              backgroundColor: '#e0e7ff',
              border: '1px solid #4466cc',
              color: '#062461',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>


         {showPreview && (
            <>
              <label className="form-label" style={{ marginTop: '2rem' }}>Live Preview</label>

              <div className="preview-meta">
                <p><strong>Title:</strong> {title || 'No title yet'}</p>
                <p><strong>Status:</strong> {status}</p>
                <p><strong>Tags:</strong> {tags.map(tag => tag.label).join(', ') || 'None'}</p>
              </div>

              <div
                className="preview-box"
                dangerouslySetInnerHTML={{
                  __html: draftToHtml(convertToRaw(editorState.getCurrentContent())),
                }}
              ></div>
            </>

          )}

        </div>
      </div>
    </>
  );
};

export default AskQuestionPage;
