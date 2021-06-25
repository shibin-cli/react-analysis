module.exports = {
    title: 'react原理与核心代码解读',
    description: '实现一个精简版的React，解读React的核心代码',
    base: '/react-analysis/',
    dest: './dist',
    head: [
        ['link', {
            rel: 'icon',
            href: '/logo.png'
        }]
    ],
    themeConfig: {
        logo: '/logo.png',
        nav: [{
                text: '首页',
                link: '/'
            },
            {
                text: '开始',
                link: '/guide/VirtualDOM'
            },
            {
                text: 'GitHub',
                link: 'https://github.com/shibin-cli/react-analysis'
            },
        ],
        sidebar: [{
            title: '开始', // 必要的
            path: '/guide/', // 可选的, 标题的跳转链接，应为绝对路径且必须存在
            sidebarDepth: 1, // 可选的, 默认值是 1，
            collapsable: false,
            children: [
                ['/guide/', '说明'],
                ['/guide/VirtualDOM', 'VirtualDOM'],
                ['/guide/Fiber', 'Fiber'],
                ['/guide/React', 'React核心代码解读']
            ]
        }],
        plugins: {
            '@vuepress/pwa': {
                serviceWorker: true,
                updatePopup: {
                    message: "新内容可用",
                    buttonText: "刷新"
                }
            }
        }
    }
}