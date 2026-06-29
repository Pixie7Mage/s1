import { Navigate, Route, Routes } from 'react-router-dom';
import { ClientFormProvider } from './context/ClientFormContext';
import PersonalFamilyPage from './pages/PersonalFamilyPage';
import IncomePage from './pages/IncomePage';
import ExpensesPage from './pages/ExpensesPage';
import AssetsPage from './pages/AssetsPage';
import LiabilitiesPage from './pages/LiabilitiesPage';
import GoalsPage from './pages/GoalsPage';
import InvestmentsPage from './pages/InvestmentsPage';
import InsurancePage from './pages/InsurancePage';
import EmergencyFundPage from './pages/EmergencyFundPage';
import AssumptionsPage from './pages/AssumptionsPage';
import ReviewPage from './pages/ReviewPage';

export default function App() {
  return (
    <ClientFormProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/client" replace />} />
        <Route path="/client" element={<PersonalFamilyPage />} />
        <Route path="/income" element={<IncomePage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/liabilities" element={<LiabilitiesPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/investments" element={<InvestmentsPage />} />
        <Route path="/insurance" element={<InsurancePage />} />
        <Route path="/emergency-fund" element={<EmergencyFundPage />} />
        <Route path="/assumptions" element={<AssumptionsPage />} />
        <Route path="/review" element={<ReviewPage />} />
      </Routes>
    </ClientFormProvider>
  );
}
