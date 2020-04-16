const JiraClient = require("jira-connector")
const fetch = require('node-fetch')
const config = require('./config.json')

main()

async function main() {
  const jira = new JiraClient({
    host: config.jira.endpoint,
    strictSSL: true,
    basic_auth: {
      username: config.jira.user,
      password: config.jira.password
    }
  })

  const { issues } = await jira.search.search({
    jql: `project="${config.project}" AND status="To Do"`
  })
  
  let report = `Opened issues in ${config.project}`

  for (const issue of issues) {
    report += `\n${issue.key}: ${issue.fields.summary}\nhttps://${config.jira.endpoint}/browse/${issue.key}\n`
  }

  const url = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${config['wechat-key']}`
  const content = {
    msgtype: 'text',
    text: {
      content: report
    }
  }

  fetch(url, { method: 'POST', body: JSON.stringify(content) })
    .then(response => {
      response.json().then(json => {
        return json
      })
    })
    .catch(error => {
      console.log(error)
      return new Error(error)
    })
}
