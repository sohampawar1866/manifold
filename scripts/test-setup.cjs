#!/usr/bin/env node

// Test script to validate the setup works correctly
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const testSetup = async () => {
  console.log('🧪 Testing Manifold Setup Process...')
  
  const setupPath = path.join(__dirname, '..', 'scripts', 'setup.cjs')
  const genPath = path.join(__dirname, '..', 'gen_manifold')
  
  // Clean up any existing gen_manifold
  if (fs.existsSync(genPath)) {
    console.log('🧹 Cleaning existing gen_manifold folder...')
    fs.rmSync(genPath, { recursive: true, force: true })
  }
  
  // Create a mock stdin for automated testing
  const child = spawn('node', [setupPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  })
  
  let output = ''
  child.stdout.on('data', (data) => {
    output += data.toString()
    console.log(data.toString())
  })
  
  child.stderr.on('data', (data) => {
    console.error('ERROR:', data.toString())
  })
  
  // Send automated inputs
  setTimeout(() => child.stdin.write('1\n'), 500)   // DeFi
  setTimeout(() => child.stdin.write('3\n'), 1000)  // 3 chains
  setTimeout(() => child.stdin.write('1\n'), 1500)  // Recommended functions
  setTimeout(() => child.stdin.write('y\n'), 2000)  // Confirm
  setTimeout(() => child.stdin.end(), 2500)
  
  child.on('close', (code) => {
    console.log(`\n🧪 Setup process exited with code ${code}`)
    
    if (code === 0) {
      console.log('✅ Setup completed successfully!')
      
      // Check if gen_manifold was created
      if (fs.existsSync(genPath)) {
        console.log('✅ gen_manifold folder created')
        
        // Check key files
        const keyFiles = [
          'package.json',
          'src/App.jsx',
          'src/manifold.config.js',
          'src/components/FunctionCard.jsx',
          'src/hooks/useFunctionGenerator.js',
          'src/utils/functionTemplates.js'
        ]
        
        keyFiles.forEach(file => {
          const filePath = path.join(genPath, file)
          if (fs.existsSync(filePath)) {
            console.log(`✅ ${file} exists`)
          } else {
            console.log(`❌ ${file} missing`)
          }
        })
        
      } else {
        console.log('❌ gen_manifold folder not created')
      }
    } else {
      console.log('❌ Setup failed')
    }
  })
}

testSetup().catch(console.error)