"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal, Download, Trash2, CheckCircle, XCircle, Clock, Archive, Eye, Edit } from "lucide-react"
import { toast } from "sonner"

interface BulkActionOption {
  value: string
  label: string
  icon?: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  color?: string
}

interface BulkActionsProps {
  selectedItems: string[]
  totalItems: number
  filteredItems: any[]
  onSelectAll: (checked: boolean) => void
  onSelectItem: (itemId: string, checked: boolean) => void
  onBulkAction: (action: string) => void
  onExport?: () => void
  actionOptions: BulkActionOption[]
  itemName: string
  isSelectAll: boolean
  loading?: boolean
}

export function BulkActions({
  selectedItems,
  totalItems,
  filteredItems,
  onSelectAll,
  onSelectItem,
  onBulkAction,
  onExport,
  actionOptions,
  itemName,
  isSelectAll,
  loading = false
}: BulkActionsProps) {
  const [isActionSelectOpen, setIsActionSelectOpen] = useState(false)

  const handleBulkAction = (action: string) => {
    if (selectedItems.length === 0) {
      toast.error(`Please select ${itemName} to perform bulk action`)
      return
    }
    onBulkAction(action)
    setIsActionSelectOpen(false)
  }

  const handleExport = () => {
    if (selectedItems.length === 0 && onExport) {
      toast.error(`Please select ${itemName} to export`)
      return
    }
    onExport?.()
  }

  return (
    <div className="space-y-4">
      {/* Bulk Action Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={isSelectAll}
              onCheckedChange={onSelectAll}
              disabled={loading || filteredItems.length === 0}
            />
            <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
              Select All ({filteredItems.length})
            </label>
          </div>
          
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                {selectedItems.length} selected
              </Badge>
              
              <Select open={isActionSelectOpen} onOpenChange={setIsActionSelectOpen}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Bulk Actions" />
                </SelectTrigger>
                <SelectContent>
                  {actionOptions.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className={option.color || ""}
                      onClick={() => handleBulkAction(option.value)}
                    >
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onExport && (
            <Button variant="outline" onClick={handleExport} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Selection Summary */}
      {selectedItems.length > 0 && (
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {selectedItems.length} of {filteredItems.length} {itemName} selected
          </p>
        </div>
      )}
    </div>
  )
}

// Individual row checkbox component
interface RowCheckboxProps {
  itemId: string
  isSelected: boolean
  onSelect: (itemId: string, checked: boolean) => void
  disabled?: boolean
}

export function RowCheckbox({ itemId, isSelected, onSelect, disabled = false }: RowCheckboxProps) {
  return (
    <Checkbox
      checked={isSelected}
      onCheckedChange={(checked) => onSelect(itemId, checked as boolean)}
      disabled={disabled}
      className="mr-2"
    />
  )
}

// Common bulk action options
export const commonBulkActions = {
  activate: {
    value: "activate",
    label: "Activate",
    icon: <CheckCircle className="h-4 w-4 text-green-600" />,
    color: "text-green-600"
  },
  deactivate: {
    value: "deactivate",
    label: "Deactivate",
    icon: <XCircle className="h-4 w-4 text-red-600" />,
    color: "text-red-600"
  },
  delete: {
    value: "delete",
    label: "Delete",
    icon: <Trash2 className="h-4 w-4 text-red-600" />,
    color: "text-red-600"
  },
  archive: {
    value: "archive",
    label: "Archive",
    icon: <Archive className="h-4 w-4 text-blue-600" />,
    color: "text-blue-600"
  },
  publish: {
    value: "publish",
    label: "Publish",
    icon: <CheckCircle className="h-4 w-4 text-green-600" />,
    color: "text-green-600"
  },
  unpublish: {
    value: "unpublish",
    label: "Unpublish",
    icon: <XCircle className="h-4 w-4 text-orange-600" />,
    color: "text-orange-600"
  },
  approve: {
    value: "approve",
    label: "Approve",
    icon: <CheckCircle className="h-4 w-4 text-green-600" />,
    color: "text-green-600"
  },
  reject: {
    value: "reject",
    label: "Reject",
    icon: <XCircle className="h-4 w-4 text-red-600" />,
    color: "text-red-600"
  },
  pending: {
    value: "pending",
    label: "Mark Pending",
    icon: <Clock className="h-4 w-4 text-yellow-600" />,
    color: "text-yellow-600"
  }
}