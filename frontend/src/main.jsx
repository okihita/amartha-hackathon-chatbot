import { render } from 'preact';
import { Router } from 'preact-router';
import './styles.css';

// Pages
import Users from './pages/Users';
import Majelis from './pages/Majelis';
import BusinessTypes from './pages/BusinessTypes';
import FinancialLiteracy from './pages/FinancialLiteracy';
import UserProfile from './pages/UserProfile';

// Layout
import Header from './components/Header';

function App() {
  return (
    <div class="container">
      <Header />
      <Router>
        <Users path="/" />
        <Majelis path="/majelis" />
        <BusinessTypes path="/business-types" />
        <FinancialLiteracy path="/financial-literacy" />
        <UserProfile path="/user-profile/:phone" />
      </Router>
    </div>
  );
}

render(<App />, document.getElementById('app'));
