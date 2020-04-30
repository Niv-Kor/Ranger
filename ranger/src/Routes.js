import AppCarousel from './components/widgets/AppCarousel';
import LoginPage from './components/authentication/LoginPage';
import SignUpPage from './components/authentication/SignUpPage';
import JournalsTab from './components/application/journals/JournalsTab';
import Journal from './components/application/journals/Journal';
import Range from './components/application/ranges/Range';

export const ROUTES = [
    //authentication
    { path: '/auth', component: AppCarousel },
    { path: '/auth/login', component: LoginPage },
    { path: '/auth/signup', component: SignUpPage },

    //application
    { path: '/home/journals', component: JournalsTab },
    { path: '/home/journal/:id', component: Journal },
    { path: '/home/journal/:journalId/:rangeId', component: Range }
];