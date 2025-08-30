"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Phone, MapPin, Sparkles, Shield, Clock, CheckCircle } from "lucide-react"

interface UserRegistrationProps {
  onRegister: (data: { name: string; phone: string; address: string }) => void
}

export function UserRegistration({ onRegister }: UserRegistrationProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  })
  
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.phone && formData.address) {
      setIsSubmitting(true)
      
      // Simula um pequeno delay para feedback visual
      setTimeout(() => {
        onRegister(formData)
        setIsSubmitting(false)
      }, 800)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    const formatted = cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    return formatted
  }

  const isFormValid = formData.name.trim() && formData.phone.trim() && formData.address.trim()
  const completionPercentage = [formData.name, formData.phone, formData.address].filter(Boolean).length * 33.33

  return (
    <div className="relative mb-8">
      {/* Card principal com gradiente e glassmorphism */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/50 border border-white/50 shadow-xl backdrop-blur-sm">
        
        {/* Elementos decorativos */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Header melhorado */}
        <CardHeader className="relative z-10 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl text-white shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Cadastro Rápido
              </CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Preencha seus dados para uma experiência personalizada
              </CardDescription>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progresso do cadastro</span>
              <span className="text-sm font-bold text-purple-600">{Math.round(completionPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 pt-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Campo Nome */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <User className={`h-5 w-5 transition-colors duration-300 ${
                  focusedField === "name" ? "text-purple-600" : "text-gray-400"
                }`} />
              </div>
              <Input
                type="text"
                placeholder="Nome completo"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                className={`pl-12 pr-4 py-6 rounded-xl border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                  focusedField === "name" 
                    ? "border-purple-400 shadow-lg shadow-purple-500/20 bg-white" 
                    : formData.name 
                      ? "border-green-300 bg-green-50/50" 
                      : "border-gray-200 hover:border-purple-300"
                }`}
                required
              />
              {formData.name && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}
            </div>

            {/* Campo Telefone */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <Phone className={`h-5 w-5 transition-colors duration-300 ${
                  focusedField === "phone" ? "text-purple-600" : "text-gray-400"
                }`} />
              </div>
              <Input
                type="tel"
                placeholder="(99) 99999-9999"
                value={formData.phone}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value)
                  if (formatted.length <= 15) {
                    handleChange("phone", formatted)
                  }
                }}
                onFocus={() => setFocusedField("phone")}
                onBlur={() => setFocusedField(null)}
                className={`pl-12 pr-4 py-6 rounded-xl border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                  focusedField === "phone" 
                    ? "border-purple-400 shadow-lg shadow-purple-500/20 bg-white" 
                    : formData.phone 
                      ? "border-green-300 bg-green-50/50" 
                      : "border-gray-200 hover:border-purple-300"
                }`}
                required
              />
              {formData.phone && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}
            </div>

            {/* Campo Endereço */}
            <div className="relative group">
              <div className="absolute left-4 top-6 z-10">
                <MapPin className={`h-5 w-5 transition-colors duration-300 ${
                  focusedField === "address" ? "text-purple-600" : "text-gray-400"
                }`} />
              </div>
              <textarea
                placeholder="Endereço completo com ponto de referência&#10;Ex: Rua das Flores, 123, Centro, próximo ao mercado"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                onFocus={() => setFocusedField("address")}
                onBlur={() => setFocusedField(null)}
                className={`pl-12 pr-4 py-6 rounded-xl border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none h-24 w-full ${
                  focusedField === "address" 
                    ? "border-purple-400 shadow-lg shadow-purple-500/20 bg-white" 
                    : formData.address 
                      ? "border-green-300 bg-green-50/50" 
                      : "border-gray-200 hover:border-purple-300"
                }`}
                required
              />
              {formData.address && (
                <div className="absolute right-4 top-6">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}
            </div>

            {/* Benefícios do cadastro */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/50 rounded-xl p-4 mt-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                Vantagens do seu cadastro:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span>Checkout mais rápido</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span>Endereços salvos</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Shield className="h-4 w-4 text-purple-500" />
                  <span>Dados seguros</span>
                </div>
              </div>
            </div>

            {/* Botão de submit */}
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`w-full py-6 rounded-xl text-lg font-bold transition-all duration-300 ${
                isFormValid
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02]"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Salvando dados...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Salvar e Continuar</span>
                </div>
              )}
            </Button>
          </form>

          {/* Nota sobre privacidade */}
          <p className="text-xs text-gray-600 mt-4 text-center">
            🔒 Seus dados estão seguros e são usados apenas para melhorar sua experiência de compra
          </p>
        </CardContent>
      </div>
    </div>
  )
}