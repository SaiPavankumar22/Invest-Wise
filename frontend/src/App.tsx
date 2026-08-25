import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { SavedSchemesProvider } from './contexts/SavedSchemesContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ChatBot } from './components/ChatBot';
import { Home } from './pages/Home';
import Dashboard from './pages/Dashboard';
import { SchemeDetails } from './pages/SchemeDetails';
import { SavedSchemes } from './pages/SavedSchemes';
import { Login } from './components/Login'
import { SignUp } from './components/SignUp'
import InvestmentsAdvisor from './pages/InvestmentsAdvisor';
import { VideoGuides } from './pages/VideoGuides';
import { Advice } from './components/Advicers';
import { MutualFundExplorer } from './components/MutualFundExplorer';
import { LICPolicyExplorer } from './components/LICPolicyExplorer';
import { PostOfficeSchemeExplorer } from './components/PostOfficeSchemes';
import InvestmentAnalysis from './components/FinancialAnalysis';
import GoldRatesTable from './components/Gold';




function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
    </>
  );
}

const AUTH_PAGES = ['/login', '/signUp'];

function AppRoutes() {
  const location = useLocation();
  const isAuthPage = AUTH_PAGES.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
      {!isAuthPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/scheme/:id" element={<MainLayout><SchemeDetails /></MainLayout>} />
        <Route path="/saved" element={<MainLayout><SavedSchemes /></MainLayout>} />
        <Route path='/login' element={<Login/>}/>
        <Route path='/signUp' element={<SignUp/>}/>
        <Route path="/investments" element={<MainLayout><InvestmentsAdvisor/></MainLayout>}/>
        <Route path="/video-guides" element={<MainLayout><VideoGuides /></MainLayout>} />
        <Route path="/advice" element={<MainLayout><Advice/></MainLayout>}/>
        <Route path="/lic-explorer" element={<MainLayout><LICPolicyExplorer/></MainLayout>}/>
        <Route path="/post-office-explorer" element={<MainLayout><PostOfficeSchemeExplorer /></MainLayout>} />
        <Route path='/get-mutual-funds' element={<MainLayout><MutualFundExplorer/></MainLayout>} />
        <Route path="/financial-doc-analysis" element={<MainLayout><InvestmentAnalysis/></MainLayout>}/>
        <Route path="/postoffice" element={<MainLayout><PostOfficeSchemeExplorer/></MainLayout>}/>
        <Route path="/gold" element={<MainLayout><GoldRatesTable rates={[]} loading={false} /></MainLayout>}/>
        <Route path="*" element={<MainLayout><Home /></MainLayout>} />
      </Routes>
      {location.pathname === '/' && <Footer />}
      {!isAuthPage && <ChatBot />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SavedSchemesProvider>
          <Router>
            <AppRoutes />
          </Router>
        </SavedSchemesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;