import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Book from './pages/Book';
import Later from './pages/Later';
import Scheduled from './pages/Scheduled';
import CoreAdvisory from './pages/CoreAdvisory';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Guide from './pages/Guide';
import SuccessState from './pages/SuccessState';
import DeliverableView from './pages/DeliverableView';
import BuyingFramework from './pages/resources/BuyingFramework';
import Playbook from './pages/resources/Playbook';
import Scorecard from './pages/resources/Scorecard';
import DealerComparison from './pages/resources/DealerComparison';
import DealerComparisonTemplatePrint from './pages/resources/DealerComparisonTemplatePrint';
import VehicleComparisonMatrix from './pages/resources/VehicleComparisonMatrix';
import VehicleComparisonMatrixPrint from './pages/resources/VehicleComparisonMatrixPrint';
import VehicleDecisionEnginePrint from './pages/resources/VehicleDecisionEnginePrint';
import OTDCalculator from './pages/resources/OTDCalculator';
import BuildInfo from './pages/BuildInfo';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Dashboard Pages
import DashboardLayout from './components/dashboard/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import StrategyBrief from './pages/dashboard/StrategyBrief';
import MySearch from './pages/dashboard/MySearch';
import ListingReviewForm from './pages/dashboard/ListingReviewForm';
import TestDriveFeedbackForm from './pages/dashboard/TestDriveFeedbackForm';
import DealerOfferReviewForm from './pages/dashboard/DealerOfferReviewForm';
import Resources from './pages/dashboard/Resources';
import Profile from './pages/dashboard/Profile';
import StrategicCarBuyerGuide from './pages/dashboard/StrategicCarBuyerGuide';
import GuideProductGate from './components/dashboard/GuideProductGate';
import BuyerMission from './pages/dashboard/BuyerMission';
import { GUIDE_TOOL_CONTEXTS } from './data/strategicCarBuyerGuide';

