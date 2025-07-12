"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"

interface CategorySelectorProps {
  leadId: string
  currentCategory: string
  onCategoryUpdated?: () => void
}

export function CategorySelector({ leadId, currentCategory, onCategoryUpdated }: CategorySelectorProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const categories = [
    { value: "none", label: "None", color: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
    { value: "hot", label: "Hot", color: "bg-red-100 text-red-700 hover:bg-red-200" },
    { value: "warm", label: "Warm", color: "bg-orange-100 text-orange-700 hover:bg-orange-200" },
    { value: "cold", label: "Cold", color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
  ]

  const handleCategoryChange = async (category: string) => {
    if (category === currentCategory) return

    setLoading(true)
    try {
      const response = await fetch(`/api/leads/${leadId}/category`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      })

      if (response.ok) {
        await queryClient.invalidateQueries({ queryKey: ["lead", leadId] })
        await queryClient.invalidateQueries({ queryKey: ["leads"] })
        
        toast({
          title: "Success",
          description: `Category updated to ${category}`,
        })
        
        if (onCategoryUpdated) onCategoryUpdated()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update category",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating the category",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <Button
          key={cat.value}
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => handleCategoryChange(cat.value)}
          className={`${cat.color} ${
            currentCategory === cat.value 
              ? "ring-2 ring-offset-2 ring-blue-500 font-semibold" 
              : ""
          } transition-all duration-200`}
        >
          {cat.label}
        </Button>
      ))}
    </div>
  )
} 