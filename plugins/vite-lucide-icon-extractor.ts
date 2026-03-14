import fs from 'fs'
import path from 'path'
import fg from 'fast-glob'

export default function lucideIconExtractor() {
  return {
    name: 'lucide-icon-extractor',

    async buildStart() {
      console.log('\n[lucide-icon-extractor] Starting icon scan')

      const files = await fg(['src/**/*.{vue,ts,js}'])
      console.log(`[lucide-icon-extractor] Scanning ${files.length} source files`)

      const icons = new Set<string>()
      icons.add("BadgeQuestionMark")

      const lucideRegex =
        /<(?:LucideIcon|lucide-icon)\b[^>]*?(?:\bname=["'`](\w+)["'`]|:name=["'`](?:'|`)(\w+)(?:'|`))/g

      const sectionHeaderRegex =
        /<(?:SectionHeader|section-header)\b[^>]*?(?:\biconName=["'`](\w+)["'`]|icon-name=["'`](\w+)["'`]|:iconName=["'`](?:'|`)(\w+)(?:'|`)|:icon-name=["'`](?:'|`)(\w+)(?:'|`))/g

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8')

        let match

        // LucideIcon
        while ((match = lucideRegex.exec(content))) {
          const icon = match[1] || match[2]
          if (icon) {
            icons.add(icon)
            console.log(`[lucide-icon-extractor] Found <LucideIcon> icon: ${icon} (${file})`) 
          }
        }

        // SectionHeader
        while ((match = sectionHeaderRegex.exec(content))) {
          const icon = match[1] || match[2] || match[3] || match[4]
          if (icon) {
            icons.add(icon)
            console.log(`[lucide-icon-extractor] Found <SectionHeader> icon: ${icon} (${file})`)
          }
        }
      }

      //
      // Load dynamic icons from static file
      //
      const dynamicFile = path.resolve('./src/icons.dynamic.json')
      let dynamicIcons: string[] = []

      if (fs.existsSync(dynamicFile)) {
        try {
          dynamicIcons = JSON.parse(fs.readFileSync(dynamicFile, 'utf8'))
          console.log(`[lucide-icon-extractor] Loaded ${dynamicIcons.length} dynamic icons`)
        } catch (err) {
          console.error('[lucide-icon-extractor] Failed to parse icons.dynamic.json', err)
        }
      }

      //
      // Load exclusions
      //
      const excludeFile = path.resolve('./src/icons.exclude.json')
      let excludedIcons: string[] = []

      if (fs.existsSync(excludeFile)) {
        try {
          excludedIcons = JSON.parse(fs.readFileSync(excludeFile, 'utf8'))
          console.log(`[lucide-icon-extractor] Loaded ${excludedIcons.length} excluded icons`)
        } catch (err) {
          console.error('[lucide-icon-extractor] Failed to parse icons.exclude.json', err)
        }
      }

      //
      // Merge literal + dynamic
      //
      for (const icon of dynamicIcons) {
        icons.add(icon)
      }

      //
      // Apply exclusions
      //
      for (const icon of excludedIcons) {
        if (icons.delete(icon)) {
          console.log(`[lucide-icon-extractor] Excluded icon: ${icon}`)
        }
      }

      const iconList = Array.from(icons).sort()

      console.log(`[lucide-icon-extractor] Total unique icons: ${iconList.length}`)
      if (iconList.length > 0) {
        console.log(`[lucide-icon-extractor] Icons: ${iconList.join(', ')}`)
      }

      const outDir = path.resolve('src/generated')
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true })
        console.log(`[lucide-icon-extractor] Created directory: ${outDir}`)
      }

      //
      // Write icon-map.ts
      //
      const mapOutput = `
/* AUTO-GENERATED FILE — DO NOT EDIT */
import {
  ${iconList.join(',\n  ')}
} from 'lucide-vue-next'

export const iconMap = {
  ${iconList.map(i => `${i},`).join('\n  ')}
}
`
      const mapPath = path.join(outDir, 'icon-map.ts')
      fs.writeFileSync(mapPath, mapOutput.trim() + '\n')
      console.log(`[lucide-icon-extractor] Wrote icon-map.ts → ${mapPath}`)

      //
      // Write icon-types.ts
      //
      const typesOutput = `
/* eslint-disable */
// @ts-nocheck
// biome-ignore lint: disable
// oxlint-disable
/* AUTO-GENERATED FILE — DO NOT EDIT */
export type IconName =
${iconList.map(i => `  | "${i}"`).join('\n')}
`
      const typesPath = path.join(outDir, 'icon-types.ts')
      fs.writeFileSync(typesPath, typesOutput.trim() + '\n')
      console.log(`[lucide-icon-extractor] Wrote icon-types.ts → ${typesPath}`)

      console.log('[lucide-icon-extractor] Done\n')
    },
  }
}
