import { render } from 'preact';
import { Router } from 'preact-router';
import './styles.css';

// Pages
import Users from './pages/Users';
import Majelis from './pages/Majelis';
import MajelisDetail from './pages/MajelisDetail';
import BusinessTypes from './pages/BusinessTypes';
import FinancialLiteracy from './pages/FinancialLiteracy';
import UserProfile from './pages/UserProfile';
import HowItWorks from './pages/HowItWorks';
import Demo from './pages/Demo';
import Secret from './pages/Secret';
import Analytics from './pages/Analytics';

// Layout
import Header from './components/Header';

function App() {
  return (
    <div class="container">
      <Header />
      <Router>
        <Users path="/" />
        <Majelis path="/majelis" />
        <MajelisDetail path="/majelis/:id" />
        <BusinessTypes path="/business-types" />
        <FinancialLiteracy path="/financial-literacy" />
        <HowItWorks path="/how-it-works" />
        <Demo path="/demo" />
        <Secret path="/secret" />
        <UserProfile path="/user-profile/:phone" />
        <Analytics path="/analytics" />
      </Router>
    </div>
  );
}

render(<App />, document.getElementById('app'));
