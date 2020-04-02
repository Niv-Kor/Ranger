import AppCarousel from './components/authentication/AppCarousel';
import LoginPage from './components/authentication/LoginPage';
import SignUpPage from './components/authentication/SignUpPage';
import UserSurveys from './components/application/UserSurveys';

export const ROUTES = [
    //authentication
    { path: '/auth', component: AppCarousel },
    { path: '/auth/login', component: LoginPage },
    { path: '/auth/signup', component: SignUpPage },

    //application
    { path: '/home/user-surveys', component: UserSurveys }
];