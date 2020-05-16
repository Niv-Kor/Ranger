import AppCarousel from './components/widgets/AppCarousel';
import LoginPage from './components/authentication/LoginPage';
import SignUpPage from './components/authentication/SignUpPage';
import TargetsManager from './components/application/settings/TargetsManager';
import GeneralSettings from './components/application/settings/GeneralSettings';
import JournalSettings from './components/application/settings/JournalSettings';
import RangeSettings from './components/application/settings/RangeSettings';
import JournalsPage from './components/application/journals/JournalsPage';
import Journal from './components/application/journals/Journal';
import Range from './components/application/ranges/Range';

export const ROUTES = [
    //authentication
    { path: '/auth', component: AppCarousel },
    { path: '/auth/login', component: LoginPage },
    { path: '/auth/signup', component: SignUpPage },

    //settings
    { path: '/home/settings', component: GeneralSettings },
    { path: '/home/targets', component: TargetsManager },
    { path: '/home/journals/:journalId/settings', component: JournalSettings },
    { path: '/home/journals/:journalId/:rangeId/settings', component: RangeSettings },

    //application
    { path: '/home/journals', component: JournalsPage },
    { path: '/home/journals/:id', component: Journal },
    { path: '/home/journals/:journalId/:rangeId', component: Range }
];