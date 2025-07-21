import React, { createContext, useContext, useState } from 'react';

const TagContext = createContext();

const defaultTags = [
  { label: 'React', value: 'React' },
  { label: 'Node.js', value: 'Node.js' },
  { label: 'MongoDB', value: 'MongoDB' },
  { label: 'Express', value: 'Express' },
  { label: 'JWT', value: 'JWT' },
  { label: 'Mongoose', value: 'Mongoose' },
  { label: 'Socket.IO', value: 'Socket.IO' },
  { label: 'Firebase', value: 'Firebase' },
  { label: 'TailwindCSS', value: 'TailwindCSS' },
  { label: 'VITE', value: 'Vite' },
  { label: 'Frontend', value: 'Frontend' },
  { label: 'Backend', value: 'Backend' },
  { label: 'Javascript', value: 'Javascript' },
  { label: 'Python', value: 'Pyrhon' },
  { label: 'SQL', value: 'sql' },
  { label: 'NoSQL', value: 'nosql' },
  { label: 'Graphs', value: 'Graphs' },
  { label: 'Algorithms', value: 'Algorithms' },
  { label: 'Database', value: 'Database' },
  { label: 'Security', value: 'Security' },
  { label: 'Docker', value: 'Docker' },






];

export const TagProvider = ({ children }) => {
  const [tagOptions, setTagOptions] = useState(defaultTags);

  const addNewTag = (newTag) => {
    if (!tagOptions.some(tag => tag.value.toLowerCase() === newTag.toLowerCase())) {
      setTagOptions(prev => [...prev, { label: newTag, value: newTag }]);
    }
  };

  return (
    <TagContext.Provider value={{ tagOptions, addNewTag }}>
      {children}
    </TagContext.Provider>
  );
};

export const useTags = () => useContext(TagContext);
