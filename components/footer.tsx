import { Phone, Clock, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-20 pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold text-card-foreground">Contato</p>
              <p className="text-sm text-muted-foreground">(99) 8468-0391</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold text-card-foreground">Horário</p>
              <p className="text-sm text-muted-foreground">7h às 18h</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold text-card-foreground">Entrega</p>
              <p className="text-sm text-muted-foreground">Pedreiras-MA e Trizedela do Vale</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
