module.exports = {
  apps: [
    {
      name: 'bwebapp',
      script: 'server/index.js',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'sk-hoGW432uIf61TGVzbl928ic1VE7tC20CYgnRVYO62xTz9BB9',
        OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'https://new.lemonapi.site/v1',
        LLM_MODEL: process.env.LLM_MODEL || '[L]gemini-3.1-pro-preview'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
