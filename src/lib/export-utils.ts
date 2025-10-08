// Utility functions for exporting data to CSV

export interface ExportColumn {
  key: string
  label: string
  formatter?: (value: any) => string
}

export function exportToCSV<T>(
  data: T[],
  columns: ExportColumn[],
  filename: string
): void {
  if (data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Create CSV headers
  const headers = columns.map(col => col.label)
  
  // Create CSV rows
  const rows = data.map(item => 
    columns.map(col => {
      const value = col.key.split('.').reduce((obj, key) => obj?.[key], item)
      const formattedValue = col.formatter ? col.formatter(value) : String(value || '')
      
      // Escape quotes and wrap in quotes if contains comma or quotes
      if (formattedValue.includes(',') || formattedValue.includes('"')) {
        return `"${formattedValue.replace(/"/g, '""')}"`
      }
      return formattedValue
    })
  )

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

// Common formatters
export const formatters = {
  date: (value: string | Date) => {
    return new Date(value).toLocaleDateString()
  },
  dateTime: (value: string | Date) => {
    return new Date(value).toLocaleString()
  },
  currency: (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  },
  number: (value: number) => {
    return value.toLocaleString()
  },
  boolean: (value: boolean) => {
    return value ? 'Yes' : 'No'
  },
  array: (value: any[]) => {
    return value.join('; ')
  },
  status: (value: string) => {
    return value.toLowerCase().replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
}