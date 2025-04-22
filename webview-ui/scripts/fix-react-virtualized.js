const fs = require('node:fs')
const path = require('node:path')

const targetFile = path.join(
  __dirname,
  '../node_modules/react-virtualized/dist/es/WindowScroller/utils/onScroll.js'
)

function fixFlowDirective() {
  if (!fs.existsSync(targetFile)) {
    return
  }

  let content = fs.readFileSync(targetFile, 'utf8')

  if (content.includes("'no babel-plugin-flow-react-proptypes'")) {
    content = content.replace(
      "'no babel-plugin-flow-react-proptypes'",
      '// Flow removed'
    )
    fs.writeFileSync(targetFile, content, 'utf8')
  }
}

fixFlowDirective()
