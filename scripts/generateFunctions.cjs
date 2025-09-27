const fs = require('fs')
const path = require('path')

function generateRealFunctions(targetPath) {
  // Copy the template file
  const templatePath = path.join(__dirname, 'realFunctions.template.js')
  const targetFile = path.join(targetPath, 'src/utils/realFunctions.js')
  
  if (fs.existsSync(templatePath)) {
    fs.copyFileSync(templatePath, targetFile)
    console.log('✅ Generated realFunctions.js with NetworkManager singleton')
  } else {
    console.error('⚠️ Template file not found')
    throw new Error('realFunctions.template.js not found')
  }
}

module.exports = {
  generateRealFunctions
}