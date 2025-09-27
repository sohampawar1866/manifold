#!/usr/bin/env node

/**
 * 🔨 Smart Contract Compiler for Kadena Multi-Chain Template
 * 
 * Compiles Solidity contracts and prepares them for multi-chain deployment
 */

import solc from 'solc';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class ContractCompiler {
  constructor() {
    this.contractsDir = path.join(__dirname, '../src/contracts');
    this.outputDir = path.join(__dirname, '../src/contracts/compiled');
  }

  findSolidityFiles() {
    if (!fs.existsSync(this.contractsDir)) {
      console.log('📁 Creating contracts directory...');
      fs.mkdirSync(this.contractsDir, { recursive: true });
      
      // Create a sample contract
      this.createSampleContract();
      return [path.join(this.contractsDir, 'SimpleStorage.sol')];
    }

    const files = fs.readdirSync(this.contractsDir)
      .filter(file => file.endsWith('.sol'))
      .map(file => path.join(this.contractsDir, file));

    if (files.length === 0) {
      console.log('⚠️  No Solidity files found. Creating a sample contract...');
      this.createSampleContract();
      return [path.join(this.contractsDir, 'SimpleStorage.sol')];
    }

    return files;
  }

  createSampleContract() {
    const sampleContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SimpleStorage
 * @dev A simple contract to demonstrate multi-chain deployment on Kadena
 */
contract SimpleStorage {
    uint256 private storedData;
    address public owner;
    
    event DataStored(uint256 indexed value, address indexed setter);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    /**
     * @dev Store a value
     * @param x The value to store
     */
    function set(uint256 x) public {
        storedData = x;
        emit DataStored(x, msg.sender);
    }
    
    /**
     * @dev Retrieve the stored value
     * @return The stored value
     */
    function get() public view returns (uint256) {
        return storedData;
    }
    
    /**
     * @dev Transfer ownership (only owner can call)
     * @param newOwner The new owner address
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }
}`;

    fs.writeFileSync(path.join(this.contractsDir, 'SimpleStorage.sol'), sampleContract);
    console.log('✅ Created sample SimpleStorage.sol contract');
  }

  compileSolidityFile(filePath) {
    const contractName = path.basename(filePath, '.sol');
    const sourceCode = fs.readFileSync(filePath, 'utf8');

    // Prepare compiler input
    const input = {
      language: 'Solidity',
      sources: {
        [contractName + '.sol']: {
          content: sourceCode
        }
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['abi', 'evm.bytecode']
          }
        },
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    };

    console.log(`🔨 Compiling ${contractName}...`);

    try {
      const output = JSON.parse(solc.compile(JSON.stringify(input)));

      if (output.errors) {
        const errors = output.errors.filter(error => error.severity === 'error');
        if (errors.length > 0) {
          console.error(`❌ Compilation errors in ${contractName}:`);
          errors.forEach(error => console.error(`  - ${error.formattedMessage}`));
          return null;
        }
        
        // Show warnings
        const warnings = output.errors.filter(error => error.severity === 'warning');
        if (warnings.length > 0) {
          console.warn(`⚠️  Compilation warnings in ${contractName}:`);
          warnings.forEach(warning => console.warn(`  - ${warning.formattedMessage}`));
        }
      }

      const contract = output.contracts[contractName + '.sol'][contractName];
      
      const compiledContract = {
        contractName,
        abi: contract.abi,
        bytecode: contract.evm.bytecode.object,
        compiledAt: new Date().toISOString(),
        compiler: {
          version: solc.version(),
          optimizer: true,
          optimizerRuns: 200
        }
      };

      console.log(`✅ ${contractName} compiled successfully`);
      return compiledContract;

    } catch (error) {
      console.error(`❌ Failed to compile ${contractName}:`, error.message);
      return null;
    }
  }

  async compileAll() {
    console.log('🚀 Starting contract compilation...\n');

    const solidityFiles = this.findSolidityFiles();
    
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const compiledContracts = [];

    for (const filePath of solidityFiles) {
      const compiled = this.compileSolidityFile(filePath);
      if (compiled) {
        compiledContracts.push(compiled);
        
        // Save individual compiled contract
        const outputPath = path.join(this.outputDir, `${compiled.contractName}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(compiled, null, 2));
        console.log(`💾 Saved to ${outputPath}`);
      }
    }

    // Create a combined contracts file for easy importing
    const allContracts = {};
    compiledContracts.forEach(contract => {
      allContracts[contract.contractName] = contract;
    });

    const allContractsPath = path.join(this.outputDir, 'all-contracts.json');
    fs.writeFileSync(allContractsPath, JSON.stringify(allContracts, null, 2));

    console.log(`\n📊 Compilation Summary:`);
    console.log(`✅ Successfully compiled: ${compiledContracts.length} contracts`);
    console.log(`💾 Output directory: ${this.outputDir}`);
    
    if (compiledContracts.length > 0) {
      console.log(`\n🚀 Ready for deployment! Run: npm run deploy`);
    }

    return compiledContracts;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const compiler = new ContractCompiler();
  compiler.compileAll().catch(error => {
    console.error('Compilation failed:', error);
    process.exit(1);
  });
}

export { ContractCompiler };