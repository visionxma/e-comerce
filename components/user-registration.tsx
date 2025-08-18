"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface UserRegistrationProps {
  onRegister: (data: { name: string; phone: string; address: string }) => void
}

export function UserRegistration({ onRegister }: UserRegistrationProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.phone && formData.address) {
      onRegister(formData)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Cadastro Rápido</CardTitle>
        <CardDescription>Preencha seus dados para facilitar suas compras</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="tel"
              placeholder="Seu telefone (99) 99999-9999"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="text"
              placeholder="Endereço completo (rua, número, bairro)"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Salvar Dados
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
