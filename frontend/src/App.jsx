import axios from 'axios';
import { useEffect } from 'react';
axios.defaults.baseURL = 'http://localhost:3000';
axios.defaults.withCredentials = true;

function App() {
  useEffect(() => {
    axios.get('/auth/register');
  }, []);
  return <div className="">Hello world</div>;
}

export default App;
