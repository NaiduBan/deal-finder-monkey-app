
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to the splash screen
  return <Navigate to="/splash" replace />;
};

export default Index;
