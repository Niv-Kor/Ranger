import AppCarousel from './components/authentication/AppCarousel';
import LoginPage from './components/authentication/LoginPage';
import SignUpPage from './components/authentication/SignUpPage';
import Journals from './components/application/Journals';

export const ROUTES = [
    //authentication
    { path: '/auth', component: AppCarousel },
    { path: '/auth/login', component: LoginPage },
    { path: '/auth/signup', component: SignUpPage },

    //application
    { path: '/home/journals', component: Journals }
];