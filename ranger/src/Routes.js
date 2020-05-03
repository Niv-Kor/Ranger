import AppCarousel from './components/widgets/AppCarousel';
import LoginPage from './components/authentication/LoginPage';
import SignUpPage from './components/authentication/SignUpPage';
import GeneralSettings from './components/application/settings/GeneralSettings';
import JournalsTab from './components/application/journals/JournalsTab';
import Journal from './components/application/journals/Journal';
import Range from './components/application/ranges/Range';

export const ROUTES = [
    //authentication
    { path: '/auth', component: AppCarousel },
    { path: '/auth/login', component: LoginPage },
    { path: '/auth/signup', component: SignUpPage },

    //settings
    { path: '/home/settings', component: GeneralSettings },
    { path: '/home/journals/:journalId/settings', component: GeneralSettings },
    { path: '/home/journals/:journalId/:rangeId/settings', component: GeneralSettings },

    //application
    { path: '/home/journals', component: JournalsTab },
    { path: '/home/journals/:id', component: Journal },
    { path: '/home/journals/:journalId/:rangeId', component: Range }
];