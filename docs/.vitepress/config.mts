import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "erha",
    titleTemplate: ':title - erha',
    description: "erha' Blog",
    base: '/blog/',  // 设置站点的基础路径。如果站点部署在非根路径下，需要设置此选项。
    cleanUrls: true,  // 当设置为 true 时，VitePress 将从 URL 中删除 .html 后缀。
    srcExclude: ['**/README.md', '**/TODO.md'],  // 排除不需要编译的文件
    srcDir: './src',  // 设置源文件目录为src    默认值：.
    // outDir: '../dist',  // 设置输出目录  默认值： ./.vitepress/dist
    assetsDir: 'static',  // 打包时设置静态资源存放的文件夹  默认值： assets
    cacheDir: './.vitepress/cache',  // 设置缓存目录  默认值： .vitepress/cache
    head: [
        // 添加 favicon.ico
        ['link', { rel: 'icon', href: '/blog/favicon.ico' }],
        
        // 可选：如果你有 PNG 格式的 favicon，比如用于苹果设备
        // ['link', { rel: 'icon', type: 'image/png', href: '/favicon-180.png', sizes: '180x180' }],
        
        // 可选：Apple Touch Icon（苹果设备主屏幕图标）
        // ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
        
        // 可选：其他格式，如 SVG
        // ['link', { rel: 'icon', type: 'image/svg+xml', href: '/blog/logo.svg' }],
    ],
    themeConfig: {
        nav: [
            { text: 'Home', link: '/' },
            { text: '前端相关文章', link: '/front-end/H5语义标签' },
            { text: '后端相关文章', link: '/back-end/node简介' }
        ],
        sidebar: {
            '/front-end/': [
                //   {
                //     text: 'Examples',
                //     items: [
                //       { text: 'Markdown Examples', link: '/markdown-examples' },
                //       { text: 'Runtime API Examples', link: '/api-examples' }
                //     ]
                //   },
                {
                    text: 'HTML',
                    collapsed: false,  // 是否折叠
                    items: [
                        { text: 'H5语义标签', link: '/front-end/H5语义标签' },
                    ]
                },
                //   {
                //     text: 'CSS',
                //     items: [
                //       { text: 'H5语义标签', link: '/H5语义标签' },
                //     ]
                //   },
                //   {
                //     text: 'JavaScript',
                //     items: [
                //       { text: 'H5语义标签', link: '/H5语义标签' },
                //     ]
                //   }
            ],
            '/back-end/': [
                {
                    text: 'Node',
                    collapsed: false,  // 是否折叠
                    items: [
                        { text: 'node简介', link: '/back-end/node简介' },
                    ]
                },
            ]
        },
        // socialLinks: [
        //     { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
        //     { icon: 'twitter', link: '...' },
        //     // 可以通过将 SVG 作为字符串传递来添加自定义图标：
        //     {
        //       icon: {
        //         svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Dribbble</title><path d="M12...6.38z"/></svg>'
        //       },
        //       link: '...',
        //       // 也可以为无障碍添加一个自定义标签 (可选但推荐):
        //       ariaLabel: 'cool link'
        //     }
        // ],

        // footer: {
        //   message: 'Released under the MIT License.',
        //   copyright: 'Copyright © 2020-present erha'
        // },
    },
})