// Admin Pages
import AdminRoute from './components/admin/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import ClientsList from './pages/admin/ClientsList';
import ClientDetail from './pages/admin/ClientDetail';
import VehiclesList from './pages/admin/VehiclesList';
import VehicleDetail from './pages/admin/VehicleDetail';
import PowertrainDetail from './pages/admin/PowertrainDetail';
import VehicleConfigDetail from './pages/admin/VehicleConfigDetail';
import ModelComparisonTool from './pages/admin/ModelComparisonTool';
import EngagementsList from './pages/admin/EngagementsList';
import EngagementBuilder from './pages/admin/EngagementBuilder';
import ListingReviewsManager from './pages/admin/ListingReviewsManager';
import DealerOffersManager from './pages/admin/DealerOffersManager';
import ResourcesManager from './pages/admin/ResourcesManager';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/book" element={<Book />} />
                    <Route path="/later" element={<Later />} />
                    <Route path="/scheduled" element={<Scheduled />} />
                    <Route path="/start" element={<CoreAdvisory />} />
                    <Route path="/core-advisory" element={<CoreAdvisory />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/guide" element={<Guide />} />
                    <Route path="/resources/buying-framework" element={<BuyingFramework />} />
                    <Route path="/resources/playbook" element={<Playbook />} />
                    <Route path="/resources/scorecard" element={<Scorecard />} />
                    <Route path="/resources/dealer-offer-comparison" element={<DealerComparison />} />
                    <Route path="/resources/dealer-offer-comparison/template" element={<DealerComparisonTemplatePrint />} />
                    <Route path="/resources/vehicle-comparison-matrix" element={<VehicleComparisonMatrix />} />
                    <Route path="/resources/vehicle-comparison-matrix/template" element={<VehicleComparisonMatrixPrint />} />
                    <Route path="/resources/vehicle-comparison-matrix/print-radar" element={<VehicleDecisionEnginePrint />} />
                    <Route path="/resources/out-the-door-calculator" element={<OTDCalculator />} />
                    <Route path="/build-info" element={<BuildInfo />} />

                    {/* Auth Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/start/success" element={<SuccessState />} />
                    <Route path="/deliverable/:id" element={<DeliverableView />} />

                    {/* Protected Dashboard Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<DashboardLayout />}>
                            <Route index element={<Overview />} />
                            <Route path="strategy-brief" element={<StrategyBrief />} />
                            <Route path="my-search" element={<MySearch />} />
                            <Route path="my-search/listing" element={<ListingReviewForm />} />
                            <Route path="my-search/test-drive" element={<TestDriveFeedbackForm />} />
                            <Route path="my-search/offer" element={<DealerOfferReviewForm />} />
                            <Route path="resources" element={<Resources />} />
                            <Route
                                path="strategic-car-buyer-guide"
                                element={
                                    <GuideProductGate>
                                        <StrategicCarBuyerGuide />
                                    </GuideProductGate>
                                }
                            />
                            <Route
                                path="strategic-car-buyer-guide/framework"
                                element={
                                    <GuideProductGate>
                                        <BuyingFramework guideContext={GUIDE_TOOL_CONTEXTS.framework} />
                                    </GuideProductGate>
                                }
                            />
                            <Route
                                path="strategic-car-buyer-guide/playbook"
                                element={
                                    <GuideProductGate>
                                        <Playbook guideContext={GUIDE_TOOL_CONTEXTS.playbook} />
                                    </GuideProductGate>
                                }
                            />
                            <Route
                                path="strategic-car-buyer-guide/decision-engine"
                                element={
                                    <GuideProductGate>
                                        <VehicleComparisonMatrix guideContext={GUIDE_TOOL_CONTEXTS.decisionEngine} />
                                    </GuideProductGate>
                                }
                            />
                            <Route
                                path="strategic-car-buyer-guide/scorecard"
                                element={
                                    <GuideProductGate>
                                        <Scorecard guideContext={GUIDE_TOOL_CONTEXTS.scorecard} />
                                    </GuideProductGate>
                                }
                            />
                            <Route
                                path="strategic-car-buyer-guide/out-the-door-calculator"
                                element={
                                    <GuideProductGate>
                                        <OTDCalculator guideContext={GUIDE_TOOL_CONTEXTS.otdCalculator} />
                                    </GuideProductGate>
                                }
                            />
                            <Route
                                path="strategic-car-buyer-guide/dealer-offer-comparison"
                                element={
                                    <GuideProductGate>
                                        <DealerComparison guideContext={GUIDE_TOOL_CONTEXTS.offerComparison} />
                                    </GuideProductGate>
                                }
                            />
                            <Route
                                path="buyer-mission"
                                element={
                                    <GuideProductGate>
                                        <BuyerMission />
                                    </GuideProductGate>
                                }
                            />
                            <Route path="profile" element={<Profile />} />
                        </Route>
                    </Route>

                    {/* Protected Admin Routes */}
                    <Route element={<AdminRoute />}>
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<Navigate to="/admin/clients" replace />} />
                            <Route path="clients" element={<ClientsList />} />
                            <Route path="clients/:id" element={<ClientDetail />} />
                            <Route path="vehicles" element={<VehiclesList />} />
                            <Route path="vehicles/:id" element={<VehicleDetail />} />
                            <Route path="vehicles/:modelId/powertrains/:ptId" element={<PowertrainDetail />} />
                            <Route path="vehicles/:modelId/configs/:configId" element={<VehicleConfigDetail />} />
                            <Route path="engagements" element={<EngagementsList />} />
                            <Route path="engagements/:id" element={<EngagementBuilder />} />
                            <Route path="listings" element={<ListingReviewsManager />} />
                            <Route path="offers" element={<DealerOffersManager />} />
                            <Route path="resources" element={<ResourcesManager />} />
                            <Route path="model-comparison" element={<ModelComparisonTool />} />
                        </Route>
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
