const state = {
    menuItems: [
        {
            title: 'Edit Journal',
            icon: '',
            path: '/settings',
            prefixCondition: '/home/journals/',
            forbiddenSuffix: 'settings',
            pathAbsolute: false,
            additionalSlashes: 0
        },
        {
            title: 'Edit Range',
            icon: '',
            path: '/settings',
            prefixCondition: '/home/journals/',
            forbiddenSuffix: 'settings',
            pathAbsolute: false,
            additionalSlashes: 1
        },
        {
            title: 'My Targets',
            icon: '',
            path: '/home/targets',
            prefixCondition: '/home',
            forbiddenSuffix: '',
            pathAbsolute: true,
            additionalSlashes: Infinity
        },
        {
            title: 'Settings',
            icon: 'mdi-cog',
            path: '/home/settings',
            prefixCondition: '/home',
            forbiddenSuffix: '',
            pathAbsolute: true,
            additionalSlashes: Infinity
        }
    ],
    appTitles: [
        { //home page
            titleStatic: true,
            title: '',
            titlePrefix: {
                string: '',
                useLogo: true
            },
            prefixCondition: '/home',
            suffixCondition: '',
            additionalSlashes: 0
        },
        { //targets manager
            titleStatic: true,
            title: 'My Targets',
            titlePrefix: {
                string: '',
                useLogo: false
            },
            prefixCondition: '/home/',
            suffixCondition: 'targets',
            additionalSlashes: 0
        },
        { //general settings
            titleStatic: true,
            title: 'settings',
            titlePrefix: {
                string: '',
                useLogo: true
            },
            prefixCondition: '/home/',
            suffixCondition: 'settings',
            additionalSlashes: 0
        },
        { //my journals
            titleStatic: true,
            title: 'Shooting Journals',
            titlePrefix: {
                string: '',
                useLogo: false
            },
            prefixCondition: '/home/journals',
            suffixCondition: '',
            additionalSlashes: 0
        },
        { //journal page
            titleStatic: false,
            title: {
                domain: 2,
                splitBy: '-',
                index: 1
            },
            titlePrefix: {
                string: 'journal',
                useLogo: false
            },
            prefixCondition: '/home/journals/',
            suffixCondition: '',
            additionalSlashes: 0
        },
        { //range page
            titleStatic: false,
            title: {
                domain: 2,
                splitBy: '-',
                index: 1
            },
            titlePrefix: {
                string: 'range',
                useLogo: false
            },
            prefixCondition: '/home/journals/',
            suffixCondition: '',
            additionalSlashes: 1
        },
        { //journal settings
            titleStatic: false,
            title: {
                domain: 2,
                splitBy: '-',
                index: 1
            },
            titlePrefix: {
                string: 'edit journal',
                useLogo: false
            },
            prefixCondition: '/home/journals/',
            suffixCondition: 'settings',
            additionalSlashes: 1
        },
        { //range settings
            titleStatic: false,
            title: {
                domain: 2,
                splitBy: '-',
                index: 1
            },
            titlePrefix: {
                string: 'edit range',
                useLogo: false
            },
            prefixCondition: '/home/journals/',
            suffixCondition: 'settings',
            additionalSlashes: 2
        }
    ]
}

const getters = {
    /**
     * Get the appropriate menu items for the current page.
     * 
     * @param {String} routerPath - The current page's router path
     *                              (this.$router.app._route.path).
     * @returns {Array} [
     *                     {
     *                        {String} title - The item's name,
     *                        {String} icon - Item's mdi icon,
     *                        {String} path - The path which the item should send the router,
     *                        {Boolean} pathAbsolute - True if the item's path is the whole path to be redirected to,
     *                                                 or just an addition to the current one.
     *                     }
     *                     ...
     *                  ]
     */
    getMenuItems: state => routerPath => {
        let includedItems = [];

        let pushItem = function(item) {
            includedItems.push({
                title: item.title,
                icon: item.icon,
                path: item.path,
                pathAbsolute: item.pathAbsolute
            })
        }

        for (let item of state.menuItems) {
            if (routerPath.includes(item.prefixCondition)) {
                //check if the path has the exact amount of additional slashes
                if (item.additionalSlashes !== Infinity) {
                    let prefixLen = item.prefixCondition.length;
                    let suffixLen = routerPath.length - prefixLen;
                    let suffix = routerPath.substr(prefixLen, suffixLen);
                    let suffixSplit = suffix.split('/');
                    let slashCount = suffixSplit.length - 1;
                    let finalSuffix = suffixSplit[slashCount];
                    let matchSlashes = item.additionalSlashes === slashCount;
                    let notForbidden = item.forbiddenSuffix !== finalSuffix;
                    
                    if (matchSlashes && notForbidden) pushItem(item);
                }
                else pushItem(item);
            }
        }

        return includedItems;
    },
    /**
     * Get the appropriate application title for the current page.
     * 
     * @param {String} routerPath - The current page's router path
     *                              (this.$router.app._route.path).
     * @returns {Object} {
     *                      {String} prefix - The prefix of the title (should appear to its left),
     *                      {String} title - The title that should now appear inside the app bar
     *                   }
     */
    getAppTitle: state => routerPath => {
        let title = '';
        let prefix = '';
        let useLogo = true;

        let fileteredItems = state.appTitles.filter(x => {
            if (!routerPath.includes(x.prefixCondition)) return false;
            else {
                //match slash count
                let prefixLen = x.prefixCondition.length;
                let suffixLen = routerPath.length - prefixLen;
                let suffix = routerPath.substr(prefixLen, suffixLen);
                let slashCount = suffix.split('/').length - 1;
                return x.additionalSlashes === slashCount;
            }
        })

        let meetSuffix = fileteredItems.find(x => {
            let domains = routerPath.split('/');
            return x.suffixCondition === domains[domains.length - 1];
        })

        if (fileteredItems.length) {
            let finalCandidate;
            if (meetSuffix) finalCandidate = meetSuffix;
            else finalCandidate = fileteredItems.find(x => !x.suffixCondition);

            if (finalCandidate) {
                prefix = finalCandidate.titlePrefix.string;
                useLogo = finalCandidate.titlePrefix.useLogo;

                //static title
                if (finalCandidate.titleStatic) title = finalCandidate.title;
                //dynamic title
                else {
                    let pathDomains = routerPath.split('/');
                    let matchDomain = pathDomains[finalCandidate.title.domain + 1];
                    let domainSplit = matchDomain.split(finalCandidate.title.splitBy);
                    let rawTitle = domainSplit[finalCandidate.title.index];
                    title = rawTitle.replace('%20', ' ');
                }
            }
        }

        return { useLogo, prefix, title };
    }
}

export default {
    state,
    getters
}