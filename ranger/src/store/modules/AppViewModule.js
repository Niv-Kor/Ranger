const state = {
    menuItems: [
        {
            title: 'Edit Journal',
            icon: '',
            path: '/settings',
            prefixCondition: '/home/journals/',
            pathAbsolute: false,
            additionalSlashes: 0
        },
        {
            title: 'Edit Range',
            icon: '',
            path: '/settings',
            prefixCondition: '/home/journals/',
            pathAbsolute: false,
            additionalSlashes: 1
        },
        {
            title: 'Settings',
            icon: 'mdi-cog',
            path: '/home/settings',
            prefixCondition: '/home',
            pathAbsolute: true,
            additionalSlashes: Infinity
        }
    ],
    appTitles: [
        {
            titleStatic: true,
            title: 'Shooting Journals',
            titlePrefix: '',
            prefixCondition: '/home/journals',
            additionalSlashes: 0
        },
        {
            titleStatic: false,
            title: {
                domain: 2,
                splitBy: '-',
                index: 1
            },
            titlePrefix: 'Journal',
            prefixCondition: '/home/journals/',
            additionalSlashes: 0
        },
        {
            titleStatic: false,
            title: {
                domain: 2,
                splitBy: '-',
                index: 1
            },
            titlePrefix: 'Journal',
            prefixCondition: '/home/journals/',
            additionalSlashes: 1
        },
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
                    let slashCount = suffix.split('/').length - 1;

                    if (item.additionalSlashes === slashCount) pushItem(item);
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

        for (let item of state.appTitles) {
            if (routerPath.includes(item.prefixCondition)) {
                let prefixLen = item.prefixCondition.length;
                let suffixLen = routerPath.length - prefixLen;
                let suffix = routerPath.substr(prefixLen, suffixLen);
                let slashCount = suffix.split('/').length - 1;

                if (item.additionalSlashes === slashCount) {
                    prefix = item.titlePrefix;

                    //static title
                    if (item.titleStatic) title = item.title;
                    //dynamic title
                    else {
                        let domains = routerPath.split('/');
                        let matchDomain = domains[item.title.domain + 1];
                        let domainSplit = matchDomain.split(item.title.splitBy);
                        let rawTitle = domainSplit[item.title.index];
                        title = rawTitle.replace('%20', ' ');
                    }
                }
            }
        }

        return { prefix, title };
    }
}

export default {
    state,
    getters
}