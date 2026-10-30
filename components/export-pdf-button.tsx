
"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default function ExportPDFButton() {
  const handleExportPDF = () => {
    window.print()
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleExportPDF}
    >
      <Download className="h-4 w-4 mr-2" />
      Export PDF
    </Button>
  )
}
