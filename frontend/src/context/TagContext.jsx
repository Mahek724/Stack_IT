import React, { createContext, useContext, useState } from 'react';

const TagContext = createContext();

const defaultTags = [
  { label: 'React', value: 'react' },
  { label: 'Node.js', value: 'nodejs' },
  { label: 'MongoDB', value: 'mongodb' },
  { label: 'Express', value: 'express' },
  { label: 'JWT', value: 'jwt' },
  { label: 'Mongoose', value: 'mongoose' },
  { label: 'Socket.IO', value: 'socket.io' },
  { label: 'Firebase', value: 'firebase' },
  { label: 'TailwindCSS', value: 'tailwindcss' },
  { label: 'Vite', value: 'vite' },
  { label: 'Frontend', value: 'frontend' },
  { label: 'Backend', value: 'backend' },
  { label: 'Javascript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'SQL', value: 'sql' },
  { label: 'NoSQL', value: 'nosql' },
  { label: 'Graphs', value: 'graphs' },
  { label: 'Algorithms', value: 'algorithms' },
  { label: 'Database', value: 'database' },
  { label: 'Security', value: 'security' },
  { label: 'DSA', value: 'dsa' },
  { label: 'Docker', value: 'docker' },
  { label: 'Java', value: 'java' },
  { label: 'Programming', value: 'programming' },
  { label: 'Stack', value: 'stack' },
  { label: 'Queue', value: 'queue' },
  { label: 'OOP', value: 'oop' },
  { label: 'useState', value: 'useSate' },
  { label: 'useEffect', value: 'useEffect' },
  { label: 'Recursion', value: 'recursion' },
  { label: 'Binary Search', value: 'binarySearch' },
  { label: 'Interfaces', value: 'interfaces' },




];

export const TagProvider = ({ children }) => {
  const [tagOptions, setTagOptions] = useState(defaultTags);

  const addNewTag = (newTag) => {
    const normalized = newTag.toLowerCase();
    const exists = tagOptions.some(tag => tag.value === normalized);
    if (!exists) {
      setTagOptions(prev => [
        ...prev,
        { label: normalized.charAt(0).toUpperCase() + normalized.slice(1), value: normalized }
      ]);
    }
  };

  return (
    <TagContext.Provider value={{ tagOptions, addNewTag }}>
      {children}
    </TagContext.Provider>
  );
};

export const useTags = () => useContext(TagContext);
