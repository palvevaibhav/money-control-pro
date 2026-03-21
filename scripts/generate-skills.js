#!/usr/bin/env node

/**
 * Skills Auto-Generator
 *
 * Scans the skills/.curated folder and generates a skills.json file
 * with all available skills for the project.
 *
 * Usage:
 *   node scripts/generate-skills.js
 */

const fs = require('fs');
const path = require('path');

class SkillsGenerator {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.skillsDir = path.join(this.projectRoot, 'skills', '.curated');
        this.outputFile = path.join(this.projectRoot, 'skills.json');
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
        console.log(`[${timestamp}] ${prefix} ${message}`);
    }

    error(message) {
        this.log(message, 'error');
        process.exit(1);
    }

    success(message) {
        this.log(message, 'success');
    }

    scanSkillsDirectory() {
        if (!fs.existsSync(this.skillsDir)) {
            this.log(`Skills directory not found: ${this.skillsDir}`);
            this.log('Creating skills directory structure...');
            fs.mkdirSync(this.skillsDir, { recursive: true });
            return [];
        }

        const skills = [];
        const items = fs.readdirSync(this.skillsDir);

        for (const item of items) {
            const itemPath = path.join(this.skillsDir, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory()) {
                const skillFile = path.join(itemPath, 'SKILL.md');
                if (fs.existsSync(skillFile)) {
                    try {
                        const content = fs.readFileSync(skillFile, 'utf8');
                        const skill = this.parseSkillFile(content, item);
                        if (skill) {
                            skills.push(skill);
                        }
                    } catch (error) {
                        this.log(`Warning: Failed to parse skill ${item}: ${error.message}`, 'error');
                    }
                }
            }
        }

        return skills;
    }

    parseSkillFile(content, skillName) {
        const lines = content.split('\n');
        const skill = {
            name: skillName,
            description: '',
            file: `skills/.curated/${skillName}/SKILL.md`,
            metadata: {}
        };

        let inDescription = false;
        let description = [];

        for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed.startsWith('# ')) {
                // Skip title
                continue;
            }

            if (trimmed.startsWith('## ')) {
                // Section headers
                const section = trimmed.substring(3).toLowerCase();
                if (section === 'description') {
                    inDescription = true;
                } else {
                    inDescription = false;
                }
                continue;
            }

            if (inDescription && trimmed) {
                description.push(trimmed);
            }

            // Parse metadata
            if (trimmed.startsWith('- **') && trimmed.includes(':**')) {
                const colonIndex = trimmed.indexOf(':**');
                const key = trimmed.substring(3, colonIndex).toLowerCase().replace(/\s+/g, '_');
                const value = trimmed.substring(colonIndex + 3).trim();
                skill.metadata[key] = value;
            }
        }

        skill.description = description.join(' ').replace(/\s+/g, ' ').trim();

        return skill.description ? skill : null;
    }

    generateSkillsJson(skills) {
        const skillsJson = {
            generated_at: new Date().toISOString(),
            total_skills: skills.length,
            skills: skills
        };

        fs.writeFileSync(this.outputFile, JSON.stringify(skillsJson, null, 2));
        this.success(`Generated skills.json with ${skills.length} skills`);
    }

    run() {
        console.log('🔧 Generating Skills Configuration\n');

        try {
            const skills = this.scanSkillsDirectory();
            this.generateSkillsJson(skills);

            console.log('\n' + '='.repeat(50));
            console.log('📚 SKILLS GENERATION COMPLETED!');
            console.log('='.repeat(50));
            console.log(`📁 Output: ${this.outputFile}`);
            console.log(`📊 Skills found: ${skills.length}`);

            if (skills.length > 0) {
                console.log('\n📋 Available Skills:');
                skills.forEach((skill, index) => {
                    console.log(`${index + 1}. ${skill.name}: ${skill.description.substring(0, 80)}...`);
                });
            }

            console.log('='.repeat(50));

        } catch (error) {
            this.error(`Skills generation failed: ${error.message}`);
        }
    }
}

// Run the generator
if (require.main === module) {
    const generator = new SkillsGenerator();
    generator.run();
}

module.exports = SkillsGenerator;