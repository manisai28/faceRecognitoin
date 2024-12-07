import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import Register from './components/Register';
import Recognize from './components/Recognize';

function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Face Recognition App
          </Typography>
          <Button color="inherit" component={Link} to="/register">
            Register
          </Button>
          <Button color="inherit" component={Link} to="/recognize">
            Recognize
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/recognize" element={<Recognize />} />
          <Route path="/" element={<Register />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
