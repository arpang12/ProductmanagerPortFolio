// Simple hook to extract URL parameters
// In a real app with React Router, you'd use useParams from react-router-dom

export const useParams = () => {
  // For now, we'll extract from window.location
  // This is a simplified version - in production you'd use React Router
  const path = window.location.pathname;
  const segments = path.split('/').filter(Boolean);
  
  return {
    username: segments[0] === 'u' ? segments[1] : undefined
  };
};
