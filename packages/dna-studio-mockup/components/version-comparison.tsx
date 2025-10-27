import type React from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { VersionHistory } from "@/lib/data"

interface VersionComparisonProps {
  currentVersion: string
  versionHistory: VersionHistory[]
}

export const VersionComparison: React.FC<VersionComparisonProps> = ({
  currentVersion,
  versionHistory
}) => {
  const getVersionType = (version: string) => {
    const [major, minor, patch] = version.split('.').map(Number)
    const prevVersion = versionHistory.find(v => v.version !== version)
    
    if (!prevVersion) return 'initial'
    
    const [prevMajor, prevMinor, prevPatch] = prevVersion.version.split('.').map(Number)
    
    if (major > prevMajor) return 'major'
    if (minor > prevMinor) return 'minor'
    if (patch > prevPatch) return 'patch'
    
    return 'unknown'
  }

  const getVersionTypeColor = (type: string) => {
    switch (type) {
      case 'major':
        return 'bg-red-500/10 text-red-400 border-red-500/30'
      case 'minor':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      case 'patch':
        return 'bg-green-500/10 text-green-400 border-green-500/30'
      case 'initial':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <Card className="p-4 bg-card border-border">
      <h4 className="font-semibold text-sm mb-3">Version Evolution</h4>
      <div className="space-y-3">
        {versionHistory.map((version, index) => {
          const versionType = getVersionType(version.version)
          const isCurrentVersion = version.version === currentVersion
          
          return (
            <div key={version.version} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${
                  isCurrentVersion ? 'bg-blue-400' : 'bg-gray-500'
                }`} />
                {index < versionHistory.length - 1 && (
                  <div className="w-px h-8 bg-border mt-2" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={`text-xs font-mono ${getVersionTypeColor(versionType)}`}>
                    v{version.version}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {versionType}
                  </Badge>
                  {isCurrentVersion && (
                    <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">
                      Current
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-foreground mb-1">{version.description}</p>
                <p className="text-xs text-muted-foreground">{version.releaseDate}</p>
                
                {version.changes && version.changes.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground mb-1">Changes:</div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {version.changes.map((change, changeIndex) => (
                        <li key={changeIndex} className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-current rounded-full flex-shrink-0" />
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default VersionComparison